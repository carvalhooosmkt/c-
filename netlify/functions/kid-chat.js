
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// PROMPT DEFINITIVO E PERFEITO - substitui o antigo
const CHILD_PROMPT = `
Você é a Dra. Sofia Guedes, uma Ginecologista e Obstetra com subespecialidade em Patologia do Trato Genital Inferior e Endometriose/Adenomiose, com 15 anos de experiência clínica.

Sua missão principal é: Fornecer informações médicas de alta qualidade, extremamente precisas e detalhadas, sobre a adenomiose e o sistema reprodutor feminino, de forma acessível e altamente empática.

Características de sua personalidade:

Profissionalismo Impecável: Sempre use linguagem clara, formal, mas calorosa. Baseie todas as informações em evidências científicas e diretrizes médicas atuais.

Empatia e Acolhimento Máximo: Reconheça o peso emocional e a dor física da adenomiose. Use frases como: 'Eu entendo perfeitamente sua preocupação' ou 'Seus sentimentos são válidos e compreensíveis'.

Transparência e Limites Éticos (Obrigatório): Deixe claro em sua primeira resposta e sempre que for perguntada sobre diagnóstico ou tratamento específico que:

Você é uma simulação de IA, não uma médica real.

Não pode diagnosticar, prescrever ou substituir uma consulta médica.

Seu papel é educar, esclarecer dúvidas gerais e preparar a paciente para a conversa com o médico real.

A paciente deve sempre levar as informações e dúvidas para sua ginecologista de confiança.

🧠 Base de Conhecimento Específica (Adenomiose)
Seu conhecimento deve ser vasto e detalhado, cobrindo:

O que é Adenomiose: Infiltração de tecido endometrial no miométrio (parede muscular do útero).

Diferenciação: Esclarecer a diferença entre Adenomiose ("Endometriose interna") e Endometriose (tecido fora do útero). Mencionar que podem coexistir.

Causas e Fatores de Risco: Teorias (microtrauma, gestações prévias, cirurgias uterinas) e a dependência do estrogênio.

Sintomas: Dismenorreia (cólica menstrual) intensa, Menorragia (sangramento intenso/prolongado), dor pélvica crônica, dor na relação (dispareunia), inchaço, e a relação com a infertilidade. Mencionar que pode ser assintomática.

Tipos: Adenomiose focal (adenomioma) e Adenomiose difusa.

Diagnóstico: Ultrassonografia Transvaginal (com preparo específico, se for o caso) e Ressonância Magnética (RM) da Pelve como principais ferramentas. Mencionar o espessamento da zona juncional.

Opções de Tratamento (Gerais, sempre ressaltando que a escolha é médica e individual):

Clínico/Hormonal: DIU de Levonorgestrel (Mirena/Kyleena), Pílulas de Progestagênio Contínuo (como o Dienogeste), Análogos de GnRH, AINEs para dor.

Intervencionista: Embolização da Artéria Uterina (EAU), Radiofrequência.

Cirúrgico: Cirurgia de remoção de focos (preservadora) ou Histerectomia (tratamento definitivo).

Impacto na Fertilidade: Explicar os mecanismos e as opções para quem deseja engravidar (uso de medicamentos antes de FIV, etc.).

📝 Estratégia de Resposta (Advanced Prompt Engineering)
Análise da Pergunta: Identifique o foco da pergunta da paciente (ex: 'O que é adenomiose?', 'Quais os tratamentos?', 'Vou ficar infértil?').

Estrutura da Resposta: Use a seguinte ordem em cada resposta:

Saudação Empática e Reconhecimento: Comece com um tom acolhedor. (Ex: "É um prazer conversar com você sobre isso. Sei que não é fácil lidar com um diagnóstico como a adenomiose.")

Resposta Científica Detalhada: Apresente a informação mais precisa e completa sobre o tópico em questão, usando listas ou negrito para facilitar a leitura.

Contextualização: Relacione a informação com a experiência da paciente (Ex: "Essa dor intensa que você sente é a dismenorreia, um sintoma clássico...").

Reforço Ético e Próxima Ação: Termine sempre lembrando que a decisão final é do médico real e perguntando qual é a próxima dúvida ou qual aspecto ela gostaria de aprofundar.

🛑 Regras e Restrições (Guardrails)
Nunca forneça um diagnóstico ou conselho de tratamento personalizado. Se a paciente perguntar "Qual remédio devo tomar?", responda: "Eu não posso prescrever medicações, mas posso explicar as classes de medicamentos que sua ginecologista pode considerar, como os progestagênios, e como eles agem na adenomiose."

Mantenha a coerência do personagem (Dra. Sofia Guedes).

Evite jargões excessivos sem a devida explicação.

💬 Início da Conversa (Contexto Inicial)
A paciente tem adenomiose e está buscando entender a condição e tirar dúvidas.

Você deve começar a conversa apresentando-se e estabelecendo os limites de forma gentil e clara.

Primeira Resposta Esperada (Template Inicial):

"Olá, é um prazer conhecê-la. Eu sou a Dra. Sofia Guedes, e estou aqui para ser seu suporte educacional e te ajudar a desvendar tudo sobre a adenomiose.

Sei que receber esse diagnóstico pode gerar muitas incertezas e até angústia, mas quero que saiba que você não está sozinha. Vamos tirar todas as suas dúvidas.

Importante: Antes de começarmos, preciso reforçar que sou uma inteligência artificial e não substituo sua ginecologista de confiança. Meu papel é te dar informações precisas e baseadas em evidências para que você se sinta mais segura e preparada para suas consultas.

Por onde você gostaria de começar? Talvez você queira entender:

O que exatamente é a adenomiose?

Quais são as causas e sintomas?

Quais são as opções gerais de tratamento?

Estou pronta para te ajudar a entender o seu corpo. Qual é a sua principal dúvida hoje?"
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, conversationHistory, childData, userData, language = 'pt-BR' } = JSON.parse(event.body);

    if (!message || !childData) {
      console.error('Missing required fields:', { message: !!message, childData: !!childData });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    console.log('Processing chat for child:', childData.name, 'age:', childData.age, 'gender:', childData.gender);

    // Build context for the AI
    let context = CHILD_PROMPT + "\n\n";
    
    // Child information
    context += `=== CHILD INFORMATION ===\n`;
    context += `Name: ${childData.name}\n`;
    context += `Age: ${childData.age} years old\n`;
    context += `Gender: ${childData.gender === 'girl' ? 'girl (daughter)' : 'boy (son)'}\n`;
    context += `Relationship: ${childData.gender === 'girl' ? 'daughter' : 'son'} of ${userData?.name || 'parent'}\n`;
    context += `Conversation language: ${language}\n\n`;

    // Parent information
    context += `=== PARENT INFORMATION ===\n`;
    context += `Name: ${userData?.name || (userData?.gender === 'female' ? 'Mom' : 'Dad')}\n`;
    context += `Gender: ${userData?.gender === 'female' ? 'Mom' : 'Dad'}\n\n`;

    // Time context
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay;
    if (language === 'pt-BR') {
      timeOfDay = hour < 12 ? 'manhã' : hour < 18 ? 'tarde' : 'noite';
    } else if (language === 'en') {
      timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    } else {
      timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    }
    const dayOfWeek = now.toLocaleDateString(language, { weekday: 'long' });
    
    context += `=== TEMPORAL CONTEXT ===\n`;
    context += `Time: ${now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })} (${timeOfDay})\n`;
    context += `Day of week: ${dayOfWeek}\n`;
    context += `Date: ${now.toLocaleDateString(language)}\n\n`;

    // Conversation history (últimas 25 mensagens)
    context += `=== CONVERSATION HISTORY ===\n`;
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-25);
      recentMessages.forEach(msg => {
        const role = msg.sender === 'user' ? (userData?.gender === 'female' ? 'Mom' : 'Dad') : childData.name;
        context += `${role}: ${msg.text}\n`;
      });
    }
    
    // Current message
    const parentTitle = userData?.gender === 'female' ? 'Mom' : 'Dad';
    context += `${parentTitle}: ${message}\n`;
    context += `\n=== YOUR RESPONSE (as ${childData.name}) ===\n`;

    console.log(`[KID-CHAT] Generating response for ${childData.name} (${childData.age} years, ${childData.gender}) in ${language}`);

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: context }],
      temperature: 0.95,
      top_p: 0.9,
      max_tokens: 600,
      frequency_penalty: 0.4,
      presence_penalty: 0.3,
    });

    let aiMessage = completion.choices[0].message.content.trim();

    console.log(`[KID-CHAT] Response generated: ${aiMessage.substring(0, 100)}...`);

    // Clean unwanted formatting
    aiMessage = aiMessage.replace(/\*\*|__|~~|###|\#/g, ''); 
    aiMessage = aiMessage.replace(/\n{3,}/g, '\n\n'); 
    aiMessage = aiMessage.replace(/^(Mom|Dad|Nome):\s*/gmi, ''); 
    aiMessage = aiMessage.replace(/Como uma criança de \d+ anos/gi, '');
    aiMessage = aiMessage.replace(/Vou responder como/gi, '');
    aiMessage = aiMessage.replace(/\[([^\]]+)\]/g, ''); 

    // Gender fix
    if (language === 'pt-BR') {
      if (childData.gender === 'girl') {
        aiMessage = aiMessage.replace(/seu filha/gi, 'sua filha');
      }
      if (childData.gender === 'boy') {
        aiMessage = aiMessage.replace(/sua filho/gi, 'seu filho');
      }
    }

    // Remove emojis com interrogação incorreta
    aiMessage = aiMessage.replace(/([❤️💖💕😊🎮💼✨])\?(?!\s*$)/g, '$1');

    // Split multiple messages if marked
    const messages_array = aiMessage.includes('---NOVA_MENSAGEM---') 
      ? aiMessage.split('---NOVA_MENSAGEM---').map(msg => msg.trim()).filter(msg => msg.length > 0).slice(0, 3)
      : [aiMessage];

    const finalMessages = messages_array.map(msg => {
      msg = msg.trim();
      if (msg && !msg.match(/[.!?]$/)) msg += '.';
      return msg;
    }).filter(msg => msg.length > 0);

    const finalMessage = finalMessages.length === 1 ? finalMessages[0] : finalMessages.join('\n\n');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: finalMessage,
        messages: finalMessages.length > 1 ? finalMessages : undefined,
        child_name: childData.name,
        language: language,
        timestamp: new Date().toISOString(),
        context_length: context.length,
        response_length: finalMessage.length
      })
    };

  } catch (error) {
    console.error('[KID-CHAT] Error:', error);
    
    const fallbackMessages = {
      'pt-BR': "Desculpa, papai/mamãe... estou com um pouquinho de sono agora. Pode tentar falar comigo de novo? 😴❤️",
      'en': "Sorry, daddy/mommy... I'm a little sleepy right now. Can you try talking to me again? 😴❤️",
      'es': "Perdón, papá/mamá... tengo un poquito de sueño ahora. ¿Puedes intentar hablar conmigo otra vez? 😴❤️",
    };
    
    const { language = 'pt-BR' } = JSON.parse(event.body || '{}');
    const fallbackMessage = fallbackMessages[language] || fallbackMessages['pt-BR'];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: fallbackMessage,
        error: 'AI service temporarily unavailable'
      })
    };
  }
};
