// Starter vocabulary, written for this app. Each word: [kana as normally written, Hepburn romaji (long vowels as
// ou/uu/ii/aa so it matches how it is typed; ' marks ん before a vowel or y: kin'youbi is きんようび, kinyoubi would be きにょうび), English, optional kanji shown as a small extra]. Content tests check the
// romaji against the kana and that every English gloss and kana spelling is unique (so no quiz has two right answers).
type W = [jp: string, romaji: string, en: string, kanji?: string]
export interface VocabUnit { id: string; title: string; blurb: string; words: W[] } // 18 words = 3 lessons of 6

export const VOCAB_UNITS: VocabUnit[] = [
  { id: 'greetings', title: 'Greetings and phrases', blurb: 'Say hello, thank people and be polite.', words: [
    ['おはよう', 'ohayou', 'good morning (casual)'],
    ['おはようございます', 'ohayou gozaimasu', 'good morning (polite)'],
    ['こんにちは', 'konnichiwa', 'hello, good afternoon'],
    ['こんばんは', 'konbanwa', 'good evening'],
    ['さようなら', 'sayounara', 'goodbye'],
    ['おやすみなさい', 'oyasuminasai', 'good night'],
    ['ありがとう', 'arigatou', 'thank you'],
    ['ありがとうございます', 'arigatou gozaimasu', 'thank you very much'],
    ['どういたしまして', 'douitashimashite', "you're welcome"],
    ['すみません', 'sumimasen', 'excuse me, sorry'],
    ['ごめんなさい', 'gomennasai', "I'm sorry"],
    ['おねがいします', 'onegaishimasu', 'please'],
    ['はい', 'hai', 'yes'],
    ['いいえ', 'iie', 'no'],
    ['はじめまして', 'hajimemashite', 'nice to meet you'],
    ['よろしくおねがいします', 'yoroshiku onegaishimasu', 'pleased to meet you'],
    ['いただきます', 'itadakimasu', 'let us eat (said before a meal)'],
    ['ごちそうさまでした', 'gochisousamadeshita', 'thank you for the meal'],
  ] },
  { id: 'numbers', title: 'Numbers', blurb: 'Count from zero to ten thousand.', words: [
    ['れい', 'rei', 'zero'], ['いち', 'ichi', 'one', '一'], ['に', 'ni', 'two', '二'], ['さん', 'san', 'three', '三'],
    ['よん', 'yon', 'four', '四'], ['ご', 'go', 'five', '五'], ['ろく', 'roku', 'six', '六'], ['なな', 'nana', 'seven', '七'],
    ['はち', 'hachi', 'eight', '八'], ['きゅう', 'kyuu', 'nine', '九'], ['じゅう', 'juu', 'ten', '十'],
    ['ひゃく', 'hyaku', 'hundred', '百'], ['せん', 'sen', 'thousand', '千'], ['まん', 'man', 'ten thousand', '万'],
    ['ひとつ', 'hitotsu', 'one thing'], ['ふたつ', 'futatsu', 'two things'], ['みっつ', 'mittsu', 'three things'],
    ['いくつ', 'ikutsu', 'how many'],
  ] },
  { id: 'people', title: 'People and family', blurb: 'Talk about yourself, friends and family.', words: [
    ['わたし', 'watashi', 'I, me', '私'], ['あなた', 'anata', 'you'], ['ともだち', 'tomodachi', 'friend', '友達'],
    ['せんせい', 'sensei', 'teacher', '先生'], ['がくせい', 'gakusei', 'student', '学生'], ['ひと', 'hito', 'person', '人'],
    ['おとこ', 'otoko', 'man', '男'], ['おんな', 'onna', 'woman', '女'], ['こども', 'kodomo', 'child', '子供'],
    ['かぞく', 'kazoku', 'family', '家族'], ['おかあさん', 'okaasan', 'mother', 'お母さん'], ['おとうさん', 'otousan', 'father', 'お父さん'],
    ['おにいさん', 'oniisan', 'older brother', 'お兄さん'], ['おねえさん', 'oneesan', 'older sister', 'お姉さん'],
    ['おとうと', 'otouto', 'younger brother', '弟'], ['いもうと', 'imouto', 'younger sister', '妹'],
    ['なまえ', 'namae', 'name', '名前'], ['みなさん', 'minasan', 'everyone', '皆さん'],
  ] },
  { id: 'food', title: 'Food and drink', blurb: 'Order, eat and drink.', words: [
    ['みず', 'mizu', 'water', '水'], ['おちゃ', 'ocha', 'tea', 'お茶'], ['ごはん', 'gohan', 'rice, meal', 'ご飯'], ['パン', 'pan', 'bread'],
    ['たまご', 'tamago', 'egg', '卵'], ['さかな', 'sakana', 'fish', '魚'], ['にく', 'niku', 'meat', '肉'], ['やさい', 'yasai', 'vegetables', '野菜'],
    ['くだもの', 'kudamono', 'fruit', '果物'], ['りんご', 'ringo', 'apple'], ['みかん', 'mikan', 'mandarin orange'],
    ['ぎゅうにゅう', 'gyuunyuu', 'milk', '牛乳'], ['コーヒー', 'koohii', 'coffee'], ['さけ', 'sake', 'sake, alcohol', 'お酒'],
    ['すし', 'sushi', 'sushi', '寿司'], ['ラーメン', 'raamen', 'ramen'], ['おべんとう', 'obentou', 'boxed lunch', 'お弁当'], ['ケーキ', 'keeki', 'cake'],
  ] },
  { id: 'places', title: 'Places and things', blurb: 'Name what is around you.', words: [
    ['いえ', 'ie', 'house, home', '家'], ['がっこう', 'gakkou', 'school', '学校'], ['えき', 'eki', 'station', '駅'], ['みせ', 'mise', 'shop', '店'],
    ['びょういん', 'byouin', 'hospital', '病院'], ['ほん', 'hon', 'book', '本'], ['くるま', 'kuruma', 'car', '車'], ['でんしゃ', 'densha', 'train', '電車'],
    ['かばん', 'kaban', 'bag', '鞄'], ['とけい', 'tokei', 'clock, watch', '時計'], ['でんわ', 'denwa', 'telephone', '電話'], ['かさ', 'kasa', 'umbrella', '傘'],
    ['つくえ', 'tsukue', 'desk', '机'], ['いす', 'isu', 'chair', '椅子'], ['まど', 'mado', 'window', '窓'], ['ドア', 'doa', 'door'],
    ['トイレ', 'toire', 'toilet'], ['テレビ', 'terebi', 'television'],
  ] },
  { id: 'time', title: 'Time and days', blurb: 'Talk about when things happen.', words: [
    ['きょう', 'kyou', 'today', '今日'], ['あした', 'ashita', 'tomorrow', '明日'], ['きのう', 'kinou', 'yesterday', '昨日'], ['いま', 'ima', 'now', '今'],
    ['あさ', 'asa', 'morning', '朝'], ['ひる', 'hiru', 'daytime, noon', '昼'], ['よる', 'yoru', 'night', '夜'], ['まいにち', 'mainichi', 'every day', '毎日'],
    ['げつようび', 'getsuyoubi', 'Monday', '月曜日'], ['かようび', 'kayoubi', 'Tuesday', '火曜日'], ['すいようび', 'suiyoubi', 'Wednesday', '水曜日'],
    ['もくようび', 'mokuyoubi', 'Thursday', '木曜日'], ['きんようび', "kin'youbi", 'Friday', '金曜日'], ['どようび', 'doyoubi', 'Saturday', '土曜日'],
    ['にちようび', 'nichiyoubi', 'Sunday', '日曜日'], ['しゅうまつ', 'shuumatsu', 'weekend', '週末'], ['ことし', 'kotoshi', 'this year', '今年'],
    ['らいしゅう', 'raishuu', 'next week', '来週'],
  ] },
  { id: 'verbs', title: 'Everyday verbs', blurb: 'The actions you will use most.', words: [
    ['たべる', 'taberu', 'to eat', '食べる'], ['のむ', 'nomu', 'to drink', '飲む'], ['いく', 'iku', 'to go', '行く'], ['くる', 'kuru', 'to come', '来る'],
    ['みる', 'miru', 'to see, to watch', '見る'], ['きく', 'kiku', 'to listen, to ask', '聞く'], ['はなす', 'hanasu', 'to speak', '話す'],
    ['よむ', 'yomu', 'to read', '読む'], ['かく', 'kaku', 'to write', '書く'], ['かう', 'kau', 'to buy', '買う'], ['ねる', 'neru', 'to sleep', '寝る'],
    ['おきる', 'okiru', 'to wake up', '起きる'], ['あそぶ', 'asobu', 'to play', '遊ぶ'], ['はたらく', 'hataraku', 'to work', '働く'],
    ['べんきょうする', 'benkyousuru', 'to study'], ['ある', 'aru', 'to exist (things)'], ['いる', 'iru', 'to exist (people, animals)'], ['する', 'suru', 'to do'],
  ] },
  { id: 'adjectives', title: 'Adjectives and colours', blurb: 'Describe things.', words: [
    ['おおきい', 'ookii', 'big', '大きい'], ['ちいさい', 'chiisai', 'small', '小さい'], ['あたらしい', 'atarashii', 'new', '新しい'], ['ふるい', 'furui', 'old (things)', '古い'],
    ['たかい', 'takai', 'tall, expensive', '高い'], ['やすい', 'yasui', 'cheap', '安い'], ['おいしい', 'oishii', 'delicious'], ['あつい', 'atsui', 'hot'],
    ['さむい', 'samui', 'cold (weather)', '寒い'], ['たのしい', 'tanoshii', 'fun', '楽しい'], ['むずかしい', 'muzukashii', 'difficult', '難しい'],
    ['やさしい', 'yasashii', 'easy, kind'], ['いい', 'ii', 'good', '良い'], ['しろ', 'shiro', 'white', '白'], ['くろ', 'kuro', 'black', '黒'],
    ['あか', 'aka', 'red', '赤'], ['あお', 'ao', 'blue', '青'], ['きいろ', 'kiiro', 'yellow', '黄色'],
  ] },
]
