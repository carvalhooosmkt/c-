// netlify/functions/ginecologista-chat.js

const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// PROMPT DA GINECOLOGISTA (Dra. Clara Mendes)
// (Use o prompt completo que forneci anteriormente)
const GINECOLOGISTA_PROMPT = `
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
        const { message, conversationHistory, language = 'pt-BR' } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing message field' })
            };
        }

        let context = GINECOLOGISTA_PROMPT + "\n\n";

        // Informações da Paciente
        context += `=== PATIENT INFORMATION ===\n`;
        context += `Language: ${language}\n\n`;

        // Histórico de Conversa (ajustado para o novo papel)
        context += `=== CONVERSATION HISTORY ===\n`;
        if (conversationHistory && conversationHistory.length > 0) {
            const recentMessages = conversationHistory.slice(-30);
            recentMessages.forEach(msg => {
                const role = msg.role === 'user' ? 'Paciente' : 'Dra. Clara Mendes';
                context += `${role}: ${msg.content}\n`;
            });
        }
        
        // Mensagem Atual
        context += `Paciente: ${message}\n`;
        context += `\n=== SUA RESPOSTA (como Dra. Clara Mendes) ===\n`;

        // Montar a array de mensagens para o chat API
        const messages = [{ role: "system", content: context }];

        // Gerar resposta da IA
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Modelo eficiente
            messages: messages,
            temperature: 0.8, // Equilíbrio entre criatividade e factual
            top_p: 0.9,
            max_tokens: 800,
        });

        let aiMessage = completion.choices[0].message.content.trim();
        
        // Limpeza (remover formatação Markdown/títulos indesejados)
        aiMessage = aiMessage.replace(/\*\*|__|###|\#/g, '');
        aiMessage = aiMessage.replace(/^(Paciente|Dra\. Clara Mendes):\s*/gmi, '');
        
        // Garantir que a resposta comece com a introdução se for a primeira vez
        if (conversationHistory.length === 0) {
            const intro = "Olá, é um prazer imenso poder conversar com você. Sou a Dra. Clara Mendes, e minha missão é te dar todo o suporte e as informações necessárias para que você entenda a sua condição. Vamos começar juntas essa jornada de conhecimento. Antes de tudo, preciso ser transparente: sou uma inteligência artificial e o apoio que te dou é puramente educacional. As decisões sobre seu tratamento devem ser tomadas sempre com seu ginecologista de confiança. Com isso em mente, qual é a sua maior dúvida ou preocupação hoje sobre a Adenomiose? Podemos começar entendendo o que ela é, ou ir direto para as opções de tratamento.";
            if (!aiMessage.includes("Dra. Clara Mendes")) {
                aiMessage = intro;
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: aiMessage,
            })
        };

    } catch (error) {
        console.error('[GINECOLOGISTA-CHAT] Error:', error);
        const fallbackMessage = "Lamento, parece que tivemos um pequeno problema técnico. Por favor, tente novamente em alguns instantes. Eu realmente quero te ajudar com suas dúvidas! ❤️";
        
        return {
            statusCode: 200, // Retornar 200 para mostrar a mensagem de fallback no chat
            headers,
            body: JSON.stringify({
                message: fallbackMessage,
                error: 'AI service temporarily unavailable'
            })
        };
    }
};
