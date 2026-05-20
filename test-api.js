
import { callLLM } from './llm.js';

const mensajes = [
  {
    role: 'user',
    content: 'Hola, responde con una sola frase en español confirmando que estás funcionando.'
  }
];

console.log('🔌 Probando conexión con Groq...\n');

try {
  const respuesta = await callLLM(mensajes);
  console.log('\n✅ Conexión exitosa!\n');
  console.log('Respuesta del modelo:');
  console.log(JSON.stringify(respuesta, null, 2));
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}