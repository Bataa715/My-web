import type { EnglishWord, GrammarRule } from '@/lib/types';

// Irregular Verbs - Base Form, Past Simple, Past Participle, Translation
export const initialEnglishWords: Omit<
  EnglishWord,
  'id' | 'memorized' | 'favorite'
>[] = [
  // Most Common Irregular Verbs
  { word: 'be - was/were - been', translation: 'байх', definition: 'I am, He was, They have been' },
  { word: 'have - had - had', translation: 'байх, -тай байх', definition: 'I have, I had, I have had' },
  { word: 'do - did - done', translation: 'хийх', definition: 'I do, I did, I have done' },
  { word: 'say - said - said', translation: 'хэлэх', definition: 'I say, I said, I have said' },
  { word: 'go - went - gone', translation: 'явах', definition: 'I go, I went, I have gone' },
  { word: 'get - got - got/gotten', translation: 'авах, болох', definition: 'I get, I got, I have gotten' },
  { word: 'make - made - made', translation: 'хийх, бүтээх', definition: 'I make, I made, I have made' },
  { word: 'know - knew - known', translation: 'мэдэх', definition: 'I know, I knew, I have known' },
  { word: 'think - thought - thought', translation: 'бодох', definition: 'I think, I thought, I have thought' },
  { word: 'take - took - taken', translation: 'авах', definition: 'I take, I took, I have taken' },
  { word: 'see - saw - seen', translation: 'харах', definition: 'I see, I saw, I have seen' },
  { word: 'come - came - come', translation: 'ирэх', definition: 'I come, I came, I have come' },
  { word: 'want - wanted - wanted', translation: 'хүсэх', definition: 'Regular verb example' },
  { word: 'give - gave - given', translation: 'өгөх', definition: 'I give, I gave, I have given' },
  { word: 'find - found - found', translation: 'олох', definition: 'I find, I found, I have found' },
  { word: 'tell - told - told', translation: 'хэлэх', definition: 'I tell, I told, I have told' },
  { word: 'feel - felt - felt', translation: 'мэдрэх', definition: 'I feel, I felt, I have felt' },
  { word: 'become - became - become', translation: 'болох', definition: 'I become, I became, I have become' },
  { word: 'leave - left - left', translation: 'орхих, явах', definition: 'I leave, I left, I have left' },
  { word: 'put - put - put', translation: 'тавих', definition: 'I put, I put, I have put' },
  { word: 'mean - meant - meant', translation: 'утга илэрхийлэх', definition: 'I mean, I meant, I have meant' },
  { word: 'keep - kept - kept', translation: 'хадгалах', definition: 'I keep, I kept, I have kept' },
  { word: 'let - let - let', translation: 'зөвшөөрөх', definition: 'I let, I let, I have let' },
  { word: 'begin - began - begun', translation: 'эхлэх', definition: 'I begin, I began, I have begun' },
  { word: 'seem - seemed - seemed', translation: 'санагдах', definition: 'Regular verb' },
  { word: 'show - showed - shown', translation: 'харуулах', definition: 'I show, I showed, I have shown' },
  { word: 'hear - heard - heard', translation: 'сонсох', definition: 'I hear, I heard, I have heard' },
  { word: 'run - ran - run', translation: 'гүйх', definition: 'I run, I ran, I have run' },
  { word: 'hold - held - held', translation: 'барих', definition: 'I hold, I held, I have held' },
  { word: 'bring - brought - brought', translation: 'авчрах', definition: 'I bring, I brought, I have brought' },
  { word: 'write - wrote - written', translation: 'бичих', definition: 'I write, I wrote, I have written' },
  { word: 'sit - sat - sat', translation: 'суух', definition: 'I sit, I sat, I have sat' },
  { word: 'stand - stood - stood', translation: 'зогсох', definition: 'I stand, I stood, I have stood' },
  { word: 'lose - lost - lost', translation: 'алдах', definition: 'I lose, I lost, I have lost' },
  { word: 'pay - paid - paid', translation: 'төлөх', definition: 'I pay, I paid, I have paid' },
  { word: 'meet - met - met', translation: 'уулзах', definition: 'I meet, I met, I have met' },
  { word: 'set - set - set', translation: 'тавих, тохируулах', definition: 'I set, I set, I have set' },
  { word: 'learn - learnt/learned - learnt/learned', translation: 'сурах', definition: 'Both forms are correct' },
  { word: 'lead - led - led', translation: 'удирдах', definition: 'I lead, I led, I have led' },
  { word: 'understand - understood - understood', translation: 'ойлгох', definition: 'I understand, I understood, I have understood' },
  { word: 'speak - spoke - spoken', translation: 'ярих', definition: 'I speak, I spoke, I have spoken' },
  { word: 'read - read - read', translation: 'унших', definition: 'Pronunciation changes: /riːd/ - /red/ - /red/' },
  { word: 'spend - spent - spent', translation: 'зарцуулах', definition: 'I spend, I spent, I have spent' },
  { word: 'grow - grew - grown', translation: 'өсөх, ургах', definition: 'I grow, I grew, I have grown' },
  { word: 'win - won - won', translation: 'ялах', definition: 'I win, I won, I have won' },
  { word: 'buy - bought - bought', translation: 'худалдаж авах', definition: 'I buy, I bought, I have bought' },
  { word: 'send - sent - sent', translation: 'илгээх', definition: 'I send, I sent, I have sent' },
  { word: 'build - built - built', translation: 'барих', definition: 'I build, I built, I have built' },
  { word: 'fall - fell - fallen', translation: 'унах', definition: 'I fall, I fell, I have fallen' },
  { word: 'cut - cut - cut', translation: 'хайчлах, огтлох', definition: 'I cut, I cut, I have cut' },
  { word: 'sell - sold - sold', translation: 'зарах', definition: 'I sell, I sold, I have sold' },
  { word: 'drive - drove - driven', translation: 'жолоодох', definition: 'I drive, I drove, I have driven' },
  { word: 'break - broke - broken', translation: 'эвдэх', definition: 'I break, I broke, I have broken' },
  { word: 'eat - ate - eaten', translation: 'идэх', definition: 'I eat, I ate, I have eaten' },
  { word: 'drink - drank - drunk', translation: 'уух', definition: 'I drink, I drank, I have drunk' },
  { word: 'sleep - slept - slept', translation: 'унтах', definition: 'I sleep, I slept, I have slept' },
  { word: 'wake - woke - woken', translation: 'сэрэх', definition: 'I wake, I woke, I have woken' },
  { word: 'fly - flew - flown', translation: 'нисэх', definition: 'I fly, I flew, I have flown' },
  { word: 'swim - swam - swum', translation: 'усанд сэлэх', definition: 'I swim, I swam, I have swum' },
  { word: 'sing - sang - sung', translation: 'дуулах', definition: 'I sing, I sang, I have sung' },
  { word: 'ring - rang - rung', translation: 'хонхдох', definition: 'I ring, I rang, I have rung' },
  { word: 'draw - drew - drawn', translation: 'зурах', definition: 'I draw, I drew, I have drawn' },
  { word: 'throw - threw - thrown', translation: 'шидэх', definition: 'I throw, I threw, I have thrown' },
  { word: 'catch - caught - caught', translation: 'барих', definition: 'I catch, I caught, I have caught' },
  { word: 'teach - taught - taught', translation: 'заах', definition: 'I teach, I taught, I have taught' },
  { word: 'choose - chose - chosen', translation: 'сонгох', definition: 'I choose, I chose, I have chosen' },
  { word: 'forget - forgot - forgotten', translation: 'мартах', definition: 'I forget, I forgot, I have forgotten' },
  { word: 'hide - hid - hidden', translation: 'нуух', definition: 'I hide, I hid, I have hidden' },
  { word: 'bite - bit - bitten', translation: 'хазах', definition: 'I bite, I bit, I have bitten' },
  { word: 'blow - blew - blown', translation: 'үлээх', definition: 'I blow, I blew, I have blown' },
  { word: 'wear - wore - worn', translation: 'өмсөх', definition: 'I wear, I wore, I have worn' },
  { word: 'tear - tore - torn', translation: 'урах', definition: 'I tear, I tore, I have torn' },
  { word: 'beat - beat - beaten', translation: 'цохих', definition: 'I beat, I beat, I have beaten' },
  { word: 'shake - shook - shaken', translation: 'сэгсрэх', definition: 'I shake, I shook, I have shaken' },
  { word: 'freeze - froze - frozen', translation: 'хөлдөх', definition: 'I freeze, I froze, I have frozen' },
  { word: 'steal - stole - stolen', translation: 'хулгайлах', definition: 'I steal, I stole, I have stolen' },
  { word: 'rise - rose - risen', translation: 'өсөх, босох', definition: 'I rise, I rose, I have risen' },
  { word: 'ride - rode - ridden', translation: 'унах (морь, дугуй)', definition: 'I ride, I rode, I have ridden' },
  { word: 'cost - cost - cost', translation: 'үнэтэй байх', definition: 'It cost, It cost, It has cost' },
  { word: 'hit - hit - hit', translation: 'цохих', definition: 'I hit, I hit, I have hit' },
  { word: 'hurt - hurt - hurt', translation: 'өвтгөх', definition: 'I hurt, I hurt, I have hurt' },
  { word: 'shut - shut - shut', translation: 'хаах', definition: 'I shut, I shut, I have shut' },
  { word: 'spread - spread - spread', translation: 'тархаах', definition: 'I spread, I spread, I have spread' },
  { word: 'lie - lay - lain', translation: 'хэвтэх', definition: 'I lie, I lay, I have lain (not "lay" = тавих)' },
  { word: 'lay - laid - laid', translation: 'тавих', definition: 'I lay, I laid, I have laid' },
  { word: 'light - lit - lit', translation: 'гэрэлтүүлэх', definition: 'I light, I lit, I have lit' },
  { word: 'bend - bent - bent', translation: 'нугалах', definition: 'I bend, I bent, I have bent' },
  { word: 'lend - lent - lent', translation: 'зээлдүүлэх', definition: 'I lend, I lent, I have lent' },
  { word: 'dig - dug - dug', translation: 'малтах', definition: 'I dig, I dug, I have dug' },
  { word: 'hang - hung - hung', translation: 'өлгөх', definition: 'I hang, I hung, I have hung' },
  { word: 'stick - stuck - stuck', translation: 'наах', definition: 'I stick, I stuck, I have stuck' },
  { word: 'swing - swung - swung', translation: 'дүүжлэх', definition: 'I swing, I swung, I have swung' },
  { word: 'fight - fought - fought', translation: 'тэмцэх', definition: 'I fight, I fought, I have fought' },
  { word: 'seek - sought - sought', translation: 'хайх', definition: 'I seek, I sought, I have sought' },
  { word: 'feed - fed - fed', translation: 'хооллох', definition: 'I feed, I fed, I have fed' },
  { word: 'bleed - bled - bled', translation: 'цус алдах', definition: 'I bleed, I bled, I have bled' },
  { word: 'speed - sped - sped', translation: 'хурдасгах', definition: 'I speed, I sped, I have sped' },
  { word: 'sweep - swept - swept', translation: 'шүүрдэх', definition: 'I sweep, I swept, I have swept' },
  { word: 'weep - wept - wept', translation: 'уйлах', definition: 'I weep, I wept, I have wept' },
  { word: 'creep - crept - crept', translation: 'мөлхөх', definition: 'I creep, I crept, I have crept' },
  { word: 'deal - dealt - dealt', translation: 'харьцах', definition: 'I deal, I dealt, I have dealt' },
  { word: 'dream - dreamt - dreamt', translation: 'зүүдлэх', definition: 'Also: dreamed-dreamed' },
  { word: 'lean - leant - leant', translation: 'налах', definition: 'Also: leaned-leaned' },
  { word: 'leap - leapt - leapt', translation: 'үсрэх', definition: 'Also: leaped-leaped' },
  { word: 'burn - burnt - burnt', translation: 'шатах', definition: 'Also: burned-burned' },
  { word: 'smell - smelt - smelt', translation: 'үнэрлэх', definition: 'Also: smelled-smelled' },
  { word: 'spell - spelt - spelt', translation: 'үсэглэх', definition: 'Also: spelled-spelled' },
  { word: 'spill - spilt - spilt', translation: 'асгах', definition: 'Also: spilled-spilled' },
  { word: 'spoil - spoilt - spoilt', translation: 'эвдэх', definition: 'Also: spoiled-spoiled' },
];

