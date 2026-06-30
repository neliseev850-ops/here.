export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    
    // Берём защищенный секретный ключ Claude из настроек Vercel
    const apiKey = process.env.CLAUDE_API_KEY; 

    try {
        // 1. Извлекаем системный промпт (инструкции режимов), если фронтенд его передал
        let systemInstruction = "";
        let chatMessages = messages.filter(msg => {
            if (msg.role === 'system') {
                systemInstruction = msg.content;
                return false; // Удаляем из общего списка сообщений для Claude
            }
            return true;
        });

        // 2. ОПТИМАЛЬНАЯ ПАМЯТЬ: Передаем Claude только последние 5 сообщений диалога.
        // Это не даст контексту раздуваться, сохраняя отличную историю переписки.
        const limitedMessages = chatMessages.slice(-5);

        // 3. Отправляем запрос в Anthropic API
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01', // Спецификация API Anthropic
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022", // Самая умная и сбалансированная модель
                ...(systemInstruction && { system: systemInstruction }), // Передаем системный промпт в правильном поле
                messages: limitedMessages,
                max_tokens: 400 // Жесткое ограничение длины ответа ИИ для экономии твоих 2 млн токенов
            })
        });

        const data = await response.json();

        // 4. Маскируем ответ Claude под формат OpenAI/Groq, который ожидает твой index.html
        if (data.content && data.content[0]) {
            const formattedData = {
                choices: [
                    {
                        message: {
                            role: "assistant",
                            content: data.content[0].text
                        }
                    }
                ]
            };
            return res.status(200).json(formattedData);
        }

        // Если пришла ошибка от самого Claude, возвращаем её для отладки
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Ошибка сервера при запросе к Claude' });
    }
}
