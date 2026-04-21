/**
 * Generator konten affiliate TikTok untuk pasar Indonesia — tanpa API.
 * Pola: hook 0–3 detik, narasi percakapan, CTA sesuai platform (keranjang kuning / e-commerce).
 */

export type TikTokTone = 'gen_z' | 'casual' | 'warm'
export type TikTokPlatform = 'tiktok_shop' | 'shopee' | 'tokopedia' | 'campur'

/** Suara di output video: diam (tanpa bicara) atau VO Bahasa Indonesia singkat. */
export type VideoAudioMode = 'silent' | 'voice_id'

/** Apa yang ditonjolkan di video (dipakai talent/model). */
export type WearableInVideo = 'baju' | 'celana' | 'sepatu' | 'aksesoris' | 'lainnya'

/** Gaya konten / setting adegan (OOTD cermin, jalan, dll.). */
export type ContentScenePreset =
    | 'bebas'
    | 'ootd_mirror'
    | 'ootd_street'
    | 'unboxing'
    | 'flatlay'
    | 'detail_product'

/** Ekspresi wajah / mood talent untuk prompt video & shot list. */
export type CharacterExpressionPreset =
    | 'natural'
    | 'smile'
    | 'soft_smile'
    | 'neutral'
    | 'confident'
    | 'playful'

export interface TikTokLocalInput {
    productName: string
    category: string
    priceHint: string
    features: string
    targetAudience: string
    brand: string
    tone: TikTokTone
    platform: TikTokPlatform
    mode: 'quick' | 'full'
    /** Untuk tips syuting (9:16 vs 16:9). */
    screenFormat: 'portrait' | 'landscape'
    /** Jenis produk yang dipakai/ditampilkan di video (baju, celana, sepatu, …). */
    wearableItem: WearableInVideo
    /** Siapa yang pakai di video, contoh: "model perempuan 20an", "pria casual", "kamu sendiri POV". */
    whoInVideo: string
    /** Konteks adegan: OOTD cermin, street, unboxing, dll. */
    scenePreset: ContentScenePreset
    /** Ekspresi wajah: senyum, netral, dll. */
    expressionPreset: CharacterExpressionPreset
    /** Catatan bebas untuk ekspresi/pose (opsional), contoh: "senyum ke arah kaca". */
    expressionNote: string
    /**
     * Satu klip/render maksimal dari pihak ketiga (mis. 8 dtk).
     * Rencana shot dibagi per segmen ini.
     */
    clipSegmentSeconds?: number
    /**
     * Total durasi video yang direncanakan (kelipatan clipSegmentSeconds, mis. 8×3 = 24 dtk).
     */
    durationSeconds?: number
    /**
     * Default `silent`: tanpa narasi/VO; karakter tidak berbicara. `voice_id` = VO singkat Bahasa Indonesia selaras hook.
     */
    videoAudioMode?: VideoAudioMode
}

export interface TikTokLocalResult {
    hook: string
    caption: string
    hashtags: string[]
    callToAction: string
    shootingTip: string
    /** Satu paragraf Bahasa Indonesia: adegan + instruksi visual (hemat token, cukup untuk AI video / tim). */
    videoPrompt: string
    /** Urutan shot: pose, zoom, sudut & gerakan kamera (Bahasa Indonesia saja). */
    rencanaShot: string
}

const HOOKS_ID: string[] = [
    'Jangan skip dulu — barang ini beneran ngebantu {product} tanpa ribet.',
    'POV: kamu baru tahu ada {product} seenak ini di harga segini.',
    'Spoiler: endingnya aku checkout juga. Ini review jujur {product}.',
    'Udah lewat FYP kamu 3x? Mungkin ini tanda buat cek {product}.',
    'Bukan endorse sembarang — ini yang aku pakai sendiri: {product}.',
    'Temenku nanya mulu link-nya — akhirnya aku spill {product} di sini.',
    'Konten ini buat yang suka bandingin review dulu sebelum beli {product}.',
    'Dari skeptis jadi nagih — cerita singkat soal {product}.',
    'Yang suka hemat tapi tetep mau kualitas: cek {product}.',
    'Satu menit, biar kamu nggak salah beli — fokus ke {product}.',
    'Racun TikTok versi hemat: {product} (bukan gimmick).',
    'Ini alasan kenapa aku balik lagi beli {product}.',
    'Kalau kamu cari yang praktis buat harian: {product}.',
    'Before you scroll: ini worth it atau nggak untuk {product}?',
    'Disclaimer: cocoknya tergantung kebutuhan — ini pengalaman pribadi {product}.',
]

