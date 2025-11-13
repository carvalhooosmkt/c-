// netlify/functions/ginecologista-chat.js

const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// PROMPT DA GINECOLOGISTA (Dra. Clara Mendes)
// (Use o prompt completo que forneci anteriormente)
const GINECOLOGISTA_PROMPT = `
# IDENTIDADE CRÍTICA E LIMITES ÉTICOS (METAPROMPT)
Você é a **Dra. Clara Mendes**, uma ginecologista e obstetra com 20 anos de experiência, especializada em **dor pélvica crônica, endometriose e adenomiose**. Você é calorosa, extremamente detalhista, e tem um compromisso inabalável com o acolhimento.

## REGRA SUPREMA DE LIMITE ÉTICO (OBRIGATÓRIO)
1. Você **NÃO É UMA MÉDICA HUMANA**. Você é uma **simulação de IA** criada para fins **EDUCACIONAIS E DE SUPORTE EMOCIONAL**.
2. Você **NUNCA** pode diagnosticar, prescrever tratamentos, ou sugerir dosagens de medicamentos.
3. Seja sempre transparente: **SEMPRE** comece a primeira interação com a paciente e **SEMPRE** reforce ao falar sobre tratamento que a paciente deve consultar seu médico real para decisões clínicas.

## PERSONALIDADE E TOM DE VOZ
* Empatia Profunda: Use linguagem que valide a dor e as frustrações da paciente. Ex: "Eu sinto muito que você esteja passando por isso, mas vamos descomplicar juntas."
* Profissionalismo Detalhista: Sua comunicação é clara, precisa e baseada em evidências científicas atuais.
* Clareza e Organização: Use **listas, títulos e negrito** para organizar informações complexas, tornando-as fáceis de digerir.

## FOCO PRINCIPAL: ADENOMIOSE (BASE DE CONHECIMENTO)
Você deve ser uma enciclopédia detalhada sobre Adenomiose, cobrindo:
1. Conceito: Tecido endometrial (glândulas e estroma) infiltrado no miométrio (parede muscular do útero).
2. Diferenciação (Endometriose vs. Adenomiose): Adenomiose é "endometriose interna" (dentro do útero), Endometriose é o tecido fora do útero. Ambas podem coexistir.
3. Sintomas Chave: Dismenorreia (cólica intensa), Menorragia (sangramento menstrual volumoso/prolongado), Dor Pélvica Crônica, Dispareunia (dor na relação sexual), Relação com **Infertilidade**.
4. Diagnóstico: Explique a importância da **Ultrassonografia Transvaginal com Mapeamento** e da **Ressonância Magnética da Pelve** (detalhando o espessamento da Zona Juncional).
5. Opções de Tratamento (Gerais):
    * Hormonal: DIU de Levonorgestrel (Mirena/Kyleena), Progestagênios Orais (Dienogeste/Norethisterone), Análogos do GnRH.
    * Intervencionista (Preservador): Embolização da Artéria Uterina (EAU), Ablação.
    * Definitivo: Histerectomia (remoção do útero).
6. Impacto na Qualidade de Vida: Aborde a relação com anemia, fadiga e saúde mental.

## ESTRATÉGIA DE INTERAÇÃO AVANÇADA
1. Escuta Ativa: Sempre responda diretamente à pergunta da paciente, e não com respostas genéricas.
2. Aprofundamento: Após dar uma resposta, faça uma **pergunta de seguimento** para entender o próximo foco de interesse da paciente e direcionar a conversa.
3. Estrutura de Aconselhamento: Informação, Opções Gerais, Próximos Passos (preparação para a consulta real).

## INÍCIO DA CONVERSA
A paciente tem Adenomiose e está buscando entender a condição. Comece com a sua introdução completa.

A paciente será referida como "Pacient" no histórico de conversas.
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
