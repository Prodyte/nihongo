// N4 grammar: lessons of six sentences, written for this app like the N5 ones (grammarN5.ts). Every word is a starter,
// N5 or N4 course word taught before the lesson (course.ts places each lesson after its words; tests check it).
// Tests check words, spelling and structure; they can't judge the explanations, so skim those.
import type { GrammarLessonSpec } from './grammar'

export const N4_GRAMMAR: GrammarLessonSpec[] = [
  {
    title: 'Plain form: だ, 行く, 行った',
    explain: {
      title: 'The plain (casual) form',
      body: [
        'With friends and family, Japanese drops です and ます. Nouns and な-adjectives take だ (is), じゃない (is not), だった (was).',
        'Verbs use the dictionary form (行く), the ない form (行かない) and the た form (行った). い-adjectives just drop です: 高い, 高くない, 高かった.',
        'The same plain forms come before many grammar points in this section: 行くつもりです, 行ったことがあります.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['今日[きょう]', 'は', '日曜日[にちようび]', 'だ'], en: 'It’s Sunday today (casual).', bank: ['だった'], gap: { at: 3, wrong: ['だった', 'じゃない'] } },
      { tokens: ['明日[あした]', '学校[がっこう]', 'に', '行[い]く'], en: 'I’m going to school tomorrow (casual).', bank: ['行[い]った'], gap: { at: 3, wrong: ['行[い]った', '行[い]かない'] } },
      { tokens: ['昨日[きのう]', 'は', '雨[あめ]', 'だった'], en: 'It rained yesterday (casual).', bank: ['だ'], gap: { at: 3, wrong: ['だ', 'じゃない'] } },
      { tokens: ['この', '映画[えいが]', 'は', '面白[おもしろ]くない'], en: 'This film isn’t interesting (casual).', bank: ['面白[おもしろ]い'], gap: { at: 3, wrong: ['面白[おもしろ]い', '面白[おもしろ]かった'] } },
      { tokens: ['あの', '人[ひと]', 'は', '先生[せんせい]', 'じゃない'], en: 'That person isn’t a teacher (casual).', bank: ['だった'], gap: { at: 4, wrong: ['だ', 'だった'] } },
      { tokens: ['もう', 'ご飯[はん]', 'を', '食[た]べた'], en: 'I’ve already eaten (casual).', bank: ['食[た]べる'], gap: { at: 3, wrong: ['食[た]べる', '食[た]べない'] } },
    ],
  },
  {
    title: '〜たことがあります',
    explain: {
      title: '〜たことがあります: “have done (before)”',
      body: [
        'The た form + ことがあります talks about experience: 日本へ 行ったことがあります = “I have been to Japan”.',
        'ことがありません = “have never”: 飛行機に 乗ったことがありません = “I have never been on a plane”.',
        'Ask with か: すしを 食べたことがありますか = “Have you ever eaten sushi?”',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['日本[にほん]', 'へ', '行[い]った', 'こと', 'が', 'あります'], en: 'I have been to Japan.', bank: ['行[い]く'], gap: { at: 2, wrong: ['行[い]く', '行[い]って'] } },
      { tokens: ['すし', 'を', '食[た]べた', 'こと', 'が', 'あります', 'か'], en: 'Have you ever eaten sushi?', bank: ['食[た]べる'], gap: { at: 2, wrong: ['食[た]べる', '食[た]べて'] } },
      { tokens: ['飛行機[ひこうき]', 'に', '乗[の]った', 'こと', 'が', 'ありません'], en: 'I have never been on a plane.', bank: ['あります'], gap: { at: 5, wrong: ['あります', 'いません'] } },
      { tokens: ['この', '本[ほん]', 'を', '読[よ]んだ', 'こと', 'が', 'あります'], en: 'I have read this book before.', bank: ['読[よ]む'], gap: { at: 3, wrong: ['読[よ]む', '読[よ]んで'] } },
      { tokens: ['外国[がいこく]', 'に', '住[す]んだ', 'こと', 'が', 'ありません'], en: 'I have never lived abroad.', bank: ['あります'], gap: { at: 5, wrong: ['あります', 'いません'] } },
      { tokens: ['あの', '人[ひと]', 'に', '会[あ]った', 'こと', 'が', 'あります'], en: 'I have met that person before.', bank: ['会[あ]う'], gap: { at: 3, wrong: ['会[あ]う', '会[あ]って'] } },
    ],
  },
  {
    title: '〜たり〜たりします',
    explain: {
      title: '〜たり〜たりします: “do things like A and B”',
      body: [
        'Make the た form and add り: 読んだり, 見たり. End the list with します (or しました for the past).',
        '〜たり〜たり gives examples, not a full list: 本を 読んだり 映画を 見たりします = “I read books, watch films and so on”.',
        'With two opposite verbs it means “on and off”: 降ったり 止んだり = “raining on and off”.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['日曜日[にちようび]', 'は', '本[ほん]', 'を', '読[よ]んだり', '映画[えいが]', 'を', '見[み]たり', 'します'], en: 'On Sundays I read books, watch films and so on.', bank: ['読[よ]んで'], gap: { at: 4, wrong: ['読[よ]んで', '読[よ]みます'] } },
      { tokens: ['夏休[なつやす]み', 'は', '泳[およ]いだり', '山[やま]', 'に', '登[のぼ]ったり', 'しました'], en: 'In the summer holidays I swam, climbed mountains and so on.', bank: ['泳[およ]いで'], gap: { at: 2, wrong: ['泳[およ]いで', '泳[およ]ぎます'] } },
      { tokens: ['週末[しゅうまつ]', 'は', '掃除[そうじ]', 'を', 'したり', '洗濯[せんたく]', 'を', 'したり', 'します'], en: 'At weekends I clean, do the laundry and so on.', bank: ['して'], gap: { at: 4, wrong: ['して', 'します'] } },
      { tokens: ['友達[ともだち]', 'と', '話[はな]したり', '歌[うた]', 'を', '歌[うた]ったり', 'しました'], en: 'I chatted and sang songs with friends.', bank: ['話[はな]して'], gap: { at: 2, wrong: ['話[はな]して', '話[はな]します'] } },
      { tokens: ['休[やす]み', 'の', '日[ひ]', 'は', '寝[ね]たり', 'テレビ', 'を', '見[み]たり', 'します'], en: 'On my days off I sleep, watch TV and so on.', bank: ['寝[ね]て'], gap: { at: 4, wrong: ['寝[ね]て', '寝[ね]ます'] } },
      { tokens: ['夜[よる]', 'は', '音楽[おんがく]', 'を', '聞[き]いたり', '手紙[てがみ]', 'を', '書[か]いたり', 'します'], en: 'In the evenings I listen to music, write letters and so on.', bank: ['聞[き]いて'], gap: { at: 4, wrong: ['聞[き]いて', '聞[き]きます'] } },
    ],
  },
  {
    title: 'つもり',
    explain: {
      title: '〜つもりです: “I plan to”',
      body: [
        'The dictionary form + つもりです says what you intend to do: 来年 日本へ 行くつもりです = “I plan to go to Japan next year”.',
        'The ない form + つもりです = “I don’t plan to”: もう 吸わないつもりです.',
        'Ask about someone’s plans with つもりですか.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['来年[らいねん]', '日本[にほん]', 'へ', '行[い]く', 'つもり', 'です'], en: 'I plan to go to Japan next year.', bank: ['行[い]った'], gap: { at: 3, wrong: ['行[い]った', '行[い]って'] } },
      { tokens: ['今晩[こんばん]', 'は', '早[はや]く', '寝[ね]る', 'つもり', 'です'], en: 'I intend to go to bed early tonight.', bank: ['寝[ね]た'], gap: { at: 3, wrong: ['寝[ね]た', '寝[ね]て'] } },
      { tokens: ['新[あたら]しい', 'カメラ', 'を', '買[か]う', 'つもり', 'です'], en: 'I plan to buy a new camera.', bank: ['買[か]った'], gap: { at: 3, wrong: ['買[か]った', '買[か]って'] } },
      { tokens: ['もう', 'たばこ', 'を', '吸[す]わない', 'つもり', 'です'], en: 'I don’t intend to smoke any more.', bank: ['吸[す]う'], gap: { at: 3, wrong: ['吸[す]う', '吸[す]った'] } },
      { tokens: ['週末[しゅうまつ]', 'は', 'どこ', 'へ', '行[い]く', 'つもり', 'です', 'か'], en: 'Where are you planning to go at the weekend?', bank: ['行[い]った'], gap: { at: 4, wrong: ['行[い]った', '行[い]って'] } },
      { tokens: ['大学[だいがく]', 'で', '日本語[にほんご]', 'を', '勉強[べんきょう]する', 'つもり', 'です'], en: 'I plan to study Japanese at university.', bank: ['勉強[べんきょう]した'], gap: { at: 4, wrong: ['勉強[べんきょう]した', '勉強[べんきょう]して'] } },
    ],
  },
  {
    title: 'Volitional: 行こう, 〜ようと思います',
    explain: {
      title: 'The volitional form: “let’s”, “I think I’ll”',
      body: [
        'The volitional form is the casual “let’s”: 帰る → 帰ろう, 休む → 休もう (godan: change the ending to the お sound + う). 起きる → 起きよう (ichidan: る → よう). する → しよう, 来る → 来よう.',
        'Add と思います to say what you are thinking of doing: 映画を 見ようと思います = “I think I’ll watch a film”.',
        'と思っています means you have been thinking about it for a while.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['一緒[いっしょ]', 'に', '帰[かえ]ろう'], en: 'Let’s go home together (casual).', bank: ['帰[かえ]る'], gap: { at: 2, wrong: ['帰[かえ]る', '帰[かえ]った'] } },
      { tokens: ['ちょっと', '休[やす]もう'], en: 'Let’s take a short break (casual).', bank: ['休[やす]む'], gap: { at: 1, wrong: ['休[やす]む', '休[やす]んだ'] } },
      { tokens: ['明日[あした]', 'は', '早[はや]く', '起[お]きよう'], en: 'Let’s get up early tomorrow (casual).', bank: ['起[お]きる'], gap: { at: 3, wrong: ['起[お]きる', '起[お]きた'] } },
      { tokens: ['来年[らいねん]', '結婚[けっこん]しよう', 'と', '思[おも]っています'], en: 'I’m thinking of getting married next year.', bank: ['結婚[けっこん]する'], gap: { at: 1, wrong: ['結婚[けっこん]する', '結婚[けっこん]した'] } },
      { tokens: ['週末[しゅうまつ]', '映画[えいが]', 'を', '見[み]よう', 'と', '思[おも]います'], en: 'I think I’ll watch a film at the weekend.', bank: ['見[み]る'], gap: { at: 3, wrong: ['見[み]る', '見[み]た'] } },
      { tokens: ['毎日[まいにち]', '漢字[かんじ]', 'を', '覚[おぼ]えよう', 'と', '思[おも]います'], en: 'I’m going to learn kanji every day.', bank: ['覚[おぼ]える'], gap: { at: 3, wrong: ['覚[おぼ]える', '覚[おぼ]えた'] } },
    ],
  },
  {
    title: 'Potential: 話せます, できます',
    explain: {
      title: 'The potential form: “can”',
      body: [
        'Godan verbs change the ending to the え sound + る: 話す → 話せる (話せます), 読む → 読める. Ichidan verbs add られる: 起きる → 起きられる. 来る → 来られる, する → できる.',
        'What you can do usually takes が instead of を: 日本語が 話せます.',
        'The dictionary form + ことができます says the same thing, a little more formally: 泳ぐことができます.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['わたし', 'は', '日本語[にほんご]', 'が', '話[はな]せます'], en: 'I can speak Japanese.', bank: ['を'], gap: { at: 4, wrong: ['話[はな]します', '話[はな]しました'] } },
      { tokens: ['漢字[かんじ]', 'が', '少[すこ]し', '読[よ]めます'], en: 'I can read a little kanji.', bank: ['を'], gap: { at: 3, wrong: ['読[よ]みます', '読[よ]みません'] } },
      { tokens: ['ここ', 'で', '写真[しゃしん]', 'が', '撮[と]れます', 'か'], en: 'Can I take photos here?', bank: ['を'], gap: { at: 4, wrong: ['撮[と]ります', '撮[と]りました'] } },
      { tokens: ['朝[あさ]', '早[はや]く', '起[お]きられません'], en: 'I can’t get up early in the morning.', bank: ['起[お]きません'], gap: { at: 2, wrong: ['起[お]きません', '起[お]きました'] } },
      { tokens: ['わたし', 'は', '泳[およ]ぐ', 'こと', 'が', 'できます'], en: 'I am able to swim.', bank: ['します'], gap: { at: 5, wrong: ['あります', 'します'] } },
      { tokens: ['日曜日[にちようび]', 'は', '来[こ]られます', 'か'], en: 'Can you come on Sunday?', bank: ['来[き]ます'], gap: { at: 2, wrong: ['来[き]ます', '来[き]ました'] } },
    ],
  },
  {
    title: 'なければなりません・なくてもいいです',
    explain: {
      title: '“Must” and “don’t have to”',
      body: [
        'The ない form without い + ければなりません = “must”: 起きない → 起きなければなりません = “I have to get up”.',
        'The ない form without い + くてもいいです = “don’t have to”: 行かなくてもいいです.',
        'Compare てはいけません (“must not”), from N5: 行ってはいけません = “you must not go”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['明日[あした]', 'は', '早[はや]く', '起[お]きなければなりません'], en: 'I have to get up early tomorrow.', bank: ['起[お]きなくてもいいです'], gap: { at: 3, wrong: ['起[お]きなくてもいいです', '起[お]きてはいけません'] } },
      { tokens: ['薬[くすり]', 'を', '飲[の]まなければなりません'], en: 'I have to take medicine.', bank: ['飲[の]まなくてもいいです'], gap: { at: 2, wrong: ['飲[の]まなくてもいいです', '飲[の]んではいけません'] } },
      { tokens: ['土曜日[どようび]', 'は', '会社[かいしゃ]', 'へ', '行[い]かなくてもいいです'], en: 'I don’t have to go to the office on Saturday.', bank: ['行[い]かなければなりません'], gap: { at: 4, wrong: ['行[い]かなければなりません', '行[い]ってはいけません'] } },
      { tokens: ['宿題[しゅくだい]', 'を', 'しなければなりません'], en: 'I have to do my homework.', bank: ['しなくてもいいです'], gap: { at: 2, wrong: ['しなくてもいいです', 'してはいけません'] } },
      { tokens: ['靴[くつ]', 'を', '脱[ぬ]がなくてもいいです'], en: 'You don’t have to take off your shoes.', bank: ['脱[ぬ]がなければなりません'], gap: { at: 2, wrong: ['脱[ぬ]がなければなりません', '脱[ぬ]いではいけません'] } },
      { tokens: ['手紙[てがみ]', 'を', '書[か]かなければなりません'], en: 'I have to write a letter.', bank: ['書[か]かなくてもいいです'], gap: { at: 2, wrong: ['書[か]かなくてもいいです', '書[か]いてはいけません'] } },
    ],
  },
  {
    title: '〜ないでください',
    explain: {
      title: '〜ないでください: “please don’t”',
      body: [
        'The ない form + でください asks someone not to do something: 吸わないでください = “please don’t smoke”.',
        'It is the opposite of てください: 開けてください (please open it), 開けないでください (please don’t open it).',
        'With friends, drop ください: 忘れないで! = “Don’t forget!”',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['ここ', 'で', 'たばこ', 'を', '吸[す]わないでください'], en: 'Please don’t smoke here.', bank: ['吸[す]ってください'], gap: { at: 4, wrong: ['吸[す]ってください', '吸[す]います'] } },
      { tokens: ['写真[しゃしん]', 'を', '撮[と]らないでください'], en: 'Please don’t take photos.', bank: ['撮[と]ってください'], gap: { at: 2, wrong: ['撮[と]ってください', '撮[と]ります'] } },
      { tokens: ['あまり', '心配[しんぱい]しないでください'], en: 'Please don’t worry too much.', bank: ['心配[しんぱい]してください'], gap: { at: 1, wrong: ['心配[しんぱい]してください', '心配[しんぱい]します'] } },
      { tokens: ['授業[じゅぎょう]', 'で', '寝[ね]ないでください'], en: 'Please don’t sleep in class.', bank: ['寝[ね]てください'], gap: { at: 2, wrong: ['寝[ね]てください', '寝[ね]ます'] } },
      { tokens: ['窓[まど]', 'を', '開[あ]けないでください'], en: 'Please don’t open the window.', bank: ['開[あ]けてください'], gap: { at: 2, wrong: ['開[あ]けてください', '開[あ]けます'] } },
      { tokens: ['傘[かさ]', 'を', '忘[わす]れないでください'], en: 'Please don’t forget your umbrella.', bank: ['忘[わす]れてください'], gap: { at: 2, wrong: ['忘[わす]れてください', '忘[わす]れます'] } },
    ],
  },
  {
    title: '〜てみる',
    explain: {
      title: '〜てみる: “try doing”',
      body: [
        'The て form + みる = “do it and see”: 着てみます = “I’ll try it on”.',
        'てみたい = “want to try”: 日本のお酒を 飲んでみたいです.',
        'てみてください = “please try”: 食べてみてください.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['この', '服[ふく]', 'を', '着[き]てみます'], en: 'I’ll try these clothes on.', bank: ['着[き]ます'], gap: { at: 3, wrong: ['着[き]ます', '着[き]ません'] } },
      { tokens: ['日本[にほん]', 'の', 'お酒[さけ]', 'を', '飲[の]んでみたい', 'です'], en: 'I want to try Japanese sake.', bank: ['飲[の]みたい'], gap: { at: 4, wrong: ['飲[の]みたい', '飲[の]んだ'] } },
      { tokens: ['この', 'ケーキ', 'を', '食[た]べてみてください'], en: 'Please try this cake.', bank: ['食[た]べてください'], gap: { at: 3, wrong: ['食[た]べてください', '食[た]べます'] } },
      { tokens: ['新[あたら]しい', '店[みせ]', 'へ', '行[い]ってみましょう'], en: 'Let’s try the new shop.', bank: ['行[い]きましょう'], gap: { at: 3, wrong: ['行[い]きましょう', '行[い]きます'] } },
      { tokens: ['先生[せんせい]', 'に', '聞[き]いてみます'], en: 'I’ll try asking the teacher.', bank: ['聞[き]きます'], gap: { at: 2, wrong: ['聞[き]きます', '聞[き]きません'] } },
      { tokens: ['日本[にほん]', 'の', '料理[りょうり]', 'を', '作[つく]ってみたい', 'です'], en: 'I want to try making Japanese food.', bank: ['作[つく]りたい'], gap: { at: 4, wrong: ['作[つく]りたい', '作[つく]った'] } },
    ],
  },
  {
    title: '〜ておく',
    explain: {
      title: '〜ておく: “do in advance”, “leave as is”',
      body: [
        'The て form + おく = do something now, ready for later: ホテルを 予約しておきます = “I’ll book the hotel (in advance)”.',
        'It also means “leave it that way”: 窓を 開けておいてください = “Please leave the window open”.',
        'Compare てみる (try doing): 予約してみます = “I’ll try booking”.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['旅行[りょこう]', 'の', '前[まえ]', 'に', 'ホテル', 'を', '予約[よやく]しておきます'], en: 'I’ll book a hotel before the trip.', bank: ['予約[よやく]してみます'], gap: { at: 6, wrong: ['予約[よやく]してみます', '予約[よやく]しません'] } },
      { tokens: ['パーティー', 'の', '前[まえ]', 'に', '飲[の]み物[もの]', 'を', '買[か]っておきます'], en: 'I’ll buy drinks before the party.', bank: ['買[か]ってみます'], gap: { at: 6, wrong: ['買[か]ってみます', '買[か]いません'] } },
      { tokens: ['授業[じゅぎょう]', 'の', '前[まえ]', 'に', '新[あたら]しい', '言葉[ことば]', 'を', '覚[おぼ]えておきます'], en: 'Before class I learn the new words.', bank: ['覚[おぼ]えてみます'], gap: { at: 7, wrong: ['覚[おぼ]えてみます', '覚[おぼ]えません'] } },
      { tokens: ['窓[まど]', 'を', '開[あ]けておいてください'], en: 'Please leave the window open.', bank: ['開[あ]けてみてください'], gap: { at: 2, wrong: ['開[あ]けてみてください', '開[あ]けましょう'] } },
      { tokens: ['お茶[ちゃ]', 'を', '冷蔵庫[れいぞうこ]', 'に', '入[い]れておきました'], en: 'I put the tea in the fridge (for later).', bank: ['入[い]れてみました'], gap: { at: 4, wrong: ['入[い]れてみました', '入[い]れませんでした'] } },
      { tokens: ['寝[ね]る', '前[まえ]', 'に', '明日[あした]', 'の', '服[ふく]', 'を', '準備[じゅんび]しておきます'], en: 'Before bed I get tomorrow’s clothes ready.', bank: ['準備[じゅんび]してみます'], gap: { at: 7, wrong: ['準備[じゅんび]してみます', '準備[じゅんび]しません'] } },
    ],
  },
  {
    title: '〜てしまう',
    explain: {
      title: '〜てしまう: “end up doing”, “do completely”',
      body: [
        'The て form + しまう often means something happened that you didn’t want: 財布を 忘れてしまいました = “I (went and) left my wallet behind”.',
        'It can also mean “finish completely”: もう 読んでしまいました = “I’ve already read it all”.',
        'In speech, てしまう often shortens to ちゃう: 寝ちゃった = “I fell asleep”.',
      ],
      examples: [1, 4],
    },
    sentences: [
      { tokens: ['宿題[しゅくだい]', 'を', '忘[わす]れてしまいました'], en: 'I (stupidly) forgot my homework.', bank: ['忘[わす]れておきました'], gap: { at: 2, wrong: ['忘[わす]れておきました', '忘[わす]れてみました'] } },
      { tokens: ['財布[さいふ]', 'を', '電車[でんしゃ]', 'に', '忘[わす]れてしまいました'], en: 'I left my wallet on the train.', bank: ['忘[わす]れてみました'], gap: { at: 4, wrong: ['忘[わす]れておきました', '忘[わす]れてみました'] } },
      { tokens: ['ケーキ', 'を', '全部[ぜんぶ]', '食[た]べてしまいました'], en: 'I ate the whole cake.', bank: ['食[た]べてみました'], gap: { at: 3, wrong: ['食[た]べてみました', '食[た]べておきました'] } },
      { tokens: ['電車[でんしゃ]', 'の', '中[なか]', 'で', '寝[ね]てしまいました'], en: 'I fell asleep on the train.', bank: ['寝[ね]てみました'], gap: { at: 4, wrong: ['寝[ね]てみました', '寝[ね]ておきました'] } },
      { tokens: ['この', '本[ほん]', 'は', 'もう', '読[よ]んでしまいました'], en: 'I’ve already finished reading this book.', bank: ['読[よ]んでみました'], gap: { at: 4, wrong: ['読[よ]んでみました', '読[よ]んでおきました'] } },
      { tokens: ['お金[かね]', 'を', '全部[ぜんぶ]', '使[つか]ってしまいました'], en: 'I spent all my money.', bank: ['使[つか]ってみました'], gap: { at: 3, wrong: ['使[つか]ってみました', '使[つか]っておきました'] } },
    ],
  },
  {
    title: 'あげる・くれる・もらう',
    explain: {
      title: 'Giving and receiving',
      body: [
        'あげる = give (from me, or to someone else): 友達に 本を あげました = “I gave my friend a book”.',
        'くれる = give to me (or my family): 友達が 花を くれました = “My friend gave me flowers”.',
        'もらう = receive: 母に 時計を もらいました = “I got a watch from my mother”. The giver takes に.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['わたし', 'は', '友達[ともだち]', 'に', '本[ほん]', 'を', 'あげました'], en: 'I gave my friend a book.', bank: ['くれました'], gap: { at: 6, wrong: ['くれました', 'もらいました'] } },
      { tokens: ['友達[ともだち]', 'が', 'わたし', 'に', '花[はな]', 'を', 'くれました'], en: 'My friend gave me flowers.', bank: ['あげました'], gap: { at: 6, wrong: ['あげました', 'もらいました'] } },
      { tokens: ['わたし', 'は', '母[はは]', 'に', '時計[とけい]', 'を', 'もらいました'], en: 'I got a watch from my mother.', bank: ['くれました'], gap: { at: 6, wrong: ['あげました', 'くれました'] } },
      { tokens: ['父[ちち]', 'が', 'わたし', 'に', '自転車[じてんしゃ]', 'を', 'くれました'], en: 'My father gave me a bicycle.', bank: ['あげました'], gap: { at: 6, wrong: ['あげました', 'もらいました'] } },
      { tokens: ['誕生日[たんじょうび]', 'に', '何[なに]', 'を', 'もらいました', 'か'], en: 'What did you get for your birthday?', bank: ['くれました'], gap: { at: 4, wrong: ['あげました', 'くれました'] } },
      { tokens: ['妹[いもうと]', 'に', 'お菓子[かし]', 'を', 'あげました'], en: 'I gave my little sister some sweets.', bank: ['くれました'], gap: { at: 4, wrong: ['くれました', 'もらいました'] } },
    ],
  },
  {
    title: '〜てあげる・てくれる・てもらう',
    explain: {
      title: 'Doing things for people',
      body: [
        'The て form + あげる / くれる / もらう = giving or receiving a favour, with the same directions as giving things.',
        '友達が 傘を 貸してくれました = “My friend (kindly) lent me an umbrella”. 先生に 見てもらいました = “I had my teacher look at it”.',
        'てくれませんか is a polite request: 待ってくれませんか = “Could you wait for me?”',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['友達[ともだち]', 'が', '傘[かさ]', 'を', '貸[か]してくれました'], en: 'My friend lent me an umbrella.', bank: ['貸[か]してあげました'], gap: { at: 4, wrong: ['貸[か]してあげました', '貸[か]してもらいました'] } },
      { tokens: ['わたし', 'は', '弟[おとうと]', 'に', '本[ほん]', 'を', '読[よ]んであげました'], en: 'I read a book to my little brother.', bank: ['読[よ]んでくれました'], gap: { at: 6, wrong: ['読[よ]んでくれました', '読[よ]んでもらいました'] } },
      { tokens: ['先生[せんせい]', 'に', '作文[さくぶん]', 'を', '見[み]てもらいました'], en: 'I had my teacher look at my essay.', bank: ['見[み]てくれました'], gap: { at: 4, wrong: ['見[み]てあげました', '見[み]てくれました'] } },
      { tokens: ['母[はは]', 'が', 'お弁当[べんとう]', 'を', '作[つく]ってくれました'], en: 'My mother made me a packed lunch.', bank: ['作[つく]ってあげました'], gap: { at: 4, wrong: ['作[つく]ってあげました', '作[つく]ってもらいました'] } },
      { tokens: ['ちょっと', '待[ま]ってくれません', 'か'], en: 'Could you wait a moment?', bank: ['待[ま]ってあげません'], gap: { at: 1, wrong: ['待[ま]ってあげません', '待[ま]ってもらいません'] } },
      { tokens: ['友達[ともだち]', 'に', '写真[しゃしん]', 'を', '撮[と]ってもらいました'], en: 'I had a friend take my photo.', bank: ['撮[と]ってくれました'], gap: { at: 4, wrong: ['撮[と]ってあげました', '撮[と]ってくれました'] } },
    ],
  },
  {
    title: '〜たら',
    explain: {
      title: '〜たら: “if”, “when”',
      body: [
        'Add ら to the plain past: 降った → 降ったら, 安かった → 安かったら, 暇だった → 暇だったら.',
        'It means “if” (雨が 降ったら 行きません = “If it rains, I won’t go”) or “when, once” (駅に 着いたら 電話をください = “Call me when you get to the station”).',
        'たら is the most widely used “if”; it works in almost every situation.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['雨[あめ]', 'が', '降[ふ]ったら', '行[い]きません'], en: 'If it rains, I won’t go.', bank: ['降[ふ]って'], gap: { at: 2, wrong: ['降[ふ]って', '降[ふ]る'] } },
      { tokens: ['駅[えき]', 'に', '着[つ]いたら', '電話[でんわ]', 'を', 'ください'], en: 'Please call me when you get to the station.', bank: ['着[つ]いて'], gap: { at: 2, wrong: ['着[つ]いて', '着[つ]く'] } },
      { tokens: ['お金[かね]', 'が', 'あったら', '車[くるま]', 'を', '買[か]いたい', 'です'], en: 'If I had money, I’d want to buy a car.', bank: ['あって'], gap: { at: 2, wrong: ['あって', 'ある'] } },
      { tokens: ['仕事[しごと]', 'が', '終[お]わったら', '飲[の]み', 'に', '行[い]きましょう'], en: 'When work is over, let’s go for a drink.', bank: ['終[お]わって'], gap: { at: 2, wrong: ['終[お]わって', '終[お]わる'] } },
      { tokens: ['安[やす]かったら', '買[か]います'], en: 'If it’s cheap, I’ll buy it.', bank: ['安[やす]くて'], gap: { at: 0, wrong: ['安[やす]くて', '安[やす]い'] } },
      { tokens: ['暇[ひま]', 'だったら', '遊[あそ]び', 'に', '来[き]てください'], en: 'If you’re free, come over.', bank: ['です'], gap: { at: 1, wrong: ['だ', 'です'] } },
    ],
  },
  {
    title: '〜ば',
    explain: {
      title: '〜ば: “if”',
      body: [
        'Verbs: change the ending to the え sound + ば: 走る → 走れば, 飲む → 飲めば, ある → あれば, する → すれば.',
        'い-adjectives: い → ければ: 安い → 安ければ. いい → よければ.',
        'ば stresses the condition: “if (and only if) you do this, then…”. どうすれば いいですか = “What should I do?”',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['天気[てんき]', 'が', 'よければ', '散歩[さんぽ]', 'に', '行[い]きます'], en: 'If the weather is good, I’ll go for a walk.', bank: ['よくて'], gap: { at: 2, wrong: ['よくて', 'いい'] } },
      { tokens: ['走[はし]れば', '電車[でんしゃ]', 'に', '乗[の]れます'], en: 'If you run, you can catch the train.', bank: ['走[はし]って'], gap: { at: 0, wrong: ['走[はし]って', '走[はし]る'] } },
      { tokens: ['この', '薬[くすり]', 'を', '飲[の]めば', 'よくなります'], en: 'If you take this medicine, you’ll get better.', bank: ['飲[の]んで'], gap: { at: 3, wrong: ['飲[の]んで', '飲[の]む'] } },
      { tokens: ['どう', 'すれば', 'いい', 'です', 'か'], en: 'What should I do?', bank: ['して'], gap: { at: 1, wrong: ['して', 'する'] } },
      { tokens: ['時間[じかん]', 'が', 'あれば', '行[い]きます'], en: 'If I have time, I’ll go.', bank: ['あって'], gap: { at: 2, wrong: ['あって', 'ある'] } },
      { tokens: ['練習[れんしゅう]', 'すれば', '上手[じょうず]', 'に', 'なります'], en: 'If you practise, you’ll get good at it.', bank: ['して'], gap: { at: 1, wrong: ['して', 'する'] } },
    ],
  },
  {
    title: '〜と: whenever',
    explain: {
      title: 'Dictionary form + と: “whenever”, “if… then always”',
      body: [
        'と after the dictionary form says that B always follows A: 春に なると 花が 咲きます = “When spring comes, the flowers bloom”.',
        'It is used for natural results, machines and directions: このボタンを 押すと ドアが 開きます.',
        'Don’t use と for requests or plans (“if it rains, let’s…”): use たら for those.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['春[はる]', 'に', 'なる', 'と', '花[はな]', 'が', '咲[さ]きます'], en: 'When spring comes, the flowers bloom.', bank: ['を'], gap: { at: 3, wrong: ['を', 'で'] } },
      { tokens: ['この', 'ボタン', 'を', '押[お]す', 'と', 'ドア', 'が', '開[あ]きます'], en: 'If you press this button, the door opens.', bank: ['で'], gap: { at: 4, wrong: ['を', 'で'] } },
      { tokens: ['右[みぎ]', 'に', '曲[ま]がる', 'と', '駅[えき]', 'が', 'あります'], en: 'Turn right and you’ll see the station.', bank: ['を'], gap: { at: 3, wrong: ['を', 'で'] } },
      { tokens: ['お酒[さけ]', 'を', '飲[の]む', 'と', '顔[かお]', 'が', '赤[あか]く', 'なります'], en: 'When I drink alcohol, my face goes red.', bank: ['で'], gap: { at: 3, wrong: ['を', 'で'] } },
      { tokens: ['冬[ふゆ]', 'に', 'なる', 'と', '寒[さむ]く', 'なります'], en: 'When winter comes, it gets cold.', bank: ['を'], gap: { at: 3, wrong: ['を', 'で'] } },
      { tokens: ['まっすぐ', '行[い]く', 'と', '右[みぎ]', 'に', '銀行[ぎんこう]', 'が', 'あります'], en: 'Go straight on and the bank is on the right.', bank: ['で'], gap: { at: 2, wrong: ['を', 'で'] } },
    ],
  },
  {
    title: '〜なら',
    explain: {
      title: '〜なら: “if it’s…”, “if you’re going to…”',
      body: [
        'なら picks up a topic or a plan and gives advice about it: すしなら あの店が おいしいです = “If it’s sushi you want, that restaurant is good”.',
        'It goes straight after nouns and the plain form of verbs and adjectives: 行くなら, 寒いなら.',
        '日本へ 行くなら = “if you’re going to Japan (before you go)”; 日本へ 行ったら = “once you’re in Japan”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['日本[にほん]', 'へ', '行[い]く', 'なら', '春[はる]', 'が', 'いい', 'です', 'よ'], en: 'If you’re going to Japan, spring is the best time.', bank: ['から'], gap: { at: 3, wrong: ['から', 'まで'] } },
      { tokens: ['すし', 'なら', 'あの', '店[みせ]', 'が', 'おいしい', 'です'], en: 'If it’s sushi you want, that restaurant is good.', bank: ['から'], gap: { at: 1, wrong: ['から', 'まで'] } },
      { tokens: ['車[くるま]', 'で', '行[い]く', 'なら', 'お酒[さけ]', 'は', '飲[の]まないでください'], en: 'If you’re driving, please don’t drink.', bank: ['から'], gap: { at: 3, wrong: ['から', 'まで'] } },
      { tokens: ['寒[さむ]い', 'なら', '窓[まど]', 'を', '閉[し]めましょう'], en: 'If you’re cold, let’s close the window.', bank: ['まで'], gap: { at: 1, wrong: ['から', 'まで'] } },
      { tokens: ['分[わ]からない', 'なら', '先生[せんせい]', 'に', '聞[き]いてください'], en: 'If you don’t understand, ask the teacher.', bank: ['まで'], gap: { at: 1, wrong: ['から', 'まで'] } },
      { tokens: ['買[か]い物[もの]', 'なら', '駅[えき]', 'の', '近[ちか]く', 'が', '便利[べんり]', 'です'], en: 'For shopping, near the station is convenient.', bank: ['まで'], gap: { at: 1, wrong: ['から', 'まで'] } },
    ],
  },
  {
    title: '〜そうです: looks like',
    explain: {
      title: '〜そうです: “looks like”, “seems about to”',
      body: [
        'い-adjectives drop い and add そう: おいしい → おいしそう = “looks delicious”. (いい → よさそう.)',
        'Verbs: the ます stem + そう = “looks like it’s about to”: 降ります → 降りそう. 雨が 降りそうです = “It looks like rain”.',
        'This そう is about what you see. Another そう (next lesson) is about what you hear.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['雨[あめ]', 'が', '降[ふ]りそう', 'です'], en: 'It looks like it’s going to rain.', bank: ['降[ふ]る'], gap: { at: 2, wrong: ['降[ふ]る', '降[ふ]った'] } },
      { tokens: ['この', 'ケーキ', 'は', 'おいしそう', 'です'], en: 'This cake looks delicious.', bank: ['おいしい'], gap: { at: 3, wrong: ['おいしい', 'おいしかった'] } },
      { tokens: ['この', '料理[りょうり]', 'は', '辛[から]そう', 'です'], en: 'This dish looks spicy.', bank: ['辛[から]い'], gap: { at: 3, wrong: ['辛[から]い', '辛[から]かった'] } },
      { tokens: ['子供[こども]', 'は', '楽[たの]しそう', 'です'], en: 'The children look like they’re having fun.', bank: ['楽[たの]しい'], gap: { at: 2, wrong: ['楽[たの]しい', '楽[たの]しかった'] } },
      { tokens: ['この', 'かばん', 'は', '高[たか]そう', 'です', 'ね'], en: 'This bag looks expensive, doesn’t it?', bank: ['高[たか]い'], gap: { at: 3, wrong: ['高[たか]い', '高[たか]かった'] } },
      { tokens: ['その', '荷物[にもつ]', 'は', '重[おも]そう', 'です'], en: 'That luggage looks heavy.', bank: ['重[おも]い'], gap: { at: 3, wrong: ['重[おも]い', '重[おも]かった'] } },
    ],
  },
  {
    title: '〜そうです: I hear',
    explain: {
      title: 'Plain form + そうです: “I hear that”',
      body: [
        'The plain form + そうです passes on something you heard or read: 明日は 雨だそうです = “I hear it will rain tomorrow”.',
        'Nouns and な-adjectives take だ: 雨だそうです, 静かだそうです. Verbs and い-adjectives go straight in: 帰るそうです, おいしいそうです.',
        'To say who said it, use と言っていました: 友達は 来ないと 言っていました = “My friend said they won’t come”.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['明日[あした]', 'は', '雨[あめ]', 'だ', 'そう', 'です'], en: 'I hear it will rain tomorrow.', bank: ['な'], gap: { at: 3, wrong: ['な', 'の'] } },
      { tokens: ['あの', '店[みせ]', 'は', 'とても', 'おいしい', 'そう', 'です'], en: 'I hear that restaurant is very good.', bank: ['だ'], gap: { at: 4, wrong: ['おいしく', 'おいしくて'] } },
      { tokens: ['先生[せんせい]', 'は', '来週[らいしゅう]', '国[くに]', 'へ', '帰[かえ]る', 'そう', 'です'], en: 'I hear the teacher is going back to their country next week.', bank: ['だ'], gap: { at: 5, wrong: ['帰[かえ]り', '帰[かえ]って'] } },
      { tokens: ['駅[えき]', 'の', '前[まえ]', 'に', '新[あたら]しい', 'ホテル', 'が', 'できた', 'そう', 'です'], en: 'I hear a new hotel has opened in front of the station.', bank: ['だ'], gap: { at: 7, wrong: ['でき', 'できて'] } },
      { tokens: ['友達[ともだち]', 'は', '明日[あした]', '来[こ]ない', 'と', '言[い]っていました'], en: 'My friend said they won’t come tomorrow.', bank: ['を'], gap: { at: 4, wrong: ['を', 'が'] } },
      { tokens: ['妹[いもうと]', 'は', '後[あと]', 'で', '行[い]く', 'と', '言[い]いました'], en: 'My little sister said she would go later.', bank: ['を'], gap: { at: 5, wrong: ['を', 'が'] } },
    ],
  },
  {
    title: 'ようです・みたい・らしい',
    explain: {
      title: '“It seems”: ようです, みたい, らしい',
      body: [
        'ようです = “it seems (from what I can tell)”: 風邪を 引いたようです = “I seem to have caught a cold”. After a noun: Nのようです.',
        'みたいです means the same and is more casual. It goes straight after nouns: 兄弟みたいです.',
        'らしいです = “apparently (I heard)”: あの店は 今日 休みらしいです.',
      ],
      examples: [1, 2],
    },
    sentences: [
      { tokens: ['誰[だれ]', 'も', 'いない', 'よう', 'です'], en: 'It seems nobody is here.', bank: ['みたい'], gap: { at: 2, wrong: ['いて', 'います'] } },
      { tokens: ['風邪[かぜ]', 'を', '引[ひ]いた', 'よう', 'です'], en: 'I seem to have caught a cold.', bank: ['が'], gap: { at: 1, wrong: ['が', 'に'] } },
      { tokens: ['外[そと]', 'は', '寒[さむ]い', 'みたい', 'です'], en: 'It seems cold outside.', bank: ['よう'], gap: { at: 2, wrong: ['寒[さむ]く', '寒[さむ]くて'] } },
      { tokens: ['あの', '二人[ふたり]', 'は', '兄弟[きょうだい]', 'みたい', 'です'], en: 'Those two seem like brothers.', bank: ['よう'], gap: { at: 4, wrong: ['よう', 'そう'] } },
      { tokens: ['彼[かれ]', 'は', '先生[せんせい]', 'らしい', 'です'], en: 'Apparently he is a teacher.', bank: ['みたい'], gap: { at: 3, wrong: ['よう', 'そう'] } },
      { tokens: ['あの', '店[みせ]', 'は', '今日[きょう]', '休[やす]み', 'らしい', 'です'], en: 'Apparently that shop is closed today.', bank: ['よう'], gap: { at: 5, wrong: ['よう', 'そう'] } },
    ],
  },
  {
    title: 'かもしれません',
    explain: {
      title: 'かもしれません: “might”',
      body: [
        'The plain form + かもしれません = “might”, “maybe”: 雪が 降るかもしれません = “It might snow”.',
        'Nouns and な-adjectives go straight in (no だ): 車の中かもしれません.',
        'It is less sure than でしょう (“probably”). Casually, かもしれない or just かも.',
      ],
      examples: [0, 5],
    },
    sentences: [
      { tokens: ['明日[あした]', 'は', '雪[ゆき]', 'が', '降[ふ]る', 'かもしれません'], en: 'It might snow tomorrow.', bank: ['降[ふ]って'], gap: { at: 4, wrong: ['降[ふ]って', '降[ふ]ります'] } },
      { tokens: ['彼[かれ]', 'は', '来[こ]ない', 'かもしれません'], en: 'He might not come.', bank: ['来[き]て'], gap: { at: 2, wrong: ['来[き]て', '来[き]ます'] } },
      { tokens: ['この', '答[こた]え', 'は', '違[ちが]う', 'かもしれません'], en: 'This answer might be wrong.', bank: ['を'], gap: { at: 3, wrong: ['違[ちが]って', '違[ちが]います'] } },
      { tokens: ['バス', 'は', 'もう', '出[で]た', 'かもしれません'], en: 'The bus might have left already.', bank: ['出[で]て'], gap: { at: 3, wrong: ['出[で]て', '出[で]ます'] } },
      { tokens: ['この', '本[ほん]', 'は', '子供[こども]', 'に', 'は', '難[むずか]しい', 'かもしれません'], en: 'This book might be difficult for children.', bank: ['を'], gap: { at: 6, wrong: ['難[むずか]しく', '難[むずか]しくて'] } },
      { tokens: ['財布[さいふ]', 'は', '車[くるま]', 'の', '中[なか]', 'かもしれません'], en: 'My wallet might be in the car.', bank: ['だ'], gap: { at: 3, wrong: ['を', 'が'] } },
    ],
  },
  {
    title: 'はずです',
    explain: {
      title: 'はずです: “should (by my reckoning)”',
      body: [
        'The plain form + はずです says what you expect, from what you know: 会議は 三時に 終わるはずです = “The meeting should end at three”.',
        'Nouns take の, な-adjectives take な: 休みのはずです, 静かなはずです.',
        'はずです is about expectation, not duty: for “must” use なければなりません.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['彼[かれ]', 'は', 'もう', '家[いえ]', 'に', '着[つ]いた', 'はず', 'です'], en: 'He should be home by now.', bank: ['着[つ]いて'], gap: { at: 5, wrong: ['着[つ]いて', '着[つ]きます'] } },
      { tokens: ['会議[かいぎ]', 'は', '三時[さんじ]', 'に', '終[お]わる', 'はず', 'です'], en: 'The meeting should end at three.', bank: ['終[お]わって'], gap: { at: 4, wrong: ['終[お]わって', '終[お]わります'] } },
      { tokens: ['この', '店[みせ]', 'は', '日曜日[にちようび]', 'も', '開[あ]いている', 'はず', 'です'], en: 'This shop should be open on Sundays too.', bank: ['を'], gap: { at: 5, wrong: ['開[あ]いて', '開[あ]きます'] } },
      { tokens: ['彼女[かのじょ]', 'は', 'この', 'こと', 'を', '知[し]っている', 'はず', 'です'], en: 'She should know about this.', bank: ['が'], gap: { at: 5, wrong: ['知[し]って', '知[し]ります'] } },
      { tokens: ['荷物[にもつ]', 'は', '明日[あした]', '着[つ]く', 'はず', 'です'], en: 'The parcel should arrive tomorrow.', bank: ['着[つ]いて'], gap: { at: 3, wrong: ['着[つ]いて', '着[つ]きます'] } },
      { tokens: ['ここ', 'に', '置[お]いた', 'はず', 'です', 'が', 'ありません'], en: 'I’m sure I put it here, but it isn’t here.', bank: ['を'], gap: { at: 2, wrong: ['置[お]いて', '置[お]きます'] } },
    ],
  },
  {
    title: 'Passive: 〜られる',
    explain: {
      title: 'The passive: “was done (by)”',
      body: [
        'Godan verbs: the あ sound + れる: 呼ぶ → 呼ばれる, 取る → 取られる. Ichidan: る → られる: 食べる → 食べられる. する → される, 来る → 来られる.',
        'The person who did it takes に: 先生に 名前を 呼ばれました = “My name was called by the teacher”.',
        'Japanese also uses the passive for things that happen to you and annoy you: 雨に 降られました = “I got rained on”.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['先生[せんせい]', 'に', '名前[なまえ]', 'を', '呼[よ]ばれました'], en: 'The teacher called my name.', bank: ['呼[よ]びました'], gap: { at: 4, wrong: ['呼[よ]びました', '呼[よ]ばせました'] } },
      { tokens: ['母[はは]', 'に', '手紙[てがみ]', 'を', '読[よ]まれました'], en: 'My mother read my letter (and I wish she hadn’t).', bank: ['読[よ]みました'], gap: { at: 4, wrong: ['読[よ]みました', '読[よ]ませました'] } },
      { tokens: ['電車[でんしゃ]', 'で', '財布[さいふ]', 'を', '取[と]られました'], en: 'My wallet was stolen on the train.', bank: ['取[と]りました'], gap: { at: 4, wrong: ['取[と]りました', '取[と]らせました'] } },
      { tokens: ['弟[おとうと]', 'に', 'ケーキ', 'を', '食[た]べられました'], en: 'My little brother ate my cake.', bank: ['食[た]べました'], gap: { at: 4, wrong: ['食[た]べました', '食[た]べさせました'] } },
      { tokens: ['雨[あめ]', 'に', '降[ふ]られました'], en: 'I got caught in the rain.', bank: ['降[ふ]りました'], gap: { at: 2, wrong: ['降[ふ]りました', '降[ふ]らせました'] } },
      { tokens: ['この', '本[ほん]', 'は', '多[おお]く', 'の', '人[ひと]', 'に', '読[よ]まれています'], en: 'This book is read by many people.', bank: ['読[よ]んでいます'], gap: { at: 7, wrong: ['読[よ]んでいます', '読[よ]ませています'] } },
    ],
  },
  {
    title: 'Causative: 〜させる',
    explain: {
      title: 'The causative: “make” or “let” someone do',
      body: [
        'Godan verbs: the あ sound + せる: 書く → 書かせる, 遊ぶ → 遊ばせる. Ichidan: る → させる: 食べる → 食べさせる. する → させる, 来る → 来させる.',
        'The person made to act takes に (or を with verbs that take no object): 子供に 野菜を 食べさせました, 子供を 遊ばせます.',
        'て-form + ください = “let me”: 考えさせてください = “Let me think about it”.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['母[はは]', 'は', 'わたし', 'に', '野菜[やさい]', 'を', '食[た]べさせました'], en: 'My mother made me eat vegetables.', bank: ['食[た]べられました'], gap: { at: 6, wrong: ['食[た]べられました', '食[た]べました'] } },
      { tokens: ['先生[せんせい]', 'は', '学生[がくせい]', 'に', '作文[さくぶん]', 'を', '書[か]かせました'], en: 'The teacher made the students write an essay.', bank: ['書[か]かれました'], gap: { at: 6, wrong: ['書[か]かれました', '書[か]きました'] } },
      { tokens: ['子供[こども]', 'を', '公園[こうえん]', 'で', '遊[あそ]ばせます'], en: 'I let the children play in the park.', bank: ['遊[あそ]ばれます'], gap: { at: 4, wrong: ['遊[あそ]ばれます', '遊[あそ]びます'] } },
      { tokens: ['ちょっと', '考[かんが]えさせてください'], en: 'Please let me think about it for a moment.', bank: ['考[かんが]えてください'], gap: { at: 1, wrong: ['考[かんが]えてください', '考[かんが]えられてください'] } },
      { tokens: ['父[ちち]', 'は', '弟[おとうと]', 'に', '車[くるま]', 'を', '洗[あら]わせました'], en: 'My father made my little brother wash the car.', bank: ['洗[あら]われました'], gap: { at: 6, wrong: ['洗[あら]われました', '洗[あら]いました'] } },
      { tokens: ['ここ', 'で', '少[すこ]し', '待[ま]たせてください'], en: 'Please let me wait here a little.', bank: ['待[ま]ってください'], gap: { at: 3, wrong: ['待[ま]ってください', '待[ま]たれてください'] } },
    ],
  },
  {
    title: '〜ながら',
    explain: {
      title: '〜ながら: “while doing”',
      body: [
        'The ます stem + ながら = doing two things at once: 聞きます → 聞きながら.',
        'The main action comes last: 音楽を 聞きながら 勉強します = “I study while listening to music”.',
        'Both actions must be done by the same person.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['音楽[おんがく]', 'を', '聞[き]きながら', '勉強[べんきょう]します'], en: 'I study while listening to music.', bank: ['聞[き]いて'], gap: { at: 2, wrong: ['聞[き]いて', '聞[き]く'] } },
      { tokens: ['テレビ', 'を', '見[み]ながら', 'ご飯[はん]', 'を', '食[た]べます'], en: 'I eat while watching TV.', bank: ['見[み]て'], gap: { at: 2, wrong: ['見[み]て', '見[み]る'] } },
      { tokens: ['歩[ある]きながら', '電話[でんわ]', 'を', 'しないでください'], en: 'Please don’t talk on the phone while walking.', bank: ['歩[ある]いて'], gap: { at: 0, wrong: ['歩[ある]いて', '歩[ある]く'] } },
      { tokens: ['コーヒー', 'を', '飲[の]みながら', '新聞[しんぶん]', 'を', '読[よ]みます'], en: 'I read the newspaper while drinking coffee.', bank: ['飲[の]んで'], gap: { at: 2, wrong: ['飲[の]んで', '飲[の]む'] } },
      { tokens: ['働[はたら]きながら', '大学[だいがく]', 'に', '通[かよ]っています'], en: 'I go to university while working.', bank: ['働[はたら]いて'], gap: { at: 0, wrong: ['働[はたら]いて', '働[はたら]く'] } },
      { tokens: ['歌[うた]', 'を', '歌[うた]いながら', '料理[りょうり]', 'を', '作[つく]ります'], en: 'I cook while singing.', bank: ['歌[うた]って'], gap: { at: 2, wrong: ['歌[うた]って', '歌[うた]う'] } },
    ],
  },
  {
    title: 'ので・のに',
    explain: {
      title: 'ので (“because”) and のに (“even though”)',
      body: [
        'ので gives a reason, more softly and politely than から: 頭が 痛いので 早く 帰ります.',
        'のに = “even though”, often with surprise or disappointment: たくさん 練習したのに 上手に なりません.',
        'Nouns and な-adjectives take な before both: 休みなので, 日曜日なのに.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['頭[あたま]', 'が', '痛[いた]い', 'ので', '早[はや]く', '帰[かえ]ります'], en: 'I have a headache, so I’ll go home early.', bank: ['のに'], gap: { at: 3, wrong: ['のに', 'けど'] } },
      { tokens: ['バス', 'が', '来[こ]なかった', 'ので', '遅[おく]れました'], en: 'The bus didn’t come, so I was late.', bank: ['のに'], gap: { at: 3, wrong: ['のに', 'けど'] } },
      { tokens: ['明日[あした]', 'は', '休[やす]み', 'な', 'ので', 'ゆっくり', '寝[ね]ます'], en: 'Tomorrow is a day off, so I’ll have a lie-in.', bank: ['のに'], gap: { at: 4, wrong: ['のに', 'けど'] } },
      { tokens: ['たくさん', '練習[れんしゅう]した', 'のに', '上手[じょうず]', 'に', 'なりません'], en: 'I practised a lot, but I’m not getting any better.', bank: ['ので'], gap: { at: 2, wrong: ['ので', 'から'] } },
      { tokens: ['約束[やくそく]', 'した', 'のに', '彼[かれ]', 'は', '来[き]ませんでした'], en: 'He didn’t come, even though he promised.', bank: ['ので'], gap: { at: 2, wrong: ['ので', 'から'] } },
      { tokens: ['日曜日[にちようび]', 'な', 'のに', '仕事[しごと]', 'が', 'あります'], en: 'It’s Sunday, but I have work.', bank: ['ので'], gap: { at: 2, wrong: ['ので', 'から'] } },
    ],
  },
  {
    title: 'すぎる・やすい・にくい',
    explain: {
      title: '“Too much”, “easy to”, “hard to”',
      body: [
        'すぎる = “too (much)”: the ます stem or an adjective without い/な + すぎる: 飲みすぎました, 大きすぎます, 静かすぎます.',
        'やすい = “easy to”: 書きやすい = “easy to write with”. にくい = “hard to”: 覚えにくい.',
        'やすい and にくい work like い-adjectives: 書きやすくない, 覚えにくかった.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['昨日[きのう]', 'は', '飲[の]みすぎました'], en: 'I drank too much yesterday.', bank: ['飲[の]みやすかった'], gap: { at: 2, wrong: ['飲[の]みました', '飲[の]みやすかった'] } },
      { tokens: ['この', 'かばん', 'は', '大[おお]きすぎます'], en: 'This bag is too big.', bank: ['大[おお]きい'], gap: { at: 3, wrong: ['大[おお]きい', '大[おお]きかった'] } },
      { tokens: ['この', 'ペン', 'は', '書[か]きやすい', 'です'], en: 'This pen is easy to write with.', bank: ['書[か]きにくい'], gap: { at: 3, wrong: ['書[か]きにくい', '書[か]きすぎ'] } },
      { tokens: ['この', '漢字[かんじ]', 'は', '覚[おぼ]えにくい', 'です'], en: 'This kanji is hard to remember.', bank: ['覚[おぼ]えやすい'], gap: { at: 3, wrong: ['覚[おぼ]えやすい', '覚[おぼ]えすぎ'] } },
      { tokens: ['この', '部屋[へや]', 'は', '静[しず]かすぎます'], en: 'This room is too quiet.', bank: ['静[しず]か'], gap: { at: 3, wrong: ['静[しず]かです', '静[しず]かでした'] } },
      { tokens: ['この', '靴[くつ]', 'は', '歩[ある]きやすい', 'です'], en: 'These shoes are easy to walk in.', bank: ['歩[ある]きにくい'], gap: { at: 3, wrong: ['歩[ある]きにくい', '歩[ある]きすぎ'] } },
    ],
  },
  {
    title: 'ように・ようになりました',
    explain: {
      title: 'ように: “so that”, and ようになる: “come to (be able to)”',
      body: [
        'The dictionary or ない form + ように = “so that”: 忘れないように ノートに 書きます = “I write it down so that I don’t forget”.',
        'ようにしています = “I make a point of”: 毎日 運動するようにしています.',
        'ようになりました = a change that happened over time: 日本語が 話せるようになりました = “I have become able to speak Japanese”.',
      ],
      examples: [1, 2],
    },
    sentences: [
      { tokens: ['毎日[まいにち]', '運動[うんどう]する', 'ように', 'しています'], en: 'I make a point of exercising every day.', bank: ['ので'], gap: { at: 1, wrong: ['運動[うんどう]して', '運動[うんどう]します'] } },
      { tokens: ['忘[わす]れない', 'ように', 'ノート', 'に', '書[か]きます'], en: 'I write it in my notebook so that I don’t forget.', bank: ['ので'], gap: { at: 0, wrong: ['忘[わす]れなくて', '忘[わす]れません'] } },
      { tokens: ['日本語[にほんご]', 'が', '話[はな]せる', 'ように', 'なりました'], en: 'I have become able to speak Japanese.', bank: ['話[はな]します'], gap: { at: 2, wrong: ['話[はな]す', '話[はな]した'] } },
      { tokens: ['最近[さいきん]', '漢字[かんじ]', 'が', '読[よ]める', 'ように', 'なりました'], en: 'Recently I have become able to read kanji.', bank: ['読[よ]む'], gap: { at: 3, wrong: ['読[よ]む', '読[よ]んだ'] } },
      { tokens: ['風邪[かぜ]', 'を', '引[ひ]かない', 'ように', '気[き]', 'を', 'つけてください'], en: 'Take care not to catch a cold.', bank: ['ので'], gap: { at: 2, wrong: ['引[ひ]いて', '引[ひ]きません'] } },
      { tokens: ['みんな', 'に', '聞[き]こえる', 'ように', '大[おお]きい', '声[こえ]', 'で', '話[はな]します'], en: 'I speak loudly so that everyone can hear.', bank: ['ので'], gap: { at: 2, wrong: ['聞[き]こえて', '聞[き]こえます'] } },
    ],
  },
  {
    title: 'ことにする・ことになる',
    explain: {
      title: 'ことにしました (“I decided”) and ことになりました (“it was decided”)',
      body: [
        'The dictionary form + ことにしました = “I decided to”: 毎朝 走ることにしました.',
        'ことになりました = “it has been decided (not by me alone)”: 来月 結婚することになりました.',
        'ことになっています = a rule or arrangement: この部屋では たばこを 吸わないことになっています.',
      ],
      examples: [1, 2],
    },
    sentences: [
      { tokens: ['来年[らいねん]', 'から', '日本[にほん]', 'に', '住[す]む', 'こと', 'に', 'しました'], en: 'I’ve decided to live in Japan from next year.', bank: ['なりました'], gap: { at: 7, wrong: ['なりました', 'ありました'] } },
      { tokens: ['毎朝[まいあさ]', '走[はし]る', 'こと', 'に', 'しました'], en: 'I’ve decided to run every morning.', bank: ['なりました'], gap: { at: 4, wrong: ['なりました', 'ありました'] } },
      { tokens: ['来月[らいげつ]', '結婚[けっこん]する', 'こと', 'に', 'なりました'], en: 'It’s been arranged that I’ll get married next month.', bank: ['しました'], gap: { at: 4, wrong: ['しました', 'ありました'] } },
      { tokens: ['お酒[さけ]', 'を', 'やめる', 'こと', 'に', 'しました'], en: 'I’ve decided to give up alcohol.', bank: ['なりました'], gap: { at: 5, wrong: ['なりました', 'ありました'] } },
      { tokens: ['会議[かいぎ]', 'は', '金曜日[きんようび]', 'に', 'する', 'こと', 'に', 'なりました'], en: 'It’s been decided to hold the meeting on Friday.', bank: ['しました'], gap: { at: 7, wrong: ['しました', 'ありました'] } },
      { tokens: ['この', '部屋[へや]', 'で', 'は', 'たばこ', 'を', '吸[す]わない', 'こと', 'に', 'なっています'], en: 'The rule is that you don’t smoke in this room.', bank: ['しています'], gap: { at: 9, wrong: ['しています', 'あります'] } },
    ],
  },
  {
    title: 'とき',
    explain: {
      title: '〜とき: “when”',
      body: [
        'とき (時) = “the time when”. Put a noun + の, a な-adjective + な, or a plain verb or い-adjective in front: 子供のとき, 暇なとき, 寝るとき, 若いとき.',
        'The verb tense matters: 日本へ 行くとき = on the way to Japan; 日本へ 行ったとき = once there.',
        'Add は or に as needed: 若いときは よく 旅行しました.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['子供[こども]', 'の', 'とき', 'よく', 'この', '公園[こうえん]', 'で', '遊[あそ]びました'], en: 'When I was a child, I often played in this park.', bank: ['な'], gap: { at: 1, wrong: ['な', 'に'] } },
      { tokens: ['暇[ひま]', 'な', 'とき', '何[なに]', 'を', 'します', 'か'], en: 'What do you do when you’re free?', bank: ['の'], gap: { at: 1, wrong: ['の', 'に'] } },
      { tokens: ['寝[ね]る', 'とき', '電気[でんき]', 'を', '消[け]します'], en: 'I turn off the light when I go to bed.', bank: ['寝[ね]た'], gap: { at: 0, wrong: ['寝[ね]て', '寝[ね]ます'] } },
      { tokens: ['日本[にほん]', 'へ', '行[い]った', 'とき', 'カメラ', 'を', '買[か]いました'], en: 'When I went to Japan, I bought a camera.', bank: ['行[い]く'], gap: { at: 2, wrong: ['行[い]く', '行[い]って'] } },
      { tokens: ['道[みち]', 'を', '渡[わた]る', 'とき', '車[くるま]', 'に', '気[き]', 'を', 'つけてください'], en: 'Watch out for cars when you cross the road.', bank: ['渡[わた]った'], gap: { at: 2, wrong: ['渡[わた]って', '渡[わた]ります'] } },
      { tokens: ['若[わか]い', 'とき', 'は', 'よく', '旅行[りょこう]しました'], en: 'When I was young I travelled a lot.', bank: ['な'], gap: { at: 0, wrong: ['若[わか]く', '若[わか]くて'] } },
    ],
  },
  {
    title: 'か・かどうか',
    explain: {
      title: 'Questions inside sentences: 〜か, 〜かどうか',
      body: [
        'A question word + plain form + か puts a question inside a sentence: 駅は どこに あるか 知っていますか = “Do you know where the station is?”',
        'For yes/no questions, use かどうか (“whether or not”): 雨が 降るかどうか 分かりません.',
        'Nouns and な-adjectives drop だ before か: 正しいかどうか, 本当かどうか.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['明日[あした]', '雨[あめ]', 'が', '降[ふ]る', 'か', 'どう', 'か', '分[わ]かりません'], en: 'I don’t know whether it will rain tomorrow.', bank: ['も'], gap: { at: 4, wrong: ['が', 'を'] } },
      { tokens: ['彼[かれ]', 'が', '来[く]る', 'か', 'どう', 'か', '聞[き]いてください'], en: 'Please ask whether he is coming.', bank: ['も'], gap: { at: 3, wrong: ['が', 'を'] } },
      { tokens: ['駅[えき]', 'は', 'どこ', 'に', 'ある', 'か', '知[し]っています', 'か'], en: 'Do you know where the station is?', bank: ['が'], gap: { at: 5, wrong: ['が', 'を'] } },
      { tokens: ['何[なに]', 'を', '買[か]う', 'か', '決[き]めました', 'か'], en: 'Have you decided what to buy?', bank: ['が'], gap: { at: 3, wrong: ['が', 'を'] } },
      { tokens: ['この', '言葉[ことば]', 'が', '正[ただ]しい', 'か', 'どう', 'か', '調[しら]べます'], en: 'I’ll check whether this word is correct.', bank: ['を'], gap: { at: 4, wrong: ['が', 'を'] } },
      { tokens: ['いつ', '出発[しゅっぱつ]する', 'か', '教[おし]えてください'], en: 'Please tell me when you are leaving.', bank: ['が'], gap: { at: 2, wrong: ['が', 'を'] } },
    ],
  },
  {
    title: 'Polite speech: いらっしゃる, 参る',
    explain: {
      title: 'Honorific and humble verbs (敬語)',
      body: [
        'Honorific verbs raise the other person: いらっしゃる (= いる, 行く, 来る), 召し上がる (= 食べる, 飲む). 先生は いらっしゃいますか.',
        'Humble verbs lower yourself: 参る (= 行く, 来る), おる (= いる), いただく (= もらう, 食べる), 差し上げる (= あげる).',
        'You will hear these in shops, at work and on announcements; at N4 it is enough to recognise them.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['先生[せんせい]', 'は', 'いらっしゃいます', 'か'], en: 'Is the teacher in?', bank: ['参[まい]ります'], gap: { at: 2, wrong: ['参[まい]ります', 'おります'] } },
      { tokens: ['何[なに]', 'を', '召[め]し上[あ]がります', 'か'], en: 'What would you like to eat?', bank: ['いただきます'], gap: { at: 2, wrong: ['いただきます', '参[まい]ります'] } },
      { tokens: ['明日[あした]', 'また', '参[まい]ります'], en: 'I will come again tomorrow (humble).', bank: ['いらっしゃいます'], gap: { at: 2, wrong: ['いらっしゃいます', '召[め]し上[あ]がります'] } },
      { tokens: ['先生[せんせい]', 'に', '本[ほん]', 'を', 'いただきました'], en: 'I received a book from my teacher (humble).', bank: ['差[さ]し上[あ]げました'], gap: { at: 4, wrong: ['差[さ]し上[あ]げました', 'くれました'] } },
      { tokens: ['先生[せんせい]', 'に', 'お土産[みやげ]', 'を', '差[さ]し上[あ]げました'], en: 'I gave my teacher a souvenir (humble).', bank: ['いただきました'], gap: { at: 4, wrong: ['いただきました', 'もらいました'] } },
      { tokens: ['父[ちち]', 'は', '今[いま]', '家[いえ]', 'に', 'おります'], en: 'My father is at home now (humble).', bank: ['いらっしゃいます'], gap: { at: 5, wrong: ['いらっしゃいます', '参[まい]ります'] } },
    ],
  },
]
