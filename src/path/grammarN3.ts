// N3 grammar: lessons of six sentences, written for this app like the N5 and N4 ones. Sentences lean on N5 and N4 words
// so each lesson can come early in the N3 section (course.ts places it after its words; tests check every word is taught).
// Tests check words, spelling and structure; they can't judge the explanations, so skim those.
import type { GrammarLessonSpec } from './grammar'

export const N3_GRAMMAR: GrammarLessonSpec[] = [
  {
    title: '〜てばかりいる',
    explain: {
      title: 'ばかり: “nothing but”, “only”',
      body: [
        'Noun + ばかり means “nothing but”: 甘い物ばかり 食べます = “eats nothing but sweet things”.',
        'The て form + ばかりいる says someone keeps doing one thing, usually with a complaint: 寝てばかりいます = “does nothing but sleep”.',
        'ばかり sounds more critical than だけ (“only”), which just states a limit.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['弟[おとうと]', 'は', 'ゲーム', 'を', 'して', 'ばかり', 'います'], en: 'My younger brother does nothing but play games.', bank: ['だけ'], gap: { at: 5, wrong: ['しか', 'まで'] } },
      { tokens: ['妹[いもうと]', 'は', '毎日[まいにち]', 'テレビ', 'を', '見[み]て', 'ばかり', 'います'], en: 'My younger sister just watches TV every day.', bank: ['だけ'], gap: { at: 6, wrong: ['しか', 'まで'] } },
      { tokens: ['彼[かれ]', 'は', '寝[ね]て', 'ばかり', 'います'], en: 'He does nothing but sleep.', bank: ['しか'], gap: { at: 3, wrong: ['しか', 'まで'] } },
      { tokens: ['父[ちち]', 'は', '仕事[しごと]', 'ばかり', 'して', 'います'], en: 'My father does nothing but work.', bank: ['しか'], gap: { at: 3, wrong: ['しか', 'まで'] } },
      { tokens: ['子供[こども]', 'は', '甘[あま]い', '物[もの]', 'ばかり', '食[た]べます'], en: 'The child eats nothing but sweet things.', bank: ['しか'], gap: { at: 4, wrong: ['しか', 'まで'] } },
      { tokens: ['兄[あに]', 'は', '漫画[まんが]', 'ばかり', '読[よ]んで', 'います'], en: 'My older brother reads nothing but manga.', bank: ['しか'], gap: { at: 3, wrong: ['しか', 'まで'] } },
    ],
  },
  {
    title: '〜たばかり',
    explain: {
      title: '〜たばかり: “have just done”',
      body: [
        'The た form + ばかりです says something happened only a short time ago: 起きたばかりです = “I’ve just got up”.',
        'It is about how it feels, not the clock: 先週 買ったばかり can mean “bought only last week”, because it still feels new.',
        'Compare 〜たところ (next lesson), which means “just this moment”.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['今[いま]', '起[お]きた', 'ばかり', 'です'], en: 'I’ve just got up.', bank: ['起[お]きる'], gap: { at: 1, wrong: ['起[お]きる', '起[お]きて'] } },
      { tokens: ['日本[にほん]', 'に', '来[き]た', 'ばかり', 'です'], en: 'I have only just come to Japan.', bank: ['来[く]る'], gap: { at: 2, wrong: ['来[く]る', '来[き]て'] } },
      { tokens: ['さっき', '昼[ひる]ご飯[はん]', 'を', '食[た]べた', 'ばかり', 'です'], en: 'I ate lunch only a little while ago.', bank: ['食[た]べる'], gap: { at: 3, wrong: ['食[た]べる', '食[た]べて'] } },
      { tokens: ['この', '車[くるま]', 'は', '先週[せんしゅう]', '買[か]った', 'ばかり', 'です'], en: 'I bought this car only last week.', bank: ['買[か]う'], gap: { at: 4, wrong: ['買[か]う', '買[か]って'] } },
      { tokens: ['駅[えき]', 'に', '着[つ]いた', 'ばかり', 'です'], en: 'I’ve just arrived at the station.', bank: ['着[つ]く'], gap: { at: 2, wrong: ['着[つ]く', '着[つ]いて'] } },
      { tokens: ['先月[せんげつ]', '結婚[けっこん]した', 'ばかり', 'です'], en: 'We only got married last month.', bank: ['結婚[けっこん]する'], gap: { at: 1, wrong: ['結婚[けっこん]する', '結婚[けっこん]して'] } },
    ],
  },
  {
    title: '〜ところ',
    explain: {
      title: 'ところ: about to, in the middle of, just did',
      body: [
        'Dictionary form + ところです = “about to”: 出かけるところです = “I’m just about to go out”.',
        'ている + ところです = “in the middle of”: 食べているところです = “I’m eating right now”.',
        'た form + ところです = “have just (this moment)”: 帰ったところです = “I’ve just got home”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['今[いま]', 'から', '出[で]かける', 'ところ', 'です'], en: 'I’m just about to go out.', bank: ['出[で]かけた'], gap: { at: 2, wrong: ['出[で]かけた', '出[で]かけて'] } },
      { tokens: ['今[いま]', 'ご飯[はん]', 'を', '食[た]べて', 'いる', 'ところ', 'です'], en: 'I’m in the middle of eating right now.', bank: ['食[た]べた'], gap: { at: 3, wrong: ['食[た]べた', '食[た]べる'] } },
      { tokens: ['今[いま]', '家[いえ]', 'に', '帰[かえ]った', 'ところ', 'です'], en: 'I’ve just this moment got home.', bank: ['帰[かえ]る'], gap: { at: 3, wrong: ['帰[かえ]る', '帰[かえ]って'] } },
      { tokens: ['これから', '宿題[しゅくだい]', 'を', 'する', 'ところ', 'です'], en: 'I’m about to do my homework.', bank: ['した'], gap: { at: 3, wrong: ['した', 'して'] } },
      { tokens: ['今[いま]', '手紙[てがみ]', 'を', '書[か]いて', 'いる', 'ところ', 'です'], en: 'I’m writing a letter right now.', bank: ['書[か]いた'], gap: { at: 3, wrong: ['書[か]いた', '書[か]く'] } },
      { tokens: ['電車[でんしゃ]', 'は', '今[いま]', '出[で]た', 'ところ', 'です'], en: 'The train has just left.', bank: ['出[で]る'], gap: { at: 3, wrong: ['出[で]る', '出[で]て'] } },
    ],
  },
  {
    title: '〜ようにする',
    explain: {
      title: '〜ようにする: “make a point of”',
      body: [
        'Dictionary form or ない form + ようにする means making an effort to do (or not do) something: 早く寝るようにします = “I’ll try to go to bed early”.',
        'ようにしています describes a habit you keep up: 野菜を食べるようにしています = “I make a point of eating vegetables”.',
        'Compare ようになる (next lesson): する is your effort, なる is a change that happens.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['毎日[まいにち]', '野菜[やさい]', 'を', '食[た]べる', 'ように', 'して', 'います'], en: 'I make a point of eating vegetables every day.', bank: ['なって'], gap: { at: 5, wrong: ['なって', 'あって'] } },
      { tokens: ['早[はや]く', '寝[ね]る', 'ように', 'して', 'います'], en: 'I try to go to bed early.', bank: ['なって'], gap: { at: 3, wrong: ['なって', 'あって'] } },
      { tokens: ['肉[にく]', 'を', '食[た]べない', 'ように', 'して', 'います'], en: 'I try not to eat meat.', bank: ['食[た]べる'], gap: { at: 2, wrong: ['食[た]べる', '食[た]べた'] } },
      { tokens: ['毎朝[まいあさ]', '歩[ある]く', 'ように', 'して', 'います'], en: 'I make a habit of walking every morning.', bank: ['なって'], gap: { at: 3, wrong: ['なって', 'あって'] } },
      { tokens: ['授業[じゅぎょう]', 'に', '遅[おく]れない', 'ように', 'します'], en: 'I’ll make sure not to be late for class.', bank: ['なります'], gap: { at: 4, wrong: ['なります', 'あります'] } },
      { tokens: ['日本語[にほんご]', 'で', '話[はな]す', 'ように', 'して', 'います'], en: 'I try to speak in Japanese.', bank: ['なって'], gap: { at: 4, wrong: ['なって', 'あって'] } },
    ],
  },
  {
    title: '〜ようになる',
    explain: {
      title: '〜ようになる: “come to (be able to)”',
      body: [
        'Dictionary form or potential form + ようになる describes a change: 漢字が読めるようになりました = “I can read kanji now”.',
        'With an ordinary verb it means a new habit: 魚を食べるようになりました = “I’ve started eating fish”.',
        'ようになりたい = “I want to become able to”: 泳げるようになりたいです.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['日本語[にほんご]', 'が', '上手[じょうず]', 'に', '話[はな]せる', 'ように', 'なりました'], en: 'I’ve become able to speak Japanese well.', bank: ['しました'], gap: { at: 6, wrong: ['しました', 'ありました'] } },
      { tokens: ['漢字[かんじ]', 'が', '読[よ]める', 'ように', 'なりました'], en: 'I can read kanji now.', bank: ['しました'], gap: { at: 4, wrong: ['しました', 'ありました'] } },
      { tokens: ['泳[およ]げる', 'ように', 'なりたい', 'です'], en: 'I want to become able to swim.', bank: ['したい'], gap: { at: 2, wrong: ['したい', 'ありたい'] } },
      { tokens: ['子供[こども]', 'が', '一人[ひとり]', 'で', '歩[ある]ける', 'ように', 'なりました'], en: 'The child can walk alone now.', bank: ['しました'], gap: { at: 6, wrong: ['しました', 'ありました'] } },
      { tokens: ['最近[さいきん]', '魚[さかな]', 'を', '食[た]べる', 'ように', 'なりました'], en: 'Recently I’ve started eating fish.', bank: ['しました'], gap: { at: 5, wrong: ['しました', 'ありました'] } },
      { tokens: ['毎朝[まいあさ]', '早[はや]く', '起[お]きられる', 'ように', 'なりました'], en: 'I can get up early every morning now.', bank: ['しました'], gap: { at: 4, wrong: ['しました', 'ありました'] } },
    ],
  },
  {
    title: '〜ても',
    explain: {
      title: '〜ても: “even if”, “even though”',
      body: [
        'The て form + も means “even if”: 雨が降っても 行きます = “I’ll go even if it rains”.',
        'い-adjectives use くても (高くても), nouns and な-adjectives use でも (暇でも).',
        'The second half says what happens anyway, often something unexpected: 勉強しても わかりません.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['雨[あめ]', 'が', '降[ふ]っても', '行[い]きます'], en: 'I’ll go even if it rains.', bank: ['降[ふ]ったら'], gap: { at: 2, wrong: ['降[ふ]って', '降[ふ]ったら'] } },
      { tokens: ['高[たか]くても', '買[か]います'], en: 'I’ll buy it even if it’s expensive.', bank: ['高[たか]くて'], gap: { at: 0, wrong: ['高[たか]くて', '高[たか]ければ'] } },
      { tokens: ['薬[くすり]', 'を', '飲[の]んでも', 'よく', 'なりません'], en: 'Even though I take medicine, I don’t get better.', bank: ['飲[の]んだら'], gap: { at: 2, wrong: ['飲[の]んで', '飲[の]んだら'] } },
      { tokens: ['寒[さむ]くても', '毎朝[まいあさ]', '走[はし]ります'], en: 'I run every morning even when it’s cold.', bank: ['寒[さむ]くて'], gap: { at: 0, wrong: ['寒[さむ]くて', '寒[さむ]ければ'] } },
      { tokens: ['勉強[べんきょう]しても', 'わかりません'], en: 'Even when I study, I don’t understand.', bank: ['勉強[べんきょう]して'], gap: { at: 0, wrong: ['勉強[べんきょう]して', '勉強[べんきょう]すれば'] } },
      { tokens: ['暇[ひま]', 'でも', '出[で]かけません'], en: 'Even when I’m free, I don’t go out.', bank: ['なら'], gap: { at: 1, wrong: ['なら', 'で'] } },
    ],
  },
  {
    title: '〜ば〜ほど',
    explain: {
      title: '〜ば〜ほど: “the more …, the more …”',
      body: [
        'Say the same word twice, first in the ば form, then in the dictionary form + ほど: 食べれば食べるほど = “the more you eat”.',
        'The second half says how things change: 練習すればするほど 上手になります = “the more you practise, the better you get”.',
        'It works with い-adjectives too: 安ければ安いほど いい = “the cheaper, the better”.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['練習[れんしゅう]すれば', 'する', 'ほど', '上手[じょうず]', 'に', 'なります'], en: 'The more you practise, the better you get.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'より'] } },
      { tokens: ['考[かんが]えれば', '考[かんが]える', 'ほど', '難[むずか]しく', 'なります'], en: 'The more I think about it, the harder it gets.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'より'] } },
      { tokens: ['食[た]べれば', '食[た]べる', 'ほど', '太[ふと]ります'], en: 'The more you eat, the fatter you get.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'より'] } },
      { tokens: ['安[やす]ければ', '安[やす]い', 'ほど', 'いい', 'です'], en: 'The cheaper, the better.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'より'] } },
      { tokens: ['話[はな]せば', '話[はな]す', 'ほど', '好[す]き', 'に', 'なりました'], en: 'The more we talked, the more I liked her.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'より'] } },
      { tokens: ['早[はや]ければ', '早[はや]い', 'ほど', 'いい', 'です'], en: 'The sooner, the better.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'より'] } },
    ],
  },
  {
    title: '〜ために',
    explain: {
      title: 'ために: “in order to”, “for”, “because of”',
      body: [
        'Dictionary form + ために = “in order to”: 日本へ行くために 働いています = “I work so that I can go to Japan”.',
        'Noun + のために = “for (the sake of)”: 子供のために = “for my child”, 試験のために = “for the exam”.',
        'With an event that just happens, it means “because of”: 雪のために 電車が止まりました.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['日本[にほん]', 'へ', '行[い]く', 'ために', '毎日[まいにち]', '働[はたら]いて', 'います'], en: 'I work every day so that I can go to Japan.', bank: ['ように'], gap: { at: 3, wrong: ['ように', 'ほど'] } },
      { tokens: ['試験[しけん]', 'の', 'ために', '勉強[べんきょう]して', 'います'], en: 'I’m studying for the exam.', bank: ['ように'], gap: { at: 2, wrong: ['ように', 'ほど'] } },
      { tokens: ['子供[こども]', 'の', 'ために', '本[ほん]', 'を', '買[か]いました'], en: 'I bought a book for my child.', bank: ['ように'], gap: { at: 2, wrong: ['ように', 'ほど'] } },
      { tokens: ['雪[ゆき]', 'の', 'ために', '電車[でんしゃ]', 'が', '止[と]まりました'], en: 'The trains stopped because of the snow.', bank: ['ように'], gap: { at: 2, wrong: ['ように', 'ほど'] } },
      { tokens: ['病気[びょうき]', 'の', 'ために', '学校[がっこう]', 'を', '休[やす]みました'], en: 'I missed school because of illness.', bank: ['ように'], gap: { at: 2, wrong: ['ように', 'ほど'] } },
      { tokens: ['家族[かぞく]', 'の', 'ために', '料理[りょうり]', 'を', '作[つく]ります'], en: 'I cook for my family.', bank: ['ように'], gap: { at: 2, wrong: ['ように', 'ほど'] } },
    ],
  },
  {
    title: '〜について',
    explain: {
      title: 'について: “about”',
      body: [
        'Noun + について = “about, concerning”: 日本の文化について 勉強しています = “I’m studying Japanese culture”.',
        'It goes with verbs of talking, thinking and learning: 話す, 聞く, 書く, 調べる.',
        'Before a noun, add の: 歴史についての本 = “a book about history”.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['日本[にほん]', 'の', '文化[ぶんか]', 'について', '勉強[べんきょう]して', 'います'], en: 'I’m studying about Japanese culture.', bank: ['として'], gap: { at: 3, wrong: ['として', 'にとって'] } },
      { tokens: ['その', '問題[もんだい]', 'について', '話[はな]しましょう'], en: 'Let’s talk about that problem.', bank: ['として'], gap: { at: 2, wrong: ['として', 'にとって'] } },
      { tokens: ['家族[かぞく]', 'について', '作文[さくぶん]', 'を', '書[か]きました'], en: 'I wrote an essay about my family.', bank: ['として'], gap: { at: 1, wrong: ['として', 'にとって'] } },
      { tokens: ['旅行[りょこう]', 'について', '聞[き]きたい', 'です'], en: 'I want to ask about the trip.', bank: ['として'], gap: { at: 1, wrong: ['として', 'にとって'] } },
      { tokens: ['歴史[れきし]', 'について', 'の', '本[ほん]', 'を', '読[よ]みました'], en: 'I read a book about history.', bank: ['として'], gap: { at: 1, wrong: ['として', 'にとって'] } },
      { tokens: ['この', '町[まち]', 'について', '調[しら]べました'], en: 'I looked up information about this town.', bank: ['として'], gap: { at: 2, wrong: ['として', 'にとって'] } },
    ],
  },
  {
    title: '〜によると・〜によって',
    explain: {
      title: 'によると and によって',
      body: [
        'によると = “according to”, and the sentence usually ends with そうです (I hear): ニュースによると 事故があったそうです.',
        'によって = “depending on”: 国によって 文化が違います = “culture differs from country to country”.',
        'In a passive sentence, によって marks who did it: 昔の人によって 建てられました = “was built by people long ago”.',
      ],
      examples: [1, 4],
    },
    sentences: [
      { tokens: ['天気予報[てんきよほう]', 'によると', '明日[あした]', 'は', '雨[あめ]', 'です'], en: 'According to the forecast, it’ll rain tomorrow.', bank: ['について'], gap: { at: 1, wrong: ['によって', 'について'] } },
      { tokens: ['ニュース', 'によると', '事故[じこ]', 'が', 'あった', 'そう', 'です'], en: 'According to the news, there was an accident.', bank: ['について'], gap: { at: 1, wrong: ['によって', 'について'] } },
      { tokens: ['先生[せんせい]', 'によると', '試験[しけん]', 'は', '来週[らいしゅう]', 'だ', 'そう', 'です'], en: 'According to the teacher, the exam is next week.', bank: ['について'], gap: { at: 1, wrong: ['によって', 'について'] } },
      { tokens: ['人[ひと]', 'によって', '意見[いけん]', 'が', '違[ちが]います'], en: 'Opinions differ from person to person.', bank: ['について'], gap: { at: 1, wrong: ['によると', 'について'] } },
      { tokens: ['国[くに]', 'によって', '文化[ぶんか]', 'が', '違[ちが]います'], en: 'Culture differs from country to country.', bank: ['について'], gap: { at: 1, wrong: ['によると', 'について'] } },
      { tokens: ['この', '寺[てら]', 'は', '昔[むかし]', 'の', '人[ひと]', 'によって', '建[た]てられました'], en: 'This temple was built by people long ago.', bank: ['について'], gap: { at: 6, wrong: ['によると', 'について'] } },
    ],
  },
  {
    title: '〜として',
    explain: {
      title: 'として: “as”',
      body: [
        'Noun + として = “as (in the role of)”: 先生として 働いています = “I work as a teacher”.',
        'It names the role, purpose or kind something has: 趣味として = “as a hobby”, お土産として = “as a souvenir”.',
        'Compare にとって (next lesson): として is a role, にとって is a point of view.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['留学生[りゅうがくせい]', 'として', '日本[にほん]', 'に', '来[き]ました'], en: 'I came to Japan as an exchange student.', bank: ['について'], gap: { at: 1, wrong: ['について', 'にとって'] } },
      { tokens: ['趣味[しゅみ]', 'として', '写真[しゃしん]', 'を', '撮[と]って', 'います'], en: 'I take photos as a hobby.', bank: ['について'], gap: { at: 1, wrong: ['について', 'にとって'] } },
      { tokens: ['先生[せんせい]', 'として', '働[はたら]いて', 'います'], en: 'I work as a teacher.', bank: ['について'], gap: { at: 1, wrong: ['について', 'にとって'] } },
      { tokens: ['医者[いしゃ]', 'として', '病院[びょういん]', 'で', '働[はたら]いて', 'います'], en: 'She works as a doctor at a hospital.', bank: ['について'], gap: { at: 1, wrong: ['について', 'にとって'] } },
      { tokens: ['お土産[みやげ]', 'として', 'お菓子[かし]', 'を', '買[か]いました'], en: 'I bought sweets as a souvenir.', bank: ['について'], gap: { at: 1, wrong: ['について', 'にとって'] } },
      { tokens: ['友達[ともだち]', 'として', '好[す]き', 'です'], en: 'I like him as a friend.', bank: ['について'], gap: { at: 1, wrong: ['について', 'にとって'] } },
    ],
  },
  {
    title: '〜にとって',
    explain: {
      title: 'にとって: “for”, “to” (someone’s point of view)',
      body: [
        'Person + にとって = “for (from the point of view of)”: 私にとって 家族が一番大切です = “for me, family matters most”.',
        'The second half is a judgement: easy, difficult, important, special.',
        'It is not “for the benefit of” (that is のために): 子供のために 買う, but 子供にとって 難しい.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['私[わたし]', 'にとって', '家族[かぞく]', 'が', '一番[いちばん]', '大切[たいせつ]', 'です'], en: 'For me, family is the most important thing.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['子供[こども]', 'にとって', 'この', '本[ほん]', 'は', '難[むずか]しい', 'です'], en: 'This book is difficult for children.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['学生[がくせい]', 'にとって', '試験[しけん]', 'は', '大変[たいへん]', 'です'], en: 'Exams are hard on students.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['先生[せんせい]', 'にとって', 'この', '問題[もんだい]', 'は', '簡単[かんたん]', 'です'], en: 'For the teacher, this problem is easy.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['彼[かれ]', 'にとって', 'テニス', 'は', '特別[とくべつ]', 'な', 'スポーツ', 'です'], en: 'For him, tennis is a special sport.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['私[わたし]', 'にとって', '大切[たいせつ]', 'な', '日[ひ]', 'でした'], en: 'It was an important day for me.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
    ],
  },
  {
    title: '〜うちに',
    explain: {
      title: 'うちに: “while (it’s still)”, “before”',
      body: [
        'うちに means “while a state lasts”, so do it now: 熱いうちに 食べてください = “eat it while it’s hot”.',
        'With the ない form it means “before (it changes)”: 雨が降らないうちに 帰ります = “I’ll go home before it rains”.',
        'Use it for chances that will pass: 若いうちに, 日本にいるうちに.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['熱[あつ]い', 'うちに', '食[た]べて', 'ください'], en: 'Please eat it while it’s hot.', bank: ['まえに'], gap: { at: 1, wrong: ['まえに', 'あとで'] } },
      { tokens: ['若[わか]い', 'うちに', 'いろいろ', 'な', '国[くに]', 'へ', '行[い]きたい', 'です'], en: 'While I’m young, I want to go to many countries.', bank: ['まえに'], gap: { at: 1, wrong: ['まえに', 'あとで'] } },
      { tokens: ['明[あか]るい', 'うちに', '帰[かえ]りましょう'], en: 'Let’s go home while it’s still light.', bank: ['まえに'], gap: { at: 1, wrong: ['まえに', 'あとで'] } },
      { tokens: ['雨[あめ]', 'が', '降[ふ]らない', 'うちに', '帰[かえ]ります'], en: 'I’ll go home before it starts raining.', bank: ['まえに'], gap: { at: 3, wrong: ['まえに', 'あとで'] } },
      { tokens: ['忘[わす]れない', 'うちに', '書[か]いて', 'おきます'], en: 'I’ll write it down before I forget.', bank: ['まえに'], gap: { at: 1, wrong: ['まえに', 'あとで'] } },
      { tokens: ['日本[にほん]', 'に', 'いる', 'うちに', '着物[きもの]', 'を', '着[き]て', 'みたい', 'です'], en: 'While I’m in Japan, I want to try wearing a kimono.', bank: ['まえに'], gap: { at: 3, wrong: ['まえに', 'あとで'] } },
    ],
  },
  {
    title: '〜間・〜間に',
    explain: {
      title: '間 and 間に: “while”, “during”',
      body: [
        '間 (あいだ) = “the whole time”: 待っている間 本を読みました = “I read the whole time I was waiting”.',
        '間に = “at some point during”: 母が寝ている間に 掃除しました = “I cleaned while my mother was asleep”.',
        'Nouns take の: 夏休みの間, 留守の間に.',
      ],
      examples: [1, 2],
    },
    sentences: [
      { tokens: ['夏休[なつやす]み', 'の', '間[あいだ]', 'ずっと', '家[いえ]', 'に', 'いました'], en: 'I was at home the whole summer holiday.', bank: ['うちに'], gap: { at: 2, wrong: ['まえ', 'あと'] } },
      { tokens: ['母[はは]', 'が', '寝[ね]て', 'いる', '間[あいだ]', 'に', '掃除[そうじ]しました'], en: 'I cleaned while my mother was asleep.', bank: ['うちに'], gap: { at: 4, wrong: ['まえ', 'あと'] } },
      { tokens: ['電車[でんしゃ]', 'を', '待[ま]って', 'いる', '間[あいだ]', '本[ほん]', 'を', '読[よ]みました'], en: 'I read a book while I was waiting for the train.', bank: ['うちに'], gap: { at: 4, wrong: ['まえ', 'あと'] } },
      { tokens: ['留守[るす]', 'の', '間[あいだ]', 'に', '友達[ともだち]', 'が', '来[き]ました'], en: 'A friend came while I was out.', bank: ['うちに'], gap: { at: 2, wrong: ['まえ', 'あと'] } },
      { tokens: ['授業[じゅぎょう]', 'の', '間[あいだ]', '寝[ね]て', 'いました'], en: 'I slept all through the class.', bank: ['うちに'], gap: { at: 2, wrong: ['まえ', 'あと'] } },
      { tokens: ['休[やす]み', 'の', '間[あいだ]', 'に', '部屋[へや]', 'を', '片付[かたづ]けます'], en: 'I’ll tidy my room during the holidays.', bank: ['うちに'], gap: { at: 2, wrong: ['まえ', 'あと'] } },
    ],
  },
  {
    title: '〜まま',
    explain: {
      title: 'まま: “as it is”, “left (on, open)”',
      body: [
        'た form + まま = “with … left as it was”: 窓を開けたまま 寝ました = “I slept with the window open”.',
        'It often points at something that should have changed: 電気をつけたまま 出かけました.',
        'このまま = “as it is now”: このままでいいです = “it’s fine as it is”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['窓[まど]', 'を', '開[あ]けた', 'まま', '寝[ね]ました'], en: 'I slept with the window open.', bank: ['開[あ]ける'], gap: { at: 2, wrong: ['開[あ]ける', '開[あ]けて'] } },
      { tokens: ['電気[でんき]', 'を', 'つけた', 'まま', '出[で]かけました'], en: 'I went out with the light on.', bank: ['つける'], gap: { at: 2, wrong: ['つける', 'つけて'] } },
      { tokens: ['眼鏡[めがね]', 'を', 'かけた', 'まま', '寝[ね]て', 'しまいました'], en: 'I fell asleep with my glasses on.', bank: ['かける'], gap: { at: 2, wrong: ['かける', 'かけて'] } },
      { tokens: ['この', 'まま', 'で', 'いい', 'です'], en: 'It’s fine as it is.', bank: ['ほど'], gap: { at: 1, wrong: ['ほど', 'うち'] } },
      { tokens: ['テレビ', 'を', 'つけた', 'まま', '寝[ね]ないで', 'ください'], en: 'Please don’t fall asleep with the TV on.', bank: ['つける'], gap: { at: 2, wrong: ['つける', 'つけて'] } },
      { tokens: ['立[た]った', 'まま', '食[た]べないで', 'ください'], en: 'Please don’t eat standing up.', bank: ['立[た]つ'], gap: { at: 0, wrong: ['立[た]つ', '立[た]って'] } },
    ],
  },
  {
    title: '〜たびに',
    explain: {
      title: 'たびに: “every time”',
      body: [
        'Dictionary form + たびに = “every time”: この歌を聞くたびに 泣きます = “I cry every time I hear this song”.',
        'Nouns take の: 旅行のたびに = “every time I travel”.',
        'The second half is what always happens then.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['この', '歌[うた]', 'を', '聞[き]く', 'たびに', '泣[な]きます'], en: 'I cry every time I hear this song.', bank: ['うちに'], gap: { at: 4, wrong: ['うちに', 'ために'] } },
      { tokens: ['町[まち]', 'へ', '行[い]く', 'たびに', 'この', '店[みせ]', 'に', '寄[よ]ります'], en: 'Every time I go into town, I drop in at this shop.', bank: ['うちに'], gap: { at: 3, wrong: ['うちに', 'ために'] } },
      { tokens: ['彼[かれ]', 'は', '会[あ]う', 'たびに', '違[ちが]う', '服[ふく]', 'を', '着[き]て', 'います'], en: 'He’s wearing different clothes every time I meet him.', bank: ['うちに'], gap: { at: 3, wrong: ['うちに', 'ために'] } },
      { tokens: ['旅行[りょこう]', 'の', 'たびに', 'お土産[みやげ]', 'を', '買[か]います'], en: 'I buy souvenirs every time I travel.', bank: ['うちに'], gap: { at: 2, wrong: ['うちに', 'ために'] } },
      { tokens: ['祖母[そぼ]', 'は', '会[あ]う', 'たびに', 'お菓子[かし]', 'を', 'くれます'], en: 'Every time I see her, my grandmother gives me sweets.', bank: ['うちに'], gap: { at: 3, wrong: ['うちに', 'ために'] } },
      { tokens: ['雨[あめ]', 'が', '降[ふ]る', 'たびに', '道[みち]', 'が', '込[こ]みます'], en: 'Every time it rains, the roads get crowded.', bank: ['うちに'], gap: { at: 3, wrong: ['うちに', 'ために'] } },
    ],
  },
  {
    title: '〜てほしい',
    explain: {
      title: '〜てほしい: “I want (someone) to”',
      body: [
        'The て form + ほしい says what you want someone else to do: 手伝ってほしいです = “I want you to help me”.',
        'Mark the person with に: 子供に 野菜を食べてほしい = “I want my child to eat vegetables”.',
        'ないでほしい = “I don’t want (someone) to”: 誰にも言わないでほしいです.',
      ],
      examples: [1, 4],
    },
    sentences: [
      { tokens: ['母[はは]', 'に', '早[はや]く', '元気[げんき]', 'に', 'なって', 'ほしい', 'です'], en: 'I want my mother to get well soon.', bank: ['なった'], gap: { at: 5, wrong: ['なる', 'なった'] } },
      { tokens: ['友達[ともだち]', 'に', '手伝[てつだ]って', 'ほしい', 'です'], en: 'I want my friend to help me.', bank: ['手伝[てつだ]う'], gap: { at: 2, wrong: ['手伝[てつだ]う', '手伝[てつだ]った'] } },
      { tokens: ['もっと', 'ゆっくり', '話[はな]して', 'ほしい', 'です'], en: 'I’d like you to speak more slowly.', bank: ['話[はな]す'], gap: { at: 2, wrong: ['話[はな]す', '話[はな]した'] } },
      { tokens: ['子供[こども]', 'に', '野菜[やさい]', 'を', '食[た]べて', 'ほしい', 'です'], en: 'I want my child to eat vegetables.', bank: ['食[た]べる'], gap: { at: 4, wrong: ['食[た]べる', '食[た]べた'] } },
      { tokens: ['誰[だれ]', 'にも', '言[い]わないで', 'ほしい', 'です'], en: 'I don’t want you to tell anyone.', bank: ['言[い]う'], gap: { at: 2, wrong: ['言[い]う', '言[い]った'] } },
      { tokens: ['明日[あした]', 'は', '晴[は]れて', 'ほしい', 'です'], en: 'I hope it’s sunny tomorrow.', bank: ['晴[は]れる'], gap: { at: 2, wrong: ['晴[は]れる', '晴[は]れた'] } },
    ],
  },
  {
    title: '〜ように言う',
    explain: {
      title: '〜ように言う: telling and asking someone to do something',
      body: [
        'Dictionary form or ない form + ように + 言う / 頼む reports a request or an order: 静かにするように言いました = “told them to be quiet”.',
        'With the passive, someone told you: 医者に たばこをやめるように言われました = “the doctor told me to stop smoking”.',
        'It is softer and more indirect than quoting the order itself.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['先生[せんせい]', 'は', '学生[がくせい]', 'に', '静[しず]か', 'に', 'する', 'ように', '言[い]いました'], en: 'The teacher told the students to be quiet.', bank: ['ために'], gap: { at: 7, wrong: ['ために', 'ばかり'] } },
      { tokens: ['医者[いしゃ]', 'に', 'たばこ', 'を', 'やめる', 'ように', '言[い]われました'], en: 'The doctor told me to stop smoking.', bank: ['ために'], gap: { at: 5, wrong: ['ために', 'ばかり'] } },
      { tokens: ['母[はは]', 'に', '部屋[へや]', 'を', '掃除[そうじ]する', 'ように', '言[い]われました'], en: 'My mother told me to clean my room.', bank: ['ために'], gap: { at: 5, wrong: ['ために', 'ばかり'] } },
      { tokens: ['友達[ともだち]', 'に', '早[はや]く', '来[く]る', 'ように', '頼[たの]みました'], en: 'I asked my friend to come early.', bank: ['ために'], gap: { at: 4, wrong: ['ために', 'ばかり'] } },
      { tokens: ['部長[ぶちょう]', 'に', '遅[おく]れない', 'ように', '注意[ちゅうい]されました'], en: 'My manager warned me not to be late.', bank: ['ために'], gap: { at: 3, wrong: ['ために', 'ばかり'] } },
      { tokens: ['弟[おとうと]', 'に', '宿題[しゅくだい]', 'を', 'する', 'ように', '言[い]いました'], en: 'I told my younger brother to do his homework.', bank: ['ために'], gap: { at: 5, wrong: ['ために', 'ばかり'] } },
    ],
  },
  {
    title: '〜なさい',
    explain: {
      title: '〜なさい: firm instructions',
      body: [
        'The ます stem + なさい gives a firm instruction: 早く起きなさい = “get up!”.',
        'Parents say it to children and teachers use it in instructions: 次の文を読みなさい = “read the next sentence”.',
        'Don’t use it with people above you; ask with てください instead.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['早[はや]く', '起[お]きなさい'], en: 'Get up, quickly!', bank: ['起[お]きます'], gap: { at: 1, wrong: ['起[お]きます', '起[お]きた'] } },
      { tokens: ['野菜[やさい]', 'を', '食[た]べなさい'], en: 'Eat your vegetables.', bank: ['食[た]べます'], gap: { at: 2, wrong: ['食[た]べます', '食[た]べた'] } },
      { tokens: ['静[しず]か', 'に', 'しなさい'], en: 'Be quiet!', bank: ['します'], gap: { at: 2, wrong: ['します', 'した'] } },
      { tokens: ['宿題[しゅくだい]', 'を', '先[さき]', 'に', 'やりなさい'], en: 'Do your homework first.', bank: ['やります'], gap: { at: 4, wrong: ['やります', 'やった'] } },
      { tokens: ['次[つぎ]', 'の', '文[ぶん]', 'を', '読[よ]みなさい'], en: 'Read the next sentence.', bank: ['読[よ]みます'], gap: { at: 4, wrong: ['読[よ]みます', '読[よ]んだ'] } },
      { tokens: ['もう', '寝[ね]なさい'], en: 'Go to bed now.', bank: ['寝[ね]ます'], gap: { at: 1, wrong: ['寝[ね]ます', '寝[ね]た'] } },
    ],
  },
  {
    title: '〜ことがある',
    explain: {
      title: '〜ことがある: “sometimes”',
      body: [
        'Dictionary form or ない form + ことがある = “there are times when”: 電車が遅れることがあります = “the trains are sometimes late”.',
        'Don’t mix it up with the た form + ことがある (N4), which is about experience: 行ったことがあります = “I have been”.',
        'The ない form gives “sometimes don’t”: 朝ご飯を食べないことがあります.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['朝[あさ]ご飯[はん]', 'を', '食[た]べない', 'こと', 'が', 'あります'], en: 'Sometimes I don’t eat breakfast.', bank: ['食[た]べなかった'], gap: { at: 2, wrong: ['食[た]べなかった', '食[た]べて'] } },
      { tokens: ['電車[でんしゃ]', 'が', '遅[おく]れる', 'こと', 'が', 'あります'], en: 'Sometimes the trains are late.', bank: ['遅[おく]れた'], gap: { at: 2, wrong: ['遅[おく]れた', '遅[おく]れて'] } },
      { tokens: ['週末[しゅうまつ]', 'は', '家[いえ]', 'で', '料理[りょうり]する', 'こと', 'が', 'あります'], en: 'At weekends I sometimes cook at home.', bank: ['料理[りょうり]した'], gap: { at: 4, wrong: ['料理[りょうり]した', '料理[りょうり]して'] } },
      { tokens: ['夜[よる]', '遅[おそ]く', 'まで', '働[はたら]く', 'こと', 'が', 'あります'], en: 'Sometimes I work until late at night.', bank: ['働[はたら]いた'], gap: { at: 3, wrong: ['働[はたら]いた', '働[はたら]いて'] } },
      { tokens: ['彼[かれ]', 'は', '約束[やくそく]', 'を', '忘[わす]れる', 'こと', 'が', 'あります'], en: 'He sometimes forgets his promises.', bank: ['忘[わす]れた'], gap: { at: 4, wrong: ['忘[わす]れた', '忘[わす]れて'] } },
      { tokens: ['この', '道[みち]', 'は', '込[こ]む', 'こと', 'が', 'あります'], en: 'This road sometimes gets crowded.', bank: ['込[こ]んだ'], gap: { at: 3, wrong: ['込[こ]んだ', '込[こ]んで'] } },
    ],
  },
  {
    title: '〜ことにしている・〜ことになっている',
    explain: {
      title: 'ことにしている and ことになっている: rules',
      body: [
        'ことにしている = a rule you set yourself: 毎晩 日記を書くことにしています = “I make it a rule to keep a diary”.',
        'ことになっている = a rule or plan set by others: 会議は三時に始まることになっています = “the meeting is due to start at three”.',
        'They are the lasting versions of ことにする (I decide) and ことになる (it is decided) from N4.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['毎晩[まいばん]', '日記[にっき]', 'を', '書[か]く', 'こと', 'に', 'して', 'います'], en: 'I make it a rule to write in my diary every night.', bank: ['なって'], gap: { at: 6, wrong: ['なって', 'あって'] } },
      { tokens: ['夜[よる]', 'は', 'コーヒー', 'を', '飲[の]まない', 'こと', 'に', 'して', 'います'], en: 'I make it a rule not to drink coffee at night.', bank: ['なって'], gap: { at: 7, wrong: ['なって', 'あって'] } },
      { tokens: ['毎週[まいしゅう]', '両親[りょうしん]', 'に', '電話[でんわ]する', 'こと', 'に', 'して', 'います'], en: 'I make a point of calling my parents every week.', bank: ['なって'], gap: { at: 6, wrong: ['なって', 'あって'] } },
      { tokens: ['会議[かいぎ]', 'は', '三時[さんじ]', 'に', '始[はじ]まる', 'こと', 'に', 'なって', 'います'], en: 'The meeting is due to start at three.', bank: ['して'], gap: { at: 7, wrong: ['して', 'あって'] } },
      { tokens: ['この', '部屋[へや]', 'では', 'たばこ', 'を', '吸[す]わない', 'こと', 'に', 'なって', 'います'], en: 'You’re not supposed to smoke in this room.', bank: ['して'], gap: { at: 8, wrong: ['して', 'あって'] } },
      { tokens: ['来月[らいげつ]', '引[ひ]っ越[こ]す', 'こと', 'に', 'なって', 'います'], en: 'I’m due to move house next month.', bank: ['して'], gap: { at: 4, wrong: ['して', 'あって'] } },
    ],
  },
  {
    title: '〜べき',
    explain: {
      title: 'べき: “should”',
      body: [
        'Dictionary form + べきです = “should, ought to”: 約束は守るべきです = “you should keep your promises”.',
        'べきではありません = “shouldn’t”, and べきでした = “should have”.',
        'It sounds like a moral rule; for friendly advice, たほうがいい is softer.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['約束[やくそく]', 'は', '守[まも]る', 'べき', 'です'], en: 'You should keep your promises.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['もっと', '早[はや]く', '言[い]う', 'べき', 'でした'], en: 'I should have said so sooner.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['学生[がくせい]', 'は', '勉強[べんきょう]する', 'べき', 'です'], en: 'Students ought to study.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['困[こま]って', 'いる', '人[ひと]', 'を', '助[たす]ける', 'べき', 'です'], en: 'We should help people who are in trouble.', bank: ['ばかり'], gap: { at: 5, wrong: ['ばかり', 'まま'] } },
      { tokens: ['そんな', 'こと', 'を', '言[い]う', 'べき', 'では', 'ありません'], en: 'You shouldn’t say things like that.', bank: ['ばかり'], gap: { at: 4, wrong: ['ばかり', 'まま'] } },
      { tokens: ['医者[いしゃ]', 'に', '行[い]く', 'べき', 'です', 'よ'], en: 'You really should go to the doctor.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
    ],
  },
  {
    title: '〜代わりに',
    explain: {
      title: '代わりに: “instead of”, “in return for”',
      body: [
        'Noun + の代わりに = “instead of”: パンの代わりに ご飯を食べました = “I had rice instead of bread”.',
        'Dictionary form + 代わりに works with actions: 映画を見る代わりに 本を読みました.',
        'It can also mean “in return”: 料理を作ってもらう代わりに 皿を洗います.',
      ],
      examples: [1, 2],
    },
    sentences: [
      { tokens: ['父[ちち]', 'の', '代[か]わりに', '私[わたし]', 'が', '行[い]きます'], en: 'I’ll go instead of my father.', bank: ['ために'], gap: { at: 2, wrong: ['ために', 'うちに'] } },
      { tokens: ['パン', 'の', '代[か]わりに', 'ご飯[はん]', 'を', '食[た]べました'], en: 'I had rice instead of bread.', bank: ['ために'], gap: { at: 2, wrong: ['ために', 'うちに'] } },
      { tokens: ['映画[えいが]', 'を', '見[み]る', '代[か]わりに', '本[ほん]', 'を', '読[よ]みました'], en: 'Instead of watching a film, I read a book.', bank: ['ために'], gap: { at: 3, wrong: ['ために', 'うちに'] } },
      { tokens: ['車[くるま]', 'の', '代[か]わりに', '自転車[じてんしゃ]', 'を', '使[つか]います'], en: 'I use a bicycle instead of a car.', bank: ['ために'], gap: { at: 2, wrong: ['ために', 'うちに'] } },
      { tokens: ['料理[りょうり]', 'を', '作[つく]って', 'もらう', '代[か]わりに', '皿[さら]', 'を', '洗[あら]います'], en: 'In return for having dinner cooked, I wash the dishes.', bank: ['ために'], gap: { at: 4, wrong: ['ために', 'うちに'] } },
      { tokens: ['電話[でんわ]', 'の', '代[か]わりに', '手紙[てがみ]', 'を', '送[おく]りました'], en: 'Instead of calling, I sent a letter.', bank: ['ために'], gap: { at: 2, wrong: ['ために', 'うちに'] } },
    ],
  },
  {
    title: '〜おかげで・〜せいで',
    explain: {
      title: 'おかげで and せいで: thanks to, because of',
      body: [
        'おかげで = “thanks to” (a good result): 薬のおかげで よくなりました = “thanks to the medicine, I got better”.',
        'せいで = “because of” (a bad result, someone or something to blame): 雨のせいで 試合が中止になりました.',
        'Nouns take の, verbs come in the plain form: 寝坊したせいで 遅れました.',
      ],
      examples: [4, 1],
    },
    sentences: [
      { tokens: ['先生[せんせい]', 'の', 'おかげで', '試験[しけん]', 'に', '合格[ごうかく]しました'], en: 'Thanks to my teacher, I passed the exam.', bank: ['ために'], gap: { at: 2, wrong: ['せいで', 'ために'] } },
      { tokens: ['雨[あめ]', 'の', 'せいで', '試合[しあい]', 'が', '中止[ちゅうし]', 'に', 'なりました'], en: 'The match was cancelled because of the rain.', bank: ['ために'], gap: { at: 2, wrong: ['おかげで', 'ために'] } },
      { tokens: ['友達[ともだち]', 'の', 'おかげで', '楽[たの]しい', '旅行[りょこう]', 'に', 'なりました'], en: 'Thanks to my friends, it was a fun trip.', bank: ['ために'], gap: { at: 2, wrong: ['せいで', 'ために'] } },
      { tokens: ['寝坊[ねぼう]した', 'せいで', '遅[おく]れました'], en: 'I was late because I overslept.', bank: ['ために'], gap: { at: 1, wrong: ['おかげで', 'ために'] } },
      { tokens: ['薬[くすり]', 'の', 'おかげで', 'よく', 'なりました'], en: 'Thanks to the medicine, I got better.', bank: ['ために'], gap: { at: 2, wrong: ['せいで', 'ために'] } },
      { tokens: ['風邪[かぜ]', 'の', 'せいで', '声[こえ]', 'が', '出[で]ません'], en: 'I’ve lost my voice because of a cold.', bank: ['ために'], gap: { at: 2, wrong: ['おかげで', 'ために'] } },
    ],
  },
  {
    title: '〜という',
    explain: {
      title: 'という: “called”, “that”',
      body: [
        'A name + という + noun = “a … called”: すしという料理 = “a dish called sushi”.',
        'Ask what something is called with 何という: これは何という花ですか.',
        'A whole sentence + という + noun gives its content: 雪が降るというニュース = “news that it will snow”.',
      ],
      examples: [1, 4],
    },
    sentences: [
      { tokens: ['すし', 'という', '日本[にほん]', 'の', '料理[りょうり]', 'を', '知[し]って', 'います', 'か'], en: 'Do you know the Japanese dish called sushi?', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['これ', 'は', '何[なん]', 'という', '花[はな]', 'です', 'か'], en: 'What is this flower called?', bank: ['として'], gap: { at: 3, wrong: ['として', 'について'] } },
      { tokens: ['ありがとう', 'という', '言葉[ことば]', 'が', '好[す]き', 'です'], en: 'I like the word “arigatou”.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
      { tokens: ['彼[かれ]', 'が', '結婚[けっこん]した', 'という', '話[はなし]', 'を', '聞[き]きました'], en: 'I heard that he had got married.', bank: ['として'], gap: { at: 3, wrong: ['として', 'について'] } },
      { tokens: ['明日[あした]', '雪[ゆき]', 'が', '降[ふ]る', 'という', 'ニュース', 'を', '見[み]ました'], en: 'I saw news that it will snow tomorrow.', bank: ['として'], gap: { at: 4, wrong: ['として', 'について'] } },
      { tokens: ['漢字[かんじ]', 'という', 'の', 'は', '意味[いみ]', 'の', 'ある', '字[じ]', 'です'], en: 'Kanji are characters that carry meaning.', bank: ['として'], gap: { at: 1, wrong: ['として', 'について'] } },
    ],
  },
  {
    title: '〜とか〜とか',
    explain: {
      title: 'とか: “things like”',
      body: [
        'とか lists examples, like や, but sounds more casual: お茶とか コーヒーとか = “things like tea and coffee”.',
        'It works with verbs too: 音楽を聞くとか して 休みます = “I rest by listening to music or something”.',
        'The list is not complete; there are other things too.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['お茶[ちゃ]', 'とか', 'コーヒー', 'とか', '飲[の]み物[もの]', 'が', '好[す]き', 'です'], en: 'I like drinks, things like tea and coffee.', bank: ['まで'], gap: { at: 1, wrong: ['まで', 'から'] } },
      { tokens: ['週末[しゅうまつ]', 'は', '掃除[そうじ]', 'とか', '洗濯[せんたく]', 'とか', 'を', 'します'], en: 'At the weekend I do things like cleaning and laundry.', bank: ['まで'], gap: { at: 3, wrong: ['まで', 'から'] } },
      { tokens: ['駅[えき]', 'の', '近[ちか]く', 'に', '銀行[ぎんこう]', 'とか', '郵便局[ゆうびんきょく]', 'とか', 'が', 'あります'], en: 'Near the station there are places like a bank and a post office.', bank: ['まで'], gap: { at: 5, wrong: ['まで', 'から'] } },
      { tokens: ['野菜[やさい]', 'とか', '魚[さかな]', 'とか', 'を', '食[た]べた', 'ほう', 'が', 'いい', 'です'], en: 'You’d better eat things like vegetables and fish.', bank: ['まで'], gap: { at: 1, wrong: ['まで', 'から'] } },
      { tokens: ['漫画[まんが]', 'とか', 'ゲーム', 'とか', 'が', '好[す]き', 'です'], en: 'I like things like manga and games.', bank: ['まで'], gap: { at: 1, wrong: ['まで', 'から'] } },
      { tokens: ['疲[つか]れた', 'とき', 'は', '音楽[おんがく]', 'を', '聞[き]く', 'とか', 'して', '休[やす]みます'], en: 'When I’m tired, I rest by listening to music or something.', bank: ['まで'], gap: { at: 6, wrong: ['まで', 'から'] } },
    ],
  },
  {
    title: '〜ほど・〜くらい',
    explain: {
      title: 'ほど and くらい: degree and “about”',
      body: [
        'A ほど B ない = “B is not as … as A”: 今日は昨日ほど寒くありません = “today isn’t as cold as yesterday”.',
        'ほど or くらい after a verb shows how strong a feeling is: 泣きたいほど 嬉しかった = “I was so happy I could cry”.',
        'After a number, くらい (or ぐらい) means “about”: 五分くらい = “about five minutes”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['今日[きょう]', 'は', '昨日[きのう]', 'ほど', '寒[さむ]く', 'ありません'], en: 'Today isn’t as cold as yesterday.', bank: ['まで'], gap: { at: 3, wrong: ['より', 'まで'] } },
      { tokens: ['死[し]ぬ', 'ほど', '疲[つか]れました'], en: 'I’m dead tired.', bank: ['まで'], gap: { at: 1, wrong: ['より', 'まで'] } },
      { tokens: ['泣[な]きたい', 'ほど', '嬉[うれ]しかった', 'です'], en: 'I was so happy I could have cried.', bank: ['まで'], gap: { at: 1, wrong: ['より', 'まで'] } },
      { tokens: ['駅[えき]', 'まで', '五分[ごふん]', 'くらい', 'かかります'], en: 'It takes about five minutes to the station.', bank: ['より'], gap: { at: 3, wrong: ['より', 'ほど'] } },
      { tokens: ['兄[あに]', 'は', '私[わたし]', 'ほど', '背[せ]', 'が', '高[たか]く', 'ありません'], en: 'My older brother isn’t as tall as me.', bank: ['まで'], gap: { at: 3, wrong: ['より', 'まで'] } },
      { tokens: ['歩[ある]けない', 'くらい', '足[あし]', 'が', '痛[いた]い', 'です'], en: 'My legs hurt so much I can’t walk.', bank: ['まで'], gap: { at: 1, wrong: ['より', 'まで'] } },
    ],
  },
  {
    title: '〜だけでなく',
    explain: {
      title: 'だけでなく〜も: “not only … but also”',
      body: [
        'A だけでなく B も = “not only A but also B”: 英語だけでなく 日本語も 話せます.',
        'It works after nouns, adjectives and verbs: 安いだけでなく おいしい, 読むだけでなく 書く.',
        'In speech you will also hear だけじゃなくて, which means the same.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['彼[かれ]', 'は', '英語[えいご]', 'だけでなく', '日本語[にほんご]', 'も', '話[はな]せます'], en: 'He can speak not only English but Japanese too.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まで'] } },
      { tokens: ['この', '店[みせ]', 'は', '安[やす]い', 'だけでなく', 'おいしい', 'です'], en: 'This place isn’t just cheap, it’s tasty too.', bank: ['ばかり'], gap: { at: 4, wrong: ['ばかり', 'まで'] } },
      { tokens: ['子供[こども]', 'だけでなく', '大人[おとな]', 'も', '楽[たの]しみます'], en: 'Not only children but adults enjoy it too.', bank: ['ばかり'], gap: { at: 1, wrong: ['ばかり', 'まで'] } },
      { tokens: ['雨[あめ]', 'だけでなく', '風[かぜ]', 'も', '強[つよ]い', 'です'], en: 'It’s not only raining, the wind is strong too.', bank: ['ばかり'], gap: { at: 1, wrong: ['ばかり', 'まで'] } },
      { tokens: ['彼女[かのじょ]', 'は', '料理[りょうり]', 'だけでなく', '掃除[そうじ]', 'も', '上手[じょうず]', 'です'], en: 'She’s good not only at cooking but at cleaning too.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まで'] } },
      { tokens: ['漢字[かんじ]', 'を', '読[よ]む', 'だけでなく', '書[か]く', '練習[れんしゅう]', 'も', 'します'], en: 'I practise not only reading kanji but writing them too.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まで'] } },
    ],
  },
  {
    title: '〜ずに',
    explain: {
      title: '〜ずに: “without doing”',
      body: [
        'The ない stem + ずに = “without doing”: 食べずに 行きました = “went without eating”. It means the same as ないで but sounds a little more written.',
        'Make it from the ない form: 食べない → 食べずに, 持たない → 持たずに, 言わない → 言わずに.',
        'する is the exception: せずに (勉強せずに).',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['朝[あさ]ご飯[はん]', 'を', '食[た]べずに', '学校[がっこう]', 'へ', '行[い]きました'], en: 'I went to school without eating breakfast.', bank: ['食[た]べて'], gap: { at: 2, wrong: ['食[た]べて', '食[た]べない'] } },
      { tokens: ['傘[かさ]', 'を', '持[も]たずに', '出[で]かけました'], en: 'I went out without an umbrella.', bank: ['持[も]って'], gap: { at: 2, wrong: ['持[も]って', '持[も]たない'] } },
      { tokens: ['辞書[じしょ]', 'を', '使[つか]わずに', '新聞[しんぶん]', 'を', '読[よ]みました'], en: 'I read the newspaper without using a dictionary.', bank: ['使[つか]って'], gap: { at: 2, wrong: ['使[つか]って', '使[つか]わない'] } },
      { tokens: ['何[なに]', 'も', '言[い]わずに', '帰[かえ]りました'], en: 'He went home without saying anything.', bank: ['言[い]って'], gap: { at: 2, wrong: ['言[い]って', '言[い]わない'] } },
      { tokens: ['勉強[べんきょう]せずに', '試験[しけん]', 'を', '受[う]けました'], en: 'I took the exam without studying.', bank: ['勉強[べんきょう]して'], gap: { at: 0, wrong: ['勉強[べんきょう]して', '勉強[べんきょう]しない'] } },
      { tokens: ['寝[ね]ずに', '朝[あさ]', 'まで', '働[はたら]きました'], en: 'I worked until morning without sleeping.', bank: ['寝[ね]て'], gap: { at: 0, wrong: ['寝[ね]て', '寝[ね]ない'] } },
    ],
  },
  {
    title: '〜わけ',
    explain: {
      title: 'わけ: “no wonder”, “it’s not that”',
      body: [
        'わけです = “so that’s why, no wonder”: 毎日練習しているから 上手なわけです.',
        'わけではありません = “it’s not (necessarily) that”: 嫌いなわけではありません = “it’s not that I dislike it”.',
        'わけ on its own is “the reason”: 彼が怒ったわけが わかりません = “I don’t understand why he got angry”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['毎日[まいにち]', '練習[れんしゅう]して', 'いる', 'から', '上手[じょうず]', 'な', 'わけ', 'です'], en: 'He practises every day, so no wonder he’s good.', bank: ['はず'], gap: { at: 6, wrong: ['ばかり', 'まま'] } },
      { tokens: ['高[たか]い', '物[もの]', 'が', '全部[ぜんぶ]', 'いい', 'わけ', 'では', 'ありません'], en: 'Expensive things aren’t necessarily all good.', bank: ['はず'], gap: { at: 5, wrong: ['ばかり', 'まま'] } },
      { tokens: ['嫌[きら]い', 'な', 'わけ', 'では', 'ありません'], en: 'It’s not that I dislike it.', bank: ['はず'], gap: { at: 2, wrong: ['ばかり', 'まま'] } },
      { tokens: ['窓[まど]', 'が', '開[あ]いて', 'いた', 'から', '寒[さむ]い', 'わけ', 'です'], en: 'The window was open, so no wonder it’s cold.', bank: ['はず'], gap: { at: 6, wrong: ['ばかり', 'まま'] } },
      { tokens: ['肉[にく]', 'が', '食[た]べられない', 'わけ', 'では', 'ありません'], en: 'It’s not that I can’t eat meat.', bank: ['はず'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['彼[かれ]', 'が', '怒[おこ]った', 'わけ', 'が', 'わかりません'], en: 'I don’t understand why he got angry.', bank: ['はず'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
    ],
  },
  {
    title: '〜はずがない',
    explain: {
      title: 'はずがない: “there’s no way”',
      body: [
        'Plain form + はずがありません (casual: はずがない) = “there’s no way that”, “it can’t be”.',
        'It is the strong negative of はずです (N4, “should be”): 来るはずです / 来るはずがありません.',
        'The speaker is sure from what they know: 買ったばかりだから 壊れるはずがありません.',
      ],
      examples: [0, 5],
    },
    sentences: [
      { tokens: ['彼[かれ]', 'が', 'そんな', 'こと', 'を', '言[い]う', 'はず', 'が', 'ありません'], en: 'There’s no way he would say something like that.', bank: ['ばかり'], gap: { at: 6, wrong: ['ばかり', 'まま'] } },
      { tokens: ['鍵[かぎ]', 'を', 'かけた', 'から', '開[あ]いて', 'いる', 'はず', 'が', 'ありません'], en: 'I locked it, so it can’t be open.', bank: ['ばかり'], gap: { at: 6, wrong: ['ばかり', 'まま'] } },
      { tokens: ['こんな', '難[むずか]しい', '問題[もんだい]', 'が', 'わかる', 'はず', 'が', 'ありません'], en: 'There’s no way I can understand such a hard problem.', bank: ['ばかり'], gap: { at: 5, wrong: ['ばかり', 'まま'] } },
      { tokens: ['彼女[かのじょ]', 'が', '遅[おく]れる', 'はず', 'が', 'ありません'], en: 'She can’t possibly be late.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['子供[こども]', 'に', 'できる', 'はず', 'が', 'ありません'], en: 'A child can’t possibly do it.', bank: ['ばかり'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['昨日[きのう]', '買[か]った', 'ばかり', 'だ', 'から', '壊[こわ]れる', 'はず', 'が', 'ありません'], en: 'I only bought it yesterday, so it can’t be broken.', bank: ['まま'], gap: { at: 6, wrong: ['まま', 'うち'] } },
    ],
  },
  {
    title: '〜させられる',
    explain: {
      title: 'Causative-passive: “be made to”',
      body: [
        'The causative (させる, make someone do) plus the passive (られる) = “be made to do”: 食べさせられました = “I was made to eat”.',
        'The person who made you takes に: 母に 野菜を食べさせられました.',
        'For う-verbs the short form is common: 書かせられる → 書かされる, 待たせられる → 待たされる.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['母[はは]', 'に', '野菜[やさい]', 'を', '食[た]べさせられました'], en: 'I was made to eat vegetables by my mother.', bank: ['食[た]べさせました'], gap: { at: 4, wrong: ['食[た]べさせました', '食[た]べられました'] } },
      { tokens: ['先生[せんせい]', 'に', '作文[さくぶん]', 'を', '書[か]かされました'], en: 'The teacher made me write an essay.', bank: ['書[か]かせました'], gap: { at: 4, wrong: ['書[か]かせました', '書[か]かれました'] } },
      { tokens: ['駅[えき]', 'で', '友達[ともだち]', 'に', '待[ま]たされました'], en: 'My friend kept me waiting at the station.', bank: ['待[ま]たせました'], gap: { at: 4, wrong: ['待[ま]たせました', '待[ま]たれました'] } },
      { tokens: ['部長[ぶちょう]', 'に', 'お酒[さけ]', 'を', '飲[の]まされました'], en: 'My manager made me drink alcohol.', bank: ['飲[の]ませました'], gap: { at: 4, wrong: ['飲[の]ませました', '飲[の]まれました'] } },
      { tokens: ['父[ちち]', 'に', '車[くるま]', 'を', '洗[あら]わされました'], en: 'My father made me wash the car.', bank: ['洗[あら]わせました'], gap: { at: 4, wrong: ['洗[あら]わせました', '洗[あら]われました'] } },
      { tokens: ['毎日[まいにち]', 'ピアノ', 'を', '練習[れんしゅう]させられました'], en: 'I was made to practise the piano every day.', bank: ['練習[れんしゅう]させました'], gap: { at: 3, wrong: ['練習[れんしゅう]させました', '練習[れんしゅう]されました'] } },
    ],
  },
]
