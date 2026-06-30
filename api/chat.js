export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY; 
    const limitedMessages = messages.slice(-5);

    // Список возможных названий моделей для пакета Opus 4.8 в AetherCode
    const modelsToTry = [
        "claude-3-opus", 
        "claude-4.8-opus", 
        "claude-3-opus-20240229"
    ];

    // Перебираем варианты, пока какой-то из них не сработает успешно
    for (const modelName of modelsToTry) {
        try {
            console.log(`Пробуем модель: ${modelName}`);
            
            const response = await fetch("https://api.aethercode.my/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName, 
                    messages: limitedMessages,
                    max_tokens: 400 
                })
            });

            const data = await response.json();
            
            // Если в ответе нет явной ошибки от провайдера, отдаем фронтенду
            if (response.ok && !data.error) {
                console.log(`Успешно подошла модель: ${modelName}`);
                return res.status(200).json(data);
            }
            
            console.warn(`Модель ${modelName} вернула ошибку:`, data);
        } catch (err) {
            console.error(`Ошибка сети при проверке ${modelName}:`, err);
        }
    }

    // Если ни одна модель из списка не дала правильный ответ
    return res.status(500).json({ 
        error: 'Не удалось подобрать кодовое имя модели для Claude Opus 4.8. Проверь логи Vercel.' 
    });
}
