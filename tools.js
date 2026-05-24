// tools.js — Persona B
// Semanas 1 y 2: estructura lista, funciones pendientes de integración con Módulo 3.
// Semana 3: reemplazar el throw por la lógica real que entregue el Módulo 3.
// NO cambiar los nombres de las funciones exportadas — el agente las llama por nombre exacto.

/**
 * detectar_conflictos
 * Detecta choques de horario en un periodo académico.
 *
 * Recibe:  { periodo: string }  → Ej: "2025-1"
 * Devuelve: {
 *   periodo: string,
 *   conflictos: Array<{
 *     tipo: 'aula_ocupada' | 'docente_doble',
 *     aula?: string,
 *     docente?: string,
 *     dia: string,
 *     franja: string,
 *     grupos: number[]
 *   }>,
 *   total: number
 * }
 */
export function detectar_conflictos({ periodo }) {
  // TODO semana 3: reemplazar por llamada real al Módulo 3
  throw new Error('detectar_conflictos: integración con Módulo 3 pendiente');
}

/**
 * verificar_disponibilidad
 * Consulta si un docente está libre en un día y franja específicos.
 *
 * Recibe:  { docente_id: number, dia: string, franja: string }
 *          → Ej: { docente_id: 1, dia: "Lunes", franja: "8-10" }
 * Devuelve: {
 *   docente_id: number,
 *   dia: string,
 *   franja: string,
 *   disponible: boolean,
 *   motivo: string | null   ← null si está disponible
 * }
 */
export function verificar_disponibilidad({ docente_id, dia, franja }) {
  // TODO semana 3: reemplazar por llamada real al Módulo 3
  throw new Error('verificar_disponibilidad: integración con Módulo 3 pendiente');
}

/**
 * asignar_clase
 * Asigna una clase a un grupo, docente y aula en un horario determinado.
 *
 * Recibe:  { grupo_id: number, docente_id: number, aula_id: number, dia: string, franja: string }
 *          → Ej: { grupo_id: 2, docente_id: 1, aula_id: 5, dia: "Martes", franja: "10-12" }
 * Devuelve: {
 *   exito: boolean,
 *   mensaje: string
 * }
 */
export function asignar_clase({ grupo_id, docente_id, aula_id, dia, franja }) {
  // TODO semana 3: reemplazar por llamada real al Módulo 3
  throw new Error('asignar_clase: integración con Módulo 3 pendiente');
}

/**
 * listar_grupos_sin_horario
 * Retorna todos los grupos que aún no tienen horario asignado.
 *
 * Recibe:  (nada)
 * Devuelve: {
 *   grupos: Array<{
 *     id: number,
 *     materia: string,
 *     semestre: number,
 *     inscritos: number
 *   }>,
 *   total: number
 * }
 */
export function listar_grupos_sin_horario() {
  // TODO semana 3: reemplazar por llamada real al Módulo 3
  throw new Error('listar_grupos_sin_horario: integración con Módulo 3 pendiente');
}
