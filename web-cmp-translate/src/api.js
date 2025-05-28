import OpenAI from 'openai'

const translate = async function (baseURL, apiKey, model, prompt, text, temperature) {
    const maxRetries = 3;
    let lastError = null;

    const openai = new OpenAI({
        baseURL: baseURL,
        apiKey: apiKey, // required but unused
        dangerouslyAllowBrowser: true,
        temperature: temperature,
        defaultHeaders: {
            "HTTP-Referer": "https://vitebooks.certseeds.com/web-cmp-trans/",
            "X-Title": "vitebooks-web-cmp-translate",
        },
    })
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const completion = await openai.chat.completions.create({
                model : model,
                messages : [
                    { role: "system", content: prompt }
                    , { role: "user", content: `${text}` }
                ]
            })
            // 检查响应是否有效
            if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
                throw new Error('Invalid response structure from API');
            }
            return completion.choices[0].message.content;
        } catch (error) {
            lastError = error;
            console.error(`Translation attempt ${attempt} failed:`, error.message);
            // 如果不是最后一次尝试，等待一段时间后重试
            if (attempt < maxRetries) {
                const delay = attempt * 1000; // 递增延迟: 1s, 2s, 3s
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // 三次重试都失败后返回错误信息
    console.error('All translation attempts failed:', lastError);
    return "请求错误";
}

export {
    translate
}
