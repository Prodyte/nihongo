// The first grammar unit: four lessons of six sentences. Written for this app. Sentences use only words from the
// vocabulary units plus a few function words; the ます-forms are the polite forms of taught verbs. Tests check the
// words, the verb forms, the spelling and the uniqueness; they cannot judge the explanations, so skim those.
export interface SentenceSpec {
  tokens: string[] // the chunks a learner puts in order (a particle is its own chunk)
  en: string
  bank?: string[] // extra wrong chunks for the word bank
  alts?: string[][] // other word orders that are also correct
  gap?: { at: number; wrong: string[] } // the chunk to blank in the fill-the-gap question, and wrong options for it (default: the first particle)
}
export interface GrammarLessonSpec {
  title: string
  explain: { title: string; body: string[]; examples: number[] } // examples: indices into `sentences`
  sentences: SentenceSpec[]
}

export const GRAMMAR_UNIT = { id: 'grammar-1', title: 'Grammar: simple sentences', blurb: 'Turn your words into sentences.' }

export const GRAMMAR_LESSONS: GrammarLessonSpec[] = [
  {
    title: 'A は B です',
    explain: {
      title: 'A は B です: “A is B”',
      body: [
        'です works like “am”, “is” or “are”, and it is polite. In Japanese it comes at the end of the sentence.',
        'は marks the topic: what the sentence is about. It is written は but pronounced “wa”. わたしは = “as for me”.',
        'Add か at the end to ask a question: あなたは がくせいですか。 = “Are you a student?”',
        'To answer, say はい (yes) or いいえ (no).',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['わたし', 'は', 'がくせい', 'です'], en: 'I am a student.', bank: ['も'] },
      { tokens: ['あなた', 'は', 'せんせい', 'です'], en: 'You are a teacher.', bank: ['か'] },
      { tokens: ['ともだち', 'は', 'おんな', 'です'], en: 'The friend is a woman.', bank: ['の'] },
      { tokens: ['せんせい', 'は', 'おとこ', 'です'], en: 'The teacher is a man.', bank: ['も'] },
      { tokens: ['あなた', 'は', 'がくせい', 'です', 'か'], en: 'Are you a student?', bank: ['を', 'も'] },
      { tokens: ['ともだち', 'は', 'せんせい', 'です', 'か'], en: 'Is the friend a teacher?', bank: ['の'] },
    ],
  },
  {
    title: 'の and も',
    explain: {
      title: 'の (“of”) and も (“also”)',
      body: [
        'の links two nouns, like “’s” or “of”. The owner comes first: わたしの ほん = “my book”.',
        'も means “also” or “too”. It takes the place of は: わたしも がくせいです。 = “I am a student too.”',
        'Questions work the same way: あなたも がくせいですか。 = “Are you a student too?”',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['わたし', 'の', 'ともだち', 'は', 'がくせい', 'です'], en: 'My friend is a student.', bank: ['を'] },
      { tokens: ['あなた', 'の', 'せんせい', 'は', 'おとこ', 'です'], en: 'Your teacher is a man.', bank: ['も'] },
      { tokens: ['わたし', 'の', 'ほん', 'です'], en: 'It is my book.', bank: ['は'] },
      { tokens: ['せんせい', 'の', 'なまえ', 'です'], en: "It is the teacher's name.", bank: ['を'] },
      { tokens: ['わたし', 'も', 'がくせい', 'です'], en: 'I am a student too.', bank: ['は'] },
      { tokens: ['あなた', 'も', 'がくせい', 'です', 'か'], en: 'Are you a student too?', bank: ['の'] },
    ],
  },
  {
    title: 'Verbs with を',
    explain: {
      title: 'Verbs and を',
      body: [
        'Polite verbs end in ます. Change the dictionary form you learned: たべる → たべます, のむ → のみます, よむ → よみます, かう → かいます.',
        'を marks the thing the verb acts on. It is pronounced “o” (but typed “wo”): みずを のみます。 = “I drink water.”',
        'The verb goes last. When it is clear who is doing it, Japanese leaves out “I”.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['みず', 'を', 'のみます'], en: 'I drink water.', bank: ['は'] },
      { tokens: ['ごはん', 'を', 'たべます'], en: 'I eat rice.', bank: ['も'] },
      { tokens: ['ほん', 'を', 'よみます'], en: 'I read a book.', bank: ['の'] },
      { tokens: ['パン', 'を', 'かいます'], en: 'I buy bread.', bank: ['は'] },
      { tokens: ['わたし', 'は', 'コーヒー', 'を', 'のみます'], en: 'I drink coffee.', bank: ['の'], alts: [['コーヒー', 'を', 'わたし', 'は', 'のみます']] },
      { tokens: ['ともだち', 'は', 'さかな', 'を', 'たべます'], en: 'The friend eats fish.', bank: ['も'], alts: [['さかな', 'を', 'ともだち', 'は', 'たべます']] },
    ],
  },
  {
    title: 'い-adjectives with です',
    explain: {
      title: 'い-adjectives',
      body: [
        'Adjectives that end in い (おおきい, あたらしい, おいしい, ふるい, やすい) describe things.',
        'To say something is big or new, put the adjective after は and finish with です: ほんは あたらしいです。 = “The book is new.”',
        'Add か to ask: ごはんは おいしいですか。 = “Is the rice delicious?”',
      ],
      examples: [0, 5],
    },
    sentences: [
      { tokens: ['ほん', 'は', 'あたらしい', 'です'], en: 'The book is new.', bank: ['を'] },
      { tokens: ['くるま', 'は', 'おおきい', 'です'], en: 'The car is big.', bank: ['も'] },
      { tokens: ['ラーメン', 'は', 'おいしい', 'です'], en: 'Ramen is delicious.', bank: ['の'] },
      { tokens: ['いえ', 'は', 'ふるい', 'です'], en: 'The house is old.', bank: ['を'] },
      { tokens: ['さかな', 'は', 'やすい', 'です'], en: 'The fish is cheap.', bank: ['も'] },
      { tokens: ['ごはん', 'は', 'おいしい', 'です', 'か'], en: 'Is the rice delicious?', bank: ['の'] },
    ],
  },
]
