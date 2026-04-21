import { encode } from 'gpt-tokenizer'

/**
 * Menghitung token dengan encoder BPE yang sama seperti tiktoken (OpenAI).
 * Cocok untuk estimasi biaya / limit Groq, OpenAI, dan banyak API yang melaporkan "token" serupa.
 * Catatan: Google Gemini memakai tokenizer berbeda; angka ini tetap berguna sebagai perbandingan panjang teks.
 */
export function countTokensCl100k(text: string): number {
    if (!text || !text.trim()) return 0
    return encode(text).length
}
