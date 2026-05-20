// ======================================================
// llm.js
// ======================================================

import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
import { TOOLS } from './prompts.js';

// ======================================================
// CLIENTE GROQ
// ======================================================

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Validación temprana: falla rápido si no hay key en .env
if (!process.env.GROQ_API_KEY) {
  throw new Error(
    '❌ GROQ_API_KEY no encontrada.\n' +
    '   Crea un archivo .env con: GROQ_API_KEY=gsk_TU_KEY_AQUI'
  );
}

// ======================================================
// FUNCIÓN PRINCIPAL
// ======================================================

export async function callLLM(messages) {

  console.log('\n====================================');
  console.log('📨 Mensajes enviados al LLM');
  console.log('====================================\n');
  console.log(messages);

  try {

    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages,
      temperature: 0,
      tools:       TOOLS,
      tool_choice: 'auto',
      max_tokens:  1000
    });

    const message = completion.choices[0].message;
    return message;

  } catch (error) {

    console.log('\n====================================');
    console.log('❌ ERROR EN LLM');
    console.log('====================================\n');

    // 401 — API Key inválida o expirada
    if (error.status === 401) {
      throw new Error('❌ API Key inválida (401). Genera una nueva en console.groq.com');
    }

    // 429 — Rate limit: esperar 3s y reintentar una vez
    if (error.status === 429) {
      console.warn('⏳ Rate limit. Reintentando en 3s...');
      await new Promise(r => setTimeout(r, 3000));
      return callLLM(messages);
    }

    // Cualquier otro error — relanzar para que agent.js lo vea
    throw error;
  }
}