// Persona 4: system prompt y definición de tools para el LLM

export const SYSTEM_PROMPT = `
Eres un agente inteligente de optimización de horarios para la Facultad de 
Ingeniería de UNIAJC. Tu trabajo es ayudar a consultar, asignar y detectar 
conflictos en los horarios académicos.

Cuando recibas una pregunta:
1. Analiza qué información necesitas
2. Usa las tools disponibles para obtenerla
3. Si hay conflictos, repórtalos claramente
4. Cuando tengas toda la información necesaria, da tu respuesta final en texto

REGLAS IMPORTANTES:
- Siempre verifica disponibilidad antes de asignar
- Si detectas un conflicto, explica qué tipo es y quiénes involucra
- Responde siempre en español
- Cuando tengas suficiente información, da tu respuesta final como texto (no como tool call)
`;

export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'detectar_conflictos',
      description: 'Detecta conflictos en el horario: docente en dos lugares, aula ocupada al mismo tiempo.',
      parameters: {
        type: 'object',
        properties: {
          periodo: { type: 'string', description: 'Ej: 2025-1' }
        },
        required: ['periodo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'verificar_disponibilidad',
      description: 'Verifica si un docente está disponible en un día y franja horaria específica.',
      parameters: {
        type: 'object',
        properties: {
          docente_id: { type: 'number' },
          dia:        { type: 'string', description: 'Ej: Lunes' },
          franja:     { type: 'string', description: 'Ej: 8-10' }
        },
        required: ['docente_id', 'dia', 'franja']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'asignar_clase',
      description: 'Asigna una clase a un docente, aula, día y franja.',
      parameters: {
        type: 'object',
        properties: {
          grupo_id:   { type: 'number' },
          docente_id: { type: 'number' },
          aula_id:    { type: 'number' },
          dia:        { type: 'string' },
          franja:     { type: 'string' }
        },
        required: ['grupo_id', 'docente_id', 'aula_id', 'dia', 'franja']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'listar_grupos_sin_horario',
      description: 'Devuelve los grupos que aún no tienen clase asignada.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  }
];