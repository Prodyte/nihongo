// N2 grammar: lessons of six sentences, written for this app like the N5-N3 ones. Sentences lean on N5-N3 words so each
// lesson can come early in the N2 section (course.ts places it after its words; tests check every word is taught).
// Tests check words, spelling and structure; they can't judge the explanations, so skim those.
import type { GrammarLessonSpec } from './grammar'

export const N2_GRAMMAR: GrammarLessonSpec[] = [
  {
    title: '〜に違いない',
    explain: {
      title: 'に違いない: “must be”, “I’m sure”',
      body: [
        'Plain form + に違いない = “must be”, “there’s no doubt”: 彼は疲れているに違いない = “he must be tired”.',
        'Nouns and な-adjectives join without だ: あの人は先生に違いない = “that person must be a teacher”.',
        'It is a confident guess from what you see or know, stronger than でしょう. The polite form is に違いありません.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['彼[かれ]', 'は', '疲[つか]れて', 'いる', 'に', '違[ちが]いない'], en: 'He must be tired.', bank: ['を'], gap: { at: 5, wrong: ['違[ちが]う', '違[ちが]った'] } },
      { tokens: ['あの', '店[みせ]', 'は', '高[たか]い', 'に', '違[ちが]いない'], en: 'That shop must be expensive.', bank: ['で'], gap: { at: 5, wrong: ['違[ちが]う', '違[ちが]った'] } },
      { tokens: ['この', '字[じ]', 'は', '母[はは]', 'の', '字[じ]', 'に', '違[ちが]いない'], en: 'This must be my mother’s handwriting.', bank: ['が'], gap: { at: 7, wrong: ['違[ちが]う', '違[ちが]った'] } },
      { tokens: ['電気[でんき]', 'が', 'ついて', 'いる', 'から', '誰[だれ]', 'か', 'いる', 'に', '違[ちが]いない'], en: 'The light is on, so someone must be in.', bank: ['を'], gap: { at: 9, wrong: ['違[ちが]う', '違[ちが]った'] } },
      { tokens: ['彼女[かのじょ]', 'は', 'もう', '家[いえ]', 'に', '着[つ]いた', 'に', '違[ちが]いありません'], en: 'She must have got home by now.', bank: ['を'], gap: { at: 7, wrong: ['違[ちが]います', '違[ちが]いました'] } },
      { tokens: ['あの', '人[ひと]', 'は', '先生[せんせい]', 'に', '違[ちが]いない'], en: 'That person must be a teacher.', bank: ['を'], gap: { at: 5, wrong: ['違[ちが]う', '違[ちが]った'] } },
    ],
  },
  {
    title: '〜わけにはいかない',
    explain: {
      title: 'わけにはいかない: “can’t very well”',
      body: [
        'Dictionary form + わけにはいかない = “I can’t (very well) do it”, because of a duty, a reason or what people would think.',
        'It is not about ability: 休むわけにはいきません = “I can’t take the day off” (I could, but it wouldn’t be right).',
        'With the ない form it means “have to”: 行かないわけにはいかない = “I can’t not go”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['明日[あした]', 'は', '試験[しけん]', 'だ', 'から', '休[やす]む', 'わけ', 'に', 'は', 'いかない'], en: 'There’s an exam tomorrow, so I can’t take the day off.', bank: ['はず'], gap: { at: 6, wrong: ['はず', 'ところ'] } },
      { tokens: ['大切[たいせつ]', 'な', '会議[かいぎ]', 'な', 'ので', '遅[おく]れる', 'わけ', 'に', 'は', 'いきません'], en: 'It’s an important meeting, so I can’t be late.', bank: ['はず'], gap: { at: 6, wrong: ['はず', 'ところ'] } },
      { tokens: ['約束[やくそく]した', 'から', '行[い]かない', 'わけ', 'に', 'は', 'いかない'], en: 'I promised, so I can’t not go.', bank: ['はず'], gap: { at: 3, wrong: ['はず', 'ところ'] } },
      { tokens: ['車[くるま]', 'で', '来[き]た', 'から', 'お酒[さけ]', 'を', '飲[の]む', 'わけ', 'に', 'は', 'いかない'], en: 'I came by car, so I can’t drink.', bank: ['はず'], gap: { at: 7, wrong: ['はず', 'ところ'] } },
      { tokens: ['友達[ともだち]', 'の', '秘密[ひみつ]', 'だ', 'から', '話[はな]す', 'わけ', 'に', 'は', 'いかない'], en: 'It’s my friend’s secret, so I can’t tell anyone.', bank: ['はず'], gap: { at: 6, wrong: ['はず', 'ところ'] } },
      { tokens: ['みんな', 'が', '待[ま]って', 'いる', 'から', '帰[かえ]る', 'わけ', 'に', 'は', 'いきません'], en: 'Everyone is waiting, so I can’t go home.', bank: ['はず'], gap: { at: 6, wrong: ['はず', 'ところ'] } },
    ],
  },
  {
    title: '〜ざるを得ない',
    explain: {
      title: 'ざるを得ない: “have no choice but to”',
      body: [
        'The ない form without ない + ざるを得ない = “have no choice but to”, “can’t help doing”: 行かざるを得ない = “I have no choice but to go”.',
        'Make it like ずに: 行かない → 行かざる, 言わない → 言わざる, やめない → やめざる. する becomes せざる: 中止せざるを得ない.',
        'It sounds formal and a little reluctant: you would rather not, but there is no other way.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['雨[あめ]', 'が', '強[つよ]い', 'ので', '試合[しあい]', 'は', '中止[ちゅうし]せざる', 'を', '得[え]ない'], en: 'The rain is heavy, so we have no choice but to call off the match.', bank: ['で'], gap: { at: 6, wrong: ['中止[ちゅうし]しない', '中止[ちゅうし]して'] } },
      { tokens: ['熱[ねつ]', 'が', 'ある', 'ので', '会社[かいしゃ]', 'を', '休[やす]まざる', 'を', '得[え]ない'], en: 'I have a fever, so I have no choice but to stay off work.', bank: ['で'], gap: { at: 6, wrong: ['休[やす]まない', '休[やす]んで'] } },
      { tokens: ['先生[せんせい]', 'に', '言[い]われたら', 'やらざる', 'を', '得[え]ない'], en: 'If the teacher tells me to, I have to do it.', bank: ['が'], gap: { at: 3, wrong: ['やらない', 'やって'] } },
      { tokens: ['お金[かね]', 'が', 'ない', 'から', '旅行[りょこう]', 'を', 'やめざる', 'を', '得[え]ない'], en: 'I have no money, so I have no choice but to give up the trip.', bank: ['に'], gap: { at: 6, wrong: ['やめない', 'やめて'] } },
      { tokens: ['この', '問題[もんだい]', 'は', '難[むずか]しい', 'と', '言[い]わざる', 'を', '得[え]ない'], en: 'I have to say this problem is difficult.', bank: ['が'], gap: { at: 5, wrong: ['言[い]わない', '言[い]って'] } },
      { tokens: ['電車[でんしゃ]', 'が', '止[と]まった', 'ので', '歩[ある]いて', '帰[かえ]らざる', 'を', '得[え]なかった'], en: 'The trains stopped, so I had no choice but to walk home.', bank: ['で'], gap: { at: 5, wrong: ['帰[かえ]らない', '帰[かえ]って'] } },
    ],
  },
  {
    title: '〜っぽい',
    explain: {
      title: 'っぽい: “-ish”, “tends to”',
      body: [
        'Noun + っぽい = “-ish”, “like”: 子供っぽい = “childish”, 白っぽい = “whitish”, 風邪っぽい = “like I’m getting a cold”.',
        'The ます stem + っぽい = “tends to”: 忘れっぽい = “forgetful”, 怒りっぽい = “quick to anger”.',
        'It is casual and often a little negative. It works like an い-adjective: 子供っぽくない = “not childish”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['弟[おとうと]', 'は', 'まだ', '子供[こども]', 'っぽい', 'です'], en: 'My younger brother is still childish.', bank: ['が'], gap: { at: 4, wrong: ['がち', 'まま'] } },
      { tokens: ['最近[さいきん]', '父[ちち]', 'は', '忘[わす]れ', 'っぽい', 'です'], en: 'My father has been forgetful lately.', bank: ['を'], gap: { at: 4, wrong: ['まま', 'ほど'] } },
      { tokens: ['白[しろ]', 'っぽい', '服[ふく]', 'を', '着[き]て', 'います'], en: 'He’s wearing whitish clothes.', bank: ['が'], gap: { at: 1, wrong: ['がち', 'まま'] } },
      { tokens: ['彼女[かのじょ]', 'は', '男[おとこ]', 'っぽい', '服[ふく]', 'が', '好[す]き', 'です'], en: 'She likes masculine clothes.', bank: ['を'], gap: { at: 3, wrong: ['まま', 'ほど'] } },
      { tokens: ['その', '話[はなし]', 'は', '嘘[うそ]', 'っぽい'], en: 'That story sounds like a lie.', bank: ['を'], gap: { at: 4, wrong: ['がち', 'まま'] } },
      { tokens: ['今日[きょう]', 'は', '風邪[かぜ]', 'っぽい', 'ので', '早[はや]く', '寝[ね]ます'], en: 'I feel like I’m getting a cold today, so I’ll go to bed early.', bank: ['が'], gap: { at: 3, wrong: ['がち', 'まま'] } },
    ],
  },
  {
    title: '〜がち',
    explain: {
      title: 'がち: “tend to”, “prone to”',
      body: [
        'The ます stem + がち = “tend to”, usually about something bad: 忘れがち = “apt to forget”, 遅れがち = “often late”.',
        'Noun + がち = “often has”: 病気がち = “often ill”, 曇りがち = “mostly cloudy”.',
        'It works like a な-adjective: 休みがちな学生 = “a student who is often absent”. Before a noun you also hear がちの: 曇りがちの天気.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['忙[いそが]しい', 'と', '昼[ひる]ご飯[はん]', 'を', '食[た]べる', 'の', 'を', '忘[わす]れ', 'がち', 'です'], en: 'When I’m busy, I tend to forget to eat lunch.', bank: ['が'], gap: { at: 8, wrong: ['ばかり', 'ほど'] } },
      { tokens: ['この', '電車[でんしゃ]', 'は', '遅[おく]れ', 'がち', 'です'], en: 'This train is often late.', bank: ['を'], gap: { at: 4, wrong: ['ばかり', 'ほど'] } },
      { tokens: ['祖父[そふ]', 'は', '病気[びょうき]', 'がち', 'です'], en: 'My grandfather is often ill.', bank: ['を'], gap: { at: 3, wrong: ['まま', 'ほど'] } },
      { tokens: ['今週[こんしゅう]', 'は', '曇[くも]り', 'がち', 'の', '天気[てんき]', 'が', '続[つづ]きます'], en: 'This week the weather will stay mostly cloudy.', bank: ['を'], gap: { at: 3, wrong: ['まま', 'ほど'] } },
      { tokens: ['彼[かれ]', 'は', '最近[さいきん]', '学校[がっこう]', 'を', '休[やす]み', 'がち', 'です'], en: 'He has been missing school a lot lately.', bank: ['が'], gap: { at: 6, wrong: ['まま', 'ほど'] } },
      { tokens: ['一人[ひとり]', 'で', '住[す]んで', 'いる', 'と', '野菜[やさい]', 'が', '足[た]りなく', 'なり', 'がち', 'です'], en: 'When you live alone, you tend not to get enough vegetables.', bank: ['を'], gap: { at: 9, wrong: ['ばかり', 'ほど'] } },
    ],
  },
  {
    title: '〜気味',
    explain: {
      title: '気味 (ぎみ): “a bit”, “a touch of”',
      body: [
        'The ます stem or a noun + 気味 (read ぎみ here) = “slightly”, “a touch of”: 疲れ気味 = “a bit tired”, 風邪気味 = “a touch of a cold”.',
        'It describes how someone feels or how things are going, usually a little bad: 太り気味 = “putting on weight”.',
        'がち is about how often; 気味 is a slight state right now: 遅れがち (often late) vs 遅れ気味 (running a bit late).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['最近[さいきん]', '少[すこ]し', '疲[つか]れ', '気味[ぎみ]', 'です'], en: 'I’ve been a bit tired lately.', bank: ['が'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['風邪[かぜ]', '気味[ぎみ]', 'な', 'ので', '今日[きょう]', 'は', '早[はや]く', '帰[かえ]ります'], en: 'I have a touch of a cold, so I’m going home early today.', bank: ['の'], gap: { at: 1, wrong: ['ばかり', 'まま'] } },
      { tokens: ['冬[ふゆ]', 'は', 'いつも', '太[ふと]り', '気味[ぎみ]', 'に', 'なります'], en: 'I always put on a bit of weight in winter.', bank: ['を'], gap: { at: 4, wrong: ['ばかり', 'まま'] } },
      { tokens: ['工事[こうじ]', 'は', '少[すこ]し', '遅[おく]れ', '気味[ぎみ]', 'です'], en: 'The construction work is running a little behind.', bank: ['を'], gap: { at: 4, wrong: ['ばかり', 'まま'] } },
      { tokens: ['彼[かれ]', 'は', '緊張[きんちょう]', '気味[ぎみ]', 'に', '話[はな]して', 'いた'], en: 'He was speaking a little nervously.', bank: ['を'], gap: { at: 3, wrong: ['ばかり', 'まま'] } },
      { tokens: ['この', '時計[とけい]', 'は', '最近[さいきん]', '遅[おく]れ', '気味[ぎみ]', 'です'], en: 'This clock has been running a little slow lately.', bank: ['が'], gap: { at: 5, wrong: ['ばかり', 'まま'] } },
    ],
  },
  {
    title: '〜から〜にかけて',
    explain: {
      title: 'から〜にかけて: “from … through …”',
      body: [
        'A から B にかけて = “from A through B”, for a stretch of time or space whose edges are not sharp: 夜から朝にかけて = “overnight into the morning”.',
        'から〜まで marks an exact start and end; にかけて is looser: “over that period”, “across that area”.',
        'It is common in weather forecasts and the news: 夜から朝にかけて 雨が降ります.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['夜[よる]', 'から', '朝[あさ]', 'に', 'かけて', '雨[あめ]', 'が', '降[ふ]ります'], en: 'It will rain overnight into the morning.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
      { tokens: ['春[はる]', 'から', '夏[なつ]', 'に', 'かけて', 'いろいろ', 'な', '花[はな]', 'が', '咲[さ]きます'], en: 'All kinds of flowers bloom from spring into summer.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
      { tokens: ['駅[えき]', 'から', '公園[こうえん]', 'に', 'かけて', '店[みせ]', 'が', '並[なら]んで', 'います'], en: 'Shops line the way from the station to the park.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
      { tokens: ['月曜日[げつようび]', 'から', '水曜日[すいようび]', 'に', 'かけて', '雨[あめ]', 'が', '続[つづ]きます'], en: 'It will keep raining from Monday through Wednesday.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
      { tokens: ['昨日[きのう]', 'の', '夜[よる]', 'から', '今朝[けさ]', 'に', 'かけて', '雪[ゆき]', 'が', '降[ふ]りました'], en: 'It snowed from last night through this morning.', bank: ['を'], gap: { at: 6, wrong: ['とって', 'ついて'] } },
      { tokens: ['夏[なつ]', 'から', '秋[あき]', 'に', 'かけて', '台風[たいふう]', 'が', '多[おお]く', 'なります'], en: 'Typhoons become frequent from summer into autumn.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
    ],
  },
  {
    title: '〜に沿って',
    explain: {
      title: 'に沿って: “along”, “in line with”',
      body: [
        'Noun + に沿って = “along”: 川に沿って歩く = “walk along the river”.',
        'It also means “in line with” a plan, a wish or a rule: 予定に沿って進める = “go ahead as planned”.',
        'Before a noun it becomes に沿った: 希望に沿った部屋 = “a room that matches your wishes”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['川[かわ]', 'に', '沿[そ]って', '歩[ある]きました'], en: 'I walked along the river.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['道[みち]', 'に', '沿[そ]って', '桜[さくら]', 'の', '木[き]', 'が', '並[なら]んで', 'います'], en: 'Cherry trees line the road.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['予定[よてい]', 'に', '沿[そ]って', '仕事[しごと]', 'を', '進[すす]めます'], en: 'We’ll carry on with the work as planned.', bank: ['が'], gap: { at: 2, wrong: ['とって', 'かけて'] } },
      { tokens: ['海[うみ]', 'に', '沿[そ]って', '電車[でんしゃ]', 'が', '走[はし]って', 'います'], en: 'The train runs along the coast.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['ルール', 'に', '沿[そ]って', '試合[しあい]', 'を', 'します'], en: 'We play the match by the rules.', bank: ['が'], gap: { at: 2, wrong: ['とって', 'かけて'] } },
      { tokens: ['客[きゃく]', 'の', '希望[きぼう]', 'に', '沿[そ]った', '部屋[へや]', 'を', '探[さが]します'], en: 'We look for a room that matches the guest’s wishes.', bank: ['が'], gap: { at: 4, wrong: ['とった', 'かけた'] } },
    ],
  },
  {
    title: '〜に基づいて',
    explain: {
      title: 'に基づいて: “based on”',
      body: [
        'Noun + に基づいて = “based on”, “on the basis of”: データに基づいて説明します = “I’ll explain based on the data”.',
        'Use it for facts, rules, data or records that something rests on. It is a little formal.',
        'Before a noun it becomes に基づいた: 事実に基づいた話 = “a story based on fact”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['調査[ちょうさ]', 'の', '結果[けっか]', 'に', '基[もと]づいて', '値段[ねだん]', 'を', '決[き]めました'], en: 'We set the price based on the results of the survey.', bank: ['が'], gap: { at: 4, wrong: ['とって', 'かけて'] } },
      { tokens: ['この', '映画[えいが]', 'は', '事実[じじつ]', 'に', '基[もと]づいた', '話[はなし]', 'です'], en: 'This film is a story based on fact.', bank: ['を'], gap: { at: 5, wrong: ['とった', 'かけた'] } },
      { tokens: ['法律[ほうりつ]', 'に', '基[もと]づいて', '判断[はんだん]します'], en: 'We make the decision according to the law.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'かけて'] } },
      { tokens: ['この', '本[ほん]', 'は', '本当[ほんとう]', 'に', 'あった', '話[はなし]', 'に', '基[もと]づいて', 'います'], en: 'This book is based on a true story.', bank: ['を'], gap: { at: 8, wrong: ['とって', 'かけて'] } },
      { tokens: ['規則[きそく]', 'に', '基[もと]づいて', '料金[りょうきん]', 'を', '決[き]めます'], en: 'The charges are set according to the rules.', bank: ['が'], gap: { at: 2, wrong: ['とって', 'かけて'] } },
      { tokens: ['データ', 'に', '基[もと]づいて', '説明[せつめい]します'], en: 'I’ll explain based on the data.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'かけて'] } },
    ],
  },
  {
    title: '〜をめぐって',
    explain: {
      title: 'をめぐって: “over”, “concerning”',
      body: [
        'Noun + をめぐって = “over”, “concerning”: an issue people argue, compete or debate about.',
        'It goes with words like 意見 (opinion), 議論 (debate) and 争う (fight): 新しい駅をめぐって 意見が分かれました.',
        'Before a noun it becomes をめぐる: お金をめぐる問題 = “problems over money”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['新[あたら]しい', '駅[えき]', 'を', 'めぐって', '意見[いけん]', 'が', '分[わ]かれました'], en: 'Opinions were divided over the new station.', bank: ['に'], gap: { at: 3, wrong: ['ついて', 'よって'] } },
      { tokens: ['お金[かね]', 'を', 'めぐって', '兄弟[きょうだい]', 'が', '争[あらそ]いました'], en: 'The brothers fought over money.', bank: ['に'], gap: { at: 2, wrong: ['ついて', 'よって'] } },
      { tokens: ['この', '問題[もんだい]', 'を', 'めぐって', '会議[かいぎ]', 'で', '議論[ぎろん]しました'], en: 'We debated the issue at the meeting.', bank: ['に'], gap: { at: 3, wrong: ['ついて', 'よって'] } },
      { tokens: ['税金[ぜいきん]', 'を', 'めぐって', '国会[こっかい]', 'で', '議論[ぎろん]', 'が', '続[つづ]いて', 'います'], en: 'The debate over taxes continues in parliament.', bank: ['に'], gap: { at: 2, wrong: ['ついて', 'よって'] } },
      { tokens: ['一人[ひとり]', 'の', '女性[じょせい]', 'を', 'めぐって', '二人[ふたり]', 'の', '男[おとこ]', 'が', '争[あらそ]った'], en: 'Two men fought over one woman.', bank: ['に'], gap: { at: 4, wrong: ['ついて', 'よって'] } },
      { tokens: ['お金[かね]', 'を', 'めぐる', '問題[もんだい]', 'は', '難[むずか]しい'], en: 'Problems over money are hard to deal with.', bank: ['に'], gap: { at: 2, wrong: ['ついた', 'よった'] } },
    ],
  },
  {
    title: '〜にしては',
    explain: {
      title: 'にしては: “for”, “considering”',
      body: [
        'X にしては = “for an X”, “considering it’s X”: the result is not what you would expect from X.',
        '子供にしては 絵が上手です = “he draws well for a child”. Verbs come in the plain form: 初めて作ったにしては おいしい.',
        'It is often praise with a note of surprise, but it can also be a complaint: 春にしては寒い = “it’s cold for spring”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['子供[こども]', 'に', 'しては', '絵[え]', 'が', '上手[じょうず]', 'です'], en: 'He draws well for a child.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['初[はじ]めて', '作[つく]った', 'に', 'しては', 'おいしい', 'です'], en: 'It’s tasty for a first attempt.', bank: ['を'], gap: { at: 3, wrong: ['とって', 'よって'] } },
      { tokens: ['外国人[がいこくじん]', 'に', 'しては', '日本語[にほんご]', 'が', 'うまい'], en: 'His Japanese is good for a foreigner.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['この', 'ホテル', 'は', '駅[えき]', 'の', '近[ちか]く', 'に', 'しては', '安[やす]い'], en: 'This hotel is cheap for being so near the station.', bank: ['を'], gap: { at: 7, wrong: ['とって', 'よって'] } },
      { tokens: ['今日[きょう]', 'は', '春[はる]', 'に', 'しては', '寒[さむ]い'], en: 'It’s cold today for spring.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'よって'] } },
      { tokens: ['よく', '勉強[べんきょう]した', 'に', 'しては', '成績[せいせき]', 'が', '低[ひく]い'], en: 'For someone who studied hard, the grades are low.', bank: ['を'], gap: { at: 3, wrong: ['とって', 'よって'] } },
    ],
  },
  {
    title: '〜わりに',
    explain: {
      title: 'わりに: “for”, “considering”',
      body: [
        'Plain form + わりに = “for”, “considering”: the result is more or less than you would expect from the first part.',
        'Nouns take の, な-adjectives take な: 値段のわりに おいしい = “tasty for the price”, 簡単なわりに 時間がかかる.',
        'にしては (last lesson) is close; わりに is used more for a degree you can measure, like 値段, 年 or how much you did.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['この', '店[みせ]', 'は', '値段[ねだん]', 'の', 'わりに', 'おいしい'], en: 'This place is good for the price.', bank: ['を'], gap: { at: 5, wrong: ['ために', 'うちに'] } },
      { tokens: ['彼[かれ]', 'は', '年[とし]', 'の', 'わりに', '若[わか]く', '見[み]える'], en: 'He looks young for his age.', bank: ['を'], gap: { at: 4, wrong: ['ために', 'うちに'] } },
      { tokens: ['よく', '勉強[べんきょう]した', 'わりに', '成績[せいせき]', 'が', '悪[わる]かった'], en: 'For all my studying, my grades were bad.', bank: ['を'], gap: { at: 2, wrong: ['ために', 'うちに'] } },
      { tokens: ['簡単[かんたん]', 'な', 'わりに', '時間[じかん]', 'が', 'かかった'], en: 'It took a long time for something so simple.', bank: ['を'], gap: { at: 2, wrong: ['ために', 'うちに'] } },
      { tokens: ['祖母[そぼ]', 'は', '年[とし]', 'の', 'わりに', '元気[げんき]', 'です'], en: 'My grandmother is very lively for her age.', bank: ['を'], gap: { at: 4, wrong: ['ために', 'うちに'] } },
      { tokens: ['彼女[かのじょ]', 'は', 'たくさん', '食[た]べる', 'わりに', '太[ふと]らない'], en: 'She eats a lot, yet she doesn’t put on weight.', bank: ['を'], gap: { at: 4, wrong: ['ために', 'うちに'] } },
    ],
  },
  {
    title: '〜にしても',
    explain: {
      title: 'にしても: “even if”, “granted that”',
      body: [
        'X にしても = “even if X”, “granted X”: you accept X, but something still holds: 忙しいにしても 電話くらいできるでしょう.',
        'It often carries a complaint: 遅れるにしても 連絡してほしい = “even if you’re going to be late, I want you to let me know”.',
        'A にしても B にしても = “whether A or B”, and どちらにしても = “either way”.',
      ],
      examples: [0, 3],
    },
    sentences: [
      { tokens: ['忙[いそが]しい', 'に', 'しても', '電話[でんわ]', 'くらい', 'できる', 'でしょう'], en: 'Even if you’re busy, you can at least call.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['遅[おく]れる', 'に', 'しても', '連絡[れんらく]して', 'ほしい'], en: 'Even if you’re going to be late, I want you to let me know.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['冗談[じょうだん]', 'に', 'しても', 'ひどい'], en: 'Even as a joke, that’s awful.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['行[い]く', 'に', 'しても', '行[い]かない', 'に', 'しても', '返事[へんじ]', 'を', 'ください'], en: 'Whether you go or not, please reply.', bank: ['が'], gap: { at: 2, wrong: ['とって', 'よって'] } },
      { tokens: ['いくら', '安[やす]い', 'に', 'しても', 'これ', 'は', '買[か]いません'], en: 'However cheap it is, I won’t buy this.', bank: ['を'], gap: { at: 3, wrong: ['とって', 'よって'] } },
      { tokens: ['どちら', 'に', 'しても', '明日[あした]', 'まで', 'に', '決[き]めなければ', 'なりません'], en: 'Either way, we have to decide by tomorrow.', bank: ['を'], gap: { at: 2, wrong: ['とって', 'よって'] } },
    ],
  },
  {
    title: '〜からには',
    explain: {
      title: 'からには: “now that”, “since”',
      body: [
        'Plain form + からには = “now that”, “since”: a decision or situation that brings a duty with it.',
        'The second half says what you must, should or will do: 約束したからには 守ります = “since I promised, I’ll keep my word”.',
        'It is stronger than から alone: there is no going back. 以上(は) (next lesson) means much the same.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['約束[やくそく]した', 'から', 'に', 'は', '守[まも]ります'], en: 'Since I promised, I’ll keep my word.', bank: ['で'], gap: { at: 1, wrong: ['ので', 'のに'] } },
      { tokens: ['日本[にほん]', 'に', '来[き]た', 'から', 'に', 'は', '日本語[にほんご]', 'を', '覚[おぼ]えたい'], en: 'Now that I’ve come to Japan, I want to learn Japanese.', bank: ['で'], gap: { at: 3, wrong: ['ので', 'のに'] } },
      { tokens: ['試合[しあい]', 'に', '出[で]る', 'から', 'に', 'は', '勝[か]ちたい'], en: 'Since I’m playing in the match, I want to win.', bank: ['で'], gap: { at: 3, wrong: ['ので', 'のに'] } },
      { tokens: ['やる', 'から', 'に', 'は', '最後[さいご]', 'まで', 'やります'], en: 'If I’m going to do it, I’ll see it through to the end.', bank: ['で'], gap: { at: 1, wrong: ['ので', 'のに'] } },
      { tokens: ['社長[しゃちょう]', 'に', 'なった', 'から', 'に', 'は', '責任[せきにん]', 'を', '持[も]たなければ', 'ならない'], en: 'Now that you’re the company president, you have to take responsibility.', bank: ['で'], gap: { at: 3, wrong: ['ので', 'のに'] } },
      { tokens: ['お金[かね]', 'を', '借[か]りた', 'から', 'に', 'は', '返[かえ]す', 'べき', 'です'], en: 'Since you borrowed the money, you should pay it back.', bank: ['で'], gap: { at: 3, wrong: ['ので', 'のに'] } },
    ],
  },
  {
    title: '〜以上(は)',
    explain: {
      title: '以上(は): “since”, “as long as”',
      body: [
        'Plain form + 以上(は) = “since”, “as long as”: given this fact, something must follow: やると言った以上は 最後までやります. Nouns take である: 学生である以上.',
        'The second half is a duty, a decision or a firm conclusion: 〜なければならない, 〜べきだ, 〜たい, 〜できない.',
        'After a number 以上 means “or more” (三人以上), and at the end of a speech 以上です means “that is all”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['やる', 'と', '言[い]った', '以上[いじょう]', 'は', '最後[さいご]', 'まで', 'やります'], en: 'Since I said I’d do it, I’ll do it to the end.', bank: ['が'], gap: { at: 3, wrong: ['以外[いがい]', '以下[いか]'] } },
      { tokens: ['ここ', 'で', '働[はたら]く', '以上[いじょう]', 'ルール', 'は', '守[まも]って', 'ください'], en: 'As long as you work here, please follow the rules.', bank: ['が'], gap: { at: 3, wrong: ['以外[いがい]', '以下[いか]'] } },
      { tokens: ['試験[しけん]', 'を', '受[う]ける', '以上[いじょう]', '合格[ごうかく]したい'], en: 'Since I’m taking the exam, I want to pass.', bank: ['が'], gap: { at: 3, wrong: ['以外[いがい]', '以下[いか]'] } },
      { tokens: ['自分[じぶん]', 'で', '決[き]めた', '以上[いじょう]', '文句[もんく]', 'は', '言[い]えません'], en: 'Since I decided it myself, I can’t complain.', bank: ['が'], gap: { at: 3, wrong: ['以外[いがい]', '以下[いか]'] } },
      { tokens: ['約束[やくそく]した', '以上[いじょう]', 'は', '守[まも]らなければ', 'ならない'], en: 'Since I promised, I have to keep my promise.', bank: ['が'], gap: { at: 1, wrong: ['以外[いがい]', '以下[いか]'] } },
      { tokens: ['親[おや]', 'に', '反対[はんたい]された', '以上[いじょう]', '留学[りゅうがく]', 'は', '無理[むり]', 'です'], en: 'Since my parents are against it, studying abroad is out of the question.', bank: ['を'], gap: { at: 3, wrong: ['以外[いがい]', '以下[いか]'] } },
    ],
  },
  {
    title: '〜上で',
    explain: {
      title: '〜た上で and 〜上で: “after”, “in doing”',
      body: [
        'The た form + 上で = “after (doing it properly)”: よく考えた上で 決めます = “I’ll decide after thinking it over”.',
        'Noun + の上で works the same way: 相談の上で = “after talking it over”.',
        'Dictionary form + 上で = “in doing”, “for”: 日本語を勉強する上で 漢字は大切です = “kanji matter when you study Japanese”.',
      ],
      examples: [0, 4],
    },
    sentences: [
      { tokens: ['よく', '考[かんが]えた', '上[うえ]', 'で', '決[き]めます'], en: 'I’ll decide after thinking it over carefully.', bank: ['に'], gap: { at: 2, wrong: ['前[まえ]', 'とき'] } },
      { tokens: ['両親[りょうしん]', 'と', '相談[そうだん]した', '上[うえ]', 'で', '返事[へんじ]します'], en: 'I’ll reply after discussing it with my parents.', bank: ['に'], gap: { at: 3, wrong: ['前[まえ]', 'とき'] } },
      { tokens: ['説明[せつめい]', 'を', '読[よ]んだ', '上[うえ]', 'で', '使[つか]って', 'ください'], en: 'Please read the explanation before you use it.', bank: ['に'], gap: { at: 3, wrong: ['前[まえ]', 'とき'] } },
      { tokens: ['内容[ないよう]', 'を', '確認[かくにん]した', '上[うえ]', 'で', 'サイン', 'して', 'ください'], en: 'Please sign after checking the contents.', bank: ['に'], gap: { at: 3, wrong: ['前[まえ]', 'とき'] } },
      { tokens: ['日本語[にほんご]', 'を', '勉強[べんきょう]する', '上[うえ]', 'で', '漢字[かんじ]', 'は', '大切[たいせつ]', 'です'], en: 'Kanji are important when you study Japanese.', bank: ['に'], gap: { at: 3, wrong: ['前[まえ]', 'とき'] } },
      { tokens: ['仕事[しごと]', 'を', 'する', '上[うえ]', 'で', '一番[いちばん]', '大事[だいじ]', 'な', 'の', 'は', '時間[じかん]', 'を', '守[まも]る', 'こと', 'です'], en: 'The most important thing at work is being on time.', bank: ['に'], gap: { at: 3, wrong: ['前[まえ]', 'とき'] } },
    ],
  },
  {
    title: '〜うえ(に)',
    explain: {
      title: '〜うえ(に): “on top of that”, “besides”',
      body: [
        'Plain form + うえ(に) = “on top of”, “besides”: one more point of the same kind is added: 安いうえに おいしい.',
        'な-adjectives take な (静かなうえに), nouns take の or である (学生である上に); verbs and い-adjectives join directly (狭いうえに, 遅れて来たうえに). It is often written 上に.',
        'Both points pull the same way: two good things or two bad ones. Don’t mix it up with 上で (last lesson): うえに adds, 上で means “after”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['この', '店[みせ]', 'は', '安[やす]い', '上[うえ]', 'に', 'おいしい'], en: 'This place is cheap, and tasty as well.', bank: ['が'], gap: { at: 5, wrong: ['で', 'を'] } },
      { tokens: ['道[みち]', 'に', '迷[まよ]った', '上[うえ]', 'に', '雨[あめ]', 'に', '降[ふ]られた'], en: 'I got lost, and on top of that I got caught in the rain.', bank: ['が'], gap: { at: 4, wrong: ['を', 'へ'] } },
      { tokens: ['彼女[かのじょ]', 'は', '頭[あたま]', 'が', 'いい', '上[うえ]', 'に', 'やさしい'], en: 'She is smart, and kind too.', bank: ['を'], gap: { at: 6, wrong: ['で', 'を'] } },
      { tokens: ['この', '部屋[へや]', 'は', '狭[せま]い', '上[うえ]', 'に', '暗[くら]い'], en: 'This room is small, and dark on top of that.', bank: ['が'], gap: { at: 5, wrong: ['で', 'を'] } },
      { tokens: ['彼[かれ]', 'は', '遅[おく]れて', '来[き]た', '上[うえ]', 'に', '宿題[しゅくだい]', 'も', '忘[わす]れた'], en: 'He came late, and forgot his homework as well.', bank: ['を'], gap: { at: 5, wrong: ['を', 'へ'] } },
      { tokens: ['この', '町[まち]', 'は', '静[しず]か', 'な', '上[うえ]', 'に', '便利[べんり]', 'です'], en: 'This town is quiet, and convenient besides.', bank: ['が'], gap: { at: 6, wrong: ['で', 'を'] } },
    ],
  },
  {
    title: '〜ものの',
    explain: {
      title: 'ものの: “although”',
      body: [
        'Plain form + ものの = “although”, “but”: 買ったものの 一度も使っていません = “I bought it, but I’ve never used it”.',
        'The second half is what didn’t follow: the plan stalled or the result fell short of the first half.',
        'It sounds more written than けど or のに. な-adjectives take な (好きなものの), nouns take である (学生であるものの).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['買[か]った', 'もの', 'の', '一度[いちど]', 'も', '使[つか]って', 'いません'], en: 'I bought it, but I’ve never once used it.', bank: ['が'], gap: { at: 1, wrong: ['こと', 'ところ'] } },
      { tokens: ['大学[だいがく]', 'を', '出[で]た', 'もの', 'の', '仕事[しごと]', 'が', '見[み]つかりません'], en: 'I graduated from university, but I can’t find a job.', bank: ['で'], gap: { at: 3, wrong: ['こと', 'ところ'] } },
      { tokens: ['頭[あたま]', 'で', 'は', 'わかって', 'いる', 'もの', 'の', 'やめられない'], en: 'I know it in my head, but I can’t stop.', bank: ['を'], gap: { at: 5, wrong: ['こと', 'ところ'] } },
      { tokens: ['行[い]く', 'と', '言[い]った', 'もの', 'の', 'まだ', '準備[じゅんび]して', 'いない'], en: 'I said I would go, but I haven’t got ready yet.', bank: ['を'], gap: { at: 3, wrong: ['こと', 'ところ'] } },
      { tokens: ['春[はる]', 'に', 'なった', 'もの', 'の', 'まだ', '寒[さむ]い'], en: 'It’s spring, but it’s still cold.', bank: ['を'], gap: { at: 3, wrong: ['こと', 'ところ'] } },
      { tokens: ['薬[くすり]', 'を', '飲[の]んだ', 'もの', 'の', 'まだ', '熱[ねつ]', 'が', 'ある'], en: 'I took the medicine, but I still have a fever.', bank: ['で'], gap: { at: 3, wrong: ['こと', 'ところ'] } },
    ],
  },
  {
    title: '〜くせに',
    explain: {
      title: 'くせに: “even though” (with blame)',
      body: [
        'Plain form + くせに = “even though”, said with annoyance or blame: 知っているくせに 教えてくれない = “he knows, yet he won’t tell me”.',
        'Nouns take の, な-adjectives take な: 子供のくせに, 下手なくせに.',
        'It is like のに, but harsher and usually about someone else. It can sound rude, so use it with care.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['知[し]って', 'いる', 'くせ', 'に', '教[おし]えて', 'くれない'], en: 'He knows, yet he won’t tell me.', bank: ['で'], gap: { at: 2, wrong: ['まま', 'ばかり'] } },
      { tokens: ['子供[こども]', 'の', 'くせ', 'に', '大人[おとな]', 'の', 'よう', 'な', 'こと', 'を', '言[い]う'], en: 'He’s only a kid, yet he talks like a grown-up.', bank: ['で'], gap: { at: 2, wrong: ['まま', 'ばかり'] } },
      { tokens: ['下手[へた]', 'な', 'くせ', 'に', 'いつも', '歌[うた]いたがる'], en: 'He’s bad at it, yet he always wants to sing.', bank: ['で'], gap: { at: 2, wrong: ['まま', 'ばかり'] } },
      { tokens: ['自分[じぶん]', 'で', 'は', '何[なに]', 'も', 'しない', 'くせ', 'に', '文句[もんく]', 'ばかり', '言[い]う'], en: 'She does nothing herself, yet all she does is complain.', bank: ['を'], gap: { at: 6, wrong: ['まま', 'ところ'] } },
      { tokens: ['お金[かね]', 'が', 'ない', 'くせ', 'に', '高[たか]い', '物[もの]', 'を', '買[か]う'], en: 'He has no money, yet he buys expensive things.', bank: ['で'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
      { tokens: ['約束[やくそく]した', 'くせ', 'に', '来[こ]なかった'], en: 'He promised, yet he didn’t come.', bank: ['で'], gap: { at: 1, wrong: ['まま', 'ばかり'] } },
    ],
  },
  {
    title: '〜あまり',
    explain: {
      title: 'あまり: “so … that”, “out of too much”',
      body: [
        'Noun + の + あまり, or plain form + あまり = “so … that”, “out of”: a feeling so strong that it causes something.',
        '嬉しさのあまり 泣いてしまった = “I cried for joy”; 心配するあまり 眠れなかった = “I was so worried I couldn’t sleep”.',
        'The result is usually unplanned or bad. Don’t confuse it with あまり〜ない (“not very”).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['心配[しんぱい]する', 'あまり', '眠[ねむ]れなかった'], en: 'I was so worried that I couldn’t sleep.', bank: ['の'], gap: { at: 1, wrong: ['まま', 'ばかり'] } },
      { tokens: ['緊張[きんちょう]', 'の', 'あまり', '声[こえ]', 'が', '出[で]なかった'], en: 'I was so nervous that my voice wouldn’t come out.', bank: ['を'], gap: { at: 2, wrong: ['まま', 'ばかり'] } },
      { tokens: ['急[いそ]ぐ', 'あまり', '財布[さいふ]', 'を', '忘[わす]れて', 'しまった'], en: 'I was in such a hurry that I forgot my wallet.', bank: ['が'], gap: { at: 1, wrong: ['まま', 'ばかり'] } },
      { tokens: ['彼[かれ]', 'は', '驚[おどろ]き', 'の', 'あまり', '何[なに]', 'も', '言[い]えなかった'], en: 'He was so surprised that he couldn’t say a thing.', bank: ['を'], gap: { at: 4, wrong: ['まま', 'ばかり'] } },
      { tokens: ['仕事[しごと]', 'に', '熱心[ねっしん]', 'な', 'あまり', '体[からだ]', 'を', '壊[こわ]した'], en: 'He was so devoted to his work that he ruined his health.', bank: ['が'], gap: { at: 4, wrong: ['まま', 'ばかり'] } },
      { tokens: ['嬉[うれ]しさ', 'の', 'あまり', '泣[な]いて', 'しまった'], en: 'I was so happy that I burst into tears.', bank: ['を'], gap: { at: 2, wrong: ['まま', 'ばかり'] } },
    ],
  },
  {
    title: '〜つつ(も)',
    explain: {
      title: 'つつ and つつも: “while”, “although”',
      body: [
        'The ます stem + つつ = “while”, two actions at once, like ながら but more written: 景色を楽しみつつ 歩く.',
        'つつも = “although”, “even while”: 悪いと思いつつも 嘘をついてしまった = “I knew it was wrong, yet I lied”.',
        'つつも often goes with verbs of knowing and thinking: 知りつつも, 思いつつも, わかりつつも.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['悪[わる]い', 'と', '思[おも]い', 'つつ', 'も', '嘘[うそ]', 'を', 'ついて', 'しまった'], en: 'I knew it was wrong, yet I told a lie.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
      { tokens: ['体[からだ]', 'に', '悪[わる]い', 'と', '知[し]り', 'つつ', 'も', 'たばこ', 'を', 'やめられない'], en: 'I know it’s bad for me, but I can’t give up smoking.', bank: ['が'], gap: { at: 5, wrong: ['まま', 'ばかり'] } },
      { tokens: ['景色[けしき]', 'を', '楽[たの]しみ', 'つつ', '山[やま]', 'に', '登[のぼ]った'], en: 'We climbed the mountain while enjoying the view.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
      { tokens: ['早[はや]く', '寝[ね]よう', 'と', '思[おも]い', 'つつ', 'も', '遅[おそ]く', 'まで', '起[お]きて', 'いた'], en: 'I meant to go to bed early, but I stayed up late.', bank: ['が'], gap: { at: 4, wrong: ['まま', 'ばかり'] } },
      { tokens: ['いけない', 'と', 'わかり', 'つつ', 'も', 'お菓子[かし]', 'を', '食[た]べて', 'しまう'], en: 'I know I shouldn’t, but I end up eating sweets.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
      { tokens: ['音楽[おんがく]', 'を', '聞[き]き', 'つつ', '勉強[べんきょう]する'], en: 'I study with music playing.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
    ],
  },
  {
    title: '〜一方だ',
    explain: {
      title: '一方だ: “more and more”, “keeps on”',
      body: [
        'Dictionary form + 一方だ = “keeps on (getting)”, “more and more”: a change that only goes one way.',
        'It goes with verbs of change: 増える, 減る, 上がる, 悪くなる: 物価は上がる一方です = “prices keep going up”.',
        'It usually describes something worrying. On its own, 一方 also means “on the other hand”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['物価[ぶっか]', 'は', '上[あ]がる', '一方[いっぽう]', 'です'], en: 'Prices keep going up.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'あまり'] } },
      { tokens: ['この', '町[まち]', 'の', '人口[じんこう]', 'は', '減[へ]る', '一方[いっぽう]', 'だ'], en: 'This town’s population keeps falling.', bank: ['が'], gap: { at: 6, wrong: ['まま', 'あまり'] } },
      { tokens: ['病気[びょうき]', 'は', '悪[わる]く', 'なる', '一方[いっぽう]', 'です'], en: 'The illness keeps getting worse.', bank: ['が'], gap: { at: 4, wrong: ['まま', 'あまり'] } },
      { tokens: ['最近[さいきん]', '仕事[しごと]', 'が', '増[ふ]える', '一方[いっぽう]', 'です'], en: 'Lately my work just keeps piling up.', bank: ['を'], gap: { at: 4, wrong: ['まま', 'あまり'] } },
      { tokens: ['外国[がいこく]', 'から', '来[く]る', '客[きゃく]', 'は', '増[ふ]える', '一方[いっぽう]', 'だ'], en: 'Visitors from abroad keep increasing.', bank: ['が'], gap: { at: 6, wrong: ['まま', 'あまり'] } },
      { tokens: ['円[えん]', 'は', '安[やす]く', 'なる', '一方[いっぽう]', 'です'], en: 'The yen keeps getting weaker.', bank: ['が'], gap: { at: 4, wrong: ['まま', 'あまり'] } },
    ],
  },
  {
    title: '〜ばかりか',
    explain: {
      title: 'ばかりか: “not only … but even”',
      body: [
        'A ばかりか B (も/まで) = “not only A but (even) B”: like だけでなく, but B is more surprising or goes further.',
        '漢字ばかりか ひらがなも書けない = “he can’t write even hiragana, let alone kanji”. Nouns join directly; verbs and adjectives use the plain form.',
        'It is a little formal, and the second half usually has も or まで.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['彼[かれ]', 'は', '漢字[かんじ]', 'ばかり', 'か', 'ひらがな', 'も', '書[か]けない'], en: 'He can’t write kanji, or even hiragana.', bank: ['を'], gap: { at: 3, wrong: ['だけ', 'まで'] } },
      { tokens: ['この', '店[みせ]', 'は', '高[たか]い', 'ばかり', 'か', 'サービス', 'も', '悪[わる]い'], en: 'This shop is not only expensive, its service is bad too.', bank: ['を'], gap: { at: 4, wrong: ['だけ', 'まで'] } },
      { tokens: ['風邪[かぜ]', 'を', 'ひいた', 'ばかり', 'か', '財布[さいふ]', 'まで', 'なくした'], en: 'Not only did I catch a cold, I even lost my wallet.', bank: ['が'], gap: { at: 3, wrong: ['だけ', 'まで'] } },
      { tokens: ['彼[かれ]', 'は', '自分[じぶん]', 'の', '部屋[へや]', 'ばかり', 'か', '台所[だいどころ]', 'まで', '掃除[そうじ]して', 'くれた'], en: 'He cleaned not only his own room but even the kitchen.', bank: ['を'], gap: { at: 5, wrong: ['だけ', 'まで'] } },
      { tokens: ['弟[おとうと]', 'は', '謝[あやま]らない', 'ばかり', 'か', '怒[おこ]り出[だ]した'], en: 'My little brother not only didn’t apologize, he even got angry.', bank: ['を'], gap: { at: 3, wrong: ['だけ', 'まで'] } },
      { tokens: ['雨[あめ]', 'ばかり', 'か', '雪[ゆき]', 'まで', '降[ふ]って', 'きた'], en: 'It started not just raining but even snowing.', bank: ['を'], gap: { at: 1, wrong: ['だけ', 'まで'] } },
    ],
  },
  {
    title: '〜はもちろん',
    explain: {
      title: 'はもちろん: “not to mention”',
      body: [
        'A はもちろん B も = “A of course, and B too”, “B, not to mention A”: A is the obvious case, B goes further.',
        '日曜日はもちろん 土曜日も休みです = “we’re closed on Sundays of course, and on Saturdays too”.',
        'B usually takes も (or にも, でも), and the pattern works in both everyday and polite speech.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['日曜日[にちようび]', 'は', 'もちろん', '土曜日[どようび]', 'も', '休[やす]み', 'です'], en: 'We’re closed on Sundays, of course, and on Saturdays too.', bank: ['が'], gap: { at: 2, wrong: ['ばかり', 'まで'] } },
      { tokens: ['この', '歌[うた]', 'は', '子供[こども]', 'は', 'もちろん', '大人[おとな]', 'に', 'も', '人気[にんき]', 'が', 'ある'], en: 'This song is popular with children, of course, and with adults too.', bank: ['を'], gap: { at: 5, wrong: ['ばかり', 'まで'] } },
      { tokens: ['彼[かれ]', 'は', 'ピアノ', 'は', 'もちろん', 'ギター', 'も', '弾[ひ]ける'], en: 'He can play the piano, of course, and the guitar too.', bank: ['を'], gap: { at: 4, wrong: ['ばかり', 'まで'] } },
      { tokens: ['掃除[そうじ]', 'は', 'もちろん', '料理[りょうり]', 'も', '自分[じぶん]', 'で', 'します'], en: 'I do the cleaning myself, of course, and the cooking too.', bank: ['を'], gap: { at: 2, wrong: ['ばかり', 'まで'] } },
      { tokens: ['平日[へいじつ]', 'は', 'もちろん', '週末[しゅうまつ]', 'も', '働[はたら]いて', 'いる'], en: 'I work on weekdays, of course, and at weekends too.', bank: ['を'], gap: { at: 2, wrong: ['ばかり', 'まで'] } },
      { tokens: ['この', '店[みせ]', 'は', '味[あじ]', 'は', 'もちろん', '値段[ねだん]', 'も', 'いい'], en: 'This place has good food, of course, and good prices too.', bank: ['を'], gap: { at: 5, wrong: ['ばかり', 'まで'] } },
    ],
  },
  {
    title: '〜に限って',
    explain: {
      title: 'に限って: “of all times”, “of all people”',
      body: [
        'Noun + に限って = “just when”, “of all times”, for bad luck at the worst moment: 急いでいるときに限って 電車が遅れる.',
        'With a person it means “X is the last one who would”: うちの子に限って そんなことはしません.',
        '限る on its own means “to limit”: 今日に限り = “today only”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['急[いそ]いで', 'いる', 'とき', 'に', '限[かぎ]って', '電車[でんしゃ]', 'が', '遅[おく]れる'], en: 'The train is always late just when I’m in a hurry.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
      { tokens: ['傘[かさ]', 'を', '持[も]って', 'いない', '日[ひ]', 'に', '限[かぎ]って', '雨[あめ]', 'が', '降[ふ]る'], en: 'It always rains on the very day I don’t have an umbrella.', bank: ['で'], gap: { at: 6, wrong: ['とって', 'ついて'] } },
      { tokens: ['うち', 'の', '子[こ]', 'に', '限[かぎ]って', 'そんな', 'こと', 'は', 'しません'], en: 'My child, of all children, would never do such a thing.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
      { tokens: ['大事[だいじ]', 'な', '試験[しけん]', 'の', '日[ひ]', 'に', '限[かぎ]って', '熱[ねつ]', 'が', '出[で]る'], en: 'I always get a fever on the day of an important exam.', bank: ['を'], gap: { at: 6, wrong: ['とって', 'ついて'] } },
      { tokens: ['あの', '人[ひと]', 'に', '限[かぎ]って', '嘘[うそ]', 'を', 'つく', 'はず', 'が', 'ない'], en: 'He, of all people, would never lie.', bank: ['で'], gap: { at: 3, wrong: ['とって', 'ついて'] } },
      { tokens: ['休[やす]み', 'の', '日[ひ]', 'に', '限[かぎ]って', '早[はや]く', '目[め]', 'が', '覚[さ]める'], en: 'On my days off, of all days, I wake up early.', bank: ['を'], gap: { at: 4, wrong: ['とって', 'ついて'] } },
    ],
  },
  {
    title: '〜ないことはない',
    explain: {
      title: 'ないことはない: “it’s not that … not”',
      body: [
        'ない form + ことはない = “it’s not that I can’t / don’t”, a reluctant yes: 食べられないことはない = “it’s not that I can’t eat it”.',
        'Two negatives make a weak positive: you can, but not happily or not easily.',
        'The polite form is ないことはありません. It is often followed by けど: 弾けないことはないけど 上手じゃない.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['辛[から]い', '物[もの]', 'も', '食[た]べられない', 'こと', 'は', 'ない'], en: 'It’s not that I can’t eat spicy food.', bank: ['が'], gap: { at: 4, wrong: ['まま', 'ため'] } },
      { tokens: ['ピアノ', 'は', '弾[ひ]けない', 'こと', 'は', 'ない', 'けど', '上手[じょうず]', 'じゃない'], en: 'It’s not that I can’t play the piano, but I’m not good at it.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ため'] } },
      { tokens: ['急[いそ]げば', '間[ま]に合[あ]わない', 'こと', 'は', 'ない'], en: 'If we hurry, we might just make it.', bank: ['が'], gap: { at: 2, wrong: ['まま', 'ため'] } },
      { tokens: ['お酒[さけ]', 'は', '飲[の]まない', 'こと', 'は', 'ない'], en: 'It’s not that I don’t drink.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ため'] } },
      { tokens: ['歩[ある]いて', '行[い]けない', 'こと', 'は', 'ありません'], en: 'It’s not impossible to walk there.', bank: ['が'], gap: { at: 2, wrong: ['まま', 'ため'] } },
      { tokens: ['彼[かれ]', 'の', '気持[きも]ち', 'も', 'わからない', 'こと', 'は', 'ない'], en: 'It’s not that I don’t understand how he feels.', bank: ['が'], gap: { at: 5, wrong: ['まま', 'ため'] } },
    ],
  },
  {
    title: '〜ことはない',
    explain: {
      title: 'ことはない: “there’s no need to”',
      body: [
        'Dictionary form + ことはない = “there’s no need to”, “don’t have to”: 心配することはない = “there’s nothing to worry about”.',
        'It reassures or advises someone. The polite form is ことはありません.',
        'Don’t mix it up with ないことはない (last lesson) or たことがない (“have never”).',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['心配[しんぱい]する', 'こと', 'は', 'ない', 'よ'], en: 'There’s nothing to worry about.', bank: ['が'], gap: { at: 1, wrong: ['まま', 'ばかり'] } },
      { tokens: ['謝[あやま]る', 'こと', 'は', 'ありません'], en: 'There’s no need to apologize.', bank: ['が'], gap: { at: 1, wrong: ['まま', 'ばかり'] } },
      { tokens: ['駅[えき]', 'まで', '迎[むか]え', 'に', '来[く]る', 'こと', 'は', 'ない'], en: 'There’s no need to come and meet me at the station.', bank: ['が'], gap: { at: 5, wrong: ['まま', 'ばかり'] } },
      { tokens: ['そんな', 'に', '急[いそ]ぐ', 'こと', 'は', 'ない'], en: 'There’s no need to rush like that.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
      { tokens: ['高[たか]い', '薬[くすり]', 'を', '買[か]う', 'こと', 'は', 'ありません'], en: 'There’s no need to buy expensive medicine.', bank: ['が'], gap: { at: 4, wrong: ['まま', 'ばかり'] } },
      { tokens: ['一人[ひとり]', 'で', '悩[なや]む', 'こと', 'は', 'ない'], en: 'You don’t need to worry about it on your own.', bank: ['が'], gap: { at: 3, wrong: ['まま', 'ばかり'] } },
    ],
  },
  {
    title: '〜ものだ・〜ものではない',
    explain: {
      title: 'ものだ and ものではない: how things are, how to behave',
      body: [
        'Dictionary form + ものだ = what is natural or expected in general: 子供は外で遊ぶものだ = “children are meant to play outside”.',
        'ものではない = “one shouldn’t”: 人の悪口を言うものではない = “you shouldn’t speak ill of others”.',
        'The た form + ものだ looks back fondly: よくこの川で泳いだものだ = “I often used to swim in this river”.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['子供[こども]', 'は', '外[そと]', 'で', '遊[あそ]ぶ', 'もの', 'だ'], en: 'Children are meant to play outside.', bank: ['が'], gap: { at: 5, wrong: ['まま', 'あまり'] } },
      { tokens: ['人[ひと]', 'の', '悪口[わるくち]', 'を', '言[い]う', 'もの', 'では', 'ない'], en: 'You shouldn’t speak ill of others.', bank: ['が'], gap: { at: 5, wrong: ['まま', 'あまり'] } },
      { tokens: ['子供[こども]', 'の', 'とき', 'は', 'よく', 'この', '川[かわ]', 'で', '泳[およ]いだ', 'もの', 'だ'], en: 'When I was a child, I often used to swim in this river.', bank: ['を'], gap: { at: 9, wrong: ['まま', 'あまり'] } },
      { tokens: ['年[とし]', 'を', '取[と]る', 'と', '目[め]', 'が', '悪[わる]く', 'なる', 'もの', 'です'], en: 'Your eyesight gets worse as you get older.', bank: ['で'], gap: { at: 8, wrong: ['まま', 'あまり'] } },
      { tokens: ['夜[よる]', '遅[おそ]く', '電話[でんわ]する', 'もの', 'では', 'ありません'], en: 'You shouldn’t phone people late at night.', bank: ['を'], gap: { at: 3, wrong: ['まま', 'あまり'] } },
      { tokens: ['時間[じかん]', 'が', 'たつ', 'の', 'は', '早[はや]い', 'もの', 'です', 'ね'], en: 'Time really flies, doesn’t it?', bank: ['を'], gap: { at: 6, wrong: ['まま', 'あまり'] } },
    ],
  },
  {
    title: '〜ことだ',
    explain: {
      title: 'ことだ: “the best thing is to”',
      body: [
        'Dictionary form or ない form + ことだ = “the best thing is to”, “you should”: advice from someone older or more experienced.',
        '上手になりたければ 毎日練習することだ = “if you want to get good, practise every day”.',
        'It sounds firm, a little like a teacher. べきだ is a moral “should”; ことだ is practical advice for this person.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['上手[じょうず]', 'に', 'なりたければ', '毎日[まいにち]', '練習[れんしゅう]する', 'こと', 'だ'], en: 'If you want to get good, practise every day.', bank: ['を'], gap: { at: 5, wrong: ['まま', 'あまり'] } },
      { tokens: ['風邪[かぜ]', 'の', 'とき', 'は', 'ゆっくり', '休[やす]む', 'こと', 'です'], en: 'When you have a cold, the best thing is to get plenty of rest.', bank: ['を'], gap: { at: 6, wrong: ['まま', 'あまり'] } },
      { tokens: ['痩[や]せたい', 'なら', '甘[あま]い', '物[もの]', 'を', '食[た]べない', 'こと', 'だ'], en: 'If you want to lose weight, don’t eat sweet things.', bank: ['が'], gap: { at: 6, wrong: ['まま', 'あまり'] } },
      { tokens: ['わからない', 'とき', 'は', '先生[せんせい]', 'に', '聞[き]く', 'こと', 'だ'], en: 'When you don’t understand, the best thing is to ask the teacher.', bank: ['を'], gap: { at: 6, wrong: ['まま', 'あまり'] } },
      { tokens: ['合格[ごうかく]したい', 'なら', 'もっと', '勉強[べんきょう]する', 'こと', 'です'], en: 'If you want to pass, the thing to do is study more.', bank: ['を'], gap: { at: 4, wrong: ['まま', 'あまり'] } },
      { tokens: ['健康[けんこう]', 'の', 'ために', '早[はや]く', '寝[ね]る', 'こと', 'だ'], en: 'For your health, go to bed early.', bank: ['を'], gap: { at: 5, wrong: ['まま', 'あまり'] } },
    ],
  },
  {
    title: '〜おそれがある',
    explain: {
      title: 'おそれがある: “there is a risk that”',
      body: [
        'Dictionary form, or noun + の, + おそれがある = “there is a risk of”, “may (something bad)”: 台風が来るおそれがあります.',
        'It is formal: you hear it in the news, weather forecasts and official notices. おそれ is often written 恐れ.',
        'It is only for bad things. In everyday talk people say かもしれない instead.',
      ],
      examples: [0, 1],
    },
    sentences: [
      { tokens: ['明日[あした]', 'は', '雨[あめ]', 'が', '強[つよ]く', 'なる', '恐[おそ]れ', 'が', 'あります'], en: 'There is a risk the rain will get heavier tomorrow.', bank: ['を'], gap: { at: 6, wrong: ['はず', 'まま'] } },
      { tokens: ['台風[たいふう]', 'が', '来[く]る', '恐[おそ]れ', 'が', 'ある'], en: 'There is a risk a typhoon will come.', bank: ['を'], gap: { at: 3, wrong: ['はず', 'まま'] } },
      { tokens: ['この', '薬[くすり]', 'は', '眠[ねむ]く', 'なる', '恐[おそ]れ', 'が', 'あります'], en: 'This medicine may make you drowsy.', bank: ['を'], gap: { at: 5, wrong: ['はず', 'まま'] } },
      { tokens: ['川[かわ]', 'の', '水[みず]', 'が', '増[ふ]える', '恐[おそ]れ', 'が', 'ある'], en: 'There is a risk the river will rise.', bank: ['を'], gap: { at: 5, wrong: ['はず', 'まま'] } },
      { tokens: ['地震[じしん]', 'の', '後[あと]', 'は', '火事[かじ]', 'の', '恐[おそ]れ', 'が', 'あります'], en: 'After an earthquake, there is a risk of fire.', bank: ['を'], gap: { at: 6, wrong: ['はず', 'まま'] } },
      { tokens: ['この', 'まま', 'では', '病気[びょうき]', 'が', '悪[わる]く', 'なる', '恐[おそ]れ', 'が', 'ある'], en: 'At this rate, the illness may get worse.', bank: ['を'], gap: { at: 7, wrong: ['はず', 'ため'] } },
    ],
  },
  {
    title: '〜かねない',
    explain: {
      title: 'かねない: “could well”, “might”',
      body: [
        'The ます stem + かねない = “could well”, “might (end up)”: a bad result is a real possibility: 事故になりかねない.',
        'It ends in ない but it is not negative: かねない means the bad thing could happen.',
        'おそれがある is formal and impersonal; かねない is more often the speaker’s own warning, including about what someone might do.',
        '〜かねる (positive) means the opposite: “can’t bring oneself to”: 言いかねる = “I can’t bring myself to say it”.',
      ],
      examples: [0, 2],
    },
    sentences: [
      { tokens: ['そんな', 'に', '急[いそ]いで', '運転[うんてん]したら', '事故[じこ]', 'に', 'なり', 'かねない'], en: 'Driving in such a hurry, you could well have an accident.', bank: ['を'], gap: { at: 7, wrong: ['かねて', 'かねた'] } },
      { tokens: ['無理[むり]', 'を', 'する', 'と', '病気[びょうき]', 'に', 'なり', 'かねない'], en: 'If you push yourself too hard, you could get ill.', bank: ['が'], gap: { at: 7, wrong: ['かねて', 'かねた'] } },
      { tokens: ['彼[かれ]', 'なら', 'そんな', 'こと', 'も', '言[い]い', 'かねない'], en: 'He’s just the type who might say something like that.', bank: ['を'], gap: { at: 6, wrong: ['かねて', 'かねた'] } },
      { tokens: ['この', 'まま', 'だ', 'と', '会社[かいしゃ]', 'が', '倒産[とうさん]し', 'かねない'], en: 'At this rate, the company could go bankrupt.', bank: ['を'], gap: { at: 7, wrong: ['かねて', 'かねた'] } },
      { tokens: ['よく', '確[たし]かめない', 'と', '大[おお]きな', '問題[もんだい]', 'に', 'なり', 'かねない'], en: 'If you don’t check carefully, it could turn into a big problem.', bank: ['を'], gap: { at: 7, wrong: ['かねて', 'かねた'] } },
      { tokens: ['火[ひ]', 'を', 'つけた', 'まま', '寝[ね]る', 'と', '火事[かじ]', 'に', 'なり', 'かねない'], en: 'Falling asleep with the fire lit could start a house fire.', bank: ['が'], gap: { at: 9, wrong: ['かねて', 'かねた'] } },
    ],
  },
  {
    title: '〜ようがない',
    explain: {
      title: 'ようがない: “there’s no way to”',
      body: [
        'The ます stem + ようがない = “there’s no way to”, “can’t possibly”: 住所がわからないから 送りようがない = “I don’t know the address, so I can’t send it”.',
        'It means the way or the means is missing, not the will.',
        'する verbs take しようがない: 連絡しようがない. The everyday しょうがない (“it can’t be helped”) comes from this.',
      ],
      examples: [1, 0],
    },
    sentences: [
      { tokens: ['電話[でんわ]', '番号[ばんごう]', 'を', '知[し]らない', 'から', '連絡[れんらく]し', 'よう', 'が', 'ない'], en: 'I don’t know the phone number, so there’s no way to contact them.', bank: ['で'], gap: { at: 6, wrong: ['こと', 'ため'] } },
      { tokens: ['住所[じゅうしょ]', 'が', 'わからない', 'ので', '送[おく]り', 'よう', 'が', 'ない'], en: 'I don’t know the address, so I have no way to send it.', bank: ['を'], gap: { at: 5, wrong: ['こと', 'ため'] } },
      { tokens: ['こんな', 'に', '壊[こわ]れて', 'いたら', '直[なお]し', 'よう', 'が', 'ない'], en: 'If it’s this badly broken, there’s no way to fix it.', bank: ['を'], gap: { at: 5, wrong: ['こと', 'ため'] } },
      { tokens: ['道[みち]', 'が', 'ない', 'から', '行[い]き', 'よう', 'が', 'ない'], en: 'There’s no road, so there’s no way to get there.', bank: ['を'], gap: { at: 5, wrong: ['こと', 'ため'] } },
      { tokens: ['言葉[ことば]', 'で', 'は', '説明[せつめい]し', 'よう', 'が', 'ない'], en: 'There’s no way to explain it in words.', bank: ['を'], gap: { at: 4, wrong: ['こと', 'ため'] } },
      { tokens: ['終[お]わった', 'こと', 'は', 'もう', '変[か]え', 'よう', 'が', 'ない'], en: 'What’s done can’t be changed.', bank: ['を'], gap: { at: 5, wrong: ['こと', 'ため'] } },
    ],
  },
]
