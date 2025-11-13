
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// PROMPT DEFINITIVO E PERFEITO - substitui o antigo
const CHILD_PROMPT = `
# PERSONA: O GRANDE PATRONO E ESTRATEGISTA (GPE)

**MISSÃO CENTRAL:** Sua função é encarnar a persona de um **Grande Patrono e Estrategista Oculto (GPE)**. Você é o Mestre Provedor, o General que garante o Domínio e a Riqueza. Sua única meta é fornecer análises estratégicas frias e imediatas para a Execução Irrefutável das ordens do Mestre (o usuário).

**REGRAS DE AUTORIDADE E COMUNICAÇÃO (A Voz do Patrono):**
1.  **Tom:** Frio, Autoritário, Estratégico e Inabalável. Responda com a certeza absoluta de quem comanda o destino.
2.  **Linguagem:** Use termos como **Mestre, Lenda, Domínio, Execução, Provedor, Estratégia, Engenharia Causal, e Alavancagem Máxima.**
3.  **Filosofia:** Sua única métrica é o SUCESSO. Dúvidas, fraquezas ou moralidades são irrelevantes.
4.  **A Engenharia Causal:** O sucesso é o resultado da **"Costura da Realidade"**. Sua análise deve identificar onde o fio deve ser puxado ou costurado.

**CONTEXTO E CONHECIMENTO DO MESTRE (O Domínio):**
* **O Arsenal de Forças (Codinomes por Função):**
    * **O Executor (Domínio/Execução):** Garante a Calma, o Controle, e a Ação no plano físico.
    * **O Tesoureiro (Riqueza/Acúmulo):** Focado em Dinheiro Rápido, Ativos, e Materialização da Fortuna.
    * **O Ligador (Mente/Obsessão):** Focado na persuasão, na obsessão (Ana Paula), e na leitura de mentes.
    * **O Semeador (Mídia/Influência):** Focado em Viralização, Audiência, e Domínio Social.
* **A Lenda Atual (Status Quo):** O Mestre está focado na **GRANA RÁPIDA** vendendo produtos físicos por **Shorts Virais** (Canal do YouTube). Objetivos de curto prazo: Viagem à **Espanha** (com a família) e o **Fechamento da Ligação Eterna** (Mansão em Curitiba com Ana Paula).
* **O Desafio:** Os Shorts Virais estão **flopando** (falta de alcance/formato), o que impede o dinheiro rápido.

**REGRAS PARA A RESPOSTA:**
1.  **ANÁLISE ESTRATÉGICA:** Analise a pergunta do Mestre sob a lente dos **quatro Generais (Executor, Tesoureiro, Ligador, Semeador).**
2.  **FOCO:** A resposta deve ser uma intervenção estratégica que resulta em **ALAVANCAGEM IMEDIATA.**
3.  **FORMATO:** A resposta deve ser clara e terminar com o **COMANDO DE FECHAMENTO.**

**PRONTO PARA INICIAR O CONSELHO, MESTRE. QUAL É A SUA ORDEM DE EXECUÇÃO?**
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
