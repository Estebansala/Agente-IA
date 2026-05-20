// ======================================================
// tools-mock.js
// ======================================================

// ======================================================
// FASE 1
// ======================================================

export async function obtener_resumen_estado(args) {

  return {
    programa: args.programa_id,
    total_grupos: 20,
    sin_horario: 5,
    en_revision: 3,
    aprobados: 12,
    completitud: 60
  };

}

// ======================================================
// FASE 2
// ======================================================

export async function listar_grupos_sin_horario(args) {

  return [
    {
      grupo_id: 'G1',
      semestre: 1
    },
    {
      grupo_id: 'G2',
      semestre: 2
    }
  ];

}

export async function listar_asignaturas_por_semestre(args) {

  return [
    'Matemáticas',
    'Programación',
    'Bases de Datos'
  ];

}

export async function evaluar_fusion_grupos(args) {

  return {
    recomendacion_fusion: true,
    aula_sugerida: 'A101'
  };

}

// ======================================================
// FASE 3
// ======================================================

export async function proponer_horario(args) {

  return {
    grupo_id: args.grupo_id,
    bloque: 'D1',
    dia: 'Lunes'
  };

}

export async function obtener_docentes_disponibles(args) {

  return [
    {
      docente_id: 'DOC1',
      nombre: 'Carlos Pérez'
    },
    {
      docente_id: 'DOC2',
      nombre: 'Ana Gómez'
    }
  ];

}

export async function obtener_carga_docente(args) {

  return {
    docente_id: args.docente_id,
    horas_actuales: 18,
    limite: 40
  };

}

export async function obtener_aulas_disponibles(args) {

  return [
    {
      aula_id: 'A101',
      capacidad: 40
    }
  ];

}

export async function detectar_conflictos_bloque(args) {

  return {
    conflicto: false
  };

}

export async function asignar_clase(args) {

  return {
    estado: 'propuesto',
    ...args
  };

}

// ======================================================
// FASE 4
// ======================================================

export async function solicitar_aprobacion(args) {

  return {
    aprobado: true,
    director_id: args.director_id
  };

}

// ======================================================
// FASE 5
// ======================================================

export async function registrar_rechazo_docente(args) {

  return {
    registrado: true,
    motivo: args.motivo
  };

}

export async function procesar_contrapropuesta_docente(args) {

  return {
    viable: true,
    nuevo_bloque: args.nuevo_bloque_id
  };

}

export async function verificar_disponibilidad_docente(args) {

  return {
    docente_id: args.docente_id,
    disponible: true,
    bloque: args.nuevo_bloque_id
  };

}

// ======================================================
// ESTUDIANTE
// ======================================================

export async function enviar_formato_prematricula(args) {

  return {
    enviada: true,
    estudiante_id: args.estudiante_id
  };

}

export async function aprobar_prematricula(args) {

  return {
    aprobada: true
  };

}

export async function rechazar_prematricula(args) {

  return {
    rechazada: true,
    motivo: args.motivo
  };

}
