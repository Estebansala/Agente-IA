// Prueba rápida de conexión con Groq
// Correr con: node test-api.js

import { correrAgente } from './agent.js';

const pregunta = '¿Hay conflictos en el horario del periodo 2025-1?';
await correrAgente(pregunta);