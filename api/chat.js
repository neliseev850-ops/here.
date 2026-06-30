export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    
    // Берём ключ AetherCode из переменных Vercel (CLAUDE_API_KEY)
    const apiKey = process.env.CLAUDE_API_KEY; 

    try {
        // Ограничиваем историю до 5 последних реплик для экономии твоих 2 млн токенов
        const limitedMessages = messages.slice(-5);

        // Отправляем запрос на шлюз AetherCode через OpenAI-совместимый эндпоинт
        const response = await fetch("https://api.aethercode.my/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Используем имя модели Claude, как требует прокси
                model: "claude-3-5-sonnet-20241022", 
                messages: limitedMessages,
                max_tokens: 400 // Ограничение длины ответа ИИ ради экономии баланса
            })
        });

        const data = await response.json();

        // Возвращаем данные обратно на фронтенд. 
        // Так как формат OpenAI, маскировка не нужна — твой index.html всё поймет сам!
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Ошибка сервера при запросе к AetherCode' });
    }
}
