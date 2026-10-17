// Short two-person dialogues for listening practice, written for this app at N5, N4 and N3, with questions like the JLPT
// listening section. Chunks carry furigana as 漢字[かんじ], like the stories; every word is a course word of the dialogue's
// level or easier (tests check). A line may hold more than one sentence: 、 。 and ？ are chunks of their own.
import type { Story } from './stories'

export interface Dialogue {
  id: string
  title: string // English
  scene: string // English: who is talking, where; A speaks first
  level: 5 | 4 | 3
  lines: { who: 'A' | 'B'; tokens: string[]; en: string }[]
  questions: Story['questions']
}

export const DIALOGUES: Dialogue[] = [
  {
    id: 'umbrella', title: 'Buying an umbrella', scene: 'In a shop. A customer (A) talks to a shop assistant (B).', level: 5,
    lines: [
      { who: 'A', tokens: ['すみません', '、', 'もう', '少[すこ]し', '大[おお]きい', '傘[かさ]', 'は', 'あります', 'か'], en: 'Excuse me, do you have a slightly bigger umbrella?' },
      { who: 'B', tokens: ['はい', '、', 'こちら', 'の', '黒[くろ]い', '傘[かさ]', 'と', '青[あお]い', '傘[かさ]', 'は', 'いかが', 'です', 'か'], en: 'Yes. How about this black umbrella, or this blue one?' },
      { who: 'A', tokens: ['黒[くろ]い', 'の', 'は', 'ちょっと', '高[たか]い', 'です', 'ね'], en: 'The black one is a bit expensive.' },
      { who: 'B', tokens: ['青[あお]い', 'の', 'は', '黒[くろ]い', 'の', 'より', '安[やす]い', 'です', 'よ'], en: 'The blue one is cheaper than the black one.' },
      { who: 'A', tokens: ['じゃ', '、', '青[あお]い', 'の', 'を', 'ください'], en: 'I’ll take the blue one, then.' },
    ],
    questions: [
      { q: 'What does the customer ask for?', options: ['A cheaper umbrella', 'A bigger umbrella', 'A red umbrella'], answer: 1 },
      { q: 'Why doesn’t the customer buy the black umbrella?', options: ['It is a bit expensive', 'It is too small', 'It is too heavy'], answer: 0 },
      { q: 'Which umbrella does the customer buy?', options: ['The blue one', 'The black one', 'Neither'], answer: 0 },
    ],
  },
  {
    id: 'next-train', title: 'The next train', scene: 'At a station. A passenger (A) asks a station worker (B).', level: 5,
    lines: [
      { who: 'A', tokens: ['すみません', '、', '次[つぎ]', 'の', '電車[でんしゃ]', 'は', 'いつ', '来[き]ます', 'か'], en: 'Excuse me, when does the next train come?' },
      { who: 'B', tokens: ['十時[じゅうじ]', 'に', '来[き]ます'], en: 'It comes at ten.' },
      { who: 'A', tokens: ['今[いま]', '九時[くじ]', '五十分[ごじゅっぷん]', 'です', 'ね', '。', '切符[きっぷ]', 'は', 'どこ', 'で', '買[か]います', 'か'], en: 'It’s ten to ten now, isn’t it? Where do I buy a ticket?' },
      { who: 'B', tokens: ['あそこ', 'の', '入口[いりぐち]', 'の', '右[みぎ]', 'に', 'あります'], en: 'Over there, to the right of the entrance.' },
      { who: 'A', tokens: ['ありがとうございます'], en: 'Thank you very much.' },
    ],
    questions: [
      { q: 'What time is the next train?', options: ['9:50', '10:00', '10:50'], answer: 1 },
      { q: 'Where are tickets sold?', options: ['To the right of the entrance', 'To the left of the exit', 'On the train'], answer: 0 },
      { q: 'What will the passenger do next?', options: ['Get on the train', 'Buy a ticket', 'Go home'], answer: 1 },
    ],
  },
  {
    id: 'phone-film', title: 'A phone call', scene: 'Two friends are talking on the phone. A made the call.', level: 5,
    lines: [
      { who: 'A', tokens: ['もしもし', '、', '今[いま]', '大丈夫[だいじょうぶ]', 'です', 'か'], en: 'Hello? Is now a good time?' },
      { who: 'B', tokens: ['はい', '、', '大丈夫[だいじょうぶ]', 'です'], en: 'Yes, it’s fine.' },
      { who: 'A', tokens: ['明日[あした]', '一緒[いっしょ]', 'に', '映画[えいが]', 'を', '見[み]ません', 'か'], en: 'Would you like to see a film together tomorrow?' },
      { who: 'B', tokens: ['すみません', '、', '明日[あした]', 'は', '仕事[しごと]', 'が', 'あります', '。', '土曜日[どようび]', 'は', 'どう', 'です', 'か'], en: 'Sorry, I have work tomorrow. How about Saturday?' },
      { who: 'A', tokens: ['いい', 'です', 'よ', '。', 'じゃ', '、', '土曜日[どようび]', 'の', '午後[ごご]', '二時[にじ]', 'に', '駅[えき]', 'の', '前[まえ]', 'で', '会[あ]いましょう'], en: 'Sure. Then let’s meet in front of the station at two on Saturday afternoon.' },
      { who: 'B', tokens: ['分[わ]かりました', '。', 'じゃ', '、', 'また'], en: 'OK. See you then.' },
    ],
    questions: [
      { q: 'Why can’t B go tomorrow?', options: ['B has work', 'B is ill', 'B has homework'], answer: 0 },
      { q: 'When will they see the film?', options: ['Tomorrow', 'On Saturday', 'On Sunday'], answer: 1 },
      { q: 'Where will they meet?', options: ['In front of the station', 'At the cinema', 'At a café'], answer: 0 },
    ],
  },
  {
    id: 'lunch', title: 'Lunch', scene: 'At the office. A asks a colleague, B, about lunch.', level: 5,
    lines: [
      { who: 'A', tokens: ['昼[ひる]ご飯[はん]', 'は', 'もう', '食[た]べました', 'か'], en: 'Have you had lunch yet?' },
      { who: 'B', tokens: ['いいえ', '、', 'まだ', 'です'], en: 'No, not yet.' },
      { who: 'A', tokens: ['じゃ', '、', '一緒[いっしょ]', 'に', '食[た]べに', '行[い]きましょう'], en: 'Then let’s go and eat together.' },
      { who: 'B', tokens: ['いい', 'です', 'ね', '。', 'どこ', 'へ', '行[い]きます', 'か'], en: 'Good idea. Where shall we go?' },
      { who: 'A', tokens: ['駅[えき]', 'の', '近[ちか]く', 'に', '新[あたら]しい', '店[みせ]', 'が', 'あります', '。', 'ラーメン', 'が', '安[やす]くて', 'おいしい', 'です', 'よ'], en: 'There’s a new place near the station. Its ramen is cheap and good.' },
      { who: 'B', tokens: ['じゃ', '、', 'そこ', 'へ', '行[い]きましょう', '。', 'ちょっと', '待[ま]って', 'ください', '。', 'かばん', 'を', '持[も]って', '来[き]ます'], en: 'Let’s go there, then. Just a moment: I’ll get my bag.' },
    ],
    questions: [
      { q: 'What will they do?', options: ['Eat lunch together', 'Take a train', 'Cook ramen'], answer: 0 },
      { q: 'What is the new place like?', options: ['Expensive but good', 'Cheap and good', 'Big and quiet'], answer: 1 },
      { q: 'What will B do first?', options: ['Phone the restaurant', 'Buy a ticket', 'Get a bag'], answer: 2 },
    ],
  },
  {
    id: 'clinic', title: 'At the clinic', scene: 'At a clinic. A doctor (A) talks to a patient (B).', level: 4,
    lines: [
      { who: 'A', tokens: ['今日[きょう]', 'は', 'どう', 'しました', 'か'], en: 'What seems to be the problem today?' },
      { who: 'B', tokens: ['昨日[きのう]', 'の', '夜[よる]', 'から', 'のど', 'が', '痛[いた]くて', '、', '熱[ねつ]', 'も', 'あります'], en: 'My throat has hurt since last night, and I have a fever too.' },
      { who: 'A', tokens: ['風邪[かぜ]', 'です', 'ね', '。', '薬[くすり]', 'を', '出[だ]しておきます'], en: 'It’s a cold. I’ll give you some medicine.' },
      { who: 'B', tokens: ['明日[あした]', 'は', '会社[かいしゃ]', 'に', '行[い]ってもいい', 'です', 'か'], en: 'May I go to work tomorrow?' },
      { who: 'A', tokens: ['いいえ', '、', '明日[あした]', 'まで', 'は', '家[いえ]', 'で', '休[やす]んだ', 'ほう', 'が', 'いい', 'です', 'よ'], en: 'No, you’d better rest at home until tomorrow.' },
      { who: 'B', tokens: ['分[わ]かりました', '。', '薬[くすり]', 'は', 'いつ', '飲[の]めば', 'いい', 'です', 'か'], en: 'I see. When should I take the medicine?' },
      { who: 'A', tokens: ['朝[あさ]', 'と', '夜[よる]', '、', 'ご飯[はん]', 'を', '食[た]べた', '後[あと]', 'に', '飲[の]んでください'], en: 'In the morning and at night, after meals.' },
    ],
    questions: [
      { q: 'What is wrong with the patient?', options: ['A sore throat and a fever', 'A headache', 'A stomach ache'], answer: 0 },
      { q: 'What should the patient do tomorrow?', options: ['Go to work', 'Rest at home', 'Come back to the clinic'], answer: 1 },
      { q: 'When should the patient take the medicine?', options: ['Only before bed', 'In the morning and at night, after meals', 'Every three hours'], answer: 1 },
    ],
  },
  {
    id: 'library', title: 'At the library', scene: 'At a library. A wants to borrow some books; B works there.', level: 4,
    lines: [
      { who: 'A', tokens: ['すみません', '、', 'この', '本[ほん]', 'を', '借[か]りたい', 'の', 'です', 'が'], en: 'Excuse me, I’d like to borrow these books.' },
      { who: 'B', tokens: ['こちら', 'の', '図書館[としょかん]', 'は', '初[はじ]めて', 'です', 'か'], en: 'Is this your first time at this library?' },
      { who: 'A', tokens: ['はい', '、', '初[はじ]めて', 'です'], en: 'Yes, it is.' },
      { who: 'B', tokens: ['では', '、', 'この', '紙[かみ]', 'に', '名前[なまえ]', 'と', '住所[じゅうしょ]', 'を', '書[か]いてください'], en: 'Then please write your name and address on this form.' },
      { who: 'A', tokens: ['分[わ]かりました', '。', '本[ほん]', 'は', 'いつ', 'まで', '借[か]りられます', 'か'], en: 'OK. Until when can I borrow the books?' },
      { who: 'B', tokens: ['来週[らいしゅう]', 'の', '金曜日[きんようび]', 'まで', 'です', '。', '遅[おく]れない', 'ように', '返[かえ]してください'], en: 'Until next Friday. Please make sure you return them on time.' },
    ],
    questions: [
      { q: 'What must A do first?', options: ['Write their name and address', 'Pay some money', 'Show a student card'], answer: 0 },
      { q: 'Until when can A keep the books?', options: ['This Friday', 'Next Friday', 'The end of the month'], answer: 1 },
    ],
  },
  {
    id: 'meeting', title: 'Tomorrow’s meeting', scene: 'At the office. A asks a colleague, B, about a meeting.', level: 4,
    lines: [
      { who: 'A', tokens: ['明日[あした]', 'の', '会議[かいぎ]', 'は', '十時[じゅうじ]', 'から', 'です', 'よ', 'ね'], en: 'Tomorrow’s meeting starts at ten, doesn’t it?' },
      { who: 'B', tokens: ['その', '予定[よてい]', 'でした', 'が', '、', '部長[ぶちょう]', 'が', '遅[おく]れる', 'ので', '、', '午後[ごご]', '一時[いちじ]', 'に', 'なりました'], en: 'It was going to start at ten, but the manager will be late, so it’s now at one in the afternoon.' },
      { who: 'A', tokens: ['そう', 'です', 'か', '。', '場所[ばしょ]', 'は', '同[おな]じ', 'です', 'か'], en: 'I see. Is it in the same place?' },
      { who: 'B', tokens: ['はい', '、', '同[おな]じ', '会議室[かいぎしつ]', 'です'], en: 'Yes, the same meeting room.' },
      { who: 'A', tokens: ['何[なに]', 'か', '準備[じゅんび]する', 'もの', 'は', 'あります', 'か'], en: 'Is there anything I should get ready?' },
      { who: 'B', tokens: ['会議室[かいぎしつ]', 'に', '椅子[いす]', 'を', '並[なら]べておいてください'], en: 'Please set out the chairs in the meeting room.' },
      { who: 'A', tokens: ['はい', '、', 'すぐに', 'やります'], en: 'Sure, I’ll do it right away.' },
    ],
    questions: [
      { q: 'What time will the meeting start?', options: ['10 a.m.', '1 p.m.', '3 p.m.'], answer: 1 },
      { q: 'Why has the time changed?', options: ['The room is busy', 'The manager will be late', 'B is ill'], answer: 1 },
      { q: 'What will A do next?', options: ['Set out the chairs', 'Book a room', 'Phone the manager'], answer: 0 },
    ],
  },
  {
    id: 'weekend-plans', title: 'Plans for the weekend', scene: 'Two friends, A and B, are making plans.', level: 4,
    lines: [
      { who: 'A', tokens: ['日曜日[にちようび]', '、', '天気[てんき]', 'が', 'よかったら', '一緒[いっしょ]', 'に', '山[やま]', 'に', '登[のぼ]らない', '？'], en: 'If the weather’s good on Sunday, shall we climb a mountain together?' },
      { who: 'B', tokens: ['いい', 'ね', '。', 'でも', '、', '日曜日[にちようび]', 'は', '雨[あめ]', 'が', '降[ふ]る', 'そう', 'だ', 'よ'], en: 'Sounds good. But I hear it’s going to rain on Sunday.' },
      { who: 'A', tokens: ['そう', 'か', '。', 'じゃ', '、', '土曜日[どようび]', 'は', '？'], en: 'Oh. What about Saturday, then?' },
      { who: 'B', tokens: ['土曜日[どようび]', 'は', '午前[ごぜん]', 'アルバイト', 'が', 'ある', 'けど', '、', '午後[ごご]', 'なら', '大丈夫[だいじょうぶ]'], en: 'On Saturday I have my part-time job in the morning, but the afternoon is fine.' },
      { who: 'A', tokens: ['じゃ', '、', '山[やま]', 'は', 'やめて', '、', '午後[ごご]', 'に', '映画[えいが]', 'を', '見[み]に', '行[い]こう', 'よ'], en: 'Then let’s forget the mountain and go and see a film in the afternoon.' },
      { who: 'B', tokens: ['うん', '、', 'そう', 'しよう', '。', '三時[さんじ]', 'に', '映画館[えいがかん]', 'の', '前[まえ]', 'で', '会[あ]おう'], en: 'Yeah, let’s. Let’s meet in front of the cinema at three.' },
    ],
    questions: [
      { q: 'Why won’t they climb the mountain on Sunday?', options: ['B has work', 'It is going to rain', 'A is tired'], answer: 1 },
      { q: 'What will they do on Saturday afternoon?', options: ['Climb a mountain', 'See a film', 'Work'], answer: 1 },
      { q: 'Where and when will they meet?', options: ['At the station at one', 'In front of the cinema at three', 'At B’s home at three'], answer: 1 },
    ],
  },
  {
    id: 'return-shirt', title: 'Returning a shirt', scene: 'In a clothes shop. A customer (A) talks to a shop assistant (B).', level: 3,
    lines: [
      { who: 'A', tokens: ['すみません', '、', '昨日[きのう]', 'ここ', 'で', 'この', 'シャツ', 'を', '買[か]った', 'の', 'です', 'が', '、', '着[き]てみたら', '小[ちい]さすぎました'], en: 'Excuse me, I bought this shirt here yesterday, but when I tried it on it was too small.' },
      { who: 'B', tokens: ['申[もう]し訳[わけ]ありません', '。', '大[おお]きい', 'の', 'と', 'お', '取[と]り替[か]え', 'しましょう', 'か', '、', 'それとも', 'お', '返[かえ]し', 'しましょう', 'か'], en: 'I’m very sorry. Shall I exchange it for a bigger one, or give you your money back?' },
      { who: 'A', tokens: ['同[おな]じ', '色[いろ]', 'の', '大[おお]きい', 'の', 'が', 'あれば', '、', '取[と]り替[か]えていただきたい', 'です'], en: 'If you have a bigger one in the same colour, I’d like to exchange it.' },
      { who: 'B', tokens: ['申[もう]し訳[わけ]ありません', '。', 'その', '色[いろ]', 'は', 'もう', '売[う]り切[き]れてしまいました'], en: 'I’m very sorry. That colour has already sold out.' },
      { who: 'A', tokens: ['そう', 'です', 'か', '。', 'では', '、', 'お金[かね]', 'を', '返[かえ]していただけます', 'か'], en: 'I see. Then could I have my money back?' },
      { who: 'B', tokens: ['承知[しょうち]しました'], en: 'Certainly.' },
    ],
    questions: [
      { q: 'What was wrong with the shirt?', options: ['It was too small', 'It was dirty', 'It was the wrong colour'], answer: 0 },
      { q: 'Why can’t the customer exchange it?', options: ['There is no receipt', 'That colour has sold out', 'The shop doesn’t exchange clothes'], answer: 1 },
      { q: 'What will the customer get in the end?', options: ['A bigger shirt', 'A shirt in another colour', 'Their money back'], answer: 2 },
    ],
  },
  {
    id: 'message', title: 'A message for the manager', scene: 'A phone call to an office. B works there; A is calling from another company.', level: 3,
    lines: [
      { who: 'A', tokens: ['もしもし', '、', 'さくら', '銀行[ぎんこう]', 'の', '林[はやし]', 'と', '申[もう]します', '。', '部長[ぶちょう]', 'は', 'いらっしゃいます', 'か'], en: 'Hello, this is Hayashi from Sakura Bank. Is the manager there?' },
      { who: 'B', tokens: ['申[もう]し訳[わけ]ありません', '。', '部長[ぶちょう]', 'は', '今[いま]', '会議[かいぎ]', 'に', '出[で]ています'], en: 'I’m very sorry. The manager is in a meeting right now.' },
      { who: 'B', tokens: ['三時[さんじ]', 'に', '終[お]わる', '予定[よてい]', 'です', 'が', '、', '何[なに]', 'か', 'お', '伝[つた]え', 'しましょう', 'か'], en: 'It’s due to finish at three. Shall I pass on a message?' },
      { who: 'A', tokens: ['では', '、', '明日[あした]', 'の', '約束[やくそく]', 'を', '金曜日[きんようび]', 'に', '変[か]えていただきたい', 'と', '伝[つた]えていただけます', 'か'], en: 'Then could you tell the manager I’d like to move tomorrow’s appointment to Friday?' },
      { who: 'B', tokens: ['金曜日[きんようび]', 'です', 'ね', '。', '時間[じかん]', 'は', '同[おな]じ', 'で', 'よろしい', 'です', 'か'], en: 'Friday. Is the same time all right?' },
      { who: 'A', tokens: ['はい', '、', '午前[ごぜん]', '十時[じゅうじ]', 'で', 'おねがいします', '。', '会議[かいぎ]', 'が', '終[お]わったら', '、', '電話[でんわ]', 'を', 'いただけます', 'か'], en: 'Yes, ten in the morning, please. Could the manager call me when the meeting is over?' },
      { who: 'B', tokens: ['承知[しょうち]しました', '。', 'そう', 'お', '伝[つた]え', 'しておきます'], en: 'Certainly. I’ll pass that on.' },
    ],
    questions: [
      { q: 'Why can’t the manager come to the phone?', options: ['The manager is in a meeting', 'The manager has gone home', 'The manager is on another call'], answer: 0 },
      { q: 'What does A want?', options: ['To cancel the appointment', 'To move the appointment to Friday', 'To make the appointment earlier on the same day'], answer: 1 },
      { q: 'What will happen after the meeting?', options: ['A will call again', 'A will visit the office', 'The manager will call A'], answer: 2 },
    ],
  },
  {
    id: 'flat', title: 'Looking for a flat', scene: 'At an estate agent’s. B works there; A is looking for a flat.', level: 3,
    lines: [
      { who: 'A', tokens: ['駅[えき]', 'から', '歩[ある]いて', '十分[じゅっぷん]', 'くらい', 'の', '部屋[へや]', 'を', '探[さが]している', 'の', 'です', 'が'], en: 'I’m looking for a flat about ten minutes’ walk from the station.' },
      { who: 'B', tokens: ['それ', 'なら', '、', 'この', '部屋[へや]', 'は', 'いかが', 'です', 'か', '。', '駅[えき]', 'から', '五分[ごふん]', 'で', '、', 'とても', '安[やす]い', 'です', 'よ'], en: 'In that case, how about this one? It’s five minutes from the station, and very cheap.' },
      { who: 'A', tokens: ['どうして', 'そんな', 'に', '安[やす]い', 'の', 'です', 'か'], en: 'Why is it so cheap?' },
      { who: 'B', tokens: ['建物[たてもの]', 'が', '古[ふる]くて', '、', '日[ひ]', 'が', 'あまり', '当[あ]たらない', 'から', 'です'], en: 'Because the building is old and it doesn’t get much sun.' },
      { who: 'A', tokens: ['それ', 'は', 'ちょっと', '困[こま]ります', 'ね', '。', '明[あか]るい', '部屋[へや]', 'の', 'ほう', 'が', 'いい', 'です'], en: 'That’s not ideal. I’d prefer a bright flat.' },
      { who: 'B', tokens: ['では', '、', 'こちら', 'は', 'どう', 'です', 'か', '。', '少[すこ]し', '高[たか]く', 'なります', 'が', '、', '新[あたら]しくて', '明[あか]るい', 'です', 'よ'], en: 'Then how about this one? It’s a little more expensive, but it’s new and bright.' },
      { who: 'A', tokens: ['じゃ', '、', '今日[きょう]', 'その', '部屋[へや]', 'を', '見[み]に', '行[い]ってもいい', 'です', 'か'], en: 'Then may I go and see it today?' },
    ],
    questions: [
      { q: 'What kind of flat is A looking for?', options: ['About ten minutes’ walk from the station', 'One with a garden', 'A big one near a park'], answer: 0 },
      { q: 'Why is the first flat cheap?', options: ['It is far from the station', 'The building is old and gets little sun', 'It is very small'], answer: 1 },
      { q: 'What will A do next?', options: ['Rent the first flat', 'Try another estate agent', 'Go and see the new, bright flat'], answer: 2 },
    ],
  },
  {
    id: 'farewell', title: 'A party for the manager', scene: 'Two colleagues, A and B, are organising a party for their manager, who is leaving the company.', level: 3,
    lines: [
      { who: 'A', tokens: ['来週[らいしゅう]', 'の', '部長[ぶちょう]', 'の', 'パーティー', 'の', '店[みせ]', '、', 'もう', '決[き]めた', '？'], en: 'Have you chosen the restaurant for the manager’s party next week yet?' },
      { who: 'B', tokens: ['まだ', '。', '駅[えき]', 'の', '近[ちか]く', 'の', '店[みせ]', 'に', '電話[でんわ]してみた', 'けど', '、', 'その', '日[ひ]', 'は', 'もう', '予約[よやく]', 'で', 'いっぱい', 'だった'], en: 'Not yet. I tried phoning the restaurant near the station, but it’s already fully booked that day.' },
      { who: 'A', tokens: ['そう', 'か', '。', 'じゃ', '、', '会社[かいしゃ]', 'の', '隣[となり]', 'の', '店[みせ]', 'は', 'どう', '？', '部長[ぶちょう]', 'は', '魚[さかな]', 'が', '好[す]き', 'だ', 'から', '、', 'あそこ', 'の', '魚[さかな]', 'が', 'いい', 'と', '思[おも]う', 'よ'], en: 'I see. Then how about the place next to the office? The manager likes fish, so I think the fish there would be good.' },
      { who: 'B', tokens: ['いい', 'ね', '。', '会社[かいしゃ]', 'から', '近[ちか]い', 'から', '、', 'みんな', 'も', '行[い]きやすい', 'ね'], en: 'Good idea. It’s close to the office, so it’s easy for everyone to get to.' },
      { who: 'A', tokens: ['じゃ', '、', 'わたし', 'が', '今日[きょう]', '予約[よやく]しておく', 'よ'], en: 'Then I’ll book it today.' },
      { who: 'B', tokens: ['ありがとう', '。', 'わたし', 'は', '部長[ぶちょう]', 'に', '渡[わた]す', 'プレゼント', 'を', '買[か]っておく', 'ね'], en: 'Thanks. I’ll buy the present to give the manager.' },
    ],
    questions: [
      { q: 'Why can’t they use the restaurant near the station?', options: ['It is too expensive', 'It is fully booked that day', 'It has closed down'], answer: 1 },
      { q: 'Where will the party be?', options: ['At a restaurant next to the office', 'At a restaurant near the station', 'At the manager’s home'], answer: 0 },
      { q: 'What will B do?', options: ['Book the restaurant', 'Buy a present for the manager', 'Phone the manager'], answer: 1 },
    ],
  },
]
