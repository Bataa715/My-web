export type GrammarSectionId = 'G_BASIC' | 'G_PAST' | 'G_FUTURE' | 'G_MODAL' | 'G_STRUCT';

export interface GrammarQ {
  s: string;
  c: [string, string, string, string];
  a: string;
  e: string;
}

export interface GrammarLesson {
  type: 'grammar';
  id: string;
  title: string;
  emoji: string;
  gs: GrammarSectionId;
  rule: string;
  example: string;
  q: GrammarQ[];
}

export const GRAMMAR_SECTION_LABELS: Record<GrammarSectionId, string> = {
  G_BASIC:  'Суурь дүрэм',
  G_PAST:   'Өнгөрсөн цаг',
  G_FUTURE: 'Ирээдүй цаг',
  G_MODAL:  'Modal үйл үгс',
  G_STRUCT: 'Бүтэц & Загвар',
};

export const GRAMMAR_SECTION_ORDER: GrammarSectionId[] = ['G_BASIC', 'G_PAST', 'G_FUTURE', 'G_MODAL', 'G_STRUCT'];

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  // ── G_BASIC ──────────────────────────────────────────────────────────────
  {
    type: 'grammar', id: 'g1', title: 'To Be (одоо)', emoji: '🔵', gs: 'G_BASIC',
    rule: 'I am / You are / He·She·It is / We·They are',
    example: 'I am happy. She is a doctor. They are friends.',
    q: [
      { s: 'I ___ a student.',              c: ['am','is','are','be'],      a: 'am',  e: 'I → am' },
      { s: 'She ___ very tall.',            c: ['is','am','are','be'],      a: 'is',  e: 'She → is' },
      { s: 'They ___ from Mongolia.',       c: ['are','is','am','be'],      a: 'are', e: 'They → are' },
      { s: 'He ___ my best friend.',        c: ['is','am','are','be'],      a: 'is',  e: 'He → is' },
      { s: 'You ___ very kind.',            c: ['are','is','am','been'],    a: 'are', e: 'You → are' },
      { s: 'It ___ a beautiful day.',       c: ['is','am','are','were'],    a: 'is',  e: 'It → is' },
      { s: 'We ___ ready to start.',        c: ['are','is','am','was'],     a: 'are', e: 'We → are' },
      { s: 'The dog ___ in the garden.',    c: ['is','am','are','were'],    a: 'is',  e: 'The dog (it) → is' },
      { s: 'My parents ___ at home.',       c: ['are','is','am','was'],     a: 'are', e: 'My parents (they) → are' },
      { s: 'John and Mary ___ happy.',      c: ['are','is','am','be'],      a: 'are', e: 'John and Mary (they) → are' },
    ],
  },
  {
    type: 'grammar', id: 'g2', title: 'To Be (өнгөрсөн)', emoji: '⚫', gs: 'G_BASIC',
    rule: 'I·He·She·It was / You·We·They were',
    example: 'I was tired. They were late. It was cold.',
    q: [
      { s: 'I ___ at school yesterday.',       c: ['was','were','am','be'],    a: 'was',  e: 'I → was' },
      { s: 'They ___ very tired.',             c: ['were','was','are','be'],   a: 'were', e: 'They → were' },
      { s: 'She ___ a student before.',        c: ['was','were','is','be'],    a: 'was',  e: 'She → was' },
      { s: 'We ___ late for the meeting.',     c: ['were','was','are','be'],   a: 'were', e: 'We → were' },
      { s: 'It ___ cold last night.',          c: ['was','were','is','be'],    a: 'was',  e: 'It → was' },
      { s: 'He ___ not in the office.',        c: ['was','were','is','be'],    a: 'was',  e: 'He → was' },
      { s: 'The children ___ happy.',          c: ['were','was','are','be'],   a: 'were', e: 'The children (they) → were' },
      { s: 'You ___ right about that.',        c: ['were','was','are','be'],   a: 'were', e: 'You → were' },
      { s: 'The food ___ delicious.',          c: ['was','were','is','be'],    a: 'was',  e: 'The food (it) → was' },
      { s: 'My parents ___ both teachers.',    c: ['were','was','are','be'],   a: 'were', e: 'My parents (they) → were' },
    ],
  },
  {
    type: 'grammar', id: 'g3', title: 'Present Simple (+)', emoji: '✅', gs: 'G_BASIC',
    rule: 'I/You/We/They + verb · He/She/It + verb+s/es',
    example: 'I work. She works. They play. He plays.',
    q: [
      { s: 'She ___ to work every day.',      c: ['goes','go','going','went'],         a: 'goes',    e: 'She (he/she/it) → go + es' },
      { s: 'He ___ coffee every morning.',    c: ['drinks','drink','drinking','drank'], a: 'drinks',  e: 'He → drink + s' },
      { s: 'The train ___ at 8 AM.',          c: ['leaves','leave','leaving','left'],  a: 'leaves',  e: 'The train (it) → leave + s' },
      { s: 'They ___ football on Sundays.',   c: ['play','plays','playing','played'],  a: 'play',    e: 'They → play (no s)' },
      { s: 'My brother ___ in London.',       c: ['lives','live','living','lived'],    a: 'lives',   e: 'My brother (he) → live + s' },
      { s: 'Water ___ at 100°C.',             c: ['boils','boil','boiling','boiled'],  a: 'boils',   e: 'Water (it) → boil + s' },
      { s: 'She ___ English very well.',      c: ['speaks','speak','speaking','spoke'], a: 'speaks',  e: 'She → speak + s' },
      { s: 'I ___ to music every evening.',   c: ['listen','listens','listening','listened'], a: 'listen', e: 'I → listen (no s)' },
      { s: 'The sun ___ in the west.',        c: ['sets','set','setting','sat'],       a: 'sets',    e: 'The sun (it) → set + s' },
      { s: 'He ___ at a hospital.',           c: ['works','work','working','worked'],  a: 'works',   e: 'He → work + s' },
    ],
  },
  {
    type: 'grammar', id: 'g4', title: 'Present Simple (−)', emoji: '❌', gs: 'G_BASIC',
    rule: 'I/You/We/They + don\'t · He/She/It + doesn\'t + base verb',
    example: "I don't know. She doesn't like it.",
    q: [
      { s: 'She ___ like coffee.',            c: ["doesn't","don't","isn't","not"],    a: "doesn't", e: 'She (he/she/it) → doesn\'t' },
      { s: 'They ___ have a car.',            c: ["don't","doesn't","aren't","not"],   a: "don't",   e: 'They → don\'t' },
      { s: 'He ___ study on weekends.',       c: ["doesn't","don't","isn't","not"],    a: "doesn't", e: 'He → doesn\'t' },
      { s: 'We ___ speak Japanese.',          c: ["don't","doesn't","aren't","not"],   a: "don't",   e: 'We → don\'t' },
      { s: 'It ___ work properly.',           c: ["doesn't","don't","isn't","not"],    a: "doesn't", e: 'It → doesn\'t' },
      { s: 'I ___ understand this.',          c: ["don't","doesn't","aren't","not"],   a: "don't",   e: 'I → don\'t' },
      { s: 'She ___ live here anymore.',      c: ["doesn't","don't","isn't","not"],    a: "doesn't", e: 'She → doesn\'t' },
      { s: 'My parents ___ watch TV often.',  c: ["don't","doesn't","aren't","not"],   a: "don't",   e: 'My parents (they) → don\'t' },
      { s: 'He ___ know the answer.',         c: ["doesn't","don't","isn't","not"],    a: "doesn't", e: 'He → doesn\'t' },
      { s: 'You ___ need to worry.',          c: ["don't","doesn't","aren't","not"],   a: "don't",   e: 'You → don\'t' },
    ],
  },
  {
    type: 'grammar', id: 'g5', title: 'Present Continuous', emoji: '🔄', gs: 'G_BASIC',
    rule: 'am/is/are + verb+ing = happening right now',
    example: 'I am reading. She is running. They are talking.',
    q: [
      { s: 'She ___ a book right now.',        c: ['is reading','are reading','reads','read'],         a: 'is reading',   e: 'She → is + verb+ing' },
      { s: 'They ___ in the park.',            c: ['are running','is running','run','runs'],           a: 'are running',  e: 'They → are + verb+ing' },
      { s: 'I ___ my homework now.',           c: ['am doing','is doing','are doing','done'],          a: 'am doing',     e: 'I → am + verb+ing' },
      { s: 'Look! It ___!',                    c: ['is snowing','are snowing','snows','snowed'],       a: 'is snowing',   e: 'It → is + verb+ing' },
      { s: 'We ___ dinner at the moment.',     c: ['are having','is having','have','had'],             a: 'are having',   e: 'We → are + verb+ing' },
      { s: 'He ___ on the phone right now.',   c: ['is talking','are talking','talks','talked'],       a: 'is talking',   e: 'He → is + verb+ing' },
      { s: 'The children ___ outside.',        c: ['are playing','is playing','play','played'],        a: 'are playing',  e: 'The children → are + verb+ing' },
      { s: 'I ___ you now — can you hear me?', c: ['am calling','is calling','are calling','called'], a: 'am calling',   e: 'I → am + verb+ing' },
      { s: 'She ___ in the kitchen.',          c: ['is cooking','are cooking','cooks','cooked'],       a: 'is cooking',   e: 'She → is + verb+ing' },
      { s: 'They ___ to a new house next week.',c: ['are moving','is moving','move','moved'],          a: 'are moving',   e: 'They → are + verb+ing' },
    ],
  },

  // ── G_PAST ───────────────────────────────────────────────────────────────
  {
    type: 'grammar', id: 'g6', title: 'Past Simple (тогтмол)', emoji: '📅', gs: 'G_PAST',
    rule: 'verb + -ed (regular verbs)',
    example: 'I walked. She cooked. They played.',
    q: [
      { s: 'She ___ to work yesterday.',      c: ['walked','walk','walking','walks'],       a: 'walked',   e: 'walk → walked (+ed)' },
      { s: 'They ___ a great time.',          c: ['enjoyed','enjoy','enjoying','enjoys'],   a: 'enjoyed',  e: 'enjoy → enjoyed (+ed)' },
      { s: 'He ___ hard for the exam.',       c: ['studied','study','studying','studies'],  a: 'studied',  e: 'study → studied (y→ied)' },
      { s: 'I ___ dinner for the family.',    c: ['cooked','cook','cooking','cooks'],       a: 'cooked',   e: 'cook → cooked (+ed)' },
      { s: 'We ___ the door and entered.',    c: ['opened','open','opening','opens'],       a: 'opened',   e: 'open → opened (+ed)' },
      { s: 'She ___ me with the project.',    c: ['helped','help','helping','helps'],       a: 'helped',   e: 'help → helped (+ed)' },
      { s: 'The movie ___ at 8 PM.',          c: ['started','start','starting','starts'],   a: 'started',  e: 'start → started (+ed)' },
      { s: 'He ___ the broken window.',       c: ['fixed','fix','fixing','fixes'],          a: 'fixed',    e: 'fix → fixed (+ed)' },
      { s: 'They ___ the house carefully.',   c: ['cleaned','clean','cleaning','cleans'],   a: 'cleaned',  e: 'clean → cleaned (+ed)' },
      { s: 'She ___ me with good news.',      c: ['called','call','calling','calls'],       a: 'called',   e: 'call → called (+ed)' },
    ],
  },
  {
    type: 'grammar', id: 'g7', title: 'Past Simple (дүрмийн бус)', emoji: '⚡', gs: 'G_PAST',
    rule: 'Irregular: go→went, see→saw, eat→ate, give→gave...',
    example: 'She went. I saw. He ate. They gave.',
    q: [
      { s: 'She ___ to Paris last summer.',    c: ['went','go','gone','goes'],        a: 'went',    e: 'go → went' },
      { s: 'I ___ him at the party.',          c: ['saw','see','seen','sees'],        a: 'saw',     e: 'see → saw' },
      { s: 'We ___ pizza for dinner.',         c: ['ate','eat','eaten','eats'],       a: 'ate',     e: 'eat → ate' },
      { s: 'He ___ me a present.',             c: ['gave','give','given','gives'],    a: 'gave',    e: 'give → gave' },
      { s: 'I ___ the bus to work.',           c: ['took','take','taken','takes'],    a: 'took',    e: 'take → took' },
      { s: 'She ___ a delicious cake.',        c: ['made','make','making','makes'],   a: 'made',    e: 'make → made' },
      { s: 'I ___ a new laptop last week.',    c: ['bought','buy','buying','buys'],   a: 'bought',  e: 'buy → bought' },
      { s: 'They ___ a new bridge.',           c: ['built','build','building','builds'], a: 'built', e: 'build → built' },
      { s: 'He ___ a great idea.',             c: ['had','have','having','has'],      a: 'had',     e: 'have → had' },
      { s: 'She ___ home before midnight.',    c: ['came','come','coming','comes'],   a: 'came',    e: 'come → came' },
    ],
  },
  {
    type: 'grammar', id: 'g8', title: 'Past Continuous', emoji: '⏳', gs: 'G_PAST',
    rule: 'was/were + verb+ing = happening at a moment in the past',
    example: 'She was reading when I called.',
    q: [
      { s: 'She ___ when I called.',               c: ['was reading','were reading','is reading','read'],     a: 'was reading',    e: 'She → was + verb+ing' },
      { s: 'They ___ when it started raining.',    c: ['were playing','was playing','are playing','played'],  a: 'were playing',   e: 'They → were + verb+ing' },
      { s: 'I ___ TV when he arrived.',            c: ['was watching','were watching','is watching','watched'], a: 'was watching', e: 'I → was + verb+ing' },
      { s: 'We ___ when the earthquake hit.',      c: ['were sleeping','was sleeping','are sleeping','slept'], a: 'were sleeping',  e: 'We → were + verb+ing' },
      { s: 'He ___ when the accident happened.',   c: ['was driving','were driving','is driving','drove'],    a: 'was driving',    e: 'He → was + verb+ing' },
      { s: 'The baby ___ peacefully.',             c: ['was sleeping','were sleeping','is sleeping','slept'], a: 'was sleeping',   e: 'The baby → was + verb+ing' },
      { s: 'They ___ about the project.',          c: ['were talking','was talking','are talking','talked'],  a: 'were talking',   e: 'They → were + verb+ing' },
      { s: 'I ___ when the bell rang.',            c: ['was studying','were studying','is studying','studied'], a: 'was studying', e: 'I → was + verb+ing' },
      { s: 'She ___ a song when I came in.',       c: ['was singing','were singing','is singing','sang'],     a: 'was singing',    e: 'She → was + verb+ing' },
      { s: 'What were you ___ at midnight?',       c: ['doing','do','did','done'],                            a: 'doing',          e: 'were + verb+ing: doing' },
    ],
  },

  // ── G_FUTURE ─────────────────────────────────────────────────────────────
  {
    type: 'grammar', id: 'g9', title: 'Present Perfect', emoji: '🏆', gs: 'G_FUTURE',
    rule: 'have/has + past participle (үйлдэл одоотой холбоотой)',
    example: 'I have seen it. She has finished.',
    q: [
      { s: 'She ___ to Japan twice.',         c: ['has been','have been','was','went'],      a: 'has been',    e: 'She → has + PP' },
      { s: 'I ___ never eaten sushi.',        c: ['have','has','had','am'],                  a: 'have',        e: 'I → have + PP' },
      { s: 'He ___ already left.',            c: ['has','have','had','is'],                  a: 'has',         e: 'He → has + PP' },
      { s: 'They ___ just arrived.',          c: ['have','has','had','are'],                 a: 'have',        e: 'They → have + PP' },
      { s: 'She ___ lost her keys.',          c: ['has','have','had','is'],                  a: 'has',         e: 'She → has + PP' },
      { s: 'We ___ known each other for years.', c: ['have','has','had','are'],             a: 'have',        e: 'We → have + PP' },
      { s: 'I ___ finished my homework.',     c: ['have','has','had','am'],                  a: 'have',        e: 'I → have + PP' },
      { s: 'He ___ never seen snow.',         c: ['has','have','had','is'],                  a: 'has',         e: 'He → has + PP' },
      { s: 'She ___ worked here since 2020.', c: ['has','have','had','was'],                 a: 'has',         e: 'She → has + PP' },
      { s: 'They ___ not called yet.',        c: ['have','has','had','are'],                 a: 'have',        e: 'They → have + PP' },
    ],
  },
  {
    type: 'grammar', id: 'g10', title: 'Future: Will', emoji: '🔮', gs: 'G_FUTURE',
    rule: 'will + base verb (тухайн үед шийдсэн ирээдүй)',
    example: "I'll help you. She will be great.",
    q: [
      { s: 'I ___ help you tomorrow.',            c: ['will','am','going to','would'],   a: 'will',    e: 'will + base verb' },
      { s: 'She ___ be a great doctor.',          c: ['will','would','is','going to'],   a: 'will',    e: 'will + base verb' },
      { s: 'It ___ probably rain tonight.',       c: ['will','is','going','would'],      a: 'will',    e: 'will + base verb' },
      { s: 'I promise I ___ call you.',           c: ['will','am going','going to','would'], a: 'will', e: 'will + base verb' },
      { s: 'He ___ not come to the party.',       c: ["won't","doesn't","isn't","wouldn't"], a: "won't", e: "will not → won't" },
      { s: '___ you be there tomorrow?',          c: ['Will','Are','Do','Would'],        a: 'Will',    e: 'Question: Will + subject' },
      { s: 'I think she ___ win.',                c: ['will','is','goes','would'],       a: 'will',    e: 'will + base verb' },
      { s: "Don't worry, it ___ be okay.",        c: ['will','is','goes','would'],       a: 'will',    e: 'will + base verb' },
      { s: 'We ___ meet again someday.',          c: ['will','are','going','would'],     a: 'will',    e: 'will + base verb' },
      { s: 'He ___ probably arrive late.',        c: ['will','is','goes','would'],       a: 'will',    e: 'will + base verb' },
    ],
  },
  {
    type: 'grammar', id: 'g11', title: 'Future: Going To', emoji: '🗓️', gs: 'G_FUTURE',
    rule: 'am/is/are + going to + base verb (урьдчилан төлөвлөсөн ирээдүй)',
    example: "I'm going to study. She's going to travel.",
    q: [
      { s: 'I ___ visit my grandma this weekend.',   c: ['am going to','will','am go','going to'],        a: 'am going to',  e: 'I → am going to' },
      { s: 'She ___ study medicine next year.',      c: ['is going to','will','goes to','going to'],      a: 'is going to',  e: 'She → is going to' },
      { s: 'They ___ move to a new apartment.',      c: ['are going to','will','go to','going to'],       a: 'are going to', e: 'They → are going to' },
      { s: 'Look at those clouds! It ___ rain.',     c: ['is going to','will','rains','going to'],        a: 'is going to',  e: 'It → is going to (evidence)' },
      { s: 'We ___ have a party on Friday.',         c: ['are going to','will','have','going to'],        a: 'are going to', e: 'We → are going to' },
      { s: 'He ___ start a new job next month.',     c: ['is going to','will','starts','going to'],       a: 'is going to',  e: 'He → is going to' },
      { s: 'I ___ not travel this summer.',          c: ['am not going to',"won't",'don\'t go','not going to'], a: 'am not going to', e: 'I → am not going to' },
      { s: 'Are they ___ stay long?',                c: ['going to','will','go','gonna'],                 a: 'going to',     e: 'are + going to' },
      { s: 'She ___ open a new café.',               c: ['is going to','will','opens','going to'],        a: 'is going to',  e: 'She → is going to' },
      { s: 'We ___ get married next year!',          c: ['are going to','will','get','going to'],         a: 'are going to', e: 'We → are going to' },
    ],
  },

  // ── G_MODAL ──────────────────────────────────────────────────────────────
  {
    type: 'grammar', id: 'g12', title: 'Can / Can\'t', emoji: '💪', gs: 'G_MODAL',
    rule: 'can + base verb (чадах) · can\'t = cannot',
    example: "I can swim. She can't drive.",
    q: [
      { s: 'She ___ swim very well.',             c: ['can','could','is able','cans'],           a: 'can',    e: 'can + base verb' },
      { s: 'I ___ understand this problem.',      c: ["can't",'could not','don\'t','am not'],    a: "can't",  e: "can't + base verb" },
      { s: '___ you help me, please?',            c: ['Can','Could','Are','Do'],                  a: 'Can',    e: 'Can + subject + base verb?' },
      { s: 'He ___ speak three languages.',       c: ['can','could','is','does'],                a: 'can',    e: 'can + base verb' },
      { s: 'They ___ stay up late on weekends.',  c: ['can','could','are allowed','do'],          a: 'can',    e: 'can + base verb' },
      { s: "She ___ drive yet — she's too young.",c: ["can't",'couldn\'t','isn\'t','doesn\'t'], a: "can't",  e: "can't + base verb" },
      { s: 'I ___ believe it! It\'s incredible!', c: ["can't",'couldn\'t','don\'t','am not'],   a: "can't",  e: "can't + base verb" },
      { s: 'We ___ see the mountains from here.', c: ['can','could','are','do'],                 a: 'can',    e: 'can + base verb' },
      { s: '___ you hear that noise?',            c: ['Can','Are','Do','Could'],                  a: 'Can',    e: 'Can + subject + base verb?' },
      { s: 'He ___ come — he has another plan.',  c: ["can't",'couldn\'t','won\'t','doesn\'t'], a: "can't",  e: "can't + base verb" },
    ],
  },
  {
    type: 'grammar', id: 'g13', title: 'Must / Mustn\'t', emoji: '⚠️', gs: 'G_MODAL',
    rule: 'must = шаардлагатай · mustn\'t = хориотой',
    example: 'You must wear a seatbelt. You mustn\'t smoke here.',
    q: [
      { s: 'You ___ wear a seatbelt in a car.',    c: ['must',"mustn't",'should','have to'],       a: 'must',     e: 'must = үүрэг/шаардлага' },
      { s: 'Students ___ bring ID to the exam.',   c: ['must',"mustn't",'should','might'],          a: 'must',     e: 'must = шаардлагатай' },
      { s: 'You ___ run near the pool.',           c: ["mustn't",'must','shouldn\'t','can\'t'],    a: "mustn't",  e: "mustn't = хориотой" },
      { s: 'Employees ___ be late.',               c: ["mustn't",'must','shouldn\'t','won\'t'],    a: "mustn't",  e: "mustn't = хориотой" },
      { s: 'You ___ eat more vegetables.',         c: ['must',"mustn't",'should','can'],            a: 'must',     e: 'must = чухал шаардлага' },
      { s: 'We ___ forget to lock the door!',      c: ["mustn't",'must','shouldn\'t','won\'t'],    a: "mustn't",  e: "mustn't = хэзээ ч болохгүй" },
      { s: 'Children ___ cross the road alone.',   c: ["mustn't",'must','shouldn\'t','can\'t'],    a: "mustn't",  e: "mustn't = хориотой" },
      { s: 'You ___ have a passport to travel.',   c: ['must',"mustn't",'should','can'],            a: 'must',     e: 'must = шаардлагатай' },
      { s: 'You ___ smoke inside the hospital.',   c: ["mustn't",'must','shouldn\'t','can\'t'],    a: "mustn't",  e: "mustn't = хориотой" },
      { s: 'She looks very sick — she ___ see a doctor.', c: ['must',"mustn't",'should','can'],    a: 'must',     e: 'must = заавал хийх ёстой' },
    ],
  },
  {
    type: 'grammar', id: 'g14', title: 'Should / Shouldn\'t', emoji: '💡', gs: 'G_MODAL',
    rule: 'should = зөвлөгөө өгөх · shouldn\'t = зөвлөхгүй',
    example: "You should sleep early. You shouldn't eat junk food.",
    q: [
      { s: 'You ___ drink more water.',            c: ['should',"shouldn't",'must','would'],        a: 'should',    e: 'should = зөвлөгөө' },
      { s: 'She ___ eat so much sugar.',           c: ["shouldn't",'should','mustn\'t','wouldn\'t'], a: "shouldn't", e: "shouldn't = зөвлөхгүй" },
      { s: 'I think you ___ apologize to her.',    c: ['should',"shouldn't",'must','would'],        a: 'should',    e: 'should = зөвлөгөө' },
      { s: 'He ___ stay up so late.',              c: ["shouldn't",'should','mustn\'t','wouldn\'t'], a: "shouldn't", e: "shouldn't = зөвлөхгүй" },
      { s: 'You ___ exercise regularly.',          c: ['should',"shouldn't",'must','would'],        a: 'should',    e: 'should = зөвлөгөө' },
      { s: 'We ___ waste food.',                   c: ["shouldn't",'should','mustn\'t','wouldn\'t'], a: "shouldn't", e: "shouldn't = зөвлөхгүй" },
      { s: 'She ___ talk to her teacher.',         c: ['should',"shouldn't",'must','can'],          a: 'should',    e: 'should = зөвлөгөө' },
      { s: 'Students ___ use phones in class.',    c: ["shouldn't",'should','mustn\'t','can\'t'],   a: "shouldn't", e: "shouldn't = зөвлөхгүй" },
      { s: 'You ___ try this café!',               c: ['should',"shouldn't",'must','would'],        a: 'should',    e: 'should = зөвлөгөө' },
      { s: 'He ___ drive if he\'s tired.',         c: ["shouldn't",'should','mustn\'t','wouldn\'t'], a: "shouldn't", e: "shouldn't = зөвлөхгүй" },
    ],
  },
  {
    type: 'grammar', id: 'g15', title: 'Would', emoji: '🎩', gs: 'G_MODAL',
    rule: 'would = эелдэг хүсэлт / нөхцөлт / өнгөрсөн дадал',
    example: "Would you like tea? I would love to travel.",
    q: [
      { s: '___ you like some tea?',               c: ['Would','Will','Do','Shall'],                a: 'Would',   e: 'Would you like...? = эелдэг санал' },
      { s: 'I ___ love to visit Japan.',           c: ['would','will','am','do'],                   a: 'would',   e: 'would love = их хүсэх' },
      { s: 'She said she ___ help us.',            c: ['would','will','does','is'],                  a: 'would',   e: 'Reported speech: would' },
      { s: 'If I had money, I ___ travel.',        c: ['would','will','could','am'],                 a: 'would',   e: 'Second conditional: would' },
      { s: 'He ___ rather stay home.',             c: ['would','will','does','is'],                  a: 'would',   e: "would rather = илүүд үзэх" },
      { s: '___ you mind closing the window?',     c: ['Would','Will','Do','Can'],                   a: 'Would',   e: 'Would you mind...? = эелдэг хүсэлт' },
      { s: 'They ___ never do such a thing.',      c: ['would','will','do','are'],                   a: 'would',   e: "would never = хэзээ ч хийхгүй" },
      { s: 'I ___ like to order a coffee, please.',c: ['would','will','do','am'],                   a: 'would',   e: "I would like = I'd like (эелдэг)" },
      { s: 'She ___ read before bed as a child.',  c: ['would','will','does','is'],                  a: 'would',   e: 'would = өнгөрсөн дадлага' },
      { s: '___ you like to join us for dinner?',  c: ['Would','Will','Do','Should'],                a: 'Would',   e: 'Would you like...? = урилга' },
    ],
  },

  // ── G_STRUCT ─────────────────────────────────────────────────────────────
  {
    type: 'grammar', id: 'g16', title: 'Articles (a / an / the)', emoji: '📌', gs: 'G_STRUCT',
    rule: 'a (эгшиг биш) · an (эгшиг) · the (тодорхой зүйл)',
    example: 'a cat, an apple, the moon.',
    q: [
      { s: 'I saw ___ dog in the park.',          c: ['a','an','the','—'],    a: 'a',   e: 'a + consonant sound: a dog' },
      { s: 'She is ___ engineer.',                c: ['an','a','the','—'],    a: 'an',  e: 'an + vowel sound: an engineer' },
      { s: '___ Nile is the longest river.',      c: ['The','A','An','—'],    a: 'The', e: 'the = specific/unique: The Nile' },
      { s: 'He told me ___ interesting story.',   c: ['an','a','the','—'],    a: 'an',  e: 'an + vowel sound: an interesting...' },
      { s: 'Can you open ___ door for me?',       c: ['the','a','an','—'],    a: 'the', e: 'the = specific door (both know which)' },
      { s: 'She is ___ nurse at the hospital.',   c: ['a','an','the','—'],    a: 'a',   e: 'a + consonant sound: a nurse' },
      { s: 'I ate ___ apple this morning.',       c: ['an','a','the','—'],    a: 'an',  e: 'an + vowel sound: an apple' },
      { s: '___ Amazon is in South America.',     c: ['The','A','An','—'],    a: 'The', e: 'the = specific river name' },
      { s: 'I need ___ umbrella — it\'s raining.',c: ['an','a','the','—'],    a: 'an',  e: 'an + vowel sound: an umbrella' },
      { s: 'She lives on ___ fifth floor.',       c: ['the','a','an','—'],    a: 'the', e: 'the + ordinal number' },
    ],
  },
  {
    type: 'grammar', id: 'g17', title: 'Байршлын урьдал үгс', emoji: '📍', gs: 'G_STRUCT',
    rule: 'in (дотор) · on (дээр) · at (газар/цэг)',
    example: 'in the box, on the table, at the station.',
    q: [
      { s: 'The book is ___ the table.',       c: ['on','in','at','by'],     a: 'on',    e: 'on = гадаргуу дээр' },
      { s: 'She lives ___ Paris.',             c: ['in','on','at','by'],     a: 'in',    e: 'in = хот/орон нутагт' },
      { s: 'I\'ll meet you ___ the airport.',  c: ['at','in','on','by'],     a: 'at',    e: 'at = тодорхой газар' },
      { s: 'The keys are ___ my bag.',         c: ['in','on','at','by'],     a: 'in',    e: 'in = дотор' },
      { s: 'He\'s sitting ___ the chair.',     c: ['on','in','at','by'],     a: 'on',    e: 'on = гадаргуу дээр' },
      { s: 'The cat is hiding ___ the sofa.',  c: ['under','in','on','at'],  a: 'under', e: 'under = доор' },
      { s: 'She was standing ___ the door.',   c: ['at','in','on','by'],     a: 'at',    e: 'at = байршлын цэг' },
      { s: 'The school is ___ our house.',     c: ['near','in','on','at'],   a: 'near',  e: 'near = ойр' },
      { s: 'The picture is ___ the wall.',     c: ['on','in','at','by'],     a: 'on',    e: 'on = хананд наасан → on' },
      { s: 'We waited ___ the bus stop.',      c: ['at','in','on','by'],     a: 'at',    e: 'at = тодорхой газар' },
    ],
  },
  {
    type: 'grammar', id: 'g18', title: 'Цагийн урьдал үгс', emoji: '🕐', gs: 'G_STRUCT',
    rule: 'in (сар/жил/улирал) · on (өдөр/огноо) · at (цаг)',
    example: 'in January, on Monday, at 7 o\'clock.',
    q: [
      { s: 'I was born ___ 1998.',               c: ['in','on','at','by'],   a: 'in',  e: 'in + year/month/season' },
      { s: 'She wakes up ___ 7 o\'clock.',       c: ['at','in','on','by'],   a: 'at',  e: 'at + specific time' },
      { s: 'We have class ___ Monday.',          c: ['on','in','at','by'],   a: 'on',  e: 'on + day of the week' },
      { s: 'It always snows ___ winter.',        c: ['in','on','at','by'],   a: 'in',  e: 'in + season' },
      { s: 'The meeting is ___ Friday morning.', c: ['on','in','at','by'],   a: 'on',  e: 'on + day' },
      { s: 'I\'ll see you ___ the weekend.',     c: ['at','in','on','by'],   a: 'at',  e: 'at the weekend (British)' },
      { s: 'He often works ___ night.',          c: ['at','in','on','by'],   a: 'at',  e: 'at night' },
      { s: 'She was born ___ June 5th.',         c: ['on','in','at','by'],   a: 'on',  e: 'on + specific date' },
      { s: 'We celebrate New Year ___ January.', c: ['in','on','at','by'],   a: 'in',  e: 'in + month' },
      { s: 'The train leaves ___ midnight.',     c: ['at','in','on','by'],   a: 'at',  e: 'at + specific time' },
    ],
  },
  {
    type: 'grammar', id: 'g19', title: 'Харьцуулах хэлбэр', emoji: '⚖️', gs: 'G_STRUCT',
    rule: 'short adj + -er / more + long adj + than',
    example: 'taller than, more interesting than.',
    q: [
      { s: 'She is ___ than her sister. (tall)',       c: ['taller','more tall','tallest','as tall'],               a: 'taller',          e: 'tall → taller (+er)' },
      { s: 'This is ___ than that. (interesting)',     c: ['more interesting','interestinger','most interesting','interesting as'], a: 'more interesting', e: 'long adj → more + adj' },
      { s: 'He runs ___ than before. (fast)',          c: ['faster','more fast','fastest','as fast'],               a: 'faster',          e: 'fast → faster (+er)' },
      { s: 'This test is ___ than the last. (difficult)',c: ['more difficult','difficulter','most difficult','difficult as'], a: 'more difficult', e: 'long adj → more + adj' },
      { s: 'My bag is ___ than yours. (heavy)',        c: ['heavier','more heavy','heaviest','as heavy'],           a: 'heavier',         e: 'heavy → heavier (y→ier)' },
      { s: 'This phone is ___ than mine. (expensive)', c: ['more expensive','expensiver','most expensive','expensive as'], a: 'more expensive', e: 'long adj → more + adj' },
      { s: 'Today is ___ than yesterday. (cold)',      c: ['colder','more cold','coldest','as cold'],               a: 'colder',          e: 'cold → colder (+er)' },
      { s: 'She is ___ than I thought. (smart)',       c: ['smarter','more smart','smartest','as smart'],           a: 'smarter',         e: 'smart → smarter (+er)' },
      { s: 'This road is ___ than the old one. (wide)',c: ['wider','more wide','widest','as wide'],                 a: 'wider',           e: 'wide → wider (+r)' },
      { s: 'He is ___ than his brother. (strong)',     c: ['stronger','more strong','strongest','as strong'],       a: 'stronger',        e: 'strong → stronger (+er)' },
    ],
  },
  {
    type: 'grammar', id: 'g20', title: 'Дээд зэрэглэл', emoji: '🥇', gs: 'G_STRUCT',
    rule: 'the + short adj + -est / the most + long adj',
    example: 'the tallest, the most beautiful.',
    q: [
      { s: 'She is ___ student in the class. (tall)',       c: ['the tallest','the most tall','taller','tallest'],                 a: 'the tallest',       e: 'the + tall + est' },
      { s: 'This is ___ movie I\'ve ever seen. (good)',     c: ['the best','the most good','the better','best'],                   a: 'the best',          e: 'good → the best (irregular)' },
      { s: 'He is ___ person I know. (funny)',              c: ['the funniest','the most funny','the funnier','funniest'],         a: 'the funniest',      e: 'funny → the funniest (y→iest)' },
      { s: 'This is ___ restaurant in the city. (expensive)',c: ['the most expensive','the expensivest','the more expensive','most expensive'], a: 'the most expensive', e: 'long adj → the most + adj' },
      { s: 'Everest is ___ mountain. (high)',               c: ['the highest','the most high','the higher','highest'],            a: 'the highest',       e: 'the + high + est' },
      { s: 'That was ___ day of my life. (bad)',            c: ['the worst','the most bad','the baddest','worst'],                a: 'the worst',         e: 'bad → the worst (irregular)' },
      { s: 'She is ___ singer in the band. (beautiful)',    c: ['the most beautiful','the beautifullest','the more beautiful','most beautiful'], a: 'the most beautiful', e: 'long adj → the most + adj' },
      { s: 'This is ___ book in the library. (old)',        c: ['the oldest','the most old','the older','oldest'],                a: 'the oldest',        e: 'the + old + est' },
      { s: 'He is ___ runner on the team. (fast)',          c: ['the fastest','the most fast','the faster','fastest'],            a: 'the fastest',       e: 'the + fast + est' },
      { s: 'This is ___ challenge I\'ve faced. (difficult)',c: ['the most difficult','the difficultest','the more difficult','most difficult'], a: 'the most difficult', e: 'long adj → the most + adj' },
    ],
  },
];

export const GRAMMAR_SECTION_EMOJIS: Record<GrammarSectionId, string> = {
  G_BASIC:  '🧱',
  G_PAST:   '⏰',
  G_FUTURE: '🔭',
  G_MODAL:  '🎯',
  G_STRUCT: '🏗️',
};
