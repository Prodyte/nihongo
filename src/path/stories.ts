// Short graded stories for reading practice, written for this app at N5. Chunks carry furigana as 漢字[かんじ], like
// the grammar sentences; every word is a course word (tests check), so tapping a word can look it up.

export interface Story {
  id: string
  title: string // Japanese, marked up
  en: string
  level: 5
  sentences: { tokens: string[]; en: string }[]
  questions: { q: string; options: string[]; answer: number }[]
}

export const STORIES: Story[] = [
  {
    id: 'my-day', title: 'わたし の 一日[いちにち]', en: 'My day', level: 5,
    sentences: [
      { tokens: ['わたし', 'は', '毎朝[まいあさ]', '七時[しちじ]', 'に', '起[お]きます'], en: 'I get up at seven every morning.' },
      { tokens: ['朝[あさ]ご飯[はん]', 'に', 'パン', 'を', '食[た]べます'], en: 'I eat bread for breakfast.' },
      { tokens: ['コーヒー', 'も', '飲[の]みます'], en: 'I also drink coffee.' },
      { tokens: ['八時[はちじ]', 'に', '家[いえ]', 'を', '出[で]ます'], en: 'I leave home at eight.' },
      { tokens: ['電車[でんしゃ]', 'で', '会社[かいしゃ]', 'へ', '行[い]きます'], en: 'I go to the company by train.' },
      { tokens: ['昼[ひる]ご飯[はん]', 'は', '友達[ともだち]', 'と', 'レストラン', 'で', '食[た]べます'], en: 'I eat lunch with a friend at a restaurant.' },
      { tokens: ['夜[よる]', 'は', '家[いえ]', 'で', '本[ほん]', 'を', '読[よ]みます'], en: 'At night I read books at home.' },
    ],
    questions: [
      { q: 'What time does the writer get up?', options: ['At seven', 'At eight', 'At eleven'], answer: 0 },
      { q: 'How does the writer get to work?', options: ['By bus', 'By train', 'On foot'], answer: 1 },
      { q: 'What does the writer do at night?', options: ['Watches TV', 'Studies Japanese', 'Reads books'], answer: 2 },
    ],
  },
  {
    id: 'weekend', title: '週末[しゅうまつ]', en: 'The weekend', level: 5,
    sentences: [
      { tokens: ['土曜日[どようび]', 'は', '天気[てんき]', 'が', 'よかった', 'です'], en: 'The weather was good on Saturday.' },
      { tokens: ['友達[ともだち]', 'と', '公園[こうえん]', 'へ', '行[い]きました'], en: 'I went to the park with a friend.' },
      { tokens: ['公園[こうえん]', 'に', '犬[いぬ]', 'が', 'たくさん', 'いました'], en: 'There were lots of dogs in the park.' },
      { tokens: ['それから', '喫茶店[きっさてん]', 'で', 'コーヒー', 'を', '飲[の]みました'], en: 'After that we had coffee at a café.' },
      { tokens: ['日曜日[にちようび]', 'は', '雨[あめ]', 'でした'], en: 'It rained on Sunday.' },
      { tokens: ['わたし', 'は', '家[いえ]', 'で', 'テレビ', 'を', '見[み]ました'], en: 'I watched TV at home.' },
    ],
    questions: [
      { q: 'How was the weather on Saturday?', options: ['Rainy', 'Good', 'Cold'], answer: 1 },
      { q: 'What was in the park?', options: ['Lots of dogs', 'Lots of cats', 'Lots of children'], answer: 0 },
      { q: 'What did the writer do on Sunday?', options: ['Went to a café', 'Went to the park', 'Watched TV at home'], answer: 2 },
    ],
  },
  {
    id: 'shopping', title: '買[か]い物[もの]', en: 'Shopping', level: 5,
    sentences: [
      { tokens: ['今日[きょう]', 'は', 'デパート', 'へ', '行[い]きました'], en: 'Today I went to a department store.' },
      { tokens: ['母[はは]', 'の', '誕生日[たんじょうび]', 'の', '物[もの]', 'を', '買[か]いたかった', 'です'], en: 'I wanted to buy something for my mother’s birthday.' },
      { tokens: ['きれい', 'な', 'かばん', 'が', 'ありました'], en: 'There was a pretty bag.' },
      { tokens: ['でも', 'とても', '高[たか]かった', 'です'], en: 'But it was very expensive.' },
      { tokens: ['わたし', 'は', '安[やす]い', '傘[かさ]', 'を', '買[か]いました'], en: 'I bought a cheap umbrella.' },
      { tokens: ['母[はは]', 'は', 'その', '傘[かさ]', 'が', '大好[だいす]き', 'です'], en: 'My mother loves that umbrella.' },
    ],
    questions: [
      { q: 'Where did the writer go?', options: ['A department store', 'A station', 'A bank'], answer: 0 },
      { q: 'Why didn’t the writer buy the bag?', options: ['It was too big', 'It was very expensive', 'It wasn’t pretty'], answer: 1 },
      { q: 'What did the writer buy?', options: ['A bag', 'A watch', 'An umbrella'], answer: 2 },
    ],
  },
  {
    id: 'studying', title: '日本語[にほんご] の 勉強[べんきょう]', en: 'Studying Japanese', level: 5,
    sentences: [
      { tokens: ['わたし', 'は', '毎日[まいにち]', '日本語[にほんご]', 'を', '勉強[べんきょう]します'], en: 'I study Japanese every day.' },
      { tokens: ['漢字[かんじ]', 'は', 'まだ', '難[むずか]しい', 'です'], en: 'Kanji are still difficult.' },
      { tokens: ['毎晩[まいばん]', '新[あたら]しい', '言葉[ことば]', 'を', '覚[おぼ]えます'], en: 'Every evening I learn new words.' },
      { tokens: ['先生[せんせい]', 'は', 'とても', 'やさしい', 'です'], en: 'My teacher is very kind.' },
      { tokens: ['来年[らいねん]', '日本[にほん]', 'へ', '行[い]きたい', 'です'], en: 'I want to go to Japan next year.' },
      { tokens: ['日本[にほん]', 'で', '日本語[にほんご]', 'で', '話[はな]したい', 'です'], en: 'I want to speak Japanese in Japan.' },
    ],
    questions: [
      { q: 'What is still difficult for the writer?', options: ['Kanji', 'Katakana', 'Speaking'], answer: 0 },
      { q: 'When does the writer learn new words?', options: ['Every morning', 'Every evening', 'On weekends'], answer: 1 },
      { q: 'What does the writer want to do next year?', options: ['Buy a dictionary', 'Become a teacher', 'Go to Japan'], answer: 2 },
    ],
  },
  {
    id: 'restaurant', title: 'レストラン で', en: 'At a restaurant', level: 5,
    sentences: [
      { tokens: ['昨日[きのう]', 'の', '晩[ばん]', '家族[かぞく]', 'と', 'レストラン', 'へ', '行[い]きました'], en: 'Yesterday evening I went to a restaurant with my family.' },
      { tokens: ['父[ちち]', 'は', '魚[さかな]', 'を', '食[た]べました'], en: 'My father ate fish.' },
      { tokens: ['姉[あね]', 'は', '肉[にく]', 'と', '野菜[やさい]', 'を', '食[た]べました'], en: 'My older sister ate meat and vegetables.' },
      { tokens: ['わたし', 'は', 'ラーメン', 'を', '食[た]べました'], en: 'I ate ramen.' },
      { tokens: ['ラーメン', 'は', 'とても', 'おいしかった', 'です'], en: 'The ramen was very good.' },
      { tokens: ['食[た]べた', '後[あと]', 'で', '冷[つめ]たい', 'お茶[ちゃ]', 'を', '飲[の]みました'], en: 'After eating, we drank cold tea.' },
    ],
    questions: [
      { q: 'Who did the writer go with?', options: ['Friends', 'Family', 'A teacher'], answer: 1 },
      { q: 'What did the father eat?', options: ['Fish', 'Ramen', 'Meat'], answer: 0 },
      { q: 'What did they drink afterwards?', options: ['Hot coffee', 'Water', 'Cold tea'], answer: 2 },
    ],
  },
  {
    id: 'my-town', title: 'わたし の 町[まち]', en: 'My town', level: 5,
    sentences: [
      { tokens: ['わたし', 'の', '町[まち]', 'は', '小[ちい]さい', 'です', 'が', '静[しず]か', 'です'], en: 'My town is small but quiet.' },
      { tokens: ['駅[えき]', 'の', '近[ちか]く', 'に', '銀行[ぎんこう]', 'と', '郵便局[ゆうびんきょく]', 'が', 'あります'], en: 'There is a bank and a post office near the station.' },
      { tokens: ['駅[えき]', 'から', '家[いえ]', 'まで', '歩[ある]いて', '十分[じゅっぷん]', 'です'], en: 'It is ten minutes on foot from the station to my house.' },
      { tokens: ['家[いえ]', 'の', '前[まえ]', 'に', '大[おお]きい', '木[き]', 'が', 'あります'], en: 'There is a big tree in front of my house.' },
      { tokens: ['夏[なつ]', 'は', '暑[あつ]い', 'です', 'が', '冬[ふゆ]', 'は', 'とても', '寒[さむ]い', 'です'], en: 'Summer is hot, but winter is very cold.' },
      { tokens: ['わたし', 'は', 'この', '町[まち]', 'が', '大好[だいす]き', 'です'], en: 'I love this town.' },
    ],
    questions: [
      { q: 'What is the town like?', options: ['Big and busy', 'Small but quiet', 'New and expensive'], answer: 1 },
      { q: 'How far is the house from the station?', options: ['Ten minutes on foot', 'Ten minutes by bus', 'One hour'], answer: 0 },
      { q: 'What is in front of the house?', options: ['A post office', 'A park', 'A big tree'], answer: 2 },
    ],
  },
]
