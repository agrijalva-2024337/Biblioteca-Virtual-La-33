# Evidencias SCRUM — Biblioteca Virtual La 33

Documento de apoyo para el criterio **Trabajo colaborativo: Git + SCRUM** de la evaluación técnica bimestral (Taller III).

## Equipo y roles

| Integrante | Rol SCRUM / técnico |
|------------|---------------------|
| Angel Gabriel Ernesto Grijalva Castro | Scrum Master — Auth Service e integración |
| Jose Enrique Cuc Cutz | Product Owner — Moderación |
| Benjamin Eli Argueta Caal | Developer — Notificaciones |
| Wilson Pasan del Cid | Developer — Files Service |
| Francisco Emanuel Milian Gonzales | Developer — AI/OCR |

## Ceremonias (evidencia a adjuntar en la defensa)

Completar con capturas o enlaces del tablero real del equipo:

- [ ] **Planning** — backlog del sprint priorizado (User Stories / tareas)
- [ ] **Daily** — registro breve de avances / blockers
- [ ] **Review** — demo del incremento (admin + app móvil + pipeline IA)
- [ ] **Retrospectiva** — 2–3 mejoras acordadas

> Recomendación: pegar aquí capturas del tablero (Trello / Jira / Azure Boards / Notion) o un enlace compartido.

## Tablero — columnas sugeridas

`Backlog` → `To Do` → `In Progress` → `In Review` → `Done`

### Historias / épicas de referencia (sistema)

1. Autenticación y roles (estudiante / docente / admin)
2. Subida de material + pipeline OCR/IA
3. Cola de moderación humana
4. Catálogo de materiales por grado/asignatura
5. Notificaciones in-app y correo
6. Panel admin (usuarios, grados, asignaturas)
7. App móvil estudiante (Expo)

## Git

- Commits descriptivos con prefijos (`feat:`, `fix:`, `docs:`, `refactor:`)
- Ramas por feature cuando el trabajo es paralelo
- Pull requests o merges revisados antes de integrar a la rama principal

## Definition of Done (DoD)

Una historia se considera **Done** cuando:

1. Flujo funcional en la vista correspondiente (sin errores visibles)
2. Validaciones y mensajes de error claros en formularios tocados
3. Rutas protegidas según rol si aplica
4. Manejo de loading / error en llamadas API
5. Código en la estructura de features del cliente o capa del microservicio
6. Commit(s) claros asociados a la tarea
