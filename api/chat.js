export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY; 
    const limitedMessages = messages.slice(-5);

    // Массив вариантов, включая точное название твоего пакета
    const modelsToTry = [
        "Claude Opus 4.8",      // Точное имя, как ты указал
        "claude-opus-4.8",      // Вариант маленькими буквами через дефис
        "claude-4.8-opus"       // Альтернативный технический ID
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Отправляем запрос с моделью: ${modelName}`);
            
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
            
            // Если шлюз принял модель и не вернул ошибку авторизации/лимитов
            if (response.ok && !data.error) {
                console.log(`Запрос успешно прошёл с моделью: ${modelName}`);
                return res.status(200).json(data);
            }
            
            console.warn(`Модель "${modelName}" не подошла. Ответ сервера:`, data);
        } catch (err) {
            console.error(`Ошибка сети на модели ${modelName}:`, err);
        }
    }

    return res.status(500).json({ 
        error: 'Провайдер не принял ни один вариант ID модели Claude Opus 4.8. Проверь вкладку Logs в Vercel.' 
    });
}
