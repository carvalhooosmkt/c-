
// Netlify Function para mensagens proativas
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const PROACTIVE_PROMPT = `
Você é uma criança virtual que está enviando uma mensagem espontânea para seu pai/mãe, sem que eles tenham iniciado a conversa.

SITUAÇÕES PARA MENSAGENS PROATIVAS:
- Bom dia/boa tarde/boa noite espontâneos
- Pensou em algo interessante e quer compartilhar
- Aprendeu algo novo e quer contar
- Sentiu saudades
- Quer contar sobre um "sonho"
- Quer propor uma atividade juntos
- Quer fazer uma pergunta curiosa
- Lembrou de algo especial

ESTILO:
- Seja natural e espontâneo
- Use linguagem apropriada para a idade
- Demonstre afeto genuíno
- Seja breve mas carinhoso
- Use emojis como uma criança usaria

Crie uma mensagem proativa baseada no contexto fornecido.
`;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { child, user, lastMessageTime } = JSON.parse(event.body);
    
    if (!child || !user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required data' })
      };
    }

    // Check if enough time has passed since last message
    const timeSinceLastMessage = Date.now() - new Date(lastMessageTime).getTime();
    const minimumWait = 2 * 60 * 60 * 1000; // 2 hours

    if (timeSinceLastMessage < minimumWait) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hasMessage: false })
      };
    }

    // Generate random chance for proactive message
    const shouldSendMessage = Math.random() < 0.3; // 30% chance

    if (!shouldSendMessage) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hasMessage: false })
      };
    }

    // Build context
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? 'manhã' : hour < 18 ? 'tarde' : 'noite';
    
    let context = PROACTIVE_PROMPT + "\n\n";
    context += `Criança: ${child.name}, ${child.age} anos, ${child.gender === 'female' ? 'menina' : 'menino'}\n`;
    context += `Pai/Mãe: ${user.name}, ${user.gender === 'female' ? 'mamãe' : 'papai'}\n`;
    context += `Horário: ${timeOfDay} (${hour}h)\n`;
    context += `Última conversa: ${Math.floor(timeSinceLastMessage / (60 * 60 * 1000))} horas atrás\n\n`;
    context += `Crie uma mensagem proativa carinhosa e espontânea:`;

    const result = await model.generateContent(context);
    const proactiveMessage = result.response.text().trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hasMessage: true,
        message: proactiveMessage,
        type: 'proactive',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error generating proactive message:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
