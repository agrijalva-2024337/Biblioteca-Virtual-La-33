import Groq from "groq-sdk";
import { scoreDocumentSignals, prepareTextForAnalysis } from "./heuristics.js";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/** Modelo más capaz (mejor precisión). Fallback al instant si falla. */
const PRIMARY_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `Eres un clasificador experto de documentos escolares para la Biblioteca Virtual La 33 (secundaria / bachillerato, español).

Debes decidir UNA categoría:

1) "material_apoyo"
   - Apuntes, resúmenes, teoría, guías de estudio, explicaciones, ejemplos didácticos SIN clave de respuestas rellena.
   - Lecturas, marcos teóricos, definiciones, objetivos de aprendizaje, bibliografía.
   - Hojas de ejercicios EN BLANCO (solo enunciados, sin soluciones escritas).

2) "tarea_resuelta"
   - Tareas, exámenes o prácticas YA contestadas (respuestas, desarrollos, opciones marcadas, clave de respuestas).
   - Solucionarios, "answer key", hojas con calificaciones, nombre del estudiante + respuestas.
   - Ejercicios con resultados numéricos o "respuesta:" completados.

3) "incierto"
   - Texto ilegible, OCR muy ruidoso, o señales contradictorias (teoría mezclada con muchas respuestas).
   - Usa "incierto" solo si de verdad no puedes decidir con seguridad.

Reglas de decisión:
- Si hay respuestas rellenadas / solucionario → tarea_resuelta (aunque también haya teoría).
- Si es teoría/guía y las preguntas NO están contestadas → material_apoyo.
- Prefiere material_apoyo cuando el documento enseña; tarea_resuelta cuando entrega trabajo ya hecho.
- No inventes contenido que no esté en el texto.

Responde SOLO JSON válido (sin markdown):
{
  "classification": "material_apoyo" | "tarea_resuelta" | "incierto",
  "confidence": 0.0,
  "reason": "explicación breve en español (máx 180 caracteres)",
  "evidence": ["frase o señal 1", "señal 2"]
}

confidence: 0.0–1.0 (qué tan seguro estás).`;

const ALLOWED = new Set(["material_apoyo", "tarea_resuelta", "incierto"]);

const extractJson = (content) => {
  if (!content) throw new Error("empty");
  const trimmed = String(content).trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) return JSON.parse(fence[1].trim());
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("no json");
  }
};

const normalizeResult = (parsed, fallbackReason) => {
  const classification = ALLOWED.has(parsed?.classification)
    ? parsed.classification
    : "incierto";
  let confidence = Number(parsed?.confidence);
  if (!Number.isFinite(confidence)) confidence = classification === "incierto" ? 0.4 : 0.7;
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    classification,
    confidence,
    reason: String(parsed?.reason || fallbackReason).slice(0, 220),
    evidence: Array.isArray(parsed?.evidence)
      ? parsed.evidence.map((e) => String(e).slice(0, 120)).slice(0, 5)
      : [],
  };
};

const callGroq = async (model, userContent) => {
  const response = await groq.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  return normalizeResult(extractJson(content), "Clasificación por modelo LLM.");
};

const CLASS_LABELS = {
  material_apoyo: "material de apoyo (para estudiar)",
  tarea_resuelta: "tarea o examen ya resuelto",
  incierto: "resultado poco claro",
};

const confidencePhrase = (confidence) => {
  const c = Number(confidence);
  if (!Number.isFinite(c)) return null;
  if (c >= 0.78) return "alta";
  if (c >= 0.55) return "media";
  return "baja";
};

/**
 * Convierte el resultado interno en un mensaje claro para docentes/admins.
 */
export const toHumanReason = (result) => {
  const classification = result?.classification || "incierto";
  const confidence = result?.confidence;
  const source = result?.source;
  const base = String(result?.reason || "").trim();
  const confLabel = confidencePhrase(confidence);
  const confSuffix = confLabel ? ` Confianza ${confLabel}.` : "";

  if (source === "conflict") {
    return (
      "La revisión automática no coincide: unas señales parecen de tarea resuelta " +
      "y otras de material de estudio. Por eso necesita que un docente lo revise a mano." +
      confSuffix
    );
  }

  if (source === "fallback" || source === "empty") {
    return (
      base ||
      "No hubo suficiente información para clasificar el documento con seguridad. Requiere revisión humana."
    );
  }

  if (source === "heuristics" || source === "heuristics+llm") {
    const clean = base.replace(/^\[.*?\]\s*/, "");
    return `${clean}${confSuffix}`.trim();
  }

  if (source === "consensus") {
    const clean = base || `El sistema lo identifica como ${CLASS_LABELS[classification] || classification}.`;
    return `${clean}${confSuffix}`.trim();
  }

  // llm / legacy
  if (/conflicto:|heur[ií]stica=|fuente=|confianza=/i.test(base)) {
    return (
      "Hay dudas en la clasificación automática. Conviene que un docente revise el documento." +
      confSuffix
    );
  }

  return `${base || `Sugerencia: ${CLASS_LABELS[classification] || classification}.`}${confSuffix}`.trim();
};

