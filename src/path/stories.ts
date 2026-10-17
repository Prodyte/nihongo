// Short graded stories for reading practice, written for this app at N5, N4 and N3. Chunks carry furigana as 漢字[かんじ],
// like the grammar sentences; every word is a course word of the story's level or easier (tests check), so tapping a word
// can look it up. N4 and N3 stories use that level's grammar (grammarN4.ts, grammarN3.ts).

export interface Story {
  id: string
  title: string // Japanese, marked up
  en: string
  level: 5 | 4 | 3
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
  {
    id: 'trip', title: '旅行[りょこう]', en: 'A trip', level: 4,
    sentences: [
      { tokens: ['先月[せんげつ]', '友達[ともだち]', 'と', '二人[ふたり]', 'で', '旅行[りょこう]', 'に', '行[い]きました'], en: 'Last month I went on a trip with a friend, just the two of us.' },
      { tokens: ['電車[でんしゃ]', 'の', '窓[まど]', 'から', '山[やま]', 'や', '海[うみ]', 'が', '見[み]えました'], en: 'We could see mountains and the sea from the train window.' },
      { tokens: ['ホテル', 'に', '着[つ]いて', 'から', '古[ふる]い', '寺[てら]', 'を', '見[み]に', '行[い]きました'], en: 'After we got to the hotel, we went to see an old temple.' },
      { tokens: ['寺[てら]', 'の', '庭[にわ]', 'は', '静[しず]か', 'で', 'とても', 'きれい', 'でした'], en: 'The temple garden was quiet and very beautiful.' },
      { tokens: ['夜[よる]', 'は', '有名[ゆうめい]', 'な', '店[みせ]', 'で', 'その', '町[まち]', 'の', '料理[りょうり]', 'を', '食[た]べてみました'], en: 'In the evening we tried the local food at a famous restaurant.' },
      { tokens: ['写真[しゃしん]', 'を', 'たくさん', '撮[と]ったり', 'お土産[みやげ]', 'を', '買[か]ったり', 'しました'], en: 'We took lots of photos, bought souvenirs and so on.' },
      { tokens: ['今度[こんど]', 'は', '家族[かぞく]', 'と', '行[い]こう', 'と', '思[おも]います'], en: 'Next time I think I’ll go with my family.' },
    ],
    questions: [
      { q: 'Who did the writer travel with?', options: ['A friend', 'Their family', 'Nobody'], answer: 0 },
      { q: 'What did they do after getting to the hotel?', options: ['Went to the sea', 'Went to see an old temple', 'Went to bed'], answer: 1 },
      { q: 'What is the writer thinking of doing next time?', options: ['Going alone', 'Going by plane', 'Going with their family'], answer: 2 },
    ],
  },
  {
    id: 'part-time-job', title: 'アルバイト', en: 'My part-time job', level: 4,
    sentences: [
      { tokens: ['わたし', 'は', '駅[えき]', 'の', '前[まえ]', 'の', '喫茶店[きっさてん]', 'で', 'アルバイト', 'を', 'しています'], en: 'I work part-time at a café in front of the station.' },
      { tokens: ['火曜日[かようび]', 'と', '木曜日[もくようび]', 'と', '土曜日[どようび]', 'に', '働[はたら]いています'], en: 'I work on Tuesdays, Thursdays and Saturdays.' },
      { tokens: ['最初[さいしょ]', 'は', '仕事[しごと]', 'を', '覚[おぼ]える', 'の', 'が', '大変[たいへん]', 'でした'], en: 'At first, learning the job was hard.' },
      { tokens: ['でも', '店[みせ]', 'の', '人[ひと]', 'が', '親切[しんせつ]', 'に', '教[おし]えてくれました'], en: 'But the staff at the café taught me kindly.' },
      { tokens: ['今[いま]', 'は', 'おいしい', 'コーヒー', 'が', '作[つく]れる', 'ように', 'なりました'], en: 'Now I can make good coffee.' },
      { tokens: ['もらった', 'お金[かね]', 'で', '新[あたら]しい', 'パソコン', 'を', '買[か]う', 'つもり', 'です'], en: 'I plan to buy a new computer with the money I earn.' },
    ],
    questions: [
      { q: 'Where does the writer work?', options: ['At a café', 'At a convenience store', 'At a hotel'], answer: 0 },
      { q: 'What was hard at first?', options: ['Getting up early', 'Learning the job', 'Speaking Japanese'], answer: 1 },
      { q: 'What does the writer plan to buy?', options: ['A coffee machine', 'A bicycle', 'A new computer'], answer: 2 },
    ],
  },
  {
    id: 'moving', title: '引[ひ]っ越[こ]し', en: 'Moving house', level: 4,
    sentences: [
      { tokens: ['来週[らいしゅう]', '新[あたら]しい', 'アパート', 'に', '引[ひ]っ越[こ]します'], en: 'Next week I’m moving to a new flat.' },
      { tokens: ['今[いま]', 'の', '部屋[へや]', 'は', '狭[せま]くて', '駅[えき]', 'から', '遠[とお]い', 'ので', '不便[ふべん]', 'です'], en: 'My room now is small and far from the station, so it’s inconvenient.' },
      { tokens: ['新[あたら]しい', '部屋[へや]', 'は', '広[ひろ]くて', '窓[まど]', 'から', '公園[こうえん]', 'が', '見[み]えます'], en: 'The new room is roomy, and I can see a park from the window.' },
      { tokens: ['昨日[きのう]', 'から', '荷物[にもつ]', 'を', '箱[はこ]', 'に', '入[い]れています'], en: 'Since yesterday I’ve been packing my things into boxes.' },
      { tokens: ['本[ほん]', 'が', '多[おお]すぎて', 'なかなか', '終[お]わりません'], en: 'I have too many books, so it’s taking a long time.' },
      { tokens: ['引[ひ]っ越[こ]し', 'の', '日[ひ]', 'は', '友達[ともだち]', 'が', '手伝[てつだ]い', 'に', '来[き]てくれます'], en: 'On moving day, friends are coming to help me.' },
      { tokens: ['終[お]わったら', 'みんな', 'で', '晩[ばん]ご飯[はん]', 'を', '食[た]べよう', 'と', '思[おも]います'], en: 'When we’re done, I think we’ll all have dinner together.' },
    ],
    questions: [
      { q: 'When is the writer moving?', options: ['Next week', 'Tomorrow', 'Next month'], answer: 0 },
      { q: 'Why is the room now inconvenient?', options: ['It is noisy', 'It is far from the station', 'It has no window'], answer: 1 },
      { q: 'Who will help on moving day?', options: ['The writer’s family', 'Nobody', 'Friends'], answer: 2 },
    ],
  },
  {
    id: 'doctor', title: '病院[びょういん] で', en: 'At the doctor’s', level: 4,
    sentences: [
      { tokens: ['今朝[けさ]', 'から', '頭[あたま]', 'が', '痛[いた]くて', '熱[ねつ]', 'も', 'ありました'], en: 'I’d had a headache since this morning, and a fever too.' },
      { tokens: ['会社[かいしゃ]', 'を', '休[やす]んで', '近[ちか]く', 'の', '病院[びょういん]', 'へ', '行[い]きました'], en: 'I took the day off work and went to a nearby clinic.' },
      { tokens: ['医者[いしゃ]', 'に', '風邪[かぜ]', 'だ', 'と', '言[い]われました'], en: 'The doctor told me it was a cold.' },
      { tokens: ['薬[くすり]', 'を', 'もらって', '家[いえ]', 'に', '帰[かえ]りました'], en: 'I got some medicine and went home.' },
      { tokens: ['この', '薬[くすり]', 'は', 'ご飯[はん]', 'を', '食[た]べた', '後[あと]', 'に', '飲[の]まなければなりません'], en: 'I have to take this medicine after meals.' },
      { tokens: ['今晩[こんばん]', 'は', 'お風呂[ふろ]', 'に', '入[はい]らないで', '早[はや]く', '寝[ね]る', 'つもり', 'です'], en: 'Tonight I won’t have a bath; I plan to go to bed early.' },
      { tokens: ['明日[あした]', 'は', '会社[かいしゃ]', 'に', '行[い]ける', 'かもしれません'], en: 'I might be able to go to work tomorrow.' },
    ],
    questions: [
      { q: 'What was wrong with the writer?', options: ['A headache and a fever', 'A stomach ache', 'A sore leg'], answer: 0 },
      { q: 'What did the doctor say?', options: ['It was nothing', 'It was a cold', 'It was serious'], answer: 1 },
      { q: 'When must the writer take the medicine?', options: ['Before bed', 'In the morning', 'After meals'], answer: 2 },
    ],
  },
  {
    id: 'festival', title: '夏[なつ] の お祭[まつ]り', en: 'The summer festival', level: 4,
    sentences: [
      { tokens: ['先週[せんしゅう]', 'の', '土曜日[どようび]', '近[ちか]く', 'の', '神社[じんじゃ]', 'で', 'お祭[まつ]り', 'が', 'ありました'], en: 'Last Saturday there was a festival at a nearby shrine.' },
      { tokens: ['わたし', 'は', '初[はじ]めて', '着物[きもの]', 'を', '着[き]てみました'], en: 'I tried wearing a kimono for the first time.' },
      { tokens: ['道[みち]', 'に', '店[みせ]', 'が', 'たくさん', '並[なら]んでいて', 'とても', 'にぎやか', 'でした'], en: 'Lots of stalls lined the street, and it was very lively.' },
      { tokens: ['冷[つめ]たい', 'お茶[ちゃ]', 'を', '飲[の]みながら', '友達[ともだち]', 'と', '歩[ある]きました'], en: 'I walked around with friends, drinking cold tea.' },
      { tokens: ['夜[よる]', 'に', 'なる', 'と', 'みんな', 'で', '踊[おど]りました'], en: 'When night came, everyone danced together.' },
      { tokens: ['踊[おど]り', 'は', '思[おも]った', 'より', '簡単[かんたん]', 'で', '楽[たの]しかった', 'です'], en: 'The dancing was easier than I had expected, and fun.' },
      { tokens: ['来年[らいねん]', 'も', '一緒[いっしょ]', 'に', '行[い]こう', 'と', '約束[やくそく]しました'], en: 'We promised to go together again next year.' },
    ],
    questions: [
      { q: 'Where was the festival?', options: ['At a shrine', 'At a school', 'At the station'], answer: 0 },
      { q: 'What did the writer wear?', options: ['A suit', 'A kimono', 'A T-shirt'], answer: 1 },
      { q: 'What did they promise?', options: ['To meet tomorrow', 'To buy a kimono', 'To go again next year'], answer: 2 },
    ],
  },
  {
    id: 'email-teacher', title: '先生[せんせい] へ の メール', en: 'An email to my teacher', level: 3,
    sentences: [
      { tokens: ['先生[せんせい]', 'に', '相談[そうだん]したい', 'こと', 'が', 'あります'], en: 'There is something I would like to ask your advice about.' },
      { tokens: ['実[じつ]は', '来週[らいしゅう]', 'の', '授業[じゅぎょう]', 'を', '休[やす]まなければなりません'], en: 'The thing is, I have to miss next week’s classes.' },
      { tokens: ['母[はは]', 'の', '手術[しゅじゅつ]', 'の', 'ために', '国[くに]', 'へ', '帰[かえ]る', 'こと', 'に', 'なりました'], en: 'I have to go back to my country for my mother’s operation.' },
      { tokens: ['休[やす]んでいる', '間[あいだ]', 'の', '宿題[しゅくだい]', 'について', '教[おし]えていただけません', 'か'], en: 'Could you tell me about the homework for the time I’m away?' },
      { tokens: ['国[くに]', 'に', 'いる', '間[あいだ]', 'も', '毎日[まいにち]', '自分[じぶん]', 'で', '勉強[べんきょう]する', 'つもり', 'です'], en: 'While I’m back home, I intend to study on my own every day.' },
      { tokens: ['迷惑[めいわく]', 'を', 'かけて', 'すみません'], en: 'I’m sorry for the trouble.' },
      { tokens: ['どうぞ', 'よろしく', 'おねがいします'], en: 'Thank you very much for your help.' },
    ],
    questions: [
      { q: 'Why will the writer miss class?', options: ['They are starting a new job', 'Their mother is having an operation', 'They are moving house'], answer: 1 },
      { q: 'What does the writer ask the teacher about?', options: ['The homework', 'The test date', 'A new textbook'], answer: 0 },
      { q: 'What will the writer do while away?', options: ['Rest', 'Work', 'Study on their own every day'], answer: 2 },
    ],
  },
  {
    id: 'new-library', title: '新[あたら]しい 図書館[としょかん]', en: 'News: a new library', level: 3,
    sentences: [
      { tokens: ['来月[らいげつ]', '駅[えき]', 'の', '前[まえ]', 'に', '新[あたら]しい', '図書館[としょかん]', 'が', 'できる', 'こと', 'に', 'なりました'], en: 'A new library is to open in front of the station next month.' },
      { tokens: ['市[し]', 'によると', 'この', '図書館[としょかん]', 'は', '夜[よる]', '十時[じゅうじ]', 'まで', '開[あ]いている', 'そう', 'です'], en: 'According to the city, the library will be open until ten at night.' },
      { tokens: ['仕事[しごと]', 'の', '後[あと]', 'に', 'も', '利用[りよう]する', 'こと', 'が', 'できる', 'ので', '働[はたら]く', '人[ひと]', 'にとって', '便利[べんり]', 'です'], en: 'It can be used after work too, so it is convenient for people with jobs.' },
      { tokens: ['本[ほん]', 'だけでなく', '雑誌[ざっし]', 'や', '新聞[しんぶん]', 'も', '読[よ]める', 'そう', 'です'], en: 'Not only books but magazines and newspapers can be read there too.' },
      { tokens: ['親[おや]', 'が', '本[ほん]', 'を', '選[えら]んでいる', '間[あいだ]', '子供[こども]', 'が', '遊[あそ]べる', '部屋[へや]', 'も', 'あります'], en: 'There is also a room where children can play while their parents choose books.' },
      { tokens: ['市[し]', 'は', '多[おお]く', 'の', '人[ひと]', 'に', '来[き]てほしい', 'と', '話[はな]しています'], en: 'The city says it hopes many people will come.' },
    ],
    questions: [
      { q: 'What will open next month?', options: ['A library', 'A station', 'A school'], answer: 0 },
      { q: 'Until what time will it be open?', options: ['Six in the evening', 'Ten at night', 'Midnight'], answer: 1 },
      { q: 'What can children do there?', options: ['Watch films', 'Take classes', 'Play while their parents choose books'], answer: 2 },
    ],
  },
  {
    id: 'early-riser', title: '早起[はやお]き', en: 'Getting up early', level: 3,
    sentences: [
      { tokens: ['去年[きょねん]', 'から', '毎朝[まいあさ]', '五時[ごじ]', 'に', '起[お]きる', 'ように', 'しています'], en: 'Since last year I’ve made a point of getting up at five every morning.' },
      { tokens: ['前[まえ]', 'は', '夜[よる]', '遅[おそ]く', 'まで', 'テレビ', 'を', '見[み]てばかりいました'], en: 'Before, I did nothing but watch TV until late at night.' },
      { tokens: ['その', 'せいで', '朝[あさ]', 'は', 'いつも', '疲[つか]れていて', '会社[かいしゃ]', 'に', '遅[おく]れる', 'こと', 'も', 'ありました'], en: 'Because of that I was always tired in the mornings, and sometimes I was late for work.' },
      { tokens: ['早[はや]く', '寝[ね]る', 'ように', 'なってから', '体[からだ]', 'の', '調子[ちょうし]', 'が', 'いい', 'です'], en: 'Since I started going to bed early, I’ve felt much better.' },
      { tokens: ['朝[あさ]', 'の', '静[しず]か', 'な', '時間[じかん]', 'に', '本[ほん]', 'を', '読[よ]んだり', '散歩[さんぽ]', 'したり', 'しています'], en: 'In the quiet morning hours I read, go for walks and so on.' },
      { tokens: ['早[はや]く', '起[お]きれば', '起[お]きる', 'ほど', '一日[いちにち]', 'が', '長[なが]く', '感[かん]じます'], en: 'The earlier I get up, the longer the day feels.' },
      { tokens: ['忙[いそが]しい', '人[ひと]', 'にとって', '早[はや]く', '起[お]きる', 'こと', 'は', 'いい', '習慣[しゅうかん]', 'だ', 'と', '思[おも]います'], en: 'I think getting up early is a good habit for busy people.' },
    ],
    questions: [
      { q: 'What time does the writer get up now?', options: ['At five', 'At six', 'At seven'], answer: 0 },
      { q: 'What did the writer use to do until late at night?', options: ['Work', 'Watch TV', 'Study'], answer: 1 },
      { q: 'What does the writer say about the day?', options: ['It feels shorter', 'It feels busier', 'The earlier they get up, the longer it feels'], answer: 2 },
    ],
  },
  {
    id: 'rubbish', title: 'ごみ の 出[だ]し方[かた]', en: 'How to put out the rubbish', level: 3,
    sentences: [
      { tokens: ['先月[せんげつ]', 'この', '町[まち]', 'に', '引[ひ]っ越[こ]してきた', 'ばかり', 'です'], en: 'I only moved to this town last month.' },
      { tokens: ['ごみ', 'を', '出[だ]す', '日[ひ]', 'が', '決[き]まっている', 'こと', 'を', '知[し]りませんでした'], en: 'I didn’t know that there are set days for putting out the rubbish.' },
      { tokens: ['先週[せんしゅう]', '間違[まちが]えて', '違[ちが]う', '日[ひ]', 'に', 'ごみ', 'を', '出[だ]してしまいました'], en: 'Last week I put my rubbish out on the wrong day by mistake.' },
      { tokens: ['となり', 'の', '人[ひと]', 'が', 'ごみ', 'の', '出[だ]し方[かた]', 'を', '教[おし]えてくれました'], en: 'My next-door neighbour showed me how to put out the rubbish.' },
      { tokens: ['燃[も]える', 'ごみ', 'は', '火曜日[かようび]', 'と', '金曜日[きんようび]', 'に', '出[だ]す', 'こと', 'に', 'なっています'], en: 'Burnable rubbish is supposed to go out on Tuesdays and Fridays.' },
      { tokens: ['それから', 'は', '出[だ]す', '前[まえ]', 'に', 'カレンダー', 'を', '見[み]る', 'ように', 'しています'], en: 'Since then, I make a point of checking the calendar before I put it out.' },
      { tokens: ['となり', 'の', '人[ひと]', 'の', 'おかげで', '町[まち]', 'の', '生活[せいかつ]', 'に', '慣[な]れてきました'], en: 'Thanks to my neighbour, I’m getting used to life in the town.' },
    ],
    questions: [
      { q: 'When did the writer move to the town?', options: ['Last month', 'Last year', 'Last week'], answer: 0 },
      { q: 'Who showed the writer the rules?', options: ['A teacher', 'The neighbour', 'A friend'], answer: 1 },
      { q: 'What does the writer do now before putting out rubbish?', options: ['Asks the neighbour', 'Reads the news', 'Checks the calendar'], answer: 2 },
    ],
  },
  {
    id: 'lost-wallet', title: '財布[さいふ]', en: 'The lost wallet', level: 3,
    sentences: [
      { tokens: ['昨日[きのう]', '仕事[しごと]', 'から', '帰[かえ]る', '途中[とちゅう]', 'で', '財布[さいふ]', 'を', '無[な]くしてしまいました'], en: 'Yesterday I lost my wallet on the way home from work.' },
      { tokens: ['電車[でんしゃ]', 'に', '乗[の]っている', '間[あいだ]', 'に', '落[お]とした', 'の', 'かもしれません'], en: 'Maybe I dropped it while I was on the train.' },
      { tokens: ['財布[さいふ]', 'に', 'は', 'お金[かね]', 'だけでなく', 'カード', 'も', '入[はい]っていました'], en: 'There were not only money but cards in the wallet too.' },
      { tokens: ['駅[えき]', 'に', '電話[でんわ]', 'を', 'かけました', 'が', '見[み]つかりませんでした'], en: 'I phoned the station, but it hadn’t been found.' },
      { tokens: ['今朝[けさ]', '警察[けいさつ]', 'から', '電話[でんわ]', 'が', 'あって', '財布[さいふ]', 'が', '届[とど]いた', 'と', '言[い]われました'], en: 'This morning the police phoned to tell me my wallet had been handed in.' },
      { tokens: ['拾[ひろ]ってくれた', 'の', 'は', '高校生[こうこうせい]', 'だった', 'そう', 'です'], en: 'I hear the person who picked it up was a high-school student.' },
      { tokens: ['お礼[れい]', 'を', '言[い]いたい', 'ので', '手紙[てがみ]', 'を', '書[か]く', 'こと', 'に', 'しました'], en: 'I want to thank them, so I’ve decided to write a letter.' },
    ],
    questions: [
      { q: 'Where might the writer have dropped the wallet?', options: ['On the train', 'At work', 'In a shop'], answer: 0 },
      { q: 'Who phoned the writer this morning?', options: ['The station', 'The police', 'A student'], answer: 1 },
      { q: 'What has the writer decided to do?', options: ['Buy a new wallet', 'Visit the station', 'Write a letter'], answer: 2 },
    ],
  },
]
