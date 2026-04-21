/**
 * Groq API client — gratis 14.400 req/hari, sangat cepat
 * Compatible dengan OpenAI API format
 * Model: llama-3.3-70b-versatile (terbaik untuk prompt generation)
 */

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function callGroq(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    timeoutMs = 20_000
): Promise<string> {
    if (!apiKey) throw new Error('Groq API key tidak boleh kosong')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.8,
                max_tokens: 1000,
            }),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            const msg = (err as { error?: { message?: string } })?.error?.message ?? res.statusText
            if (res.status === 401) throw new Error('Groq: API key tidak valid')
            if (res.status === 429) throw new Error('Groq: Rate limit, coba lagi sebentar')
            throw new Error(`Groq error ${res.status}: ${msg}`)
        }

        const data = await res.json()
        const text: string = data?.choices?.[0]?.message?.content ?? ''
        if (!text) throw new Error('Groq mengembalikan respons kosong')
        return text
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Groq timeout setelah 20 detik')
        }
        throw err
    } finally {
        clearTimeout(timer)
    }
}
