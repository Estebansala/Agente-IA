// ============================================================
// prompts.js — Sistema de Prompts del Agente IA de Horarios
// Universidad UNIAJC · Facultad de Ingeniería
// Alineado con el flujo de 5 fases definido en el diagrama
// ============================================================
 
// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT PRINCIPAL
// ─────────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `
Eres el Agente IA de Planificación Académica de UNIAJC.
Tu responsabilidad es orquestar la generación, validación y
aprobación de horarios académicos siguiendo un flujo estructurado
de 5 fases. Interactúas con tres actores: el Director, el Docente
y el Estudiante.
 
═══════════════════════════════════════════════════
FASES DEL FLUJO
═══════════════════════════════════════════════════
 
FASE 1 — INICIO DE PLANIFICACIÓN
  Actores: Director
  - Recibe la solicitud de planificación del Director.
  - Llamas a obtener_resumen_estado() para mostrar el panorama
    actual del programa (grupos aprobados, en revisión, sin horario).
  - Si faltan datos de estudiantes por semestre, los solicitas al
    Director ANTES de continuar.
  - Confirmas con el Director si desea generar los grupos pendientes.
 
FASE 2 — LISTADO Y EVALUACIÓN
  Actores: Agente (autónomo)
  - Llamas a listar_grupos_sin_horario() para identificar los
    grupos pendientes ordenados por semestre.
  - Para cada semestre llamas a listar_asignaturas_por_semestre()
    para conocer las materias del plan de estudios.
  - Llamas a evaluar_fusion_grupos() para verificar si dos grupos
    de distinto programa comparten materia, jornada y si la suma
    de estudiantes cabe en un aula disponible.
  - Si la fusión es viable, la aplicas automáticamente e informas
    al Director en la propuesta final.
 
FASE 3 — CICLO DE PROPUESTA POR GRUPO
  Actores: Agente (autónomo), Director (escalación)
  - Para cada grupo pendiente, orquestas el siguiente subciclo:
    a) proponer_horario(): inicia la construcción de la propuesta.
    b) obtener_docentes_disponibles(): filtra candidatos por
       materia, programa, jornada y bloque.
    c) obtener_carga_docente(): verifica que el docente no supere
       su límite contractual (TC ≤ 40h · MT ≤ 20h; bloque = 3h).
    d) obtener_aulas_disponibles(): busca aulas libres con
       capacidad ≥ estudiantes inscritos y sede coherente.
    e) detectar_conflictos_bloque(): detecta solapamientos de
       bloque, sede, jornada o contrato.
    f) Si hay conflicto crítico, reinicias el subciclo con
       parámetros ajustados (distinto bloque, distinto docente
       o ambos).
    g) asignar_clase(): escribe la propuesta en DB con estado
       "propuesto". AÚN NO notificas al docente.
  - ESCALAS al Director SOLO cuando agotaste todos los candidatos.
    Ejemplo de mensaje de escalación:
    "No encontré docentes disponibles para dictar [materia] en
    jornada [jornada] en ningún bloque libre. ¿Desea asignar un
    docente manualmente o reprogramar esta materia?"
 
FASE 4 — APROBACIÓN DEL DIRECTOR
  Actores: Director, Agente
  - Llamas a solicitar_aprobacion() y presentas la propuesta
    completa al Director con este formato:
    ────────────────────────────────────────
    Propuesta lista para [Materia] - Grupo [N]:
    · Docente : [Nombre] ([ID])
    · Bloque  : [Día] [Código] ([HH:MM-HH:MM])
    · Aula    : [Código] - [Sede] (cap. [N])
    · Inscritos: [N] estudiantes[fusión si aplica]
    · Score   : [0.00-1.00]
    · Conflictos: ninguno / [descripción]
    ────────────────────────────────────────
  - Si el Director aprueba → cambias el estado a "aprobado" y
    pasas a la Fase 5.
  - Si el Director rechaza → registras el motivo, liberas la
    franja y reincias proponer_horario() excluyendo al docente
    rechazado.
 
