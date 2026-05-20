// Persona 3: conexión con Groq API

import Groq from 'groq-sdk';
import 'dotenv/config';
import { TOOLS } from './prompts.js';

const groq = new Groq({ apiKey: process.env.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 });

export async function llamarLLM(messages) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 1000
    });

    return response.choices[0].message;

  } catch (error) {
    if (error.status === 401) throw new Error('❌ API Key inválida. Verifica el .env');
    if (error.status === 429) {
      console.log('⏳ Rate limit, esperando 3s...');
      await new Promise(r => setTimeout(r, 3000));
      return llamarLLM(messages);
    }
    throw error;
  }
}