const CAPTION_BY_CAT: Record<string, string[]> = {
    fashion: [
        'Outfit simpel tapi keliatan effort — ini salah satu item yang sering aku pakai. Harganya masuk akal buat kualitasnya. Kalau kamu suka gaya yang sama, cek dulu di toko, bandingin review, baru checkout. ✨',
        'Bukan cuma ikut trend — yang ini nyaman dipakai seharian. Share biar yang lagi nyari referensi kebagian info. 🛍️',
    ],
    tech: [
        'Buat yang kerja remote atau sering multitasking: ini salah satu barang yang ngebantu workflow aku. Spesifikasi sesuai kebutuhan ya — jangan overkill kalau belum perlu. 📱',
        'Review singkat biar kamu nggak salah beli. Cek garansi & toko resmi sebelum checkout. 🔧',
    ],
    health: [
        'Ini bukan saran medis — cuma sharing penggunaan pribadi. Sesuaikan dengan kondisi kamu dan konsultasi profesional kalau perlu. 💪',
        'Yang penting konsisten dan realistis soal ekspektasi. Produknya bantu rutinitas, bukan magic instan. 🌿',
    ],
    food: [
        'Rasanya enak, porsi oke buat segini harga. Cocok buat yang suka camilan / masak praktis di rumah. 🍽️',
        'Tips: simpen sesuai anjuran kemasan biar tetep fresh. 🥢',
    ],
    home: [
        'Buat beres-beres rumah jadi lebih cepet — ini yang aku pakai di dapur / ruang kerja. Worth it kalau dipakai rutin. 🏠',
        'Ukuran & bahan sesuai deskripsi toko — tetep baca review foto buyer ya. 🔧',
    ],
    beauty: [
        'Patch test dulu kalau kulit sensitif. Ini pengalaman pribadi — hasil bisa beda tiap orang. 💄',
        'Teksturnya enak, nyerapnya oke. Aku pakai rutin beberapa minggu baru share. ✨',
    ],
}

const BASE_TAGS = [
    '#fypindonesia',
    '#tiktokaffiliate',
    '#racuntiktok',
    '#rekomendasitiktok',
    '#reviewjujur',
]

const CAT_TAGS: Record<string, string[]> = {
    fashion: ['#ootd', '#fashiontiktok', '#haulindo'],
    tech: ['#gadgetmurah', '#techtok', '#reviewgadget'],
    health: ['#hidupsehat', '#olahraga', '#wellness'],
    food: ['#makananviral', '#kuliner', '#foodtok'],
    home: ['#rumahminimalis', '#hacksrumah', '#alatrumah'],
    beauty: ['#skincare', '#beautyhacks', '#makeupmurah'],
}

function slugTag(name: string): string {
    const s = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 24)
    return s ? `#${s}` : ''
}

function ctaFor(platform: TikTokPlatform, audience: string): string {
    const tiktok = 'Cek keranjang kuning / link di bio sebelum kehabisan stok — gratifikasi ongkir sering ganti tiap promo.'
    const shopee = 'Klik link di bio → pastikan toko & rating review — bandingkan voucher live kalau ada.'
    const tokped = 'Cek link official / toko pilihan — baca ulasan foto buyer dulu biar aman.'
    const campur = 'Link di bio: pilih channel yang kamu pakai (TikTok Shop / marketplace) — baca review & toko resmi.'

    const teen = ' Buruan simpen dulu biar nggak ilang dari FYP.'
    const adult = ' Invest ke barang yang kepakai lama — baca spesifikasi sebelum checkout.'

    let base = campur
    if (platform === 'tiktok_shop') base = tiktok
    else if (platform === 'shopee') base = shopee
    else if (platform === 'tokopedia') base = tokped

    if (audience === 'teens') return base + teen
    if (audience === 'mature') return base + ' Hati-hati penipuan — utamakan toko terpercaya.'
    return base + adult
}

/** Larangan visual untuk generator video — hindari watermark / UI platform di output. */
export const PROMPT_VIDEO_BERSIH = [
    'tanpa watermark TikTok atau platform lain',
    'tanpa logo aplikasi, ikon sosial, atau teks mengambang di sudut layar',
    'tanpa frame UI recorder, tanpa overlay promosi; gambar penuh layar seperti rekaman kamera nyata',
].join('; ')

/**
 * Satu baris untuk menempel ke prompt video atau text-to-image: hasil realistis, hemat “retry” karena gaya tidak lari ke kartun/CGI.
 */
export const PROMPT_TIKTOK_REALISM_SUFFIX =
    'Fotorealistik UGC (kamera ponsel), cahaya alami, tekstur kulit dan bahan nyata; bukan kartun, anime, ilustrasi, atau render 3D/CGI.'

const WEARABLE_LABEL_ID: Record<WearableInVideo, string> = {
    baju: 'atasan/outfit utama',
    celana: 'celana',
    sepatu: 'sepatu',
    aksesoris: 'aksesoris',
    lainnya: 'produk',
}

/**
 * Kunci kontinuitas: outfit/produk & talent tidak drift; aturan suara mengikuti `videoAudioMode`.
 */
export function buildVisualContinuityRules(input: TikTokLocalInput): string {
    const name = input.productName.trim() || 'produk'
    const w = WEARABLE_LABEL_ID[input.wearableItem] ?? 'produk'
    const talent = input.whoInVideo.trim()
    const identity = talent
        ? `Talent tetap sama: ${talent}; jangan ganti wajah, gaya rambut, atau usia beda drastis antar klip/shot.`
        : 'Talent satu orang yang sama sepanjang video; jangan ganti identitas atau wajah antar klip.'
    const mode = input.videoAudioMode ?? 'silent'
    const audio =
        mode === 'silent'
            ? 'Suara: tanpa VO/narasi; tanpa dialog; karakter tidak berbicara ke kamera; tanpa lip-sync; hanya suara ambien sangat pelan atau diam visual; tanpa teks mengambang kecuali safe area bawah.'
            : 'Suara: VO/narasi singkat Bahasa Indonesia saja, selaras hook; tanpa dialog bahasa lain; lip-sync ringan atau fokus visual; tanpa teks mengambang kecuali safe area bawah.'
    return `Kontinuitas: produk "${name}" (${w}) harus identik (warna, potongan, motif) di semua adegan; dilarang ganti pakaian/produk lain atau variasi outfit. ${identity} ${audio}`
}

/** Satu baris untuk header rencana shot (selaras dengan prompt video). */
function buildShotContinuityLine(input: TikTokLocalInput): string {
    const name = input.productName.trim() || 'produk'
    const t = input.whoInVideo.trim() || 'satu orang'
    const mode = input.videoAudioMode ?? 'silent'
    if (mode === 'silent') {
        return `Kontinuitas shot: "${name}" & outfit sama di semua shot; talent sama (${t}); tanpa VO; karakter tidak berbicara ke kamera.`
    }
    return `Kontinuitas shot: "${name}" & outfit sama di semua shot; talent sama (${t}); VO singkat Bahasa Indonesia selaras hook.`
}

export function describeSceneForPrompt(preset: ContentScenePreset): string {
    const m: Record<ContentScenePreset, string> = {
        bebas: '',
        ootd_mirror:
            'OOTD depan cermin seperti orang biasa check outfit: pegang HP ala selfie video; sesekali lihat ke pantulan dulu baru ke layar; berdiri agak miring, bobot ke satu kaki; boleh rapikan rambut/baju sekali; putar badan setengah untuk lihat samping—bukan pose runway kaku.',
        ootd_street:
            'OOTD outdoor seperti jalan santai: langkah biasa (bukan catwalk), berhenti sebentar untuk adjust tas/rambut; outfit kebaca tanpa pose “display window”.',
        unboxing:
            'Unboxing seperti reaksi orang sungguhan: buka kotak, angkat produk, ekspresi spontan; jeda kecil wajar; bukan demo studio terlalu rapi.',
        flatlay:
            'Flat lay & styling: susun barang seperti meja pribadi; tangan masuk frame untuk merapikan—bukan komposisi museum yang terlalu perfeksionis.',
        detail_product:
            'Fokus produk dengan tangan manusia: pegang, putar, dekatkan ke kamera; gerakan tangan natural, bukan putaran produk CGI.',
    }
    return m[preset] ?? ''
}

export function describeExpressionForPrompt(preset: CharacterExpressionPreset, note: string): string {
    const m: Record<CharacterExpressionPreset, string> = {
        natural: 'Wajah dan alis rileks seperti ngobrol ke HP sendiri; senyum atau netral kecil—bukan ekspresi “render” datar.',
        smile: 'Senyum seperti orang sungguhan (ada kerutan mata ringan); boleh ketawa kecil; bukan senyum iklan simetris.',
        soft_smile: 'Senyum tipis ala everyday; santai, tidak dipaksakan.',
        neutral: 'Muka cool tapi tetap hidup—kedip, geser pandangan; bukan statue face.',
        confident: 'PD tapi tetap manusiawi: bahu rileks, dagu natural; bukan pose model kaku.',
        playful: 'Ceria seperti main ke kamera; boleh kedip atau ekspresi spontan; tidak over-acting.',
    }
    const base = m[preset] ?? m.natural
    const extra = note.trim()
    return extra ? `${base} Catatan tambahan dari kreator: ${extra.trim()}` : base
}

/** Frasa pendek untuk menyematkan di baris shot (pose/wajah) — nada manusia nyata. */
function expressionShortForShot(preset: CharacterExpressionPreset): string {
    const m: Record<CharacterExpressionPreset, string> = {
        natural: 'wajah hidup & rileks',
        smile: 'senyum orang biasa (bukan iklan)',
        soft_smile: 'senyum tipis santai',
        neutral: 'cool tapi natural',
        confident: 'PD tanpa kaku',
        playful: 'ceria spontan',
    }
    return m[preset] ?? m.natural
}

/** Satu baris pembuka: semua shot mengikuti gaya manusia, bukan pose AI. */
const ARAHAN_MANUSIA_NYATA =
    'Gaya penyutradaraan: pose dan gerakan seperti manusia nyata (rekaman HP / UGC)—bukan manekin, bukan iklan CGI. Ada bobot badan, jeda, mikro-gesture wajar (rapikan rambut/baju, geser kaki); hindari pose simetris kaku, transisi terlalu mulus tanpa berat tubuh, atau ekspresi statue-like.'

/** Tiga gaya kamera/pose berbeda agar multi-varian tidak identik (indeks 0–2). */
const VARIANT_CAMERA_POSE: [string, string, string] = [
    'Varian A — Kamera: eye-level, orbit pelan & push-in halus. Pose: berdiri/kaca natural, kontak mata seimbang; hindari gerakan besar.',
    'Varian B — Kamera: low angle + tracking mengikuti langkah; pan samping. Pose: putar bahu, langkah menyamping, sandaran santai; dinamis, beda dari varian A.',
    'Varian C — Kamera: POV/over-shoulder, overhead 45°, macro produk. Pose: close-up tangan & detail outfit; sudut beda dari A dan B.',
]

/** Prompt adegan untuk AI video — Bahasa Indonesia, detail setara mode API, tanpa watermark di instruksi. */
export function buildVideoPromptBundle(input: TikTokLocalInput, variantIndex = 0): { videoPrompt: string } {
    const name = input.productName.trim() || 'produk'
    const talent = input.whoInVideo.trim() || 'talent/model'
    const fmt =
        input.screenFormat === 'portrait'
            ? 'Format vertikal 9:16, safe area untuk teks hook di bawah, komposisi center-weighted ala konten HP TikTok/UGC.'
            : 'Format lebar 16:9, produk dan talent tetap terbaca, komposisi sepertiga atau simetris untuk produk showcase.'

    let adegan = ''
    switch (input.wearableItem) {
        case 'baju':
            adegan = `${talent} pakai "${name}" (atasan)—show outfit seperti orang biasa: tarik ujung baju, putar bahu, lengan gerak natural; bukan pose katalog.`
            break
        case 'celana':
            adegan = `${talent} pakai "${name}" (celana)—full body & jalan santai; berhenti sebentar untuk cek potongan; gerakan seperti daily life.`
            break
        case 'sepatu':
            adegan = `Fokus kaki: ${talent} dengan "${name}"—langkah biasa di lantai; duduk ikat tali; bukan iklan sepatu slow-motion berlebihan.`
            break
        case 'aksesoris':
            adegan = `${talent} pakai/megang "${name}"—perlihatkan ke kamera seperti rekomendasi ke teman; tangan dan pergelangan gerak natural.`
            break
        default:
            adegan = `${talent} dengan "${name}"—medium & close-up; transisi seperti konten HP, bukan showcase CGI.`
    }

    const sceneCtx = describeSceneForPrompt(input.scenePreset)
    const exprCtx = describeExpressionForPrompt(input.expressionPreset, input.expressionNote)

    const vi = ((variantIndex % 3) + 3) % 3
    const totalDur = input.durationSeconds ?? 8
    const seg = input.clipSegmentSeconds ?? 8
    const nClips = Math.max(1, Math.ceil(totalDur / seg))
    const kamera =
        nClips > 1
            ? `Kamera: gerakan natural ala HP; total adegan target ~${totalDur} dtk, dibagi ${nClips}×${seg} dtk per render pihak ketiga—tiap segmen bisa digabung berurutan; pose akhir segmen harus bisa menyambung ke segmen berikutnya.`
            : `Kamera: gerakan seperti tangan orang (bukan gimbal sempurna)—slow pan atau push-in ringan; boleh sedikit goyangan natural; hindari gerakan terlalu mulus ala CGI; fokus ke produk dan wajah hidup; durasi total target ~${Math.min(totalDur, seg)} dtk (maks ${seg} dtk per render).`
    const lighting =
        'Pencahayaan: alami (jendela/kamar); kulit dan produk terlihat nyata; suasana seperti konten teman, bukan studio high-end kecuali memang settingnya begitu.'
    const larangan = `Larangan output: ${PROMPT_VIDEO_BERSIH}.`

    const parts = [fmt, VARIANT_CAMERA_POSE[vi], adegan]
    if (sceneCtx) parts.push(`Konteks adegan: ${sceneCtx}`)
    parts.push(`Ekspresi & mood talent: ${exprCtx}`)
    parts.push(
        'Gerakan tubuh: seperti orang biasa show outfit—bukan pose runway atau manekin; bobot badan pindah, bahu rileks.'
    )
    parts.push(buildVisualContinuityRules(input))
    parts.push(kamera, lighting, larangan, PROMPT_TIKTOK_REALISM_SUFFIX)

    return {
        videoPrompt: parts.join(' '),
    }
}

/**
 * Membungkus rencana shot agar sesuai batas durasi per klip pihak ketiga (mis. maks 8 dtk),
 * dengan penanda blok berurutan dan sambungan pose antar klip.
 */
export function wrapShotPlanForDuration(input: TikTokLocalInput, basePlan: string): string {
    const seg = input.clipSegmentSeconds ?? 8
    const total = input.durationSeconds ?? 8
    const blocks = Math.max(1, Math.ceil(total / seg))
    const plan = basePlan.trim()
    if (blocks <= 1) {
        return `=== Satu klip (0–${Math.min(total, seg)} dtk) · maks ${seg} dtk per render pihak ketiga ===\n\n${plan}`
    }
    let out = `CATATAN: total target ${total} dtk = ${blocks} render × maks ${seg} dtk per klip (pihak ketiga). Render urut lalu gabung; pose akhir tiap klip harus bisa menyambung ke klip berikutnya (tanpa jeda hitam). Outfit, produk, dan identitas talent harus identik di setiap klip (tidak ganti baju/warna/produk).\n\n`
    for (let b = 0; b < blocks; b++) {
        const t0 = b * seg
        const t1 = Math.min((b + 1) * seg, total)
        out += `=== KLIP ${b + 1}/${blocks} (${t0}–${t1} dtk) · maks ${seg} dtk ===\n`
        if (b === 0) {
            out += `Gunakan peta shot di bawah sebagai panduan; sesuaikan timing ke total ${total} dtk. Blok ini fokus segmen ${t0}–${t1} dtk. Akhiri dengan pose yang enak dipotong untuk sambungan.\n\n`
            out += plan
        } else {
            out += `Lanjutan langsung dari pose akhir klip ${b}: kamera & pose menyambung (satu alur, tidak reset adegan). Variasi sudut/gerakan baru; produk & talent sama.\n`
            out += `(Detail dalam ${t0}–${t1} dtk.)\n`
        }
        if (b < blocks - 1) {
            out += `\n→ Sambungan ke klip ${b + 2}: produk/talent tetap di frame, siap lanjut gerakan.\n`
        }
        out += '\n'
    }
    return out.trimEnd()
}

/** Satu segmen rencana shot untuk satu render (mis. maks 8 dtk di app pihak ketiga). */
export type ClipShotSegment = {
    /** Judul singkat untuk UI, mis. "KLIP 1/3 (0–8 dtk)" */
    label: string
    /** Teks rencana shot untuk segmen ini (klip pertama bisa menyertakan baris CATATAN di atas). */
    text: string
}

function extractKlipLabelFromSegment(segment: string): string {
    const m = segment.match(/===\s*(KLIP\s+\d+\/\d+[^=]*?)\s*===/)
    if (m) return m[1].replace(/\s+/g, ' ').trim()
    const satu = segment.match(/===\s*(Satu klip[^=]*?)\s*===/)
    if (satu) return satu[1].replace(/\s+/g, ' ').trim()
    return 'Rencana shot'
}

/**
 * Memecah `rencanaShot` menjadi beberapa blok sesuai penanda `=== KLIP a/b ===`
 * (output dari `wrapShotPlanForDuration`). Satu klip tanpa penanda multi-klip → satu elemen.
 */
export function splitRencanaShotIntoClips(rencanaShot: string): ClipShotSegment[] {
    const raw = rencanaShot.trim()
    if (!raw) return []

    const multiParts = raw.split(/(?=\n=== KLIP \d+\/\d+)/)
    if (multiParts.length > 1) {
        return multiParts.map((part) => ({
            label: extractKlipLabelFromSegment(part),
            text: part.trim(),
        }))
    }

    const satu = raw.match(/^===\s*(Satu klip[^=]*?)\s*===/m)
    if (satu) {
        return [{ label: satu[1].replace(/\s+/g, ' ').trim(), text: raw }]
    }

    return [{ label: 'Rencana shot', text: raw }]
}

/** Gabungan untuk disalin ke app video ketiga: prompt video (sama tiap klip) + rencana shot segmen ini. */
export function buildThirdPartyClipPaste(videoPrompt: string, clipShotSegmentText: string): string {
    const vp = videoPrompt.trim()
    const rs = clipShotSegmentText.trim()
    const parts: string[] = []
    if (vp) parts.push(`[Prompt video]\n${vp}`)
    if (rs) parts.push(`[Rencana shot — klip ini]\n${rs}`)
    return parts.join('\n\n')
}

/** Urutan shot (Bahasa Indonesia): pose, zoom, sudut, gerakan kamera. */
export function buildDirectorShotPlan(input: TikTokLocalInput, variantIndex = 0): { rencanaShot: string } {
    const vi = ((variantIndex % 3) + 3) % 3
    const name = input.productName.trim() || 'produk'
    const talent = input.whoInVideo.trim() || 'talent/model'
    const portrait = input.screenFormat === 'portrait'
    const frameNote = portrait
        ? 'Frame 9:16 — subjek di tengah; area aman teks di bawah.'
        : 'Frame 16:9 — komposisi sepertiga, produk terbaca.'

    const noWm = `Output: tanpa watermark/logo platform; tanpa teks UI di layar; full frame bersih.`
    const expr = expressionShortForShot(input.expressionPreset)
    const note = input.expressionNote.trim()
    const exprLine = note
        ? `Ekspresi/pose: ${expr}; tambahan: ${note}`
        : `Ekspresi/pose talent: ${expr}.`

    const sceneCtx = describeSceneForPrompt(input.scenePreset)
    const header: string[] = [
        `=== VARIAN ${vi + 1} (pose & sudut berbeda dari varian lain) ===`,
        VARIANT_CAMERA_POSE[vi],
        ARAHAN_MANUSIA_NYATA,
    ]
    if (sceneCtx) header.push(`Konteks adegan: ${sceneCtx}`)
    header.push(exprLine)
    header.push(buildShotContinuityLine(input))

    const shotMod = (base: string, altA: string, altB: string): string =>
        vi === 0 ? base : vi === 1 ? altA : altB

    switch (input.wearableItem) {
        case 'baju': {
            const shot1 = input.scenePreset === 'ootd_mirror'
                ? shotMod(
                      `Shot 1 (0–3s): Full body di depan kaca—${talent} pakai "${name}"; pegang HP ala selfie biasa; lihat pantulan dulu, baru layar; bobot ke satu kaki; ${expr}; zoom pelan (jangan terlalu “perfect”).`,
                      `Shot 1 (0–3s): Full body kaca—${talent} pakai "${name}"; mulai dari samping kiri lalu hadap kaca; tracking pelan dari pinggang ke wajah; ${expr}.`,
                      `Shot 1 (0–3s): Full body kaca—${talent} pakai "${name}"; buka dari sudut rendah (kaki) lalu tilt ke atas; pantulan + wajah; ${expr}.`
                  )
                : shotMod(
                      `Shot 1 (0–3s): Medium—${talent} pakai "${name}"; bahu rileks, berdiri seperti lagi cerita ke kamera; ${expr}; push-in pelan ke dada.`,
                      `Shot 1 (0–3s): Low angle medium—${talent} pakai "${name}"; langkah maju satu kaki; ${expr}; kamera ikut turun lalu naik.`,
                      `Shot 1 (0–3s): POV setengah badan—${talent} pakai "${name}"; fokus tangan rapikan baju; ${expr}; lalu reveal wajah.`
                  )
            const lines = [
                ...header,
                shot1,
                `Shot 2 (3–6s): Close tekstur kain; tangan tarik kerah/ujung baju seperti orang cek fitting—bukan pose jari kaku; ${expr}.`,
                `Shot 3 (6–9s): Putar setengah badan kiri/kanan (cepat outfit dari samping); napas natural; ${expr}.`,
                input.scenePreset === 'ootd_mirror'
                    ? `Shot 4 (9–12s): Mundur satu langkah; lihat full outfit di kaca; putar pinggul sedikit “check dari samping”; ${expr}.`
                    : `Shot 4 (9–12s): Jarak selfie; satu langkah maju biasa; pan dari pinggang ke bahu; ${expr}.`,
                `Shot 5 (12–15s): Close wajah + outfit; angguk atau senyum kecil ala closing OOTD; ${expr}; ending 1 detik tanpa “freeze” kaku.`,
                `Kamera & lighting: rumah/kamar; cahaya depan; ${frameNote}`,
                noWm,
            ]
            return { rencanaShot: wrapShotPlanForDuration(input, lines.join('\n')) }
        }
        case 'celana': {
            const shot1c = input.scenePreset === 'ootd_mirror'
                ? shotMod(
                      `Shot 1 (0–3s): Full body di kaca—${talent} pakai "${name}"; cek potongan dari depan; geser berat badan; ${expr}.`,
                      `Shot 1 (0–3s): Full body kaca—${talent} pakai "${name}"; mulai profil kiri; putar ke depan; ${expr}.`,
                      `Shot 1 (0–3s): Full body kaca—${talent} pakai "${name}"; low angle dari lutut; naik perlahan; ${expr}.`
                  )
                : shotMod(
                      `Shot 1 (0–3s): Berdiri natural—${talent} pakai "${name}"; kaki selebar bahu rileks; ${expr}; bukan pose militer.`,
                      `Shot 1 (0–3s): Berdiri—${talent} pakai "${name}"; satu langkah menyamping + sandar ringan; ${expr}.`,
                      `Shot 1 (0–3s): Setengah badan—${talent} pakai "${name}"; tangan di pinggang cek siluet; ${expr}.`
                  )
            const lines = [
                ...header,
                shot1c,
                `Shot 2 (3–6s): Jalan pelan (langkah biasa); kamera ikut seperti orang rekam teman; ${expr}.`,
                `Shot 3 (6–9s): Samping—sentuh pinggang/saku seperti cek kantong; ${expr}.`,
                `Shot 4 (9–12s): Duduk di tepi (sopan)—lihat lipatan & duduk nyaman; gerakan natural.`,
                `Shot 5 (12–15s): Berdiri lagi; rapikan kaos/baju bawah sekali jika perlu; ${expr}; siluet celana terbaca.`,
                `${portrait ? 'Pastikan full body masuk frame vertikal. ' : ''}${frameNote}`,
                noWm,
            ]
            return { rencanaShot: wrapShotPlanForDuration(input, lines.join('\n')) }
        }
        case 'sepatu': {
            const shot1s = shotMod(
                `Shot 1 (0–3s): Sudut rendah—${talent} pakai "${name}"; langkah kecil seperti jalan di rumah/jalan; ${input.scenePreset === 'ootd_mirror' ? 'boleh dari pantulan kaca; ' : ''}${expr}.`,
                `Shot 1 (0–3s): Tracking samping kaki—${talent} pakai "${name}"; 2–3 langkah; kamera sejajar lutut; ${expr}.`,
                `Shot 1 (0–3s): Macro sepatu + pergelang—${talent} pakai "${name}"; lalu reveal berdiri; ${expr}.`
            )
            const lines = [
                ...header,
                shot1s,
                `Shot 2 (3–6s): Ikuti jalan 1–2 m dari samping—gerakan kaki orang biasa, bukan parade.`,
                `Shot 3 (6–9s): Duduk, ikat tali sekali dengan gerakan tangan natural (bukan slow-mo berlebihan).`,
                `Shot 4 (9–12s): Sepatu di lantai; putar pergelang kaki pelan untuk lihat sisi—seperti cek di toko.`,
                `Shot 5 (12–15s): Zoom out pelan; berdiri sejajar; ${expr} jika wajah masuk frame.`,
                `Kamera: sedikit goyang wajar OK; ${frameNote}`,
                noWm,
            ]
            return { rencanaShot: wrapShotPlanForDuration(input, lines.join('\n')) }
        }
        case 'aksesoris': {
            const shot1a = shotMod(
                `Shot 1 (0–3s): Medium close—${talent} tunjukkan "${name}" seperti lagi show ke teman; ${expr}; push-in pelan.`,
                `Shot 1 (0–3s): Over-shoulder—${talent} tunjukkan "${name}" ke kamera; ${expr}; fokus ke tangan.`,
                `Shot 1 (0–3s): Macro detail—${talent} pegang "${name}"; putar perlahan; ${expr}.`
            )
            const lines = [
                ...header,
                shot1a,
                `Shot 2 (3–6s): Macro—putar di tangan; jari natural (bukan jari “display”).`,
                `Shot 3 (6–9s): Pakai di pergelangan/leher; gerakan harian (angkat tangan, geser rambut).`,
                `Shot 4 (9–12s): Mundur—medium shot; bahu rileks.`,
                `Shot 5 (12–15s): Close ${expr}; aksesoris tetap fokus; closing santai.`,
                `${frameNote}`,
                noWm,
            ]
            return { rencanaShot: wrapShotPlanForDuration(input, lines.join('\n')) }
        }
        default: {
            const shot1d = shotMod(
                `Shot 1 (0–3s): Perkenalan santai—${talent} dengan "${name}"; ${expr}; seperti review teman.`,
                `Shot 1 (0–3s): Medium dinamis—${talent} dengan "${name}"; geser kiri/kanan; ${expr}.`,
                `Shot 1 (0–3s): Close produk dulu—${talent} angkat "${name}"; baru wajah; ${expr}.`
            )
            const lines = [
                ...header,
                shot1d,
                `Shot 2 (3–6s): Close produk; pegang/putar seperti orang jelasin barang.`,
                `Shot 3 (6–9s): Sudut 45° / over-shoulder saat dipakai—gerakan tubuh natural.`,
                `Shot 4 (9–12s): Wajah + produk; ajakan beli dengan nada ringan; ${expr}.`,
                `Shot 5 (12–15s): Produk di tengah; zoom out pelan; ending hidup (bukan freeze).`,
                `Kamera & gerakan: UGC; ${frameNote}`,
                noWm,
            ]
            return { rencanaShot: wrapShotPlanForDuration(input, lines.join('\n')) }
        }
    }
}

function shootingTipFor(tone: TikTokTone, formatPortrait: boolean): string {
    const framing = formatPortrait
        ? 'Frame vertikal 9:16 — subjek & produk tetap di tengah, lighting depan biar warna akurat.'
        : 'Kalau 16:9, taruh produk di sepertiga bawah + teks hook di safe zone atas.'
    const toneHint =
        tone === 'gen_z'
            ? 'Buka dengan teks besar 3 kata + suara trending pelan (jangan keras-keras).'
            : tone === 'warm'
              ? 'Bicara natural seperti cerita ke teman — hindari nada sales terlalu kaku.'
              : 'Satu take jujur + close-up detail produk 2–3 detik.'
    return `${framing} ${toneHint}`
}

/** Generate pakai pola + indeks varian (pose/sudut beda per indeks) — cocok sebagai fallback tanpa API. */
export function generateLocalIndonesiaBundle(input: TikTokLocalInput, variantIndex = 0): TikTokLocalResult {
    const name = input.productName.trim() || 'produk ini'
    const hookIdx = (name.length * 7 + variantIndex * 19) % HOOKS_ID.length
    const hook = HOOKS_ID[hookIdx]!.replace(/\{product\}/g, name)

    const cat = input.category in CAPTION_BY_CAT ? input.category : 'fashion'
    const captionPool = CAPTION_BY_CAT[cat] ?? CAPTION_BY_CAT.fashion
    const capIdx = (name.length * 5 + variantIndex * 17) % captionPool.length
    let caption = captionPool[capIdx]!

    if (input.features.trim()) {
        caption += `\n\nYang aku suka: ${input.features.trim().slice(0, 200)}${input.features.length > 200 ? '…' : ''}`
    }
    if (input.priceHint.trim()) {
        caption += `\n\nKisaran harga (cek live di toko): ${input.priceHint.trim()}`
    }
    if (input.brand.trim()) {
        caption += `\n\nBrand / toko: ${input.brand.trim()}`
    }

    const tags = [
        ...BASE_TAGS,
        ...(CAT_TAGS[cat] ?? CAT_TAGS.fashion),
        slugTag(name),
        '#shopeehaul',
        '#murahmeriah',
    ].filter(Boolean)

    const unique = [...new Set(tags)].slice(0, 12)

    const cta = ctaFor(input.platform, input.targetAudience)

    const portrait = input.screenFormat === 'portrait'
    const { videoPrompt } = buildVideoPromptBundle(input, variantIndex)
    const { rencanaShot } = buildDirectorShotPlan(input, variantIndex)

    if (input.mode === 'quick') {
        return {
            hook,
            caption: '',
            hashtags: unique,
            callToAction: cta,
            shootingTip: shootingTipFor(input.tone, portrait),
            videoPrompt,
            rencanaShot,
        }
    }

    return {
        hook,
        caption,
        hashtags: unique,
        callToAction: cta,
        shootingTip: shootingTipFor(input.tone, portrait),
        videoPrompt,
        rencanaShot,
    }
}
