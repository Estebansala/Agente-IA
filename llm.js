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

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ======================================================
// FUNCIÓN PRINCIPAL
// ======================================================

export async function callLLM(messages) {

  console.log('\n====================================');
  console.log('📨 Mensajes enviados al LLM');
  console.log('====================================\n');

  console.log(messages);

  try {

    // ======================================================
    // LLAMADA AL MODELO
    // ======================================================

    const completion = await groq.chat.completions.create({

      model: 'llama-3.3-70b-versatile',

      messages,

      temperature: 0,

      tools: TOOLS,

      tool_choice: 'auto'

    });

    // ======================================================
    // RESPUESTA DEL MODELO
    // ======================================================

    const message = completion.choices[0].message;

    return message;

  } catch (error) {

    console.log('\n====================================');
    console.log('❌ ERROR EN LLM');
    console.log('====================================\n');

    console.error(error);

    return {
      content: 'Ocurrió un error consultando el modelo.'
    };

  }

}