/**
 * Fusiona heurística + LLM.
 * - Si coinciden → sube confianza
 * - Si chocan → incierto (revisión humana)
 * - Sin LLM → usa heurística si confidence >= 0.6; si no, incierto
 */
const mergeHeuristicAndLlm = (heuristic, llm) => {
  if (!llm) {
    if (heuristic.confidence >= 0.6 && heuristic.classification !== "incierto") {
      return {
        ...heuristic,
        source: "heuristics",
        reason: heuristic.reason,
      };
    }
    return {
      classification: "incierto",
      confidence: Math.max(heuristic.confidence, 0.35),
      reason: groq
        ? "El modelo de IA no respondió. El documento queda pendiente de revisión humana."
        : "No se pudo analizar con IA (clave no configurada) y las señales del texto no bastan. Requiere revisión humana.",
      evidence: [],
      source: "fallback",
      signals: heuristic.signals,
    };
  }

  if (llm.classification === "incierto") {
    if (heuristic.confidence >= 0.72 && heuristic.classification !== "incierto") {
      return {
        classification: heuristic.classification,
        confidence: Math.min(0.85, heuristic.confidence),
        reason: heuristic.reason,
        evidence: llm.evidence,
        source: "heuristics+llm",
        signals: heuristic.signals,
      };
    }
    return {
      ...llm,
      reason:
        llm.reason ||
        "La IA no pudo decidir con claridad. Un docente debe revisar el archivo.",
      source: "llm",
      signals: heuristic.signals,
    };
  }

  if (
    heuristic.classification !== "incierto" &&
    heuristic.classification !== llm.classification &&
    heuristic.confidence >= 0.55
  ) {
    return {
      classification: "incierto",
      confidence: 0.45,
      reason:
        "Las señales automáticas no coinciden entre sí (posible tarea resuelta frente a material de estudio).",
      evidence: llm.evidence,
      source: "conflict",
      signals: heuristic.signals,
    };
  }

  const boosted =
    heuristic.classification === llm.classification
      ? Math.min(0.98, llm.confidence + 0.12)
      : llm.confidence;

  return {
    classification: llm.classification,
    confidence: boosted,
    reason: llm.reason,
    evidence: llm.evidence,
    source: heuristic.classification === llm.classification ? "consensus" : "llm",
    signals: heuristic.signals,
  };
};

/**
 * @param {string} text
 * @param {{ title?: string, originalName?: string }} [meta]
 */
export const analyzeText = async (text, meta = {}) => {
  const cleaned = prepareTextForAnalysis(text, 10000);
  const heuristic = scoreDocumentSignals(cleaned, meta);

  if (!cleaned || cleaned.length < 20 || cleaned === "Contenido insuficiente para análisis.") {
    return {
      classification: "incierto",
      confidence: 0.2,
      reason:
        "No se pudo leer bien el contenido del documento. Un docente debe revisarlo manualmente.",
      evidence: [],
      source: "empty",
      signals: heuristic.signals,
    };
  }

  const userContent = [
    meta.title ? `Título del recurso: ${meta.title}` : null,
    meta.originalName ? `Nombre de archivo: ${meta.originalName}` : null,
    `Señales automáticas previas: tareaHits=${heuristic.signals.tareaHits}, apoyoHits=${heuristic.signals.apoyoHits}, sugerencia=${heuristic.classification} (${heuristic.confidence.toFixed(2)})`,
    "",
    "Texto extraído del documento:",
    cleaned,
  ]
    .filter(Boolean)
    .join("\n");

  let llm = null;

  if (groq) {
    try {
      llm = await callGroq(PRIMARY_MODEL, userContent);
    } catch (err) {
      console.error(`Groq primary (${PRIMARY_MODEL}) falló:`, err.message);
      try {
        llm = await callGroq(FALLBACK_MODEL, userContent);
      } catch (err2) {
        console.error(`Groq fallback (${FALLBACK_MODEL}) falló:`, err2.message);
      }
    }
  }

  const merged = mergeHeuristicAndLlm(heuristic, llm);
  return {
    ...merged,
    reason: toHumanReason(merged),
  };
};
