// ============================================
// TRILHAS DAS MISSÕES: 12 composições originais (uma por missão: 1–8 caça de fontes, 9–12 investigações).
// `nivel` iguala o volume percebido entre as trilhas (medido por renderização offline no teste 35).
// Cada trilha tem 16 compassos em duas seções (A e B) e repete em ciclo. Notação: ver partitura.js.
// Nas missões baseadas em acidentes reais o tom é sóbrio de propósito (sem melodia "épica").
// Todas as melodias, harmonias e ritmos são originais deste projeto; nada foi copiado de outra obra.
// ============================================
const T = (pt, en) => ({ pt, en });

export const TRILHAS = [
    {
        id: 1, nivel: 0.6, nome: T('Treinamento', 'Training'), clima: T('Clara e didática, em dó maior.', 'Bright and didactic, in C major.'),
        tonica: 'C', modo: 'maior', bpm: 118, voz: { lead: 'pulso25', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'raiz-quinta', harmonia: 'arpejo', percussao: 'suave',
              acordes: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
              melodia: ['E5 - G5 - E5 - D5 C5', 'D5 - G5 - B4 - D5 -', 'C5 - E5 - A5 - G5 E5', 'F5 - A5 - C6 - A5 F5',
                        'E5 - G5 - E5 - D5 C5', 'D5 - B4 - G4 - B4 D5', 'F5 - E5 - D5 - C5 A4', 'B4 - D5 - G5 - - -'] },
            { baixo: 'raiz-quinta', harmonia: 'arpejo', percussao: 'batida',
              acordes: ['C', 'Em', 'Am', 'F', 'Dm', 'G', 'C', 'G'],
              melodia: ['G5 - E5 - C6 - B5 G5', 'E5 - G5 - B5 - G5 E5', 'A5 - G5 - E5 - C5 E5', 'F5 - A5 - G5 - F5 E5',
                        'D5 - F5 - A5 - F5 D5', 'G5 - B5 - D6 - B5 G5', 'E5 - G5 - C6 - - G5', 'B4 - D5 - F5 - G5 -'] },
        ],
    },
    {
        id: 2, nivel: 0.46, nome: T('Goiânia', 'Goiânia'), clima: T('Sóbria e contida, em lá menor; só pulsa na segunda parte.', 'Sober and restrained, in A minor; a pulse only in the second half.'),
        tonica: 'A', modo: 'menor', bpm: 72, voz: { lead: 'triangulo', harm: 'seno', bass: 'triangulo' },
        secoes: [
            { baixo: 'pedal', harmonia: 'pad', percussao: 'nenhuma',
              acordes: ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'Em', 'Em'],
              melodia: ['A4 - - - C5 - - -', 'E5 - - - D5 - C5 -', 'C5 - - - A4 - - -', 'F4 - - - A4 - - -',
                        'D5 - - - F5 - - -', 'E5 - D5 - C5 - - -', 'B4 - - - G4 - - -', 'B4 - - - - - - -'] },
            { baixo: 'pedal', harmonia: 'pad', percussao: 'pulso',
              acordes: ['Am', 'F', 'Dm', 'Em', 'Am', 'F', 'Em', 'Am'],
              melodia: ['A4 - C5 - E5 - - -', 'F5 - E5 - C5 - - -', 'D5 - F5 - A5 - - -', 'G5 - E5 - B4 - - -',
                        'A4 - - - C5 - E5 -', 'F5 - - - C5 - A4 -', 'B4 - - - E5 - G5 -', 'A4 - - - - - - -'] },
        ],
    },
    {
        id: 3, nivel: 0.59, nome: T('Radium Girls', 'Radium Girls'), clima: T('Ragtime de época (anos 1920), com swing, em fá maior.', 'Period ragtime (1920s) with swing, in F major.'),
        tonica: 'F', modo: 'maior', bpm: 126, swing: 0.22, voz: { lead: 'pulso25', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'raiz-quinta', harmonia: 'stab', percussao: 'nenhuma',
              acordes: ['F', 'Dm', 'Gm', 'C7', 'F', 'Dm', 'Bb', 'C7'],
              melodia: ['A4 C5 F5 - A5 - F5 C5', 'D5 F5 A5 - F5 - D5 A4', 'G4 Bb4 D5 - G5 - D5 Bb4', 'C5 E5 G5 - Bb5 - G5 E5',
                        'A4 C5 F5 - A5 - C6 A5', 'F5 D5 A4 D5 F5 - A5 -', 'D5 F5 Bb5 - A5 - F5 D5', 'E5 G5 C6 - G5 E5 C5 -'] },
            { baixo: 'raiz-quinta', harmonia: 'stab', percussao: 'suave',
              acordes: ['Bb', 'F', 'Gm', 'C7', 'F', 'Dm', 'Gm', 'C7'],
              melodia: ['Bb4 D5 F5 - Bb5 - F5 D5', 'A4 C5 F5 - C6 - A5 F5', 'G5 - D5 G5 - Bb5 - G5', 'E5 - G5 - Bb5 - C6 -',
                        'F5 A5 C6 - A5 F5 C5 -', 'D5 F5 A5 D6 - A5 F5 D5', 'G4 Bb4 D5 G5 - D5 Bb4 G4', 'C5 - E5 - G5 - Bb5 -'] },
        ],
    },
    {
        id: 4, nivel: 0.46, nome: T('Chernobyl', 'Chernobyl'), clima: T('Lenta e sombria, em ré menor, com notas longas e graves.', 'Slow and dark, in D minor, with long low notes.'),
        tonica: 'D', modo: 'menor', bpm: 60, voz: { lead: 'triangulo', harm: 'seno', bass: 'triangulo' },
        secoes: [
            { baixo: 'pedal', harmonia: 'pad', percussao: 'nenhuma',
              acordes: ['Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'Am', 'Am'],
              melodia: ['D4 - - - F4 - - -', 'A4 - - - F4 - D4 -', 'D4 - - - F4 - - -', 'Bb4 - - - A4 - F4 -',
                        'G4 - - - Bb4 - - -', 'D5 - - - Bb4 - G4 -', 'A4 - - - C5 - E5 -', 'E5 - - - - - - -'] },
            { baixo: 'pedal', harmonia: 'pad', percussao: 'pulso',
              acordes: ['Dm', 'Bb', 'Gm', 'Am', 'Dm', 'Bb', 'Am', 'Dm'],
              melodia: ['F5 - - - D5 - - -', 'D5 - - - F5 - A5 -', 'G5 - F5 - D5 - Bb4 -', 'A4 - C5 - E5 - - -',
                        'D5 - F5 - A5 - - -', 'Bb5 - A5 - F5 - D5 -', 'C5 - E5 - A5 - - -', 'D5 - - - - - - -'] },
        ],
    },
    {
        id: 5, nivel: 0.43, nome: T('Lia, Geórgia', 'Lia, Georgia'), clima: T('Fria e aberta, em mi menor, como uma floresta no inverno.', 'Cold and open, in E minor, like a forest in winter.'),
        tonica: 'E', modo: 'menor', bpm: 84, voz: { lead: 'seno', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'raiz-quinta', harmonia: 'arpejo-lento', percussao: 'nenhuma',
              acordes: ['Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D'],
              melodia: ['B4 - - - E5 - G5 -', 'G5 - E5 - C5 - - -', 'B4 - D5 - G5 - - -', 'A5 - F#5 - D5 - - -',
                        'E5 - G5 - B5 - - -', 'C6 - B5 - G5 - E5 -', 'D5 - G5 - B5 - D6 -', 'A5 - F#5 - A5 - - -'] },
            { baixo: 'raiz-quinta', harmonia: 'arpejo-lento', percussao: 'suave',
              acordes: ['Em', 'C', 'G', 'D', 'C', 'G', 'D', 'Em'],
              melodia: ['G5 - B5 - E6 - D6 B5', 'C6 - G5 - E5 - G5 -', 'B5 - G5 - D5 - B4 -', 'D5 - F#5 - A5 - F#5 -',
                        'E5 - G5 - C6 - G5 -', 'D5 - G5 - B5 - G5 -', 'F#5 - A5 - D6 - A5 -', 'B5 - - - E5 - - -'] },
        ],
    },
    {
        id: 6, nivel: 0.48, nome: T('Zaragoza', 'Zaragoza'), clima: T('Clínica e delicada, em valsa lenta (3/4), em sol maior.', 'Clinical and delicate, a slow waltz (3/4), in G major.'),
        tonica: 'G', modo: 'maior', bpm: 104, passos: 6, voz: { lead: 'seno', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'valsa', harmonia: 'arpejo-lento', percussao: 'nenhuma',
              acordes: ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'D'],
              melodia: ['B4 - D5 - G5 -', 'G5 - E5 - B4 -', 'C5 - E5 - G5 -', 'F#5 - D5 - A4 -',
                        'D5 - B4 - G4 -', 'E5 - G5 - B5 -', 'C6 - G5 - E5 -', 'D5 - A4 - F#4 -'] },
            { baixo: 'valsa', harmonia: 'valsa', percussao: 'nenhuma',
              acordes: ['Am', 'D', 'G', 'Em', 'Am', 'D', 'G', 'G'],
              melodia: ['A4 - C5 - E5 -', 'F#5 - A5 - D6 -', 'B5 - G5 - D5 -', 'B4 - E5 - G5 -',
                        'C6 - A5 - E5 -', 'A5 - F#5 - D5 -', 'G5 - B5 - D6 -', 'G5 - - - - -'] },
        ],
    },
    {
        id: 7, nivel: 0.58, nome: T('Mayapuri', 'Mayapuri'), clima: T('Movimentada, de cidade e ferro-velho, em lá menor.', 'Busy, city and scrapyard, in A minor.'),
        tonica: 'A', modo: 'menor', bpm: 136, voz: { lead: 'quadrada', harm: 'pulso25', bass: 'triangulo' },
        secoes: [
            { baixo: 'pulso', harmonia: 'stab', percussao: 'batida',
              acordes: ['Am', 'G', 'F', 'Em', 'Am', 'G', 'F', 'Em'],
              melodia: ['A4 C5 E5 C5 A4 C5 E5 -', 'G4 B4 D5 B4 G4 B4 D5 -', 'F4 A4 C5 A4 F4 A4 C5 -', 'E5 D5 B4 G4 E4 G4 B4 -',
                        'A5 - E5 C5 A4 - C5 E5', 'D5 - B4 G4 D5 - G5 -', 'C5 - A4 F4 A4 - C5 F5', 'B4 - G4 E4 G4 B4 E5 -'] },
            { baixo: 'pulso', harmonia: 'stab', percussao: 'batida',
              acordes: ['Dm', 'Am', 'F', 'G', 'Dm', 'Am', 'Em', 'Am'],
              melodia: ['D5 F5 A5 F5 D5 F5 A5 -', 'C5 E5 A5 E5 C5 E5 A5 -', 'A4 C5 F5 C5 A4 C5 F5 -', 'B4 D5 G5 D5 B4 D5 G5 -',
                        'A5 - F5 D5 A4 - D5 F5', 'E5 - C5 A4 C5 - E5 A5', 'G5 - E5 B4 E5 - G5 B5', 'A5 - E5 - C5 - A4 -'] },
        ],
    },
    {
        id: 8, nivel: 0.43, nome: T('Fukushima', 'Fukushima'), clima: T('Contida, com ondas lentas, em si menor.', 'Restrained, with slow waves, in B minor.'),
        tonica: 'B', modo: 'menor', bpm: 66, voz: { lead: 'seno', harm: 'seno', bass: 'triangulo' },
        secoes: [
            { baixo: 'pedal', harmonia: 'arpejo-lento', percussao: 'nenhuma',
              acordes: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'D', 'A'],
              melodia: ['F#5 - - - B5 - - -', 'D5 - - - G5 - - -', 'A5 - F#5 - D5 - - -', 'E5 - A5 - C#6 - - -',
                        'B5 - - - D6 - - -', 'B5 - A5 - G5 - E5 -', 'F#5 - A5 - D6 - - -', 'C#6 - A5 - E5 - - -'] },
            { baixo: 'pedal', harmonia: 'arpejo-lento', percussao: 'suave',
              acordes: ['G', 'D', 'A', 'Bm', 'G', 'D', 'A', 'Bm'],
              melodia: ['G5 - B5 - D6 - - -', 'F#5 - D5 - A5 - - -', 'A5 - C#6 - E6 - - -', 'D6 - B5 - F#5 - - -',
                        'B5 - D6 - E6 - D6 -', 'A5 - F#5 - A5 - D6 -', 'C#6 - E6 - A5 - - -', 'B5 - - - F#5 - - -'] },
        ],
    },
    {
        id: 9, nivel: 0.44, nome: T('Hospital', 'Hospital'), clima: T('Calma e atenta, em fá maior, sem percussão.', 'Calm and attentive, in F major, no percussion.'),
        tonica: 'F', modo: 'maior', bpm: 76, voz: { lead: 'seno', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'pedal', harmonia: 'arpejo-lento', percussao: 'nenhuma',
              acordes: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C'],
              melodia: ['A4 - C5 - F5 - - -', 'D5 - F5 - A5 - - -', 'Bb4 - D5 - F5 - - -', 'G5 - E5 - C5 - - -',
                        'C5 - A4 - F5 - - -', 'A5 - F5 - D5 - - -', 'D5 - F5 - Bb5 - A5 -', 'G5 - E5 - C5 - - -'] },
            { baixo: 'pedal', harmonia: 'arpejo-lento', percussao: 'nenhuma',
              acordes: ['Gm', 'F', 'C', 'Dm', 'Bb', 'F', 'C', 'F'],
              melodia: ['Bb4 - D5 - G5 - - -', 'A4 - C5 - F5 - A5 -', 'G5 - E5 - G5 - C6 -', 'D6 - A5 - F5 - - -',
                        'F5 - D5 - Bb4 - - -', 'A4 - C5 - F5 - - -', 'E5 - G5 - Bb5 - - -', 'F5 - - - - - - -'] },
        ],
    },
    {
        id: 10, nivel: 0.65, nome: T('Medicina nuclear', 'Nuclear medicine'), clima: T('Tecnológica e serena, em lá maior, com pulso leve.', 'Technological and serene, in A major, with a light pulse.'),
        tonica: 'A', modo: 'maior', bpm: 100, voz: { lead: 'pulso25', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'pulso', harmonia: 'arpejo', percussao: 'suave',
              acordes: ['A', 'F#m', 'D', 'E', 'A', 'F#m', 'D', 'E'],
              melodia: ['E5 - A5 - C#6 - A5 -', 'F#5 - A5 - C#6 - A5 -', 'D5 - F#5 - A5 - F#5 -', 'E5 - G#5 - B5 - G#5 -',
                        'C#6 - B5 - A5 - E5 -', 'C#6 - A5 - F#5 - A5 -', 'F#5 - A5 - D6 - A5 -', 'G#5 - B5 - E6 - B5 -'] },
            { baixo: 'pulso', harmonia: 'arpejo', percussao: 'suave',
              acordes: ['D', 'E', 'C#m', 'F#m', 'D', 'E', 'A', 'A'],
              melodia: ['D6 - A5 - F#5 - A5 -', 'E6 - B5 - G#5 - B5 -', 'C#6 - E6 - G#5 - E5 -', 'F#5 - A5 - C#6 - A5 -',
                        'A5 - F#5 - D5 - F#5 -', 'B5 - G#5 - E5 - G#5 -', 'A5 - C#6 - E6 - C#6 -', 'A5 - - - E5 - - -'] },
        ],
    },
    {
        id: 11, nivel: 0.49, nome: T('Laboratório de cronologia', 'Chronology laboratory'), clima: T('Cadenciada como um relógio, em sol menor, para pensar no tempo.', 'Paced like a clock, in G minor, to think about time.'),
        tonica: 'G', modo: 'menor', bpm: 92, voz: { lead: 'triangulo', harm: 'seno', bass: 'triangulo' },
        secoes: [
            { baixo: 'raiz-quinta', harmonia: 'arpejo', percussao: 'relogio',
              acordes: ['Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'Bb', 'F'],
              melodia: ['D5 - G5 - Bb5 - G5 -', 'Eb5 - G5 - Bb5 - G5 -', 'D5 - F5 - Bb5 - F5 -', 'C5 - F5 - A5 - F5 -',
                        'G5 - Bb5 - D6 - Bb5 -', 'G5 - Bb5 - Eb6 - Bb5 -', 'F5 - Bb5 - D6 - Bb5 -', 'A5 - C6 - A5 - F5 -'] },
            { baixo: 'raiz-quinta', harmonia: 'arpejo', percussao: 'relogio',
              acordes: ['Cm', 'Gm', 'Eb', 'F', 'Cm', 'Gm', 'F', 'Gm'],
              melodia: ['C5 - Eb5 - G5 - Eb5 -', 'D5 - G5 - Bb5 - G5 -', 'Eb5 - G5 - Bb5 - Eb6 -', 'C6 - A5 - F5 - A5 -',
                        'G5 - Eb5 - C5 - Eb5 -', 'Bb5 - G5 - D5 - G5 -', 'A5 - F5 - C5 - F5 -', 'G5 - - - D5 - - -'] },
        ],
    },
    {
        id: 12, nivel: 0.6, nome: T('Escola', 'School'), clima: T('Leve e amistosa, em sol maior, quase uma cantiga de recreio.', 'Light and friendly, in G major, almost a playground tune.'),
        tonica: 'G', modo: 'maior', bpm: 112, voz: { lead: 'pulso25', harm: 'triangulo', bass: 'triangulo' },
        secoes: [
            { baixo: 'raiz-quinta', harmonia: 'stab', percussao: 'suave',
              acordes: ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G'],
              melodia: ['B4 D5 G5 - B5 - G5 D5', 'C5 E5 G5 - C6 - G5 E5', 'B4 D5 G5 - B5 - A5 G5', 'F#5 A5 D6 - A5 - F#5 -',
                        'G5 - B5 - D6 - B5 G5', 'E5 - G5 - C6 - B5 A5', 'A5 - F#5 - D5 - F#5 A5', 'G5 - D5 - B4 - G4 -'] },
            { baixo: 'raiz-quinta', harmonia: 'stab', percussao: 'batida',
              acordes: ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'],
              melodia: ['E5 G5 B5 - E6 - B5 G5', 'E5 G5 C6 - E6 - C6 G5', 'D5 G5 B5 - D6 - B5 G5', 'A5 F#5 D5 - F#5 - A5 -',
                        'B5 - G5 E5 G5 - B5 -', 'C6 - G5 E5 G5 - C6 -', 'D6 - A5 F#5 A5 - D6 -', 'G5 - B5 - D6 - G5 -'] },
        ],
    },
];

/** Os problemas do Laboratório de pesquisa (ids 13–16, sala do laboratório de cronologia) usam a trilha 11. */
const TRILHA_DE_PESQUISA = 11;

/** A investigação "Zaragoza: o mistério do acelerador" (número 20, v3.21) toca a trilha da missão 6. */
const NUMERO_ZARAGOZA_INV = 20;
const NUMERO_FALSO_ALARME = 21;   // v3.21: chamados sem fonte perdida (investigação curta) tocam a trilha dos chamados rápidos (2)
export const trilhaDaMissao = (id) => {
  const n = Number(id);
  if (n === NUMERO_ZARAGOZA_INV) return TRILHAS.find((t) => t.id === 6) || null;
  if (n === NUMERO_FALSO_ALARME) return TRILHAS.find((t) => t.id === 2) || null;
  return TRILHAS.find((t) => t.id === n) || (n >= 13 && n <= 16 ? TRILHAS.find((t) => t.id === TRILHA_DE_PESQUISA) : null) || null;
};
