// N5 grammar: 24 lessons of six sentences, written for this app. Chunks carry furigana as 漢字[かんじ]; every word is a
// course word taught before the lesson (course.ts places each lesson after its words; tests check it). A `gap` names
// the chunk the fill-the-gap question blanks when it is not the first particle; the English hint tells the forms apart.
// Tests check words, spelling and structure; they can't judge the explanations, so skim those.
import type { GrammarLessonSpec } from './grammar'

export const N5_GRAMMAR: GrammarLessonSpec[] = [
  {
    title: 'これ・それ・あれ',
    explain: {
      title: 'これ / それ / あれ and この / その / あの',
      body: [
        'これ is “this (near me)”, それ is “that (near you)”, あれ is “that (over there)”. They stand alone: これは 本です。 = “This is a book.”',
        'この, その, あの mean the same but always come before a noun: この 車 = “this car”.',
        'To ask “which?”, use どれ (alone) or どの + noun.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['これ', 'は', '本[ほん]', 'です'], en: 'This is a book.', bank: ['この'], gap: { at: 0, wrong: ['この', 'どの'] } },
      { tokens: ['それ', 'は', '傘[かさ]', 'です', 'か'], en: 'Is that an umbrella?', bank: ['その'], gap: { at: 0, wrong: ['その', 'どの'] } },
      { tokens: ['あれ', 'は', '学校[がっこう]', 'です'], en: 'That over there is a school.', bank: ['あの'], gap: { at: 0, wrong: ['あの', 'どの'] } },
      { tokens: ['この', '車[くるま]', 'は', '高[たか]い', 'です'], en: 'This car is expensive.', bank: ['これ'], gap: { at: 0, wrong: ['これ', 'どれ'] } },
      { tokens: ['その', '時計[とけい]', 'は', '新[あたら]しい', 'です'], en: 'That watch is new.', bank: ['それ'], gap: { at: 0, wrong: ['それ', 'どれ'] } },
      { tokens: ['あの', '人[ひと]', 'は', '先生[せんせい]', 'です'], en: 'That person over there is a teacher.', bank: ['あれ'], gap: { at: 0, wrong: ['あれ', 'どれ'] } },
    ],
  },
  {
    title: 'ここ・そこ・あそこ, あります・います',
    explain: {
      title: 'Places, and “there is”',
      body: [
        'ここ is “here”, そこ is “there (near you)”, あそこ is “over there”. どこ asks “where?”.',
        'To say something is somewhere: place に thing が あります。 あります is for things; います is for people and animals.',
        '机の 上に 本が あります。 = “There is a book on the desk.” 部屋に 猫が います。 = “There is a cat in the room.”',
      ],
      examples: [2, 3],
    },
    sentences: [
      { tokens: ['ここ', 'は', '駅[えき]', 'です'], en: 'This place is the station.', bank: ['この'], gap: { at: 0, wrong: ['この', 'どの'] } },
      { tokens: ['トイレ', 'は', 'あそこ', 'です'], en: 'The toilet is over there.', bank: ['あの'], gap: { at: 2, wrong: ['あの', 'どの'] } },
      { tokens: ['机[つくえ]', 'の', '上[うえ]', 'に', '本[ほん]', 'が', 'あります'], en: 'There is a book on the desk.', bank: ['います'], gap: { at: 6, wrong: ['います'] } },
      { tokens: ['部屋[へや]', 'に', '猫[ねこ]', 'が', 'います'], en: 'There is a cat in the room.', bank: ['あります'], gap: { at: 4, wrong: ['あります'] } },
      { tokens: ['公園[こうえん]', 'に', '子供[こども]', 'が', 'います'], en: 'There are children in the park.', bank: ['を'], gap: { at: 3, wrong: ['を', 'の'] } },
      { tokens: ['銀行[ぎんこう]', 'は', 'どこ', 'です', 'か'], en: 'Where is the bank?', bank: ['どの'], gap: { at: 2, wrong: ['どの'] } },
    ],
  },
  {
    title: 'じゃありません・でした',
    explain: {
      title: 'Nouns: “is not”, “was”, “was not”',
      body: [
        'です has a negative and a past, like a verb: です (is), じゃありません (is not), でした (was), じゃありませんでした (was not).',
        'じゃ is the everyday form of では; you will see ではありません in writing too.',
        'Words for time like 昨日 (yesterday) usually take は when they are the topic: 昨日は 日曜日でした。',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['わたし', 'は', '先生[せんせい]', 'じゃありません'], en: 'I am not a teacher.', bank: ['でした'], gap: { at: 3, wrong: ['です', 'でした'] } },
      { tokens: ['これ', 'は', 'わたし', 'の', '傘[かさ]', 'じゃありません'], en: 'This is not my umbrella.', bank: ['を'], gap: { at: 5, wrong: ['です', 'でした'] } },
      { tokens: ['昨日[きのう]', 'は', '日曜日[にちようび]', 'でした'], en: 'Yesterday was Sunday.', bank: ['を'], gap: { at: 3, wrong: ['です', 'じゃありません'] } },
      { tokens: ['昨日[きのう]', 'は', '雨[あめ]', 'でした'], en: 'It rained yesterday.', bank: ['です'], gap: { at: 3, wrong: ['です', 'じゃありません'] } },
      { tokens: ['先週[せんしゅう]', 'は', '休[やす]み', 'じゃありませんでした'], en: 'Last week was not a holiday.', bank: ['でした'], gap: { at: 3, wrong: ['でした', 'じゃありません'] } },
      { tokens: ['あの', '人[ひと]', 'は', '学生[がくせい]', 'でした', 'か'], en: 'Was that person a student?', bank: ['その'], gap: { at: 4, wrong: ['です', 'じゃありません'] } },
    ],
  },
  {
    title: 'ます・ません・ました',
    explain: {
      title: 'Verbs: present, negative, past',
      body: [
        'Polite verbs end in ます. Change the ending: 飲みます (drink, will drink), 飲みません (don’t drink), 飲みました (drank), 飲みませんでした (didn’t drink).',
        'The ます form covers both the present and the future: 明日 行きます = “I will go tomorrow”.',
        'The object of the verb takes を: コーヒーを 飲みます。',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['毎朝[まいあさ]', 'コーヒー', 'を', '飲[の]みます'], en: 'I drink coffee every morning.', bank: ['が'], gap: { at: 3, wrong: ['飲[の]みました', '飲[の]みません'] } },
      { tokens: ['わたし', 'は', 'お酒[さけ]', 'を', '飲[の]みません'], en: 'I don’t drink alcohol.', bank: ['飲[の]みます'], gap: { at: 4, wrong: ['飲[の]みます', '飲[の]みました'] } },
      { tokens: ['昨日[きのう]', '映画[えいが]', 'を', '見[み]ました'], en: 'I watched a film yesterday.', bank: ['見[み]ます'], gap: { at: 3, wrong: ['見[み]ます', '見[み]ません'] } },
      { tokens: ['今朝[けさ]', '朝[あさ]ご飯[はん]', 'を', '食[た]べませんでした'], en: 'I didn’t eat breakfast this morning.', bank: ['食[た]べました'], gap: { at: 3, wrong: ['食[た]べました', '食[た]べません'] } },
      { tokens: ['日曜日[にちようび]', 'に', '何[なに]', 'を', 'します', 'か'], en: 'What do you do on Sundays?', bank: ['が'], gap: { at: 1, wrong: ['を', 'で'] } },
      { tokens: ['友達[ともだち]', 'と', '話[はな]しました'], en: 'I talked with a friend.', bank: ['を'], gap: { at: 2, wrong: ['話[はな]します', '話[はな]しません'] } },
    ],
  },
  {
    title: 'い-adjectives: くない・かった',
    explain: {
      title: 'い-adjectives: “not”, “was”, “was not”',
      body: [
        'An い-adjective changes its own ending; です stays the same: 寒いです (is cold), 寒くないです (is not cold), 寒かったです (was cold), 寒くなかったです (was not cold).',
        'いい (good) is irregular: よくないです, よかったです, よくなかったです.',
        'Never put でした after an い-adjective: say 寒かったです, not 寒いでした.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['この', '部屋[へや]', 'は', '寒[さむ]くない', 'です'], en: 'This room is not cold.', bank: ['でした'], gap: { at: 3, wrong: ['寒[さむ]い', '寒[さむ]かった'] } },
      { tokens: ['昨日[きのう]', 'は', '暑[あつ]かった', 'です'], en: 'It was hot yesterday.', bank: ['でした'], gap: { at: 2, wrong: ['暑[あつ]い', '暑[あつ]くない'] } },
      { tokens: ['テスト', 'は', '難[むずか]しくなかった', 'です'], en: 'The test was not difficult.', bank: ['でした'], gap: { at: 2, wrong: ['難[むずか]しい', '難[むずか]しかった'] } },
      { tokens: ['その', '映画[えいが]', 'は', '面白[おもしろ]かった', 'です'], en: 'That film was interesting.', bank: ['でした'], gap: { at: 3, wrong: ['面白[おもしろ]い', '面白[おもしろ]くない'] } },
      { tokens: ['この', 'ケーキ', 'は', '甘[あま]くない', 'です'], en: 'This cake is not sweet.', bank: ['を'], gap: { at: 3, wrong: ['甘[あま]い', '甘[あま]かった'] } },
      { tokens: ['天気[てんき]', 'は', 'よくなかった', 'です'], en: 'The weather was not good.', bank: ['いい'], gap: { at: 2, wrong: ['いい', 'よかった'] } },
    ],
  },
  {
    title: 'な-adjectives',
    explain: {
      title: 'な-adjectives',
      body: [
        'Some adjectives work like nouns: 静か (quiet), きれい (pretty, clean), 便利 (convenient), 元気 (well, lively), 有名 (famous).',
        'Before a noun they take な: 静かな 所 = “a quiet place”.',
        'At the end they take です and its forms, like a noun: きれいじゃありません, 静かでした.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['この', '町[まち]', 'は', '静[しず]か', 'です'], en: 'This town is quiet.', bank: ['な'] },
      { tokens: ['図書館[としょかん]', 'は', '静[しず]か', 'な', '所[ところ]', 'です'], en: 'The library is a quiet place.', bank: ['の'], gap: { at: 3, wrong: ['の', 'に'] } },
      { tokens: ['この', '公園[こうえん]', 'は', 'きれい', 'じゃありません'], en: 'This park is not clean.', bank: ['な'], gap: { at: 4, wrong: ['です', 'でした'] } },
      { tokens: ['この', '辞書[じしょ]', 'は', '便利[べんり]', 'です'], en: 'This dictionary is useful.', bank: ['な'] },
      { tokens: ['元気[げんき]', 'です', 'か'], en: 'Are you well?', bank: ['な'], gap: { at: 2, wrong: ['の', 'を'] } },
      { tokens: ['あの', '人[ひと]', 'は', '有名[ゆうめい]', 'な', '先生[せんせい]', 'です'], en: 'That person is a famous teacher.', bank: ['の'], gap: { at: 4, wrong: ['の', 'に'] } },
    ],
  },
  {
    title: 'に and へ: where to, when',
    explain: {
      title: 'に and へ: destination and time',
      body: [
        'With 行きます, 来ます and 帰ります, the place you go to takes に or へ: 学校に 行きます。 へ (read “e”) stresses the direction.',
        'に also marks a point in time: 日曜日に, 夏休みに. Words like 毎日, 今日, 明日 take no particle.',
        'に marks who receives something, too: 母に 手紙を 書きます = “I write a letter to my mother”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['毎日[まいにち]', '学校[がっこう]', 'に', '行[い]きます'], en: 'I go to school every day.', bank: ['を'], gap: { at: 2, wrong: ['を', 'の'] } },
      { tokens: ['来週[らいしゅう]', '日本[にほん]', 'へ', '行[い]きます'], en: 'I will go to Japan next week.', bank: ['を'], gap: { at: 2, wrong: ['を', 'で'] } },
      { tokens: ['日曜日[にちようび]', 'に', '友達[ともだち]', 'の', '家[いえ]', 'に', '行[い]きました'], en: 'On Sunday I went to my friend’s house.', bank: ['で'], gap: { at: 5, wrong: ['を', 'で'] } },
      { tokens: ['母[はは]', 'に', '手紙[てがみ]', 'を', '書[か]きます'], en: 'I write a letter to my mother.', bank: ['が'], gap: { at: 1, wrong: ['を', 'で'] } },
      { tokens: ['夏休[なつやす]み', 'に', '海[うみ]', 'へ', '行[い]きました'], en: 'I went to the sea in the summer holidays.', bank: ['を'], gap: { at: 3, wrong: ['を', 'で'] } },
      { tokens: ['部屋[へや]', 'に', '入[はい]ります'], en: 'I go into the room.', bank: ['で'], gap: { at: 1, wrong: ['で', 'の'] } },
    ],
  },
  {
    title: 'で: where and how',
    explain: {
      title: 'で: the place of an action, and the means',
      body: [
        'で marks where something happens: 図書館で 本を 読みます = “I read books at the library”.',
        'で also marks how you do it: by what, with what, in what language. バスで (by bus), 箸で (with chopsticks), 日本語で (in Japanese).',
        'Careful: existing somewhere takes に (部屋に います), but doing something there takes で (部屋で 勉強します).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['図書館[としょかん]', 'で', '本[ほん]', 'を', '読[よ]みます'], en: 'I read books at the library.', bank: ['に'], gap: { at: 1, wrong: ['を', 'の'] } },
      { tokens: ['バス', 'で', '学校[がっこう]', 'へ', '行[い]きます'], en: 'I go to school by bus.', bank: ['を'], gap: { at: 1, wrong: ['を', 'が'] } },
      { tokens: ['箸[はし]', 'で', 'ご飯[はん]', 'を', '食[た]べます'], en: 'I eat rice with chopsticks.', bank: ['が'], gap: { at: 1, wrong: ['を', 'が'] } },
      { tokens: ['レストラン', 'で', '昼[ひる]ご飯[はん]', 'を', '食[た]べました'], en: 'I ate lunch at a restaurant.', bank: ['が'], gap: { at: 1, wrong: ['を', 'が'] } },
      { tokens: ['日本語[にほんご]', 'で', '手紙[てがみ]', 'を', '書[か]きました'], en: 'I wrote a letter in Japanese.', bank: ['が'], gap: { at: 1, wrong: ['を', 'が'] } },
      { tokens: ['公園[こうえん]', 'で', '遊[あそ]びます'], en: 'I play in the park.', bank: ['を'], gap: { at: 1, wrong: ['を', 'の'] } },
    ],
  },
  {
    title: 'と and や: with, and',
    explain: {
      title: 'と (“and”, “with”) and や (“and so on”)',
      body: [
        'と joins nouns into a complete list: パンと 卵 = “bread and eggs” (just those).',
        'や joins nouns into a list of examples: 肉や 野菜 = “meat, vegetables and so on”.',
        'と after a person means “with”: 友達と 映画を 見ます = “I watch a film with a friend”.',
      ],
      examples: [1, 2],
    },
    sentences: [
      { tokens: ['友達[ともだち]', 'と', '映画[えいが]', 'を', '見[み]ます'], en: 'I watch a film with a friend.', bank: ['が'], gap: { at: 1, wrong: ['を', 'で'] } },
      { tokens: ['パン', 'と', '卵[たまご]', 'を', '買[か]いました'], en: 'I bought bread and eggs.', bank: ['が'], gap: { at: 1, wrong: ['を', 'へ'] } },
      { tokens: ['机[つくえ]', 'の', '上[うえ]', 'に', '本[ほん]', 'や', 'ノート', 'が', 'あります'], en: 'There are books, notebooks and so on on the desk.', bank: ['を'], gap: { at: 5, wrong: ['を', 'で'] } },
      { tokens: ['母[はは]', 'と', '買[か]い物[もの]', 'に', '行[い]きました'], en: 'I went shopping with my mother.', bank: ['を'], gap: { at: 1, wrong: ['を', 'で'] } },
      { tokens: ['肉[にく]', 'や', '野菜[やさい]', 'を', '食[た]べます'], en: 'I eat meat, vegetables and so on.', bank: ['が'], gap: { at: 1, wrong: ['を', 'で'] } },
      { tokens: ['誰[だれ]', 'と', '行[い]きます', 'か'], en: 'Who are you going with?', bank: ['を'], gap: { at: 1, wrong: ['を', 'の'] } },
    ],
  },
  {
    title: 'から・まで: from, until',
    explain: {
      title: 'から (“from”) and まで (“until”, “as far as”)',
      body: [
        'から marks a starting point in time or place; まで marks the end point.',
        '月曜日から 金曜日まで = “from Monday to Friday”. 家から 駅まで = “from home to the station”.',
        'You can use either on its own: 駅まで 歩きます = “I walk as far as the station”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['学校[がっこう]', 'は', '月曜日[げつようび]', 'から', '金曜日[きんようび]', 'まで', 'です'], en: 'School is from Monday to Friday.', bank: ['に'], gap: { at: 3, wrong: ['まで', 'を'] } },
      { tokens: ['家[いえ]', 'から', '駅[えき]', 'まで', '歩[ある]きます'], en: 'I walk from home to the station.', bank: ['を'], gap: { at: 3, wrong: ['から', 'を'] } },
      { tokens: ['昨日[きのう]', 'は', '朝[あさ]', 'から', '晩[ばん]', 'まで', '働[はたら]きました'], en: 'Yesterday I worked from morning till night.', bank: ['を'], gap: { at: 5, wrong: ['から', 'を'] } },
      { tokens: ['夏休[なつやす]み', 'は', 'いつ', 'から', 'です', 'か'], en: 'When do the summer holidays start?', bank: ['まで'], gap: { at: 3, wrong: ['まで', 'を'] } },
      { tokens: ['駅[えき]', 'まで', 'バス', 'で', '行[い]きます'], en: 'I go to the station by bus.', bank: ['から'], gap: { at: 1, wrong: ['から', 'を'] } },
      { tokens: ['図書館[としょかん]', 'から', '本[ほん]', 'を', '借[か]りました'], en: 'I borrowed a book from the library.', bank: ['まで'], gap: { at: 1, wrong: ['まで', 'を'] } },
    ],
  },
  {
    title: 'Question words + か / も',
    explain: {
      title: '何, どこ, 誰, いつ, and adding か or も',
      body: [
        'Question words: 何 (what), どこ (where), 誰 (who), いつ (when). The sentence ends in か.',
        'Add か to make “some-”: 誰か = “someone”, 何か = “something”.',
        'Add も to a negative verb to make “no-”: 何も 食べませんでした = “I ate nothing”. With a place, keep the particle: どこにも 行きませんでした.',
      ],
      examples: [2, 4],
    },
    sentences: [
      { tokens: ['何[なに]', 'を', '食[た]べます', 'か'], en: 'What will you eat?', bank: ['も'], gap: { at: 1, wrong: ['の', 'に'] } },
      { tokens: ['どこ', 'へ', '行[い]きます', 'か'], en: 'Where are you going?', bank: ['を'], gap: { at: 1, wrong: ['を', 'の'] } },
      { tokens: ['何[なに]', 'も', '食[た]べませんでした'], en: 'I ate nothing.', bank: ['を'], gap: { at: 1, wrong: ['を', 'が'] } },
      { tokens: ['どこ', 'に', 'も', '行[い]きませんでした'], en: 'I didn’t go anywhere.', bank: ['を'], gap: { at: 2, wrong: ['を', 'の'] } },
      { tokens: ['誰[だれ]', 'か', '来[き]ました', 'か'], en: 'Did someone come?', bank: ['を'], gap: { at: 1, wrong: ['を', 'の'] } },
      { tokens: ['いつ', '日本[にほん]', 'へ', '来[き]ました', 'か'], en: 'When did you come to Japan?', bank: ['を'], gap: { at: 2, wrong: ['を', 'で'] } },
    ],
  },
  {
    title: 'Counting things',
    explain: {
      title: 'Numbers and counters',
      body: [
        'Japanese counts with a counter after the number, chosen by the kind of thing: 人 (people: 五人), 本 (long things: 二本), 枚 (flat things: 五枚), つ (general: みっつ).',
        'Time uses 時 (o’clock: 三時) and 分 (minutes: 十分, read じゅっぷん).',
        'The number usually goes right before the verb: りんごを みっつ 買いました.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['りんご', 'を', 'みっつ', '買[か]いました'], en: 'I bought three apples.', bank: ['が'], gap: { at: 2, wrong: ['三人[さんにん]', '三枚[さんまい]'] } },
      { tokens: ['学生[がくせい]', 'が', '五人[ごにん]', 'います'], en: 'There are five students.', bank: ['あります'], gap: { at: 2, wrong: ['五本[ごほん]', '五枚[ごまい]'] } },
      { tokens: ['鉛筆[えんぴつ]', 'が', '二本[にほん]', 'あります'], en: 'There are two pencils.', bank: ['います'], gap: { at: 2, wrong: ['二人[ふたり]', '二枚[にまい]'] } },
      { tokens: ['切手[きって]', 'を', '五枚[ごまい]', 'ください'], en: 'Five stamps, please.', bank: ['が'], gap: { at: 2, wrong: ['五本[ごほん]', '五人[ごにん]'] } },
      { tokens: ['今[いま]', '三時[さんじ]', 'です'], en: 'It is three o’clock now.', bank: ['を'], gap: { at: 1, wrong: ['三分[さんぷん]', '三人[さんにん]'] } },
      { tokens: ['十分[じゅっぷん]', '待[ま]ちました'], en: 'I waited ten minutes.', bank: ['を'], gap: { at: 0, wrong: ['十時[じゅうじ]', '十人[じゅうにん]'] } },
    ],
  },
  {
    title: 'が: likes, skills, understanding',
    explain: {
      title: 'が with 好き, 嫌い, 上手, 下手, 分かります',
      body: [
        'With 好き (liked), 嫌い (disliked), 上手 (good at), 下手 (bad at) and 分かります (understand), the thing takes が, not を.',
        'わたしは 魚が 好きです = “I like fish” (literally “as for me, fish is liked”).',
        'To ask what someone likes: 何が 好きですか。',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['わたし', 'は', '魚[さかな]', 'が', '好[す]き', 'です'], en: 'I like fish.', bank: ['を'], gap: { at: 3, wrong: ['に', 'で'] } },
      { tokens: ['弟[おとうと]', 'は', '野菜[やさい]', 'が', '嫌[きら]い', 'です'], en: 'My little brother dislikes vegetables.', bank: ['を'], gap: { at: 3, wrong: ['に', 'で'] } },
      { tokens: ['母[はは]', 'は', '料理[りょうり]', 'が', '上手[じょうず]', 'です'], en: 'My mother is good at cooking.', bank: ['を'], gap: { at: 3, wrong: ['に', 'へ'] } },
      { tokens: ['わたし', 'は', '歌[うた]', 'が', '下手[へた]', 'です'], en: 'I am bad at singing.', bank: ['を'], gap: { at: 3, wrong: ['に', 'へ'] } },
      { tokens: ['日本語[にほんご]', 'が', '分[わ]かります', 'か'], en: 'Do you understand Japanese?', bank: ['を'], gap: { at: 1, wrong: ['に', 'へ'] } },
      { tokens: ['何[なに]', 'が', '好[す]き', 'です', 'か'], en: 'What do you like?', bank: ['を'], gap: { at: 1, wrong: ['に', 'へ'] } },
    ],
  },
  {
    title: '欲しい: wanting things',
    explain: {
      title: '欲しい: “I want (a thing)”',
      body: [
        '欲しい is an い-adjective meaning “wanted”. The thing you want takes が: 時計が 欲しいです = “I want a watch”.',
        'It changes like any い-adjective: 欲しくないです (don’t want), 欲しかったです (wanted).',
        'Use it for your own wishes, or to ask someone else’s: 何が 欲しいですか。',
      ],
      examples: [1, 4],
    },
    sentences: [
      { tokens: ['新[あたら]しい', '車[くるま]', 'が', '欲[ほ]しい', 'です'], en: 'I want a new car.', bank: ['で'], gap: { at: 2, wrong: ['に', 'で'] } },
      { tokens: ['わたし', 'は', '時計[とけい]', 'が', '欲[ほ]しい', 'です'], en: 'I want a watch.', bank: ['に'], gap: { at: 3, wrong: ['に', 'で'] } },
      { tokens: ['何[なに]', 'が', '欲[ほ]しい', 'です', 'か'], en: 'What do you want?', bank: ['に'], gap: { at: 1, wrong: ['に', 'で'] } },
      { tokens: ['お金[かね]', 'は', '欲[ほ]しくない', 'です'], en: 'I don’t want money.', bank: ['でした'], gap: { at: 2, wrong: ['欲[ほ]しい', '欲[ほ]しかった'] } },
      { tokens: ['犬[いぬ]', 'が', '欲[ほ]しかった', 'です'], en: 'I wanted a dog.', bank: ['でした'], gap: { at: 2, wrong: ['欲[ほ]しい', '欲[ほ]しくない'] } },
      { tokens: ['大[おお]きい', '部屋[へや]', 'が', '欲[ほ]しい', 'です'], en: 'I want a big room.', bank: ['な'], gap: { at: 2, wrong: ['に', 'で'] } },
    ],
  },
  {
    title: 'たい: wanting to do',
    explain: {
      title: 'Verb + たい: “I want to …”',
      body: [
        'Take the ます form, drop ます, add たい: 行きます → 行きたい = “want to go”. Add です to be polite.',
        'たい changes like an い-adjective: 行きたくない (don’t want to go), 行きたかった (wanted to go).',
        'The object can take を or が: 水が 飲みたいです / 水を 飲みたいです.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['日本[にほん]', 'へ', '行[い]きたい', 'です'], en: 'I want to go to Japan.', bank: ['行[い]きます'], gap: { at: 2, wrong: ['行[い]きます', '行[い]きました'] } },
      { tokens: ['水[みず]', 'が', '飲[の]みたい', 'です'], en: 'I want to drink water.', bank: ['飲[の]みます'], gap: { at: 2, wrong: ['飲[の]みます', '飲[の]みました'] } },
      { tokens: ['今日[きょう]', 'は', '何[なに]', 'も', 'したくない', 'です'], en: 'I don’t want to do anything today.', bank: ['を'], gap: { at: 4, wrong: ['したい', 'したかった'] } },
      { tokens: ['何[なに]', 'を', '食[た]べたい', 'です', 'か'], en: 'What do you want to eat?', bank: ['食[た]べます'], gap: { at: 2, wrong: ['食[た]べます', '食[た]べました'] } },
      { tokens: ['その', '映画[えいが]', 'を', '見[み]たかった', 'です'], en: 'I wanted to see that film.', bank: ['見[み]たい'], gap: { at: 3, wrong: ['見[み]たい', '見[み]たくない'] } },
      { tokens: ['早[はや]く', '寝[ね]たい', 'です'], en: 'I want to go to bed early.', bank: ['寝[ね]ます'], gap: { at: 1, wrong: ['寝[ね]ます', '寝[ね]ました'] } },
    ],
  },
  {
    title: 'ましょう・ませんか',
    explain: {
      title: 'Suggesting and inviting',
      body: [
        'ましょう = “let’s …”: 食べましょう = “let’s eat”. ましょうか = “shall we …?” or “shall I …?”.',
        'ませんか (“won’t you …?”) is a polite invitation: 映画を 見ませんか = “Would you like to watch a film?”.',
        '一緒に (together) often goes with them.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['一緒[いっしょ]', 'に', '昼[ひる]ご飯[はん]', 'を', '食[た]べましょう'], en: 'Let’s eat lunch together.', bank: ['で'], gap: { at: 4, wrong: ['食[た]べました', '食[た]べません'] } },
      { tokens: ['映画[えいが]', 'を', '見[み]ません', 'か'], en: 'Would you like to watch a film?', bank: ['見[み]ました'], gap: { at: 2, wrong: ['見[み]ました', '見[み]たい'] } },
      { tokens: ['少[すこ]し', '休[やす]みましょう', 'か'], en: 'Shall we rest a little?', bank: ['を'], gap: { at: 1, wrong: ['休[やす]みました', '休[やす]みたい'] } },
      { tokens: ['明日[あした]', '公園[こうえん]', 'へ', '行[い]きません', 'か'], en: 'Why don’t we go to the park tomorrow?', bank: ['を'], gap: { at: 3, wrong: ['行[い]きました', '行[い]きたい'] } },
      { tokens: ['駅[えき]', 'で', '会[あ]いましょう'], en: 'Let’s meet at the station.', bank: ['を'], gap: { at: 2, wrong: ['会[あ]いました', '会[あ]いません'] } },
      { tokens: ['コーヒー', 'を', '飲[の]みましょう', 'か'], en: 'Shall we have a coffee?', bank: ['が'], gap: { at: 2, wrong: ['飲[の]みました', '飲[の]みたい'] } },
    ],
  },
  {
    title: 'てください: please do',
    explain: {
      title: 'The て-form, and てください',
      body: [
        'The て-form links verbs to other words. ください after it makes a polite request: 待ってください = “please wait”.',
        'Making it: る-verbs drop る and add て (食べる → 食べて). Others change their ending: う・つ・る → って (待つ → 待って), む・ぶ・ぬ → んで (読む → 読んで), く → いて (書く → 書いて), す → して (話す → 話して).',
        'Irregular: 行く → 行って, する → して, 来る → 来て.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['ちょっと', '待[ま]って', 'ください'], en: 'Please wait a moment.', bank: ['待[ま]ちます'], gap: { at: 1, wrong: ['待[ま]ちます', '待[ま]ちました'] } },
      { tokens: ['ここ', 'に', '名前[なまえ]', 'を', '書[か]いて', 'ください'], en: 'Please write your name here.', bank: ['で'], gap: { at: 4, wrong: ['書[か]きます', '書[か]きました'] } },
      { tokens: ['もう', '少[すこ]し', 'ゆっくり', '話[はな]して', 'ください'], en: 'Please speak a little more slowly.', bank: ['を'], gap: { at: 3, wrong: ['話[はな]します', '話[はな]しました'] } },
      { tokens: ['窓[まど]', 'を', '開[あ]けて', 'ください'], en: 'Please open the window.', bank: ['が'], gap: { at: 2, wrong: ['開[あ]けます', '開[あ]けました'] } },
      { tokens: ['電気[でんき]', 'を', '消[け]して', 'ください'], en: 'Please turn off the light.', bank: ['が'], gap: { at: 2, wrong: ['消[け]します', '消[け]しました'] } },
      { tokens: ['明日[あした]', '来[き]て', 'ください'], en: 'Please come tomorrow.', bank: ['来[き]ます'], gap: { at: 1, wrong: ['来[き]ます', '来[き]ました'] } },
    ],
  },
  {
    title: 'ています: -ing, and states',
    explain: {
      title: 'て-form + います',
      body: [
        'て + います describes something going on now: テレビを 見ています = “is watching TV”.',
        'It also describes a state that continues: 銀行で 働いています = “works at a bank”; 結婚しています = “is married”; 知っています = “knows”.',
        '“I don’t know” is 知りません (not 知っていません).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['今[いま]', '雨[あめ]', 'が', '降[ふ]っています'], en: 'It is raining now.', bank: ['を'], gap: { at: 3, wrong: ['降[ふ]ります', '降[ふ]りました'] } },
      { tokens: ['弟[おとうと]', 'は', 'テレビ', 'を', '見[み]ています'], en: 'My little brother is watching TV.', bank: ['が'], gap: { at: 4, wrong: ['見[み]ます', '見[み]ました'] } },
      { tokens: ['姉[あね]', 'は', '銀行[ぎんこう]', 'で', '働[はたら]いています'], en: 'My older sister works at a bank.', bank: ['に'], gap: { at: 3, wrong: ['に', 'を'] } },
      { tokens: ['兄[あに]', 'は', '結婚[けっこん]しています'], en: 'My older brother is married.', bank: ['を'], gap: { at: 2, wrong: ['結婚[けっこん]します', '結婚[けっこん]したい'] } },
      { tokens: ['先生[せんせい]', 'の', '名前[なまえ]', 'を', '知[し]っています', 'か'], en: 'Do you know the teacher’s name?', bank: ['が'], gap: { at: 4, wrong: ['知[し]ります', '知[し]りました'] } },
      { tokens: ['窓[まど]', 'が', '開[あ]いています'], en: 'The window is open.', bank: ['を'], gap: { at: 2, wrong: ['開[あ]きます', '開[あ]きました'] } },
    ],
  },
  {
    title: 'てもいい・てはいけません',
    explain: {
      title: 'Permission and prohibition',
      body: [
        'て-form + も いいです = “you may …”: 開けても いいですか = “May I open it?”.',
        'て-form + は いけません = “you must not …”: ここで 食べては いけません。 The は is read “wa”.',
        'To answer a “may I?” question: はい、どうぞ (yes, go ahead) or すみません、ちょっと… (sorry, that’s not good).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['窓[まど]', 'を', '開[あ]けて', 'も', 'いい', 'です', 'か'], en: 'May I open the window?', bank: ['は'], gap: { at: 3, wrong: ['は', 'が'] } },
      { tokens: ['ここ', 'で', 'たばこ', 'を', '吸[す]って', 'は', 'いけません'], en: 'You must not smoke here.', bank: ['も'], gap: { at: 5, wrong: ['も', 'が'] } },
      { tokens: ['鉛筆[えんぴつ]', 'で', '書[か]いて', 'も', 'いい', 'です'], en: 'You may write in pencil.', bank: ['は'], gap: { at: 3, wrong: ['は', 'が'] } },
      { tokens: ['教室[きょうしつ]', 'で', '食[た]べて', 'は', 'いけません'], en: 'You must not eat in the classroom.', bank: ['も'], gap: { at: 3, wrong: ['も', 'が'] } },
      { tokens: ['この', '本[ほん]', 'を', '借[か]りて', 'も', 'いい', 'です', 'か'], en: 'May I borrow this book?', bank: ['は'], gap: { at: 4, wrong: ['は', 'が'] } },
      { tokens: ['夜[よる]', '遅[おそ]く', '電話[でんわ]して', 'は', 'いけません'], en: 'You must not phone late at night.', bank: ['も'], gap: { at: 3, wrong: ['も', 'が'] } },
    ],
  },
  {
    title: 'て-form: and then',
    explain: {
      title: 'Joining actions and descriptions',
      body: [
        'Verbs in the て-form chain actions in order: 起きて 顔を 洗います = “I get up and wash my face”. The tense comes from the last verb.',
        'い-adjectives join with くて: 広くて 明るい = “spacious and bright”.',
        'な-adjectives and nouns join with で: 静かで きれい = “quiet and clean”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['朝[あさ]', '起[お]きて', '顔[かお]', 'を', '洗[あら]います'], en: 'In the morning I get up and wash my face.', bank: ['起[お]きます'], gap: { at: 1, wrong: ['起[お]きます', '起[お]きました'] } },
      { tokens: ['この', '部屋[へや]', 'は', '広[ひろ]くて', '明[あか]るい', 'です'], en: 'This room is spacious and bright.', bank: ['広[ひろ]い'], gap: { at: 3, wrong: ['広[ひろ]い', '広[ひろ]かった'] } },
      { tokens: ['図書館[としょかん]', 'は', '静[しず]か', 'で', 'きれい', 'です'], en: 'The library is quiet and clean.', bank: ['な'], gap: { at: 3, wrong: ['な', 'を'] } },
      { tokens: ['家[いえ]', 'に', '帰[かえ]って', '寝[ね]ました'], en: 'I went home and slept.', bank: ['帰[かえ]ります'], gap: { at: 2, wrong: ['帰[かえ]ります', '帰[かえ]りました'] } },
      { tokens: ['買[か]い物[もの]', 'を', 'して', '映画[えいが]', 'を', '見[み]ました'], en: 'I went shopping and then watched a film.', bank: ['します'], gap: { at: 2, wrong: ['します', 'しました'] } },
      { tokens: ['兄[あに]', 'は', '背[せ]', 'が', '高[たか]くて', '元気[げんき]', 'です'], en: 'My older brother is tall and lively.', bank: ['高[たか]い'], gap: { at: 4, wrong: ['高[たか]い', '高[たか]かった'] } },
    ],
  },
  {
    title: 'より・のほうが: comparing',
    explain: {
      title: 'Comparing two things',
      body: [
        'A は B より … = “A is more … than B”: 電車は バスより 速いです.',
        'To ask which of two: A と B と どちらが …ですか.',
        'Answer with のほうが: 冬のほうが 好きです = “I like winter better”. 一番 means “the most”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['電車[でんしゃ]', 'は', 'バス', 'より', '速[はや]い', 'です'], en: 'The train is faster than the bus.', bank: ['から'], gap: { at: 3, wrong: ['から', 'まで'] } },
      { tokens: ['夏[なつ]', 'と', '冬[ふゆ]', 'と', 'どちら', 'が', '好[す]き', 'です', 'か'], en: 'Which do you like better, summer or winter?', bank: ['を'], gap: { at: 5, wrong: ['を', 'に'] } },
      { tokens: ['冬[ふゆ]', 'の', 'ほう', 'が', '好[す]き', 'です'], en: 'I like winter better.', bank: ['より'], gap: { at: 1, wrong: ['を', 'に'] } },
      { tokens: ['犬[いぬ]', 'は', '猫[ねこ]', 'より', '大[おお]きい', 'です'], en: 'Dogs are bigger than cats.', bank: ['まで'], gap: { at: 3, wrong: ['から', 'まで'] } },
      { tokens: ['肉[にく]', 'より', '魚[さかな]', 'の', 'ほう', 'が', '好[す]き', 'です'], en: 'I prefer fish to meat.', bank: ['から'], gap: { at: 1, wrong: ['から', 'まで'] } },
      { tokens: ['一番[いちばん]', '好[す]き', 'な', '料理[りょうり]', 'は', '何[なん]', 'です', 'か'], en: 'What is your favourite dish?', bank: ['の'], gap: { at: 2, wrong: ['の', 'に'] } },
    ],
  },
  {
    title: '前に・後で: before, after',
    explain: {
      title: 'Before and after',
      body: [
        'Dictionary form + 前に = “before doing”: 寝る 前に = “before going to bed”. Noun + の 前に: 食事の 前に.',
        'Noun + の 後で = “after”: 仕事の 後で = “after work”.',
        'た-form + 後で = “after doing”: 見た 後で. The た-form is the past of the dictionary form: 見る → 見た, 食べる → 食べた.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['寝[ね]る', '前[まえ]', 'に', '歯[は]', 'を', '磨[みが]きます'], en: 'I brush my teeth before going to bed.', bank: ['後[あと]'], gap: { at: 1, wrong: ['後[あと]'] } },
      { tokens: ['食[た]べる', '前[まえ]', 'に', '手[て]', 'を', '洗[あら]います'], en: 'I wash my hands before eating.', bank: ['後[あと]'], gap: { at: 1, wrong: ['後[あと]'] } },
      { tokens: ['仕事[しごと]', 'の', '後[あと]', 'で', '図書館[としょかん]', 'へ', '行[い]きます'], en: 'After work I go to the library.', bank: ['前[まえ]'], gap: { at: 2, wrong: ['前[まえ]'] } },
      { tokens: ['晩[ばん]ご飯[はん]', 'の', '後[あと]', 'で', 'テレビ', 'を', '見[み]ます'], en: 'After dinner I watch TV.', bank: ['前[まえ]'], gap: { at: 2, wrong: ['前[まえ]'] } },
      { tokens: ['映画[えいが]', 'を', '見[み]た', '後[あと]', 'で', '寝[ね]ました'], en: 'After watching a film I went to bed.', bank: ['見[み]る'], gap: { at: 2, wrong: ['見[み]る', '見[み]て'] } },
      { tokens: ['出[で]かける', '前[まえ]', 'に', '電話[でんわ]', 'を', 'ください'], en: 'Please call me before you go out.', bank: ['後[あと]'], gap: { at: 1, wrong: ['後[あと]'] } },
    ],
  },
  {
    title: 'から・が: because, but',
    explain: {
      title: 'から (“so”, “because”) and が・けど (“but”)',
      body: [
        'A から B = “A, so B”: the reason comes first. 雨ですから 家に います = “It’s raining, so I’m staying home”.',
        'A が B = “A, but B”: 安いですが おいしいです = “It’s cheap but good”.',
        'けど also means “but”; it is more casual than が.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['雨[あめ]', 'です', 'から', '家[いえ]', 'に', 'います'], en: 'It’s raining, so I’m staying at home.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'を'] } },
      { tokens: ['暑[あつ]い', 'です', 'から', '窓[まど]', 'を', '開[あ]けます'], en: 'It’s hot, so I’ll open the window.', bank: ['まで'], gap: { at: 2, wrong: ['まで', 'を'] } },
      { tokens: ['この', '店[みせ]', 'は', '安[やす]い', 'です', 'が', 'おいしい', 'です'], en: 'This restaurant is cheap but good.', bank: ['を'], gap: { at: 5, wrong: ['を', 'に'] } },
      { tokens: ['日本語[にほんご]', 'は', '難[むずか]しい', 'です', 'が', '面白[おもしろ]い', 'です'], en: 'Japanese is difficult but interesting.', bank: ['を'], gap: { at: 4, wrong: ['を', 'に'] } },
      { tokens: ['疲[つか]れました', 'から', '早[はや]く', '寝[ね]ます'], en: 'I’m tired, so I’ll go to bed early.', bank: ['まで'], gap: { at: 1, wrong: ['まで', 'を'] } },
      { tokens: ['高[たか]い', 'けど', '買[か]います'], en: 'It’s expensive, but I’ll buy it.', bank: ['を'], gap: { at: 1, wrong: ['を', 'に'] } },
    ],
  },
  {
    title: 'でしょう, もう・まだ',
    explain: {
      title: 'でしょう (“probably”), もう (“already”) and まだ (“not yet”, “still”)',
      body: [
        'でしょう after a noun or adjective = “probably”: 明日は 雨でしょう = “It will probably rain tomorrow”.',
        'もう + past = “already”: もう 食べました. In a question: “yet?”.',
        'まだ + ています form negative = “not yet”: まだ 食べていません. まだ + positive = “still”: まだ 寝ています.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['明日[あした]', 'は', '雨[あめ]', 'でしょう'], en: 'It will probably rain tomorrow.', bank: ['でした'], gap: { at: 3, wrong: ['でした', 'じゃありません'] } },
      { tokens: ['あの', '人[ひと]', 'は', '先生[せんせい]', 'でしょう'], en: 'That person is probably a teacher.', bank: ['でした'], gap: { at: 4, wrong: ['でした', 'じゃありません'] } },
      { tokens: ['もう', '昼[ひる]ご飯[はん]', 'を', '食[た]べました', 'か'], en: 'Have you eaten lunch yet?', bank: ['まだ'], gap: { at: 0, wrong: ['まだ'] } },
      { tokens: ['まだ', '食[た]べていません'], en: 'I haven’t eaten yet.', bank: ['もう'], gap: { at: 0, wrong: ['もう'] } },
      { tokens: ['宿題[しゅくだい]', 'は', 'もう', '終[お]わりました'], en: 'I have already finished my homework.', bank: ['まだ'], gap: { at: 2, wrong: ['まだ'] } },
      { tokens: ['弟[おとうと]', 'は', 'まだ', '寝[ね]ています'], en: 'My little brother is still asleep.', bank: ['もう'], gap: { at: 2, wrong: ['もう'] } },
    ],
  },
]
