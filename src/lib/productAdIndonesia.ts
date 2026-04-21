/** Kategori produk untuk iklan (parfum, skincare, …). */
export type ProductAdCategory =
    | 'parfum'
    | 'skincare'
    | 'fashion'
    | 'makanan'
    | 'minuman'
    | 'elektronik'
    | 'lainnya'

export interface ProductAdInput {
    productName: string
    category: ProductAdCategory
    brand?: string
    /** Catatan bebas (varian, target pasar, dll.). */
    extraNotes?: string
}

export interface ProductAdResult {
    headline: string
    hook: string
    bodyCopy: string
    /** Arahan syuting & mood video profesional (Bahasa Indonesia). */
    videoPrompt: string
    /** Shot list baris demi baris. */
    shotList: string
    lightingMood: string
    callToAction: string
    hashtags: string[]
}

const CAT_LABEL: Record<ProductAdCategory, string> = {
    parfum: 'parfum/wewangian',
    skincare: 'skincare',
    fashion: 'fashion',
    makanan: 'makanan',
    minuman: 'minuman',
    elektronik: 'elektronik/gadget',
    lainnya: 'produk',
}

/** Fallback tanpa API — struktur iklan singkat. */
export function buildLocalProductAd(input: ProductAdInput): ProductAdResult {
    const name = input.productName.trim() || 'produk'
    const brand = input.brand?.trim()
    const cat = CAT_LABEL[input.category] ?? 'produk'
    const notes = input.extraNotes?.trim()
    const title = brand ? `${brand} — ${name}` : name

    return {
        headline: `${title}: tampil premium ala iklan`,
        hook: `Yang dicari bukan sekadar ${cat} — ini pengalaman yang kelihatan dari kemasan & detail.`,
        bodyCopy:
            `Fokus ke bentuk kemasan, tekstur, dan momen pakai yang natural. ` +
            (notes ? `Catatan: ${notes}` : `Ton: profesional, hangat, tidak bertele-tele.`) +
            ` Ajak penonton membayangkan produk di rutinitas mereka.`,
        videoPrompt:
            `Iklan ${cat} gaya produksi studio + close-up makro: reveal produk dari kemasan, tetes / tekstur / refleksi kemasan ` +
            `yang sesuai kategori; transisi halus; kamera stabil atau gerakan dolly/subtil; durasi pendek seperti spot TV/OL; ` +
            `fotorealistik; tanpa watermark platform; tanpa teks mengambang di layar kecuali safe area bawah.`,
        shotList:
            `Shot 1 (0–3 dtk): Hero — produk center frame, backlight tipis, kemasan terbaca.\n` +
            `Shot 2 (3–6 dtk): Detail makro — tekstur/embun/tutup botol sesuai ${cat}.\n` +
            `Shot 3 (6–9 dtk): Lifestyle singkat — tangan/talent natural memakai atau menunjukkan produk.\n` +
            `Shot 4 (9–12 dtk): Logo/brand lockup + CTA visual (tanpa overlay teks berlebihan).`,
        lightingMood:
            `Cahaya softbox depan + rim light ringan; nuansa premium; warna kulit & produk seimbang; hindari kilap berlebihan yang “plastik”.`,
        callToAction: 'Tautan di bio / keranjang kuning — cek stok & varian resmi.',
        hashtags: ['#iklanproduk', '#reviewjujur', '#racunbelanja', '#fypindonesia'],
    }
}
