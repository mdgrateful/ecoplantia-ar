// Plant data for the garden designer - v40 exact match
export interface Plant {
  name: string;
  acr: string;
  size: number; // spread in inches
  sciName: string;
  isKeystone: boolean;
  isGrass: boolean;
  light: string;
  bloom: string;
  bloomColor: string;
  height: string;
  spread: string;
  zone: string;
  water: string;
  about: string;
  care: string;
  wildlife: string;
  tags: string[];
  img: string;
  productImg: string;
  gallery: string[];
  productId?: string;
  isBlank?: boolean;
}

export const PLANTS: Plant[] = [
  {
    name: 'Lanceleaf Coreopsis',
    acr: 'COR',
    size: 12,
    sciName: 'Coreopsis lanceolata',
    isKeystone: true,
    isGrass: false,
    light: 'Full Sun',
    bloom: 'May-Jul',
    bloomColor: '#FFD700',
    height: '1-2 ft',
    spread: '1-1.5 ft',
    zone: '4-9',
    water: 'Dry to Medium',
    about: 'Sunshine in plant form—lanceleaf coreopsis is a tough, joyful native that blooms hard and bright in early summer and often keeps going with a little cleanup. Designers love it because it reads "intentional" even when the soil is lean and the conditions are hot.\n\nDesign notes: Use it as an edge-liner or in 3–7 plant drifts to create a clean ribbon of yellow. It pairs beautifully with native grasses (especially Little Bluestem) for that "meadow, but tidy" look.',
    care: 'Best in full sun with well-drained soil—this one actually performs better when you don\'t pamper it. Water regularly for the first few weeks; after that it\'s drought-tough. Average to sandy/rocky soil; avoid heavy fertilizer (it can flop). Deadhead to extend bloom; leave a few blooms to seed for a naturalized look. A quick mid-season shear can trigger a fresh flush of flowers.',
    wildlife: 'Coreopsis is a legit pollinator plant, not just a pretty face. Specialist bee Melissodes coreopsis shows up when these flowers are working. Recorded larval host for the wavy-lined emerald moth—a camouflaged looper that decorates itself with flower parts. Seedheads feed songbirds later in the season. Cool fact: "Tickseed" refers to the seed shape—little dark \'ticks\' that fall when heads dry.',
    tags: ['Keystone Species', 'Pollinator Favorite', 'Drought Tolerant', 'Long Blooming', 'Low Maintenance', 'Bird Food', 'Great for Drifts'],
    img: 'https://static.wixstatic.com/media/94bd1f_48d31eb0d72044c5a798b2fd8960256a~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_441b6603b3e74b2c9ec595ca3bc21a7c~mv2.jpg',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_441b6603b3e74b2c9ec595ca3bc21a7c~mv2.jpg',
      'https://static.wixstatic.com/media/94bd1f_48d31eb0d72044c5a798b2fd8960256a~mv2.png'
    ],
  },
  {
    name: 'Blazingstar',
    acr: 'LIA',
    size: 12,
    sciName: 'Liatris spicata',
    isKeystone: true,
    isGrass: false,
    light: 'Full Sun',
    bloom: 'Jul-Sep',
    bloomColor: '#9932CC',
    height: '2-4 ft',
    spread: '9-12 in',
    zone: '3-8',
    water: 'Medium',
    about: 'A striking native perennial with tall spikes of fluffy purple flowers that uniquely bloom from top to bottom. Grows from a corm and forms clumps over time. Outstanding vertical accent that adds architectural drama to any garden design.\n\nDesign notes: Plant in groups of 5-7 for maximum visual impact. The vertical spikes contrast beautifully with mounding plants like coneflowers.',
    care: 'Does not require staking despite height. Avoid overwatering as corms may rot in wet soils. Cut back after flowering or leave for winter interest. Divide clumps every 3-4 years in spring. Tolerates poor soils but performs best in well-drained conditions.',
    wildlife: 'A magnet for monarch butterflies during migration season. Attracts hummingbirds, native bees, and many other pollinators. Seedheads provide food for goldfinches in fall and winter. One of the top nectar plants for supporting pollinator populations.',
    tags: ['Keystone Species', 'Pollinator Favorite', 'Butterfly Magnet', 'Vertical Accent', 'Cut Flower', 'Deer Resistant'],
    img: 'https://static.wixstatic.com/media/94bd1f_b53a5d6e4fb042c585a424bea9356928~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_54c111d94c544dbcb7f3c76b08dd49ae~mv2.jpg',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_54c111d94c544dbcb7f3c76b08dd49ae~mv2.jpg',
      'https://static.wixstatic.com/media/94bd1f_b53a5d6e4fb042c585a424bea9356928~mv2.png'
    ],
  },
  {
    name: 'Purple Lovegrass',
    acr: 'ERA',
    size: 18,
    sciName: 'Eragrostis spectabilis',
    isKeystone: false,
    isGrass: true,
    light: 'Full Sun',
    bloom: 'Aug-Oct',
    bloomColor: '#DDA0DD',
    height: '12-24 in',
    spread: '12-18 in',
    zone: '5-9',
    water: 'Dry',
    about: 'Purple lovegrass is the late-summer purple haze effect—airy seed clouds that glow when backlit. It\'s compact, tough, and makes flower-heavy beds feel lighter and more modern.\n\nDesign notes: Place near the front/middle of beds so the seedheads catch the light and soften edges. In late afternoon sun, lovegrass can look like it\'s glowing from inside the bed—one of the best "cheap wow" plants you can add.',
    care: 'Extremely low-input grass for tough sites. Full sun and dry to medium, well-drained soil; loves lean ground. Water to establish; minimal after. Seedheads are the show—leave them through fall. Cut back in late winter/early spring. Tolerates light foot traffic.',
    wildlife: 'Small grass, big ecological ripple. Recorded larval host for the paradoxical grass moth. Seeds provide food for songbirds; birds also use the dry panicles as nesting material. Popular with small herbivorous insects—useful because birds feed on those insects.',
    tags: ['Native Grass', 'Pollinator Support', 'Bird Friendly', 'Drought Tolerant', 'Low Maintenance', 'Erosion Control', 'Late Season Drama'],
    productId: 'ff99c2d3-8646-4e63-a71c-741a69cab88b',
    img: 'https://static.wixstatic.com/media/94bd1f_935a7b7f12d14b1c9d71cb3122f0c1c4~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_8f658d4b079d4ac4a0cc986ca9356f06~mv2.jpg',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_8f658d4b079d4ac4a0cc986ca9356f06~mv2.jpg',
      'https://static.wixstatic.com/media/94bd1f_935a7b7f12d14b1c9d71cb3122f0c1c4~mv2.png'
    ],
  },
  {
    name: 'Black-Eyed Susan',
    acr: 'RUD',
    size: 18,
    sciName: 'Rudbeckia hirta',
    isKeystone: true,
    isGrass: false,
    light: 'Full Sun',
    bloom: 'Jun-Sep',
    bloomColor: '#FFA500',
    height: '1-3 ft',
    spread: '12-18 in',
    zone: '3-7',
    water: 'Dry to Medium',
    about: 'Black-eyed Susan is the fast-track to "native garden energy"—bright, high-contrast flowers that look good from the street and bloom with very little fuss. It\'s also clutch for filling gaps while slower perennials establish.\n\nDesign notes: Mass it. One looks like a volunteer; seven looks like design.',
    care: 'Forgiving, but enthusiastic. Full sun is best. Water to establish, then let it ride. Can self-seed around; deadhead if you want tighter control. Give airflow and avoid overhead watering in humid weather to prevent disease. Leave seedheads through winter, cut back in late winter. Often short-lived; self-seeding is part of the strategy.',
    wildlife: 'A true "summer-to-winter handoff" plant. Documented larval host for silvery checkerspot and wavy-lined emerald moth. Rudbeckia has specialist bees (e.g., Andrena rudbeckiae) associated with these blooms. American goldfinches and other songbirds love the seeds. Those "mystery caterpillars" on leaves can literally be your future butterflies—habitat in real time.',
    tags: ['Keystone Species', 'Pollinator Favorite', 'Bird Food', 'Long Blooming', 'Beginner Friendly', 'Great for Massing'],
    img: 'https://static.wixstatic.com/media/94bd1f_e5d5fdb0948b4808afaf856a5020ff13~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_d999bdf79f7f4395bdea532a6e0960d1~mv2.png',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_d999bdf79f7f4395bdea532a6e0960d1~mv2.png',
      'https://static.wixstatic.com/media/94bd1f_e5d5fdb0948b4808afaf856a5020ff13~mv2.png'
    ],
  },
  {
    name: 'Purple Coneflower',
    acr: 'ECH',
    size: 18,
    sciName: 'Echinacea purpurea',
    isKeystone: true,
    isGrass: false,
    light: 'Full Sun',
    bloom: 'Jun-Aug',
    bloomColor: '#DA70D6',
    height: '2-4 ft',
    spread: '1.5-2 ft',
    zone: '3-8',
    water: 'Dry to Medium',
    about: 'Purple coneflower is a cornerstone native—bold structure, long bloom, and a "designed" look even in naturalistic plantings. It\'s one of the best plants for that "flowers now + architecture later" effect because the seedheads stay upright and beautiful.\n\nDesign notes: Use coneflowers as anchors in repeating clusters (3–5), then let softer plants and grasses weave around them.',
    care: 'Coneflowers are easy, but they reward a few pro moves. Full sun to part shade (more sun = more flowers). Well-drained soil is key; avoid soggy winter soil. Regular water in the first season; then fairly drought-resilient. Deadhead for more bloom, but leave some seedheads for birds + winter structure. Wait until late winter to cut back—stems shelter stem-nesting bees.',
    wildlife: 'This plant pulls triple duty: nectar + seed + habitat. Attracts a parade of native bees and butterflies through summer. Host for silvery checkerspot and wavy-lined emerald moth. American goldfinches famously work the seedheads in fall and winter. Leaving hollow stems through winter supports stem-nesting native bees. The seedhead is a winter buffet and a snow-catching sculpture—don\'t rush to cut it down.',
    tags: ['Keystone Species', 'Pollinator Favorite', 'Bird Food', 'Winter Interest', 'Cut Flower', 'Drought Tolerant', 'Habitat Builder'],
    img: 'https://static.wixstatic.com/media/94bd1f_229936c40de64ae18bf2640a08e1b58a~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_95cddd4880f14bef9373d89fc599fd6e~mv2.jpg',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_95cddd4880f14bef9373d89fc599fd6e~mv2.jpg',
      'https://static.wixstatic.com/media/94bd1f_229936c40de64ae18bf2640a08e1b58a~mv2.png'
    ],
  },
  {
    name: 'Rough Goldenrod',
    acr: 'SOL',
    size: 24,
    sciName: 'Solidago rugosa',
    isKeystone: true,
    isGrass: false,
    light: 'Full Sun',
    bloom: 'Aug-Oct',
    bloomColor: '#DAA520',
    height: '3-5 ft',
    spread: '2-3 ft',
    zone: '4-8',
    water: 'Medium to Wet',
    about: 'A rhizomatous, spreading perennial featuring panicles of showy yellow flowers that explode into bloom in late summer. Prefers wetter habitats than most goldenrods. Despite common myths, does NOT cause hay fever—that\'s ragweed!\n\nDesign notes: Perfect for naturalized areas and rain gardens. The cultivar "Fireworks" is more compact and contained.',
    care: 'Can spread aggressively in optimal conditions. May self-seed freely. Good for naturalizing large areas. Cut back in spring before new growth emerges. Tolerates a wide range of soil conditions from average to wet.',
    wildlife: 'Supports an incredible 115+ species of moths, butterflies, and native bees! Key late-season nectar source for migrating monarchs. Provides critical fall food when other flowers are fading. Seeds feed birds through winter.',
    tags: ['Keystone Species', 'Pollinator Powerhouse', 'Late Season Nectar', 'Bird Food', 'Rain Garden', 'Naturalizing'],
    img: 'https://static.wixstatic.com/media/94bd1f_78ed4dc45454484f818e215a6b795305~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_312b8fc735c14779ade07578186e1769~mv2.jpg',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_312b8fc735c14779ade07578186e1769~mv2.jpg',
      'https://static.wixstatic.com/media/94bd1f_78ed4dc45454484f818e215a6b795305~mv2.png'
    ],
  },
  {
    name: 'Smooth Aster',
    acr: 'AST',
    size: 24,
    sciName: 'Symphyotrichum laeve',
    isKeystone: true,
    isGrass: false,
    light: 'Full-Part Sun',
    bloom: 'Sep-Oct',
    bloomColor: '#6A5ACD',
    height: '2-4 ft',
    spread: '1-2 ft',
    zone: '3-8',
    water: 'Dry to Medium',
    about: 'A native with distinctive smooth, bluish-green foliage and violet-blue to purple flowers with yellow centers. One of the most attractive blue asters, blooming in loose panicle-like clusters in autumn when most other plants are fading.\n\nDesign notes: Essential for extending the garden season into fall. Pairs beautifully with goldenrods for a classic autumn prairie combination.',
    care: 'Easily self-seeds—welcome it or edit as needed. May need staking in rich soils. Excellent drought tolerance once established. Thrives in rocky or shallow soils where other plants struggle. Cut back in late winter.',
    wildlife: 'Highly attractive to butterflies and bees as a late-season nectar source. Host plant for Pearl Crescent butterfly. Seeds eaten by songbirds. Critical fall food for migrating pollinators.',
    tags: ['Keystone Species', 'Pollinator Favorite', 'Late Season Nectar', 'Drought Tolerant', 'Butterfly Host', 'Fall Color'],
    img: 'https://static.wixstatic.com/media/94bd1f_6390f6e095084528ac9eb4e7e8917f2a~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_ab0ec431fb7649729106b8d57fbfc17e~mv2.png',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_ab0ec431fb7649729106b8d57fbfc17e~mv2.png',
      'https://static.wixstatic.com/media/94bd1f_6390f6e095084528ac9eb4e7e8917f2a~mv2.png'
    ],
  },
  {
    name: 'Blunt Mountain-Mint',
    acr: 'MMT',
    size: 24,
    sciName: 'Pycnanthemum muticum',
    isKeystone: true,
    isGrass: false,
    light: 'Full-Part Sun',
    bloom: 'Jul-Sep',
    bloomColor: '#E6E6FA',
    height: '1-3 ft',
    spread: '1-2 ft',
    zone: '4-8',
    water: 'Medium',
    about: '2025 Perennial Plant of the Year! A clump-forming aromatic perennial with flat clusters of pale lavender-pink flowers set off by striking silvery-white bracts that look dusted with snow. Strong mint fragrance when crushed.\n\nDesign notes: The silvery bracts make this plant pop in any design—use it where you want visual interest even before and after bloom.',
    care: 'Vigorous grower but not invasive like true mints. Prune roots with spade in spring to contain if needed. Tolerates a wide range of conditions from full sun to part shade. Rub leaves on skin as a natural mosquito repellent!',
    wildlife: 'TOP POLLINATOR PLANT! In field tests, attracted more pollinators than any other plant tested. Host plant for Gray Hairstreak butterfly. Deer and rabbit resistant. When mountain-mint is blooming, you can hear the garden buzzing—it\'s that active.',
    tags: ['Keystone Species', '#1 Pollinator Plant', 'Deer Resistant', 'Fragrant', 'Butterfly Host', 'Beginner Friendly'],
    img: 'https://static.wixstatic.com/media/94bd1f_c877a7e1e24143ce91317966460be77b~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_74b85c79cb9a45bb8cd2890801a6846b~mv2.jpg',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_74b85c79cb9a45bb8cd2890801a6846b~mv2.jpg',
      'https://static.wixstatic.com/media/94bd1f_c877a7e1e24143ce91317966460be77b~mv2.png'
    ],
  },
  {
    name: 'Butterfly Weed',
    acr: 'ASC',
    size: 24,
    sciName: 'Asclepias tuberosa',
    isKeystone: true,
    isGrass: false,
    light: 'Full Sun',
    bloom: 'Jun-Aug',
    bloomColor: '#FF6347',
    height: '1-2.5 ft',
    spread: '1-1.5 ft',
    zone: '3-9',
    water: 'Dry to Medium',
    about: 'Butterfly milkweed is the "clean and fiery" milkweed—bright orange blooms, a tidy clumping habit, and serious ecological impact. Once established, it\'s a heat-and-drought champ thanks to its deep taproot. 2017 Perennial Plant of the Year!\n\nDesign notes: Place where you want attention—near a path, mailbox bed, or front-border focal zone.',
    care: 'Easy if you respect its preferences. Full sun and excellent drainage is a must (think sandy/rocky/average). Consistent water the first season; drought-tough after. DON\'T move it—the taproot makes mature plants resent transplanting. Sap can irritate skin; wear gloves if sensitive. Slow to emerge in spring—mark its location!',
    wildlife: 'One of the most direct wildlife actions you can take in a garden. ESSENTIAL host plant for Monarch butterflies—caterpillars feed on the leaves. Also hosts milkweed tussock moth. Flowers feed many native bees, butterflies, and hummingbirds. Milkweed isn\'t just nectar—it\'s the nursery. If you want butterflies you can actually watch develop, this is the doorway plant.',
    tags: ['Keystone Species', 'Monarch Host', 'Butterfly Magnet', 'Pollinator Favorite', 'Drought Tolerant', 'Hummingbird Plant', 'Low Maintenance'],
    img: 'https://static.wixstatic.com/media/94bd1f_00213b64feff49f591a7fb83fd720fbb~mv2.png',
    productImg: 'https://static.wixstatic.com/media/94bd1f_00213b64feff49f591a7fb83fd720fbb~mv2.png',
    gallery: [
      'https://static.wixstatic.com/media/94bd1f_00213b64feff49f591a7fb83fd720fbb~mv2.png'
    ],
  },
  {
    name: 'Toolbox',
    acr: 'TBX',
    size: 18,
    sciName: '',
    isKeystone: false,
    isGrass: false,
    light: '',
    bloom: '',
    bloomColor: '',
    height: '',
    spread: '',
    zone: '',
    water: '',
    about: '',
    care: '',
    wildlife: '',
    tags: [],
    img: '',
    productImg: '',
    gallery: [],
    isBlank: true,
  },
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parse bloom period string to month numbers
export function parseBloomPeriod(bloom: string): number[] {
  if (!bloom) return [];
  const monthMap: Record<string, number> = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  const parts = bloom.split('-');
  if (parts.length !== 2) return [];

  const start = monthMap[parts[0]];
  const end = monthMap[parts[1]];
  if (!start || !end) return [];

  const months: number[] = [];
  for (let m = start; m <= end; m++) {
    months.push(m);
  }
  return months;
}

// Get bloom color with fallback
export function getBloomColor(bloom: string): string {
  const colorMap: Record<string, string> = {
    'May-Jul': '#FFD700',
    'Jul-Sep': '#9932CC',
    'Aug-Oct': '#DDA0DD',
    'Jun-Sep': '#FFA500',
    'Jun-Aug': '#DA70D6',
    'Sep-Oct': '#6A5ACD',
  };
  return colorMap[bloom] || '#1B9E31';
}