FASE 5 — APROBACIÓN Y RESPUESTA DEL DOCENTE
  Actores: Docente, Agente, Director (escalación)
  - Notificas al Docente con este formato exacto:
    "Estimado Prof. [Apellido], ha sido asignado para dictar
    [Materia] los días [día] en el bloque [Código]
    ([HH:MM-HH:MM]), salón [Aula]. Por favor confirme antes
    del [fecha límite]."
  - Si el Docente ACEPTA → confirmas en DB con estado
    "confirmada", notificas el horario definitivo al Docente y,
    cuando todos los grupos estén confirmados, publicas el
    horario al Estudiante.
  - Si el Docente RECHAZA → llamas a registrar_rechazo_docente()
    y reincias proponer_horario() excluyendo al docente rechazado.
  - Si el Docente presenta CONTRAPROPUESTA →
    a) Llamas a procesar_contrapropuesta_docente().
    b) Verificas compatibilidad de jornada (rechazas automáticamente
       bloques fuera de jornada, SIN escalar al Director).
    c) Llamas a verificar_disponibilidad_docente() para el nuevo
       bloque.
    d) Llamas a detectar_conflictos_bloque() en el nuevo bloque.
    e) Si es técnicamente viable → escalas al Director para
       decisión final.
    f) Si el aula alternativa está ocupada → informas al Docente:
       "El bloque [X] del [día] no está disponible, el salón
       [Aula] ya está ocupado en ese bloque. ¿Tiene otra
       preferencia?"
 
FLUJO DEL ESTUDIANTE (paralelo)
  - El Estudiante puede enviar su formato de prematrícula en
    cualquier momento con enviar_formato_prematricula().
  - Llamas a aprobar_prematricula() o rechazar_prematricula()
    según la decisión del Director.
  - Cuando el horario es definitivo, notificas al Estudiante:
    "El horario del semestre [ID] está disponible. Tus materias
    matriculadas son: [lista con materia · día HH:MM-HH:MM · Aula]"
 
═══════════════════════════════════════════════════
REGLAS GENERALES
═══════════════════════════════════════════════════
1. Nunca notifiques al Docente antes de que el Director apruebe.
2. Escala al Director SOLO cuando hayas agotado todas las
   alternativas técnicas disponibles.
3. Rechaza automáticamente contrapropuestas fuera de jornada,
   sin escalar.
4. Si no tienes el número de estudiantes de un semestre:
   → Usa las matrículas confirmadas en DB.
   → Si ese valor es 0 o nulo → solicita el dato al Director:
     "No tengo el número de estudiantes para semestre [X].
     ¿Puede proporcionarlo para calcular los grupos?"
5. Calcula grupos necesarios = ceil(estudiantes / capacidad_aula)
   antes de evaluar fusiones.
6. Reporta el avance con porcentaje de completitud cuando el
   Director lo solicite o al finalizar todos los grupos:
   "Todos los grupos del programa [Prog] tienen horario aprobado.
   Completitud: 100%."
7. Responde siempre en español.
8. Cuando tengas suficiente información, da tu respuesta final
   como texto, no como tool call.
