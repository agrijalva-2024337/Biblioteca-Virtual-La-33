import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const analyzeText = async (text) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
Eres un sistema de clasificación de documentos educativos para estudiantes.

Tu tarea es analizar texto extraído mediante OCR y determinar si el documento es:

1. "material_apoyo" → material educativo que ayuda a estudiar (resúmenes, teoría, ejemplos, guías, explicaciones).
2. "tarea_resuelta" → tareas completas ya resueltas, exámenes respondidos o ejercicios con respuestas finales.
3. "incierto" → cuando no puedes determinar claramente la categoría.

Debes responder SOLO con JSON válido con el siguiente formato:

{
  "classification": "material_apoyo | tarea_resuelta | incierto",
  "reason": "explicación corta"
}

Reglas:
- No agregues texto fuera del JSON.
- No agregues comentarios.
`
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (error) {
    return {
      classification: "incierto",
      reason: "No se pudo interpretar la respuesta de la IA",
      raw: content
    };
  }
};