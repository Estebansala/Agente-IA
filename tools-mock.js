// Persona 5: respuestas simuladas para probar sin depender del Módulo 3

export function detectar_conflictos({ periodo }) {
  return {
    periodo,
    conflictos: [
      { tipo: 'aula_ocupada', aula: 'B201', dia: 'Lunes', franja: '8-10', grupos: [1, 3] },
      { tipo: 'docente_doble', docente: 'Felipe Vasco', dia: 'Martes', franja: '10-12', grupos: [2, 4] }
    ],
    total: 2
  };
}

export function verificar_disponibilidad({ docente_id, dia, franja }) {
  const disponible = !(docente_id === 1 && dia === 'Martes' && franja === '14-16');
  return {
    docente_id, dia, franja,
    disponible,
    motivo: disponible ? null : 'El docente ya tiene clase asignada'
  };
}

export function asignar_clase({ grupo_id, docente_id, aula_id, dia, franja }) {
  return {
    exito: true,
    mensaje: `Clase asignada: Grupo ${grupo_id} con Docente ${docente_id} en Aula ${aula_id} — ${dia} ${franja}`
  };
}

export function listar_grupos_sin_horario() {
  return {
    grupos: [
      { id: 3, materia: 'Bases de Datos', semestre: 3, inscritos: 18 },
      { id: 5, materia: 'Programación 4', semestre: 5, inscritos: 15 }
    ],
    total: 2
  };
}