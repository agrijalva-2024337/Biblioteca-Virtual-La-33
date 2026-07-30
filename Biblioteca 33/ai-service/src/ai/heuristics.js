/**
 * Señales léxicas para clasificar documentos educativos.
 * Complementa al LLM y permite clasificar sin GROQ_API_KEY.
 */

const TAREA_PATTERNS = [
  { re: /\brespuesta\s*(s)?\s*[:：]/i, label: "respuesta:" },
  { re: /\bresuelto\b/i, label: "resuelto" },
  { re: /\bsoluci[oó]n\s*(es)?\s*[:：]/i, label: "solución" },
  { re: /\bclave\s+de\s+respuestas?\b/i, label: "clave de respuestas" },
  { re: /\banswer\s*key\b/i, label: "answer key" },
  { re: /\bcorrecta\s*[:：]\s*[a-d]\b/i, label: "opción correcta" },
  { re: /\bseleccion[eó]\s+la\s+opci[oó]n\b/i, label: "opción seleccionada" },
  { re: /\bmi\s+respuesta\b/i, label: "mi respuesta" },
  { re: /\bdesarroll[oa]\s*[:：]/i, label: "desarrollo" },
  { re: /\bresultado\s*[=:]\s*[-+]?\d/i, label: "resultado numérico" },
  { re: /\bnota\s*[:：]?\s*\d{1,2}\s*\/\s*\d{1,2}/i, label: "nota" },
  { re: /\bcalificaci[oó]n\b/i, label: "calificación" },
  { re: /\bnombre\s+del\s+estudiante\b/i, label: "nombre del estudiante" },
  { re: /\bcarn[eé]\s*(estudiantil)?\b/i, label: "carné" },
  { re: /\bhoj[ae]\s+de\s+respuestas?\b/i, label: "hoja de respuestas" },
  { re: /\[\s*[xX✓✔]\s*\]/, label: "casilla marcada" },
  { re: /^\s*[a-d]\)\s*.+\n\s*[a-d]\)/im, label: "opciones a-d" },
  { re: /\bpregunta\s+\d+[\s.:)].{0,80}(respuesta|r\s*=)/i, label: "pregunta+respuesta" },
];

const APOYO_PATTERNS = [
  { re: /\bobjetivos?\s+(de\s+aprendizaje|espec[ií]ficos)?\b/i, label: "objetivos" },
  { re: /\bdefinici[oó]n\b/i, label: "definición" },
  { re: /\bteor[ií]a\b/i, label: "teoría" },
  { re: /\bresumen\b/i, label: "resumen" },
  { re: /\bintroducci[oó]n\b/i, label: "introducción" },
  { re: /\bbibliograf[ií]a\b/i, label: "bibliografía" },
  { re: /\bapuntes?\b/i, label: "apuntes" },
  { re: /\bgu[ií]a\s+de\s+estudio\b/i, label: "guía de estudio" },
  { re: /\bmaterial\s+de\s+apoyo\b/i, label: "material de apoyo" },
  { re: /\bejemplo\s*[:：]/i, label: "ejemplo" },
  { re: /\bexplicaci[oó]n\b/i, label: "explicación" },
  { re: /\bconceptos?\s+clave\b/i, label: "conceptos clave" },
  { re: /\bcontenido\s+program[aá]tico\b/i, label: "contenido programático" },
  { re: /\bunidad\s+\d+/i, label: "unidad" },
  { re: /\btema\s+\d+\s*[:.\-]/i, label: "tema" },
  { re: /\blecturas?\s+recomendadas?\b/i, label: "lecturas" },
  { re: /\bmarco\s+te[oó]rico\b/i, label: "marco teórico" },
  { re: /\bconclusi[oó]n(es)?\b/i, label: "conclusión" },
];

const AMBIGUOUS_PATTERNS = [
  { re: /\bejercicio\s*\d+/i, label: "ejercicio" },
  { re: /\bactividad\b/i, label: "actividad" },
  { re: /\bpráctica\b/i, label: "práctica" },
  { re: /\btarea\b/i, label: "tarea" },
  { re: /\bexamen\b/i, label: "examen" },
  { re: /\beval[uú]aci[oó]n\b/i, label: "evaluación" },
];

const scorePatterns = (text, patterns) => {
  let hits = 0;
  const matched = [];
  for (const { re, label } of patterns) {
    if (re.test(text)) {
      hits += 1;
      matched.push(label);
    }
  }
  return { hits, matched };
};

/**
 * @param {string} text
 * @param {{ title?: string, originalName?: string }} meta
 */
export const scoreDocumentSignals = (text = "", meta = {}) => {
  const title = meta.title || "";
  const originalName = meta.originalName || "";
  const blob = `${title}\n${originalName}\n${text}`.normalize("NFC");

  const tarea = scorePatterns(blob, TAREA_PATTERNS);
  const apoyo = scorePatterns(blob, APOYO_PATTERNS);
  const ambiguous = scorePatterns(blob, AMBIGUOUS_PATTERNS);

  // Peso extra por densidad de "respuestas" numeradas
  const numberedAnswers = (blob.match(/(?:^|\n)\s*(?:\d+[\).]|[Rr]\s*[=:])\s+\S+/g) || []).length;
  if (numberedAnswers >= 3) {
    tarea.hits += 2;
    tarea.matched.push(`numbered_answers:${numberedAnswers}`);
  }

  // Guías con enunciados sin respuestas suelen ser apoyo
  const questionMarks = (blob.match(/\?/g) || []).length;
  const answerHints = (blob.match(/\brespuesta/gi) || []).length;
  if (questionMarks >= 5 && answerHints === 0 && apoyo.hits >= 1) {
    apoyo.hits += 1;
    apoyo.matched.push("questions_without_answers");
  }

  const margin = tarea.hits - apoyo.hits;

  let classification = "incierto";
  let confidence = 0.35;
  let reason = "Señales mixtas o insuficientes en el texto extraído.";

  if (tarea.hits >= 3 && margin >= 2) {
    classification = "tarea_resuelta";
    confidence = Math.min(0.92, 0.55 + tarea.hits * 0.07);
    reason = `Indicadores fuertes de tarea/examen resuelto (${tarea.matched.slice(0, 3).join(", ")}).`;
  } else if (apoyo.hits >= 3 && -margin >= 2) {
    classification = "material_apoyo";
    confidence = Math.min(0.92, 0.55 + apoyo.hits * 0.07);
    reason = `Indicadores fuertes de material de estudio (${apoyo.matched.slice(0, 3).join(", ")}).`;
  } else if (tarea.hits >= 2 && margin >= 1 && ambiguous.hits >= 1) {
    classification = "tarea_resuelta";
    confidence = 0.62;
    reason = "Patrones de respuestas en contexto de tarea/examen.";
  } else if (apoyo.hits >= 2 && margin <= -1) {
    classification = "material_apoyo";
    confidence = 0.62;
    reason = "Estructura típica de guía o apunte teórico.";
  }

  return {
    classification,
    confidence,
    reason,
    signals: {
      tareaHits: tarea.hits,
      apoyoHits: apoyo.hits,
      ambiguousHits: ambiguous.hits,
      numberedAnswers,
      textLength: blob.trim().length,
    },
  };
};

export const prepareTextForAnalysis = (raw = "", maxChars = 10000) => {
  return String(raw || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]{2,}/g, " ")
    .trim()
    .slice(0, maxChars);
};
