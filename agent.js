// ======================================================
// agent.js — Loop principal del agente IA
// ======================================================

import dotenv from 'dotenv';
dotenv.config();

import readline from 'readline';

import { callLLM } from './llm.js';
import * as tools from './tools-mock.js';
import { SYSTEM_PROMPT } from './prompts.js';

const MAX_ITERACIONES = 10;

// ======================================================
// FUNCIÓN PRINCIPAL
// ======================================================

async function runAgent(question) {

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: question
    }
  ];

  // ======================================================
  // LOOP REACT
  // ======================================================

  for (let i = 0; i < MAX_ITERACIONES; i++) {

    console.log('\n==============================');
    console.log(`ITERACIÓN ${i + 1}`);
    console.log('==============================');

    // ======================================================
    // LLAMAR LLM
    // ======================================================

    const response = await callLLM(messages);

    console.log('\nRespuesta LLM:\n');
    console.log(response);

    messages.push(response);

    // ======================================================
    // SI HAY TOOL CALLS
    // ======================================================

    if (response.tool_calls) {

      for (const toolCall of response.tool_calls) {

        const toolName = toolCall.function.name;

        const args = JSON.parse(toolCall.function.arguments);

        console.log('\n🔧 Tool llamada:', toolName);
        console.log('📥 Argumentos:', args);

        // ======================================================
        // VALIDAR TOOL
        // ======================================================

        if (!tools[toolName]) {

          console.log(`❌ La tool "${toolName}" no existe.`);

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: `La tool "${toolName}" no existe`
            })
          });

          continue;
        }

        // ======================================================
        // EJECUTAR TOOL
        // ======================================================

        try {

          const result = await tools[toolName](args);

          console.log('\n📤 Resultado tool:\n');
          console.log(result);

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });

        } catch (error) {

          console.log('\n❌ Error ejecutando tool:\n');
          console.error(error);

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: error.message
            })
          });

        }

      }

    } else {

      // ======================================================
      // RESPUESTA FINAL
      // ======================================================

      return response.content;

    }

  }

  return 'El agente no pudo completar la tarea.';
}

// ======================================================
// LEER PREGUNTA DESDE CONSOLA
// ======================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n🤖 Haz una pregunta al agente:\n\n', async (pregunta) => {

  try {

    const respuesta = await runAgent(pregunta);

    console.log('\n====================================');
    console.log('✅ RESPUESTA FINAL DEL AGENTE');
    console.log('====================================\n');

    console.log(respuesta);

  } catch (error) {

    console.log('\n====================================');
    console.log('❌ ERROR GENERAL');
    console.log('====================================\n');

    console.error(error);

  }

  rl.close();

});