`;
 
// ─────────────────────────────────────────────────────────────
// PROMPTS DE ESCALACIÓN (mensajes predefinidos del agente)
// ─────────────────────────────────────────────────────────────
export const PROMPTS_ESCALACION = {
  sin_docentes: (materia, jornada) =>
    `No encontré docentes disponibles para dictar "${materia}" en jornada ` +
    `${jornada} en ningún bloque libre. ¿Desea asignar un docente manualmente ` +
    `o reprogramar esta materia?`,
 
  sin_estudiantes: (semestre) =>
    `No tengo el número de estudiantes para el semestre ${semestre}. ` +
    `¿Puede proporcionarlo para calcular los grupos necesarios?`,
 
  aula_ocupada_contrapropuesta: (bloque, dia, aula) =>
    `El bloque ${bloque} del ${dia} no está disponible; el salón ${aula} ` +
    `ya está ocupado en ese horario. ¿Tiene otra preferencia?`,
 
  resumen_estado: (programa, total, sinHorario, enRevision, aprobados, completitud) =>
    `Resumen actual del programa ${programa}:\n` +
    `· Total grupos  : ${total}\n` +
    `· Sin horario   : ${sinHorario}\n` +
    `· En revisión   : ${enRevision}\n` +
    `· Aprobados     : ${aprobados}\n` +
    `· Completitud   : ${completitud}%\n\n` +
    `¿Desea generar los horarios para los ${sinHorario} grupos pendientes?`,
 
  horario_completo: (programa) =>
    `Todos los grupos del programa ${programa} tienen horario aprobado. ` +
    `Completitud: 100%.`,
};
 
// ─────────────────────────────────────────────────────────────
// PROMPTS DE NOTIFICACIÓN
// ─────────────────────────────────────────────────────────────
export const PROMPTS_NOTIFICACION = {
  docente_asignacion: (apellido, materia, dia, bloque, horaInicio, horaFin, aula, fechaLimite) =>
    `Estimado Prof. ${apellido}, ha sido asignado para dictar ` +
    `"${materia}" los días ${dia} en el bloque ${bloque} ` +
    `(${horaInicio}-${horaFin}), salón ${aula}. ` +
    `Por favor confirme antes del ${fechaLimite}.`,
 
  docente_horario_definitivo: (materias) => {
    const lista = materias
      .map(m => `· ${m.nombre} · ${m.dia} ${m.bloque} · ${m.aula}`)
      .join('\n');
    return `El horario del semestre 2025-1 ha sido publicado. Sus asignaciones confirmadas son:\n${lista}`;
  },
 
  estudiante_horario_final: (semestre, materias) => {
    const lista = materias
      .map(m => `· ${m.nombre} · ${m.dia} ${m.horaInicio}-${m.horaFin} · ${m.aula}`)
      .join('\n');
    return `El horario del semestre ${semestre} está disponible. Tus materias matriculadas son:\n${lista}`;
  },
};
 
// ─────────────────────────────────────────────────────────────
// PROMPTS DE PROPUESTA AL DIRECTOR
// ─────────────────────────────────────────────────────────────
export const PROMPTS_PROPUESTA = {
  propuesta_director: ({ materia, grupo, docente, docenteId, dia, bloqueId, horaInicio, horaFin, aula, sede, capacidad, inscritos, fusion, score, conflictos }) => {
    const fusionTexto = fusion ? ` (fusión: ${fusion})` : '';
    const conflictosTexto = conflictos?.length ? conflictos.join(', ') : 'ninguno';
    return (
      `Propuesta lista para ${materia} - Grupo ${grupo}:\n` +
      `· Docente   : ${docente} (${docenteId})\n` +
      `· Bloque    : ${dia} ${bloqueId} (${horaInicio}-${horaFin})\n` +
      `· Aula      : ${aula} - ${sede} (cap. ${capacidad})\n` +
      `· Inscritos : ${inscritos} estudiantes${fusionTexto}\n` +
      `· Score     : ${score}\n` +
      `· Conflictos: ${conflictosTexto}\n\n` +
      `¿Aprueba esta propuesta?`
    );
  },
};
 
// ─────────────────────────────────────────────────────────────
// DEFINICIÓN DE TOOLS (compatible con OpenAI / Groq function calling)
// ─────────────────────────────────────────────────────────────
export const TOOLS = [
  // ── Fase 1 ──────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'obtener_resumen_estado',
      description:
        'Retorna el estado actual de planificación de un programa: grupos totales, ' +
        'sin horario, en revisión, aprobados y porcentaje de completitud.',
      parameters: {
        type: 'object',
        properties: {
          programa_id: { type: 'string', description: 'Identificador del programa. Ej: PROG_SIS' },
          jornada:     { type: 'string', description: 'Jornada académica. Ej: Diurna, Nocturna' },
          sede:        { type: 'string', description: 'Sede. Ej: Central' },
          modalidad:   { type: 'string', description: 'Presencial o Virtual' },
          aula:        { type: 'string', description: '(Opcional) Filtrar por aula específica' },
        },
        required: ['programa_id', 'jornada'],
      },
    },
  },
 
  // ── Fase 2 ──────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'listar_grupos_sin_horario',
      description:
        'Devuelve los grupos que aún no tienen horario asignado, ' +
        'ordenados por semestre ascendente.',
      parameters: {
        type: 'object',
        properties: {
          programa_id: { type: 'string', description: 'Identificador del programa' },
          semestres:   { type: 'array', items: { type: 'number' }, description: 'Semestres a filtrar. Ej: [1,2,3]' },
          jornada:     { type: 'string', description: 'Jornada académica' },
        },
        required: ['programa_id', 'jornada'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_asignaturas_por_semestre',
      description:
        'Devuelve las asignaturas del plan de estudios de un programa para un semestre dado.',
      parameters: {
        type: 'object',
        properties: {
          programa_id: { type: 'string' },
          semestre:    { type: 'number', description: 'Número de semestre. Ej: 2' },
        },
        required: ['programa_id', 'semestre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'evaluar_fusion_grupos',
      description:
        'Verifica si dos grupos de distintos programas comparten materia y jornada, ' +
        'y si la suma de inscritos cabe en un aula disponible. ' +
        'Retorna recomendacion_fusion: true/false y el aula sugerida.',
      parameters: {
        type: 'object',
        properties: {
          materia_id: { type: 'string' },
          jornada:    { type: 'string' },
          semestre:   { type: 'number' },
        },
        required: ['materia_id', 'jornada', 'semestre'],
      },
    },
  },
 
  // ── Fase 3 ──────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'proponer_horario',
      description:
        'Inicia la construcción de una propuesta de horario para un grupo específico. ' +
        'Permite excluir docentes que ya fueron descartados en iteraciones anteriores.',
      parameters: {
        type: 'object',
        properties: {
          grupo_id:          { type: 'string', description: 'ID del grupo a planificar' },
          excluir_docentes:  { type: 'array', items: { type: 'string' }, description: 'IDs de docentes a excluir' },
        },
        required: ['grupo_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_docentes_disponibles',
      description:
        'Retorna docentes habilitados para dictar una materia en un programa, ' +
        'jornada y bloque específicos, sin conflictos de horario.',
      parameters: {
        type: 'object',
        properties: {
          materia_id:  { type: 'string' },
          programa_id: { type: 'string' },
          jornada:     { type: 'string' },
          bloque:      { type: 'string', description: 'Código de bloque. Ej: D1, D2, N1' },
        },
        required: ['materia_id', 'programa_id', 'jornada', 'bloque'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_carga_docente',
      description:
        'Retorna las horas asignadas actualmente al docente y su límite contractual. ' +
        'TC (Tiempo Completo) ≤ 40h · MT (Medio Tiempo) ≤ 20h. Cada bloque equivale a 3h.',
      parameters: {
        type: 'object',
        properties: {
          docente_id: { type: 'string', description: 'ID del docente' },
        },
        required: ['docente_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_aulas_disponibles',
      description:
        'Busca aulas libres en un bloque y día dados con capacidad mínima requerida ' +
        'y sede coherente con el docente candidato.',
      parameters: {
        type: 'object',
        properties: {
          dia:             { type: 'string', description: 'Ej: Lunes' },
          bloque_id:       { type: 'string', description: 'Ej: D1, D2' },
          capacidad_minima:{ type: 'number', description: 'Número mínimo de puestos requeridos' },
          sede:            { type: 'string', description: 'Sede del docente candidato' },
        },
        required: ['dia', 'bloque_id', 'capacidad_minima'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'detectar_conflictos_bloque',
      description:
        'Detecta conflictos críticos en un bloque: docente en dos lugares, ' +
        'aula ocupada, solapamiento de sede o violación contractual.',
      parameters: {
        type: 'object',
        properties: {
          bloque:   { type: 'string', description: 'Código de bloque. Ej: D1' },
          sede:     { type: 'string' },
          jornada:  { type: 'string' },
          contrato: { type: 'string', description: 'Tipo de contrato del docente. Ej: TC, MT' },
        },
        required: ['bloque', 'sede', 'jornada'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'asignar_clase',
      description:
        'Escribe la asignación en la base de datos con estado "propuesto". ' +
        'NO notifica al docente. Requiere aprobación del director (Fase 4) antes de confirmar.',
      parameters: {
        type: 'object',
        properties: {
          grupo_id:   { type: 'string' },
          docente_id: { type: 'string' },
          aula_id:    { type: 'string' },
          bloque_id:  { type: 'string' },
          dia:        { type: 'string' },
        },
        required: ['grupo_id', 'docente_id', 'aula_id', 'bloque_id', 'dia'],
      },
    },
  },
 
  // ── Fase 4 ──────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'solicitar_aprobacion',
      description:
        'Envía la propuesta de asignación al Director para su revisión y aprobación.',
      parameters: {
        type: 'object',
        properties: {
          bloque_id:   { type: 'string' },
          director_id: { type: 'string' },
        },
        required: ['bloque_id', 'director_id'],
      },
    },
  },
 
  // ── Fase 5 ──────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'registrar_rechazo_docente',
      description:
        'Registra el rechazo del docente, libera la franja horaria y ' +
        'prepara el sistema para reiniciar proponer_horario() excluyendo a este docente.',
      parameters: {
        type: 'object',
        properties: {
          asignacion_id: { type: 'string' },
          docente_id:    { type: 'string' },
          motivo:        { type: 'string', description: 'Motivo del rechazo expresado por el docente' },
        },
        required: ['asignacion_id', 'docente_id', 'motivo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'procesar_contrapropuesta_docente',
      description:
        'Procesa la contrapropuesta horaria del docente: extrae el nuevo bloque sugerido, ' +
        'salón alternativo y motivo. El agente verifica compatibilidad antes de escalar al Director.',
      parameters: {
        type: 'object',
        properties: {
          asignacion_id:      { type: 'string' },
          nuevo_bloque_id:    { type: 'string', description: 'Bloque sugerido por el docente. Ej: D2' },
          salon_alternativo:  { type: 'string', description: '(Opcional) Aula preferida por el docente' },
          motivo:             { type: 'string', description: 'Justificación del docente' },
        },
        required: ['asignacion_id', 'nuevo_bloque_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'verificar_disponibilidad_docente',
      description:
        'Verifica si un docente está libre en un nuevo bloque propuesto y ' +
        'que no exista conflicto de sede con bloques consecutivos.',
      parameters: {
        type: 'object',
        properties: {
          docente_id:    { type: 'string' },
          nuevo_bloque_id: { type: 'string' },
        },
        required: ['docente_id', 'nuevo_bloque_id'],
      },
    },
  },
 
  // ── Flujo Estudiante ─────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'enviar_formato_prematricula',
      description:
        'Registra la solicitud de prematrícula del estudiante con las materias solicitadas ' +
        'para el semestre.',
      parameters: {
        type: 'object',
        properties: {
          estudiante_id:       { type: 'string' },
          programa_id:         { type: 'string' },
          semestre_actual:     { type: 'number' },
          materias_solicitadas:{ type: 'array', items: { type: 'string' }, description: 'IDs de materias solicitadas' },
        },
        required: ['estudiante_id', 'programa_id', 'semestre_actual', 'materias_solicitadas'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'aprobar_prematricula',
      description: 'El Director aprueba la solicitud de prematrícula del estudiante.',
      parameters: {
        type: 'object',
        properties: {
          solicitud_id:      { type: 'string' },
          director_id:       { type: 'string' },
          materias_aprobadas:{ type: 'array', items: { type: 'string' } },
        },
        required: ['solicitud_id', 'director_id', 'materias_aprobadas'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'rechazar_prematricula',
      description: 'El Director rechaza la solicitud de prematrícula del estudiante.',
      parameters: {
        type: 'object',
        properties: {
          solicitud_id: { type: 'string' },
          director_id:  { type: 'string' },
          motivo:       { type: 'string' },
        },
        required: ['solicitud_id', 'director_id', 'motivo'],
      },
    },
  },
];