export const initialEnglishRule: Omit<GrammarRule, 'id' | 'createdAt'> = {
  title: 'Present Simple Tense',
  category: 'Tense',
  introduction:
    'Тогтмол давтагддаг үйлдэл, үнэн баримт, хуваарь, дүрэм журам, ерөнхий зан байдал, байнгын байдал зэргийг илэрхийлэхэд хэрэглэгддэг.',
  usage: [
    {
      condition: 'Тогтмол давтагддаг, зуршил болсон үйлдэл',
      example: 'I work every day.',
    },
    {
      condition: 'Байгалийн хууль, ерөнхий үнэн баримт',
      example: 'The Earth revolves around the Sun.',
    },
    {
      condition: 'Хуваарийн дагуух үйл явдал',
      example: 'The train leaves at 8 AM.',
    },
  ],
  form: {
    regular:
      "Ихэнх үйл үгэнд **-s** залгана: `works`, `plays`, `reads`.\n\n`-s, -sh, -ch, -x, -o` төгсгөлтэй бол **-es** залгана: `goes`, `watches`, `fixes`.\n\nГийгүүлэгч + `y`-ээр төгссөн бол 'y' үсгийг 'i' болгож **-ies** залгана: `study` -> `studies`.",
    irregular:
      '`Have` -> `has`.\n\n`Be` үйл үг нь `am, is, are` болж хувирдаг.',
  },
  structure: {
    positive: {
      formula:
        '| Subject | Verb |\n| --- | --- |\n| I/You/We/They | verb (үндсэн хэлбэр) |\n| He/She/It | verb + **s/es** |',
      examples: ['I work every day.', 'She plays the piano.'],
    },
    negative: {
      formula:
        "| Subject | do/does + not | Verb |\n| --- | --- | --- |\n| I/You/We/They | **do not (don't)** | base form |\n| He/She/It | **does not (doesn't)** | base form (s байхгүй!) |",
      examples: ['I don’t like tea.', 'He doesn’t eat meat.'],
    },
    question: {
      formula:
        '| Do/Does | Subject | Verb |\n| --- | --- | --- |\n| Do | I/you/we/they | verb | \n| Does | he/she/it | verb |',
      examples: ['Do you play tennis?', 'Does she like coffee?'],
    },
  },
  timeExpressions: [
    { word: 'always', translation: 'үргэлж' },
    { word: 'usually', translation: 'ихэвчлэн' },
    { word: 'often', translation: 'байнга' },
    { word: 'sometimes', translation: 'заримдаа' },
    { word: 'never', translation: 'хэзээ ч' },
    { word: 'every day/week/year', translation: 'өдөр/долоо хоног/жил бүр' },
    { word: 'on Mondays', translation: 'Даваа гарагт' },
    { word: 'in the morning', translation: 'өглөө' },
  ],
  practice: [
    {
      question: 'She ____ to school every day.',
      options: ['go', 'goes', 'is going'],
      correctAnswer: 'goes',
      explanation:
        '“She” гэдэг нь “he/she/it” тул үйл үгэнд “-es” нэмэгдэнэ: go → goes',
    },
    {
      question: 'I ____ breakfast at 7 AM.',
      options: ['has', 'is having', 'have'],
      correctAnswer: 'have',
      explanation:
        '“I” гэх үед үйл үг үндсэн хэлбэрээрээ хэрэглэгдэнэ. “has” зөвхөн he/she/it-д хэрэглэгдэнэ.',
    },
    {
      question: '____ they live in Paris?',
      options: ['Do', 'Does', 'Are'],
      correctAnswer: 'Do',
      explanation:
        '“They” бол олон тооны субъект тул "Do" туслах үйл үг ашиглана. “Does” зөвхөн he/she/it-д.',
    },
    {
      question: 'My brother ____ football on Sundays.',
      options: ['play', 'plays', 'is playing'],
      correctAnswer: 'plays',
      explanation:
        '“My brother” нь “he” гэсэнтэй ижил тул “play” → “plays” болно.',
    },
    {
      question: 'He ____ like chocolate.',
      options: ["don't", "doesn't", "isn't"],
      correctAnswer: "doesn't",
      explanation:
        '“He” дээр үгүйсгэсэн хэлбэрт “doesn’t” хэрэглэнэ. Үйл үг “like” үндсэн хэлбэрээрээ байна.',
    },
    {
      question: 'We ____ our homework after school.',
      options: ['is doing', 'does', 'do'],
      correctAnswer: 'do',
      explanation:
        '“We” үед үйл үг “do” хэвээр байна, ямар нэгэн -s нэмэгдэхгүй.',
    },
    {
      question: 'What time ____ the train leave?',
      options: ['do', 'is', 'does'],
      correctAnswer: 'does',
      explanation:
        '“The train” → “it” учраас “does” хэрэглэнэ. Үйл үг “leave” үндсэн хэлбэртэй байна.',
    },
    {
      question: 'They ____ go to the gym on weekends.',
      options: ['usually', 'is', 'are'],
      correctAnswer: 'usually',
      explanation:
        '“Usually” бол Present Simple-д хэрэглэдэг давтамж илэрхийлэгч үг.',
    },
    {
      question: 'My friend and I ____ tennis every Saturday.',
      options: ['play', 'plays', 'are playing'],
      correctAnswer: 'play',
      explanation:
        '“My friend and I” = “we” → “play” нь үндсэн хэлбэрээр байна.',
    },
    {
      question: 'Does she ____ coffee in the morning?',
      options: ['drinks', 'drink', 'is drinking'],
      correctAnswer: 'drink',
      explanation:
        '“Does” байгаа учраас үйл үг “drink” үндсэн хэлбэрээр хэрэглэгдэнэ. “drinks” бол буруу.',
    },
  ],
};
