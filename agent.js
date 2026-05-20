// agent.js

import { groq } from "./llm.js";

import { SYSTEM_PROMPT, TOOLS } from "./prompts.js";

import { toolImplementations } from "./tools.js";

export async function ejecutarAgente(userInput) {

  const messages = [

    {
      role: "system",
      content: SYSTEM_PROMPT,
    },

    {
      role: "user",
      content: userInput,
    },

  ];

  while (true) {

    const response = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      temperature: 0.2,

      messages,

      tools: TOOLS,

      tool_choice: "auto",

    });

    const message = response.choices[0].message;

    // RESPUESTA NORMAL
    if (!message.tool_calls) {

      return message.content;
    }

    // GUARDAR TOOL CALL
    messages.push(message);

    // EJECUTAR TOOLS
    for (const toolCall of message.tool_calls) {

      const functionName = toolCall.function.name;

      const args = JSON.parse(
        toolCall.function.arguments
      );

      console.log("Tool ejecutada:", functionName);

      // BUSCAR IMPLEMENTACIÓN
      const toolFunction =
        toolImplementations[functionName];

      if (!toolFunction) {

        throw new Error(
          `Tool no implementada: ${functionName}`
        );
      }

      // EJECUTAR TOOL
      const result = await toolFunction(args);

      // RESPUESTA TOOL
      messages.push({

        role: "tool",

        tool_call_id: toolCall.id,

        content: JSON.stringify(result),

      });
    }
  }
}