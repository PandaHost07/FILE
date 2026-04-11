export interface PromptTemplate {
    id: string
    category: string
    subcategory: string
    sceneName: string
    imagePrompt: string
    videoPrompt: string
    tags: string[]
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    // ── FURNITURE ──────────────────────────────────────────────────────────────
    {
        id: 'furn-01',
        category: 'furniture',
        subcategory: 'Kursi Kayu',
        sceneName: 'Before — Kondisi Awal',
        imagePrompt: 'A heavily weathered antique wooden chair with severely peeling paint revealing multiple layers of old color, cracked and split wood joints, missing spindles, thick dust coating every surface, cobwebs in corners, dramatic raking side light from a single workshop window casting long shadows, shallow depth of field, Canon 5D Mark IV 50mm f/2.8, warm amber dust particles floating in light rays, photorealistic, 8K resolution',
        videoPrompt: 'Static establishing shot slowly zooming in on the deteriorated chair, dust particles floating in warm workshop light, 4 seconds duration, cinematic color grade with warm amber tones, smooth dolly movement, timelapse-ready composition',
        tags: ['kursi', 'kayu', 'antik', 'before', 'furniture']
    },
    {
        id: 'furn-02',
        category: 'furniture',
        subcategory: 'Kursi Kayu',
        sceneName: 'Proses Bongkar',
        imagePrompt: 'Skilled craftsman hands carefully disassembling an antique wooden chair on a worn workbench, removing rusted screws with vintage tools, wood joints exposed showing old glue residue and mortise-tenon construction, workshop background with hanging tools, dramatic overhead lighting, macro detail of weathered wood grain, photorealistic documentary style, Canon 5D Mark IV 35mm lens, warm workshop ambiance',
        videoPrompt: 'Close-up timelapse of disassembly process, hands working methodically, tools being selected and used, wood pieces being carefully separated and laid out, 6 seconds, warm workshop lighting, smooth camera movement following the work',
        tags: ['bongkar', 'disassembly', 'kursi', 'proses']
    },
    {
        id: 'furn-03',
        category: 'furniture',
        subcategory: 'Kursi Kayu',
        sceneName: 'Proses Amplas',
        imagePrompt: 'Hands sanding weathered wood surface with sandpaper revealing fresh golden wood grain beneath old paint layers, fine wood dust particles suspended in workshop light, multiple grits of sandpaper visible, wood grain texture emerging beautifully, dramatic side lighting highlighting texture contrast between sanded and unsanded areas, photorealistic, 8K, warm amber tones',
        videoPrompt: 'Timelapse of sanding process showing transformation from weathered to fresh wood, dust particles in light, gradual reveal of beautiful wood grain, 5 seconds, smooth hand movements, satisfying texture transformation',
        tags: ['amplas', 'sanding', 'kayu', 'proses']
    },
    {
        id: 'furn-04',
        category: 'furniture',
        subcategory: 'Kursi Kayu',
        sceneName: 'Pengecatan Dasar',
        imagePrompt: 'Craftsman applying wood primer with a quality brush on restored chair frame, smooth even strokes, primer coat glistening wet under workshop lights, clean workbench setup, protective covering on floor, professional restoration environment, warm directional lighting, photorealistic documentary photography, Canon 5D Mark IV',
        videoPrompt: 'Timelapse of primer application, brush strokes covering raw wood, wet sheen of primer drying, 5 seconds, overhead and side angle cuts, satisfying coverage transformation',
        tags: ['cat', 'primer', 'pengecatan', 'proses']
    },
    {
        id: 'furn-05',
        category: 'furniture',
        subcategory: 'Kursi Kayu',
        sceneName: 'Finishing & Polish',
        imagePrompt: 'Final polishing of beautifully restored antique wooden chair, hands applying clear lacquer with soft cloth, wood grain gleaming under studio lighting, rich warm honey tones of restored wood, reflection visible on polished surface, professional restoration result, dramatic studio lighting setup, photorealistic, 8K resolution',
        videoPrompt: 'Timelapse of final polish application, transformation to gleaming finish, light reflections dancing on polished surface, 4 seconds, smooth circular polishing motion, satisfying final reveal',
        tags: ['finishing', 'polish', 'lacquer', 'final']
    },
    {
        id: 'furn-06',
        category: 'furniture',
        subcategory: 'Kursi Kayu',
        sceneName: 'After — Hasil Akhir',
        imagePrompt: 'Beautifully restored antique wooden chair in perfect condition, rich warm honey-colored wood grain gleaming, all joints tight and solid, professional studio photography setup with soft box lighting, clean white or dark background, dramatic product photography style, Canon 5D Mark IV 85mm f/1.8, perfect symmetrical composition, photorealistic, 8K resolution',
        videoPrompt: 'Elegant 360-degree rotation reveal of the fully restored chair, studio lighting highlighting every detail, 6 seconds smooth rotation, dramatic music sync point, final hero shot with perfect lighting',
        tags: ['after', 'hasil', 'final', 'reveal', 'kursi']
    },

    // ── KENDARAAN ──────────────────────────────────────────────────────────────
    {
        id: 'kend-01',
        category: 'kendaraan',
        subcategory: 'Motor Klasik',
        sceneName: 'Before — Kondisi Awal',
        imagePrompt: 'A heavily rusted vintage motorcycle from the 1970s sitting abandoned in a dusty garage, chrome parts severely oxidized, paint faded and peeling, tires flat and cracked, cobwebs covering the engine, dramatic shaft of light from a small window illuminating dust particles, photorealistic documentary photography, Canon 5D Mark IV 35mm, moody atmospheric lighting',
        videoPrompt: 'Slow cinematic pan around the abandoned motorcycle, dust particles in light, atmospheric moody lighting, 5 seconds, establishing the scale of restoration needed, melancholic but hopeful tone',
        tags: ['motor', 'klasik', 'before', 'kendaraan', 'vintage']
    },
    {
        id: 'kend-02',
        category: 'kendaraan',
        subcategory: 'Motor Klasik',
        sceneName: 'Proses Bongkar Mesin',
        imagePrompt: 'Mechanic hands carefully disassembling vintage motorcycle engine on a clean workshop table, engine parts laid out systematically, vintage tools, oil-stained rags, dramatic overhead workshop lighting, macro detail of engine components, photorealistic, warm workshop ambiance, Canon 5D Mark IV',
        videoPrompt: 'Timelapse of engine disassembly, parts being carefully removed and organized, 6 seconds, overhead angle showing systematic process, workshop sounds implied by visual rhythm',
        tags: ['mesin', 'bongkar', 'motor', 'proses']
    },
    {
        id: 'kend-03',
        category: 'kendaraan',
        subcategory: 'Motor Klasik',
        sceneName: 'Proses Sandblasting',
        imagePrompt: 'Sandblasting process removing rust and old paint from motorcycle frame, dramatic sparks and media particles flying, protective equipment visible, industrial workshop setting, dramatic backlighting creating silhouette effect, photorealistic industrial photography',
        videoPrompt: 'Timelapse of sandblasting revealing clean metal beneath rust, dramatic particle effects, 4 seconds, industrial atmosphere, transformation from rust to bare metal',
        tags: ['sandblast', 'rust', 'motor', 'proses']
    },
    {
        id: 'kend-04',
        category: 'kendaraan',
        subcategory: 'Motor Klasik',
        sceneName: 'Pengecatan Body',
        imagePrompt: 'Professional spray painting motorcycle tank in classic deep red, perfect even coat, paint booth environment, dramatic lighting showing wet paint sheen, painter in protective gear, photorealistic, 8K resolution',
        videoPrompt: 'Timelapse of spray painting process, even coat application, wet paint gleaming, 5 seconds, smooth spray gun movement, color transformation',
        tags: ['cat', 'spray', 'motor', 'body']
    },
    {
        id: 'kend-05',
        category: 'kendaraan',
        subcategory: 'Motor Klasik',
        sceneName: 'After — Hasil Akhir',
        imagePrompt: 'Fully restored vintage 1970s motorcycle gleaming in perfect condition, deep red paint with chrome details polished to mirror finish, studio photography with dramatic three-point lighting, dark background, reflections on chrome, photorealistic product photography, Canon 5D Mark IV 85mm, 8K resolution',
        videoPrompt: 'Dramatic 360-degree reveal of fully restored motorcycle, studio lighting, chrome reflections, 8 seconds smooth rotation, cinematic reveal with hero shot',
        tags: ['after', 'hasil', 'motor', 'reveal', 'final']
    },

    // ── BANGUNAN ──────────────────────────────────────────────────────────────
    {
        id: 'bang-01',
        category: 'bangunan',
        subcategory: 'Rumah Tua',
        sceneName: 'Before — Kondisi Awal',
        imagePrompt: 'Severely deteriorated old colonial house facade, paint completely peeled revealing bare concrete, broken windows with wooden boards, overgrown vegetation covering walls, cracked foundation visible, dramatic overcast sky, photorealistic architectural photography, wide angle lens, moody atmospheric lighting',
        videoPrompt: 'Slow establishing pan of deteriorated building facade, overcast dramatic sky, 6 seconds, wide angle showing full scale of deterioration, documentary style',
        tags: ['rumah', 'bangunan', 'before', 'facade']
    },
    {
        id: 'bang-02',
        category: 'bangunan',
        subcategory: 'Rumah Tua',
        sceneName: 'Proses Pembersihan',
        imagePrompt: 'Workers pressure washing old building facade, water jets removing decades of grime and old paint, dramatic water spray catching sunlight, scaffolding visible, photorealistic construction photography',
        videoPrompt: 'Timelapse of pressure washing process, grime being removed revealing original surface, 5 seconds, satisfying cleaning transformation',
        tags: ['bersih', 'washing', 'bangunan', 'proses']
    },
    {
        id: 'bang-03',
        category: 'bangunan',
        subcategory: 'Rumah Tua',
        sceneName: 'Proses Plester & Acian',
        imagePrompt: 'Skilled mason applying fresh plaster to building wall, smooth trowel strokes, fresh white plaster contrasting with old surface, dramatic side lighting showing texture, photorealistic construction photography',
        videoPrompt: 'Timelapse of plastering process, smooth application of fresh plaster, 5 seconds, satisfying surface transformation',
        tags: ['plester', 'acian', 'bangunan', 'proses']
    },
    {
        id: 'bang-04',
        category: 'bangunan',
        subcategory: 'Rumah Tua',
        sceneName: 'After — Hasil Akhir',
        imagePrompt: 'Beautifully restored colonial house facade, fresh paint in warm cream and terracotta tones, repaired windows with new glass, manicured garden, golden hour photography, architectural photography with wide angle lens, photorealistic, 8K resolution',
        videoPrompt: 'Dramatic reveal of restored building, golden hour lighting, 8 seconds, wide to close-up movement, before-after implied by beautiful final state',
        tags: ['after', 'hasil', 'bangunan', 'reveal']
    },

    // ── ELEKTRONIK ──────────────────────────────────────────────────────────────
    {
        id: 'elek-01',
        category: 'elektronik',
        subcategory: 'Radio Vintage',
        sceneName: 'Before — Kondisi Awal',
        imagePrompt: 'Vintage 1950s tube radio in deteriorated condition, wooden cabinet cracked and warped, fabric speaker cover torn and stained, dial glass cracked, knobs missing, dramatic side lighting on worn surface, photorealistic macro photography',
        videoPrompt: 'Slow pan around deteriorated vintage radio, dramatic lighting, 4 seconds, nostalgic atmosphere',
        tags: ['radio', 'vintage', 'elektronik', 'before']
    },
    {
        id: 'elek-02',
        category: 'elektronik',
        subcategory: 'Radio Vintage',
        sceneName: 'Proses Restorasi Komponen',
        imagePrompt: 'Electronics technician carefully replacing vintage vacuum tubes and capacitors, soldering iron in use, circuit board visible, macro detail of electronic components, warm workshop lighting, photorealistic',
        videoPrompt: 'Timelapse of electronic restoration, component replacement, soldering process, 5 seconds, macro detail shots',
        tags: ['komponen', 'elektronik', 'proses', 'solder']
    },
    {
        id: 'elek-03',
        category: 'elektronik',
        subcategory: 'Radio Vintage',
        sceneName: 'After — Hasil Akhir',
        imagePrompt: 'Fully restored 1950s vintage tube radio in perfect condition, wooden cabinet refinished to warm honey glow, new speaker fabric, all knobs present and polished, dial illuminated from within, studio photography with dramatic lighting, photorealistic product photography',
        videoPrompt: 'Elegant reveal of restored vintage radio, dial lighting up, 6 seconds, studio lighting, nostalgic warm atmosphere',
        tags: ['after', 'radio', 'elektronik', 'reveal']
    },

    // ── CABIN BUILD (timelapse pembangunan outdoor) ───────────────────────────
    {
        id: 'cabin-01',
        category: 'cabin',
        subcategory: 'Site & clearing',
        sceneName: 'Persiapan lahan & clearing',
        imagePrompt: 'Wide documentary shot of a small forest clearing on a gentle slope, stumps and brush piles, gravel access path, stacked lumber wrapped in plastic, overcast soft daylight with natural shadow falloff across wet soil, Sony A7 IV 24mm lens at f/8, tripod-level horizon, subtle film grain, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Locked-off wide timelapse as crew clears brush and stakes outline of cabin footprint, clouds moving overhead, natural light shifting subtly, 6 seconds, tripod static, documentary natural color grade, satisfying ground preparation progress',
        tags: ['cabin', 'timelapse', 'construction', 'clearing', 'outdoor'],
    },
    {
        id: 'cabin-02',
        category: 'cabin',
        subcategory: 'Foundation',
        sceneName: 'Pondasi & pier blocks',
        imagePrompt: 'Ground-level view of concrete pier blocks and pressure-treated sill beams aligned on gravel, bubble level and tape measure in frame, forest backdrop bokeh, morning side light 4500K, Canon EOS R6 35mm at f/7.1, sharp focus on anchor bolts and wood grain, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Low-angle timelapse of sill beams being leveled and fastened, workers as controlled motion blur, 5 seconds, static camera, consistent site lighting, satisfying structural start',
        tags: ['cabin', 'foundation', 'timelapse', 'pier'],
    },
    {
        id: 'cabin-03',
        category: 'cabin',
        subcategory: 'Framing',
        sceneName: 'Framing dinding & tiang',
        imagePrompt: 'Wide shot of partially framed cabin walls with vertical studs and temporary bracing, exposed Douglas fir grain, forest behind gaps in frame, golden hour warm rim light and cool shadow fill, tripod eye-level, Nikon Z6 28mm f/5.6, sawdust on gloves and boots visible, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Lock-off timelapse as wall sections lift and brace into place, sun angle moving across studs, 7 seconds, wide establishing, cinematic but natural color science',
        tags: ['cabin', 'framing', 'walls', 'timelapse'],
    },
    {
        id: 'cabin-04',
        category: 'cabin',
        subcategory: 'Roof',
        sceneName: 'Struktur atap & decking',
        imagePrompt: 'Elevated angle of roof rafters and roof sheathing partially installed, stacks of OSB on lift, safety harness visible, partly cloudy sky with realistic specular on metal fasteners, Sony 24mm, deep depth of field, authentic construction site debris, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Crane-wide timelapse of roof sheathing being screwed down row by row, cloud shadows sweeping across plywood, 6 seconds, slow smooth movement, documentary realism',
        tags: ['cabin', 'roof', 'timelapse', 'sheathing'],
    },
    {
        id: 'cabin-05',
        category: 'cabin',
        subcategory: 'Envelope',
        sceneName: 'Insulasi & dinding luar',
        imagePrompt: 'Detail of exterior wall with house wrap and vertical wood siding going up, cap nail pattern visible, caulking line, forest green backdrop, diffused overcast light reducing harsh contrast, Canon 50mm f/4, tactile wood texture, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Vertical pan timelapse following siding install from bottom course upward, 5 seconds, locked vertical composition, satisfying coverage rhythm',
        tags: ['cabin', 'siding', 'envelope', 'timelapse'],
    },
    {
        id: 'cabin-06',
        category: 'cabin',
        subcategory: 'Openings',
        sceneName: 'Pintu & jendela',
        imagePrompt: 'Interior-exterior split view of rough opening with window flanges taped to WRB, foam backer rod, level lines, natural daylight through opening, realistic glass reflection, 35mm documentary style, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Static shot timelapse of window unit set, shimmed, and fastened, 4 seconds, subtle focus pull, consistent ambient light',
        tags: ['cabin', 'window', 'door', 'install'],
    },
    {
        id: 'cabin-07',
        category: 'cabin',
        subcategory: 'Finish',
        sceneName: 'Stain & eksterior',
        imagePrompt: 'Full cabin exterior with fresh semi-transparent stain on wood siding, stone skirt base, metal roof matte finish, late afternoon warm sunlight with long shadows in pine forest, Sony 24mm, architectural photography, natural color grade without HDR halos, photorealistic, hyperdetailed, 8K resolution',
        videoPrompt: 'Wide hero timelapse of stain application on siding boards, brush strokes accelerating, 6 seconds, tripod lock-off, emotional build reveal, natural cinematic grade',
        tags: ['cabin', 'stain', 'finish', 'reveal', 'timelapse'],
    },

    // ── UNIVERSAL SCENES ──────────────────────────────────────────────────────
    {
        id: 'univ-01',
        category: 'universal',
        subcategory: 'Detail Shot',
        sceneName: 'Detail Tekstur Material',
        imagePrompt: 'Extreme macro close-up of restoration material texture, showing grain, patina, and craftsmanship detail, dramatic raking light revealing every surface detail, photorealistic macro photography, Canon 5D Mark IV 100mm macro lens, f/8, studio lighting',
        videoPrompt: 'Slow macro reveal of material texture, light raking across surface, 4 seconds, extreme close-up to medium shot pull back',
        tags: ['detail', 'macro', 'tekstur', 'universal']
    },
    {
        id: 'univ-02',
        category: 'universal',
        subcategory: 'Tools Shot',
        sceneName: 'Peralatan Restorasi',
        imagePrompt: 'Flat lay of restoration tools arranged artistically on worn workbench, various brushes, sandpaper grades, chisels, measuring tools, dramatic overhead lighting, photorealistic product photography style',
        videoPrompt: 'Overhead timelapse of tools being selected and used, 5 seconds, satisfying tool selection rhythm',
        tags: ['tools', 'alat', 'universal', 'flatlay']
    },
    {
        id: 'univ-03',
        category: 'universal',
        subcategory: 'Before-After Split',
        sceneName: 'Perbandingan Before-After',
        imagePrompt: 'Split composition showing before and after restoration side by side, dramatic lighting highlighting the transformation, professional photography, clean composition with clear visual contrast between deteriorated and restored states',
        videoPrompt: 'Wipe transition from before to after state, 4 seconds, dramatic reveal, satisfying transformation',
        tags: ['before-after', 'comparison', 'universal', 'reveal']
    },
]

export const CATEGORIES = ['semua', 'cabin', 'furniture', 'kendaraan', 'bangunan', 'elektronik', 'universal'] as const
export type TemplateCategory = typeof CATEGORIES[number]
