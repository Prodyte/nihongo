// Decks are their authors' work: we only link to them (nothing is bundled). "Tested" means we imported the
// real file with this app and played its audio. Verified reachable 2026-10-09.
export interface DeckLink { name: string; url: string; blurb: string }

export const DECK_LINKS: DeckLink[] = [
  { name: 'Kaishi 1.5k', url: 'https://github.com/donkuri/kaishi/releases/latest',
    blurb: '1,500 beginner words with example sentences, word and sentence audio, and pictures. Free from GitHub, no account needed. Tested with this app.' },
  { name: 'JIVX JLPT N5', url: 'https://jivx.com/anki',
    blurb: '500 everyday sentences with native audio in neutral and casual speech (male or female voice). The N5 deck is free; higher levels are paid. Tested with this app.' },
  { name: 'KatakanaKore1k', url: 'https://skerritt.blog/announcing-katakankore1k/',
    blurb: 'The 1,000 most common katakana words, with computer-generated audio on every card. Tested with this app.' },
  { name: 'Core 2k/6k (optimized)', url: 'https://ankiweb.net/shared/info/1487314101',
    blurb: 'A popular frequency-ordered vocabulary and sentence deck on AnkiWeb. Audio depends on the version, so check the deck page; AnkiWeb may ask you to sign in to download. Not tested with this app.' },
  { name: 'Hiragana and Katakana with Audio', url: 'https://forums.ankiweb.net/t/hiragana-and-katakana-with-audio/9510',
    blurb: 'Community thread about a kana deck that teaches the sounds without romaji.' },
  { name: 'Browse all Japanese decks on AnkiWeb', url: 'https://ankiweb.net/shared/decks?search=japanese',
    blurb: 'Everything shared on AnkiWeb. Check each deck for audio and its license.' },
]
