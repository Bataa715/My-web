export type GrammarSectionId = 'G_BASIC' | 'G_PAST' | 'G_FUTURE' | 'G_MODAL' | 'G_STRUCT';

export interface GrammarQ {
  s: string;
  c: [string, string, string, string];
  a: string;
  e: string;
}

export interface LessonTable {
  headers: string[];
  rows: string[][];
}

export interface LessonContent {
  explanation: string;
  table?: LessonTable;
  examples: { en: string; mn: string }[];
  tips?: string[];
}

export interface GrammarLesson {
  type: 'grammar';
  id: string;
  title: string;
  emoji: string;
  gs: GrammarSectionId;
  rule: string;
  example: string;
  content: LessonContent;
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
    content: {
      explanation: '"To be" гэдэг нь монгол хэлэнд "байх" гэсэн утгатай англи хэлний хамгийн чухал үйл үгийн нэг. Одоо цагт am / is / are гэсэн гурван хэлбэртэй байна. Нэр үгний дагуу ямар хэлбэрийг хэрэглэхийг сонгоно.',
      table: {
        headers: ['Нэр үг', 'To Be', 'Жишээ'],
        rows: [
          ['I', 'am', 'I am a student.'],
          ['He / She / It', 'is', 'She is a doctor.'],
          ['You / We / They', 'are', 'They are friends.'],
        ],
      },
      examples: [
        { en: 'I am happy today.', mn: 'Би өнөөдөр баяртай байна.' },
        { en: 'He is very tall.', mn: 'Тэр маш өндөр.' },
        { en: 'We are best friends.', mn: 'Бид хамгийн сайн найзууд.' },
        { en: 'The weather is nice.', mn: 'Цаг агаар сайхан байна.' },
      ],
      tips: [
        "Ярианд богиносгодог: I am → I'm, You are → You're, She is → She's",
        "Үгүйсгэлд not нэмнэ: I am not tired. / She is not home.",
      ],
    },
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
    content: {
      explanation: '"To be" үйл үгийн өнгөрсөн цагийн хэлбэр нь was болон were хоёр л байна. Одоо цагийн am/is → was, are → were болж өөрчлөгдөнө.',
      table: {
        headers: ['Нэр үг', 'Өнгөрсөн цаг', 'Жишээ'],
        rows: [
          ['I / He / She / It', 'was', 'She was a nurse.'],
          ['You / We / They', 'were', 'They were tired.'],
        ],
      },
      examples: [
        { en: 'I was at school yesterday.', mn: 'Би өчигдөр сургуульд байлаа.' },
        { en: 'The weather was cold last night.', mn: 'Өчигдөр шөнө цаг агаар хүйтэн байлаа.' },
        { en: 'We were happy at the party.', mn: 'Бид найр дээр баяртай байлаа.' },
        { en: 'He was not at home.', mn: 'Тэр гэртээ байгаагүй.' },
      ],
      tips: [
        'am → was, is → was, are → were гэж өөрчлөгдөнө.',
        "Үгүйсгэлд: was not → wasn't, were not → weren't",
      ],
    },
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
    content: {
      explanation: 'Present Simple нь өдөр бүр болдог тогтмол үйлдэл, ерөнхий үнэн зэргийг илэрхийлнэ. He/She/It-ийн хувьд үйл үгийн төгсгөлд -s эсвэл -es нэмдэг.',
      table: {
        headers: ['Нэр үг', 'Дүрэм', 'Жишээ'],
        rows: [
          ['I / You / We / They', 'verb (өөрчлөгдөхгүй)', 'I work. They play.'],
          ['He / She / It', 'verb + s/es', 'She works. He goes.'],
        ],
      },
      examples: [
        { en: 'I drink coffee every morning.', mn: 'Би өдөр бүр өглөөнд кофе уудаг.' },
        { en: 'She speaks three languages.', mn: 'Тэр гурван хэл ярьдаг.' },
        { en: 'The sun rises in the east.', mn: 'Нар зүүнээс мандана.' },
        { en: 'They play football on Sundays.', mn: 'Тэд Ням гарагт хөлбөмбөг тоглодог.' },
      ],
      tips: [
        '-s/-es дүрэм: go → goes, watch → watches, study → studies (y→ies)',
        'Цагийн тэмдэглэгч: every day, usually, always, often, sometimes, never',
      ],
    },
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
    rule: "I/You/We/They + don't · He/She/It + doesn't + base verb",
    example: "I don't know. She doesn't like it.",
    content: {
      explanation: "Present Simple-ийн үгүйсгэлд don't эсвэл doesn't ашиглана. He/She/It-ийн хувьд doesn't ашигладаг бөгөөд дараа нь үйл үг заавал base form (үндсэн хэлбэр)-д байна.",
      table: {
        headers: ['Нэр үг', 'Үгүйсгэл', 'Жишээ'],
        rows: [
          ["I / You / We / They", "don't + verb", "I don't like coffee."],
          ["He / She / It", "doesn't + verb", "She doesn't speak French."],
        ],
      },
      examples: [
        { en: "I don't eat meat.", mn: 'Би мах иддэггүй.' },
        { en: "He doesn't have a car.", mn: 'Түүнд машин байхгүй.' },
        { en: "They don't live here.", mn: 'Тэд энд амьдардаггүй.' },
        { en: "She doesn't know my name.", mn: 'Тэр миний нэрийг мэддэггүй.' },
      ],
      tips: [
        "doesn't ашиглахад үйл үг base form-д байна: doesn't goes ❌ → doesn't go ✅",
        "Асуухад: Do you...? / Does she...?",
      ],
    },
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
    content: {
      explanation: 'Present Continuous нь одоо яг болж байгаа буюу энэ үед үргэлжилж байгаа үйлдлийг илэрхийлнэ. am/is/are + verb-ing гэсэн бүтэцтэй.',
      table: {
        headers: ['Нэр үг', 'Дүрэм', 'Жишээ'],
        rows: [
          ['I', 'am + verb-ing', 'I am reading.'],
          ['He / She / It', 'is + verb-ing', 'She is cooking.'],
          ['You / We / They', 'are + verb-ing', 'They are playing.'],
        ],
      },
      examples: [
        { en: 'I am studying English right now.', mn: 'Би одоо англи хэл сурч байна.' },
        { en: 'She is talking on the phone.', mn: 'Тэр утсаар ярьж байна.' },
        { en: "Look! It's snowing!", mn: 'Харагтун! Цас орож байна!' },
        { en: 'They are building a new house.', mn: 'Тэд шинэ байшин барьж байна.' },
      ],
      tips: [
        '-ing нэмэх дүрэм: run → running, write → writing, study → studying',
        'Цагийн тэмдэглэгч: now, right now, at the moment, currently, Look!',
        'Present Simple (тогтмол) vs Continuous (одоо): I work. / I am working.',
      ],
    },
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
    content: {
      explanation: 'Өнгөрсөн цагт дуусгасан үйлдлийг илэрхийлнэ. Тогтмол (regular) үйл үгс нь -ed нэмэх замаар өнгөрсөн цагийг үүсгэнэ. Бүх нэр үгийн хувьд хэлбэр адилхан байна.',
      table: {
        headers: ['Одоо цаг', 'Өнгөрсөн цаг', 'Дүрэм'],
        rows: [
          ['walk', 'walked', '+ed'],
          ['play', 'played', '+ed'],
          ['study', 'studied', 'y → ied'],
          ['stop', 'stopped', 'p хоёрдуулна'],
          ['cook', 'cooked', '+ed'],
        ],
      },
      examples: [
        { en: 'I walked to school yesterday.', mn: 'Би өчигдөр сургуульд алхан явлаа.' },
        { en: 'She cooked dinner for us.', mn: 'Тэр бидэнд оройн хоол хийлгэлэн.' },
        { en: 'They played football last Sunday.', mn: 'Тэд өнгөрсөн Ням гарагт хөлбөмбөг тоглосон.' },
        { en: 'He studied hard for the exam.', mn: 'Тэр шалгалтанд зориулан шаргуу хичээллэсэн.' },
      ],
      tips: [
        'Цагийн тэмдэглэгч: yesterday, last week, last year, ago, in 2020',
        'Бүх нэр үгийн хувьд хэлбэр адил: I walked, She walked, They walked',
      ],
    },
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
    content: {
      explanation: 'Дүрмийн бус (irregular) үйл үгс нь өнгөрсөн цагт -ed нэмдэггүй. Өөрийн гэсэн тусгай хэлбэртэй байдаг тул цээжлэх хэрэгтэй. Эдгээр нь хамгийн өргөн хэрэглэгддэг үйл үгс юм.',
      table: {
        headers: ['Одоо цаг', 'Өнгөрсөн цаг', 'Утга'],
        rows: [
          ['go', 'went', 'явах'],
          ['see', 'saw', 'харах'],
          ['eat', 'ate', 'идэх'],
          ['give', 'gave', 'өгөх'],
          ['take', 'took', 'авах'],
          ['make', 'made', 'хийх'],
          ['buy', 'bought', 'худалдаж авах'],
          ['have', 'had', 'байх / эзэмших'],
          ['come', 'came', 'ирэх'],
          ['build', 'built', 'барих'],
        ],
      },
      examples: [
        { en: 'She went to Paris last summer.', mn: 'Тэр өнгөрсөн зун Парис явлаа.' },
        { en: 'I saw him at the party.', mn: 'Би түүнийг найр дээр харлаа.' },
        { en: 'We ate pizza for dinner.', mn: 'Бид оройн хоолонд пицца идлээ.' },
        { en: 'He bought a new phone.', mn: 'Тэр шинэ утас авлаа.' },
      ],
      tips: [
        'Үгүйсгэлд: didn\'t + BASE verb (went биш go): I didn\'t go. ✅',
        'Хамгийн нийтлэг дүрмийн бус үйл үгсийг цээжлэх нь чухал!',
      ],
    },
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
    content: {
      explanation: 'Past Continuous нь өнгөрсөн цагт тодорхой нэгэн үед болж байсан буюу үргэлжилж байсан үйлдлийг илэрхийлнэ. was/were + verb-ing гэсэн бүтэцтэй. Ихэвчлэн Past Simple-тэй хамт ашиглагдана.',
      table: {
        headers: ['Нэр үг', 'Дүрэм', 'Жишээ'],
        rows: [
          ['I / He / She / It', 'was + verb-ing', 'I was reading.'],
          ['You / We / They', 'were + verb-ing', 'They were talking.'],
        ],
      },
      examples: [
        { en: 'She was reading when I called.', mn: 'Би залгахад тэр уншиж байлаа.' },
        { en: 'They were sleeping at midnight.', mn: 'Шөнө дундад тэд унтаж байлаа.' },
        { en: 'He was driving when it happened.', mn: 'Тэр явдал болохад жолоо барьж байлаа.' },
        { en: 'What were you doing at 9 PM?', mn: 'Чи 9 цагт юу хийж байсан бэ?' },
      ],
      tips: [
        'when + Past Simple: богино дуусч буй үйл = "I called"',
        'while + Past Continuous: урт үргэлжлэх үйл = "while she was reading"',
        'She was reading WHEN I called. (was reading = урт, called = богино)',
      ],
    },
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
    content: {
      explanation: 'Present Perfect нь өнгөрсөнд болсон боловч одоотой холбоотой үйлдлийг илэрхийлнэ. Үйлдэл хэзээ болсон нь чухал биш, үр дүн нь одоо ч хамааралтай байна. have/has + past participle (3-р хэлбэр) гэсэн бүтэцтэй.',
      table: {
        headers: ['Нэр үг', 'Дүрэм', 'Жишээ'],
        rows: [
          ['I / You / We / They', 'have + PP', 'I have finished.'],
          ['He / She / It', 'has + PP', 'She has left.'],
        ],
      },
      examples: [
        { en: 'I have visited Japan.', mn: 'Би Японд очсон (туршлагатай).' },
        { en: 'She has already eaten.', mn: 'Тэр аль хэдийн идсэн.' },
        { en: 'I have never seen snow.', mn: 'Би хэзээ ч цас харж байгаагүй.' },
        { en: 'He has lived here since 2015.', mn: 'Тэр 2015-аас хойш энд амьдарч байна.' },
      ],
      tips: [
        'already (аль хэдийн), just (саяхан), yet (одоо хүртэл), never (хэзээ ч...гүй), ever (хэзээ нэгэн цагт), since/for',
        'Past Simple vs Perfect: "I ate pizza." (хэзээ мэдэгдэж байна) / "I have eaten pizza." (туршлага)',
      ],
    },
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
    content: {
      explanation: 'Will нь тухайн мөчид шийдсэн, урьдчилан таамаглах буюу амлалт өгөхөд ашиглагдах ирээдүйн хэлбэр юм. Бүх нэр үгийн хувьд will хэвээрээ байна — хэлбэр өөрчлөгдөхгүй.',
      table: {
        headers: ['Хэлбэр', 'Дүрэм', 'Жишээ'],
        rows: [
          ['Эерэг', 'Subject + will + verb', "I will help you."],
          ['Үгүйсгэл', "Subject + won't + verb", "She won't come."],
          ['Асуулт', 'Will + subject + verb?', 'Will you be there?'],
        ],
      },
      examples: [
        { en: 'I will call you tomorrow.', mn: 'Би маргааш чамд залгана.' },
        { en: "Don't worry, it will be okay.", mn: 'Санаа бүү зов, бүх зүйл сайн болно.' },
        { en: "She won't come to the party.", mn: 'Тэр найрт ирэхгүй.' },
        { en: 'Will you help me?', mn: 'Чи надад туслах уу?' },
      ],
      tips: [
        "Ярианд богиносгодог: I will → I'll, He will → He'll, will not → won't",
        "Will vs Going To: Will = тухайн мөчийн шийдвэр / Going To = урьдаас төлөвлөсөн",
      ],
    },
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
    content: {
      explanation: 'Going to нь урьдчилан төлөвлөсөн буюу тодорхой нотолгоо (харагдаж байгаа зүйл) дээр үндэслэсэн ирээдүйг илэрхийлнэ. am/is/are + going to + base verb гэсэн бүтэцтэй.',
      table: {
        headers: ['Нэр үг', 'Дүрэм', 'Жишээ'],
        rows: [
          ['I', 'am going to + verb', "I'm going to study."],
          ['He / She / It', 'is going to + verb', "She's going to travel."],
          ['You / We / They', 'are going to + verb', "They're going to move."],
        ],
      },
      examples: [
        { en: "I'm going to visit my grandma this weekend.", mn: 'Би энэ амралтын өдрүүдэд эмээгийнхээ дэргэд очно.' },
        { en: "Look at those clouds — it's going to rain!", mn: 'Тэдгээр үүлийг хара — бороо орохоор байна!' },
        { en: "She's going to study medicine.", mn: 'Тэр анагаах ухаан судлахаар байна.' },
        { en: "Are you going to come?", mn: 'Чи ирэх үү?' },
      ],
      tips: [
        "Will = тухайн мөчийн шийдвэр / Going To = урьдаас тогтоосон төлөвлөгөө",
        "Нотолгоо харагдаж байвал: Look! It's going to rain. (бороо ирж байгааг харж байна)",
      ],
    },
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
    type: 'grammar', id: 'g12', title: "Can / Can't", emoji: '💪', gs: 'G_MODAL',
    rule: "can + base verb (чадах) · can't = cannot",
    example: "I can swim. She can't drive.",
    content: {
      explanation: 'Can нь чадвар эсвэл зөвшөөрлийг илэрхийлнэ. Бүх нэр үгийн хувьд can хэвээрээ байна — -s/-es нэмдэггүй. Дараа нь үргэлж base verb хэрэглэнэ.',
      table: {
        headers: ['Хэлбэр', 'Дүрэм', 'Жишээ'],
        rows: [
          ['Эерэг', 'Subject + can + verb', 'She can swim.'],
          ["Үгүйсгэл", "Subject + can't + verb", "I can't drive."],
          ['Асуулт', 'Can + subject + verb?', 'Can you help me?'],
        ],
      },
      examples: [
        { en: 'She can speak three languages.', mn: 'Тэр гурван хэл ярьж чадна.' },
        { en: "I can't understand this problem.", mn: 'Би энэ асуудлыг ойлгож чадахгүй байна.' },
        { en: 'Can you play the guitar?', mn: 'Чи гитар тоглож чаддаг уу?' },
        { en: 'We can see the mountains from here.', mn: 'Бид эндээс уулсыг харж чадна.' },
      ],
      tips: [
        "can-ийн дараа ЗААВАЛ base verb: can goes ❌ → can go ✅",
        "can't = cannot (богиносгосон хэлбэр) — чаддаггүй, боломжгүй",
        "Зөвшөөрлийн хэрэглээ: Can I sit here? — Энд суух боломжтой юу?",
      ],
    },
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
    type: 'grammar', id: 'g13', title: "Must / Mustn't", emoji: '⚠️', gs: 'G_MODAL',
    rule: "must = шаардлагатай · mustn't = хориотой",
    example: "You must wear a seatbelt. You mustn't smoke here.",
    content: {
      explanation: "Must нь заавал хийх ёстой шаардлага буюу хүчтэй үүргийг илэрхийлнэ. Mustn't (must not) нь бол хориглол буюу хэзээ ч болохгүй гэсэн утгатай. Эдгээр хоёрыг сайн ялгаж сурах хэрэгтэй!",
      table: {
        headers: ['Хэлбэр', 'Утга', 'Жишээ'],
        rows: [
          ['must', 'заавал хийх ёстой', 'You must wear a helmet.'],
          ["mustn't", 'хэзээ ч болохгүй', "You mustn't run here."],
        ],
      },
      examples: [
        { en: 'You must wear a seatbelt in a car.', mn: 'Машинд суухдаа заавал бүс тайлах ёстой.' },
        { en: "You mustn't smoke inside the hospital.", mn: 'Эмнэлэгт дотор тамхи татаж болохгүй.' },
        { en: 'Students must bring ID to the exam.', mn: 'Оюутнууд шалгалтанд үнэмлэх авчрах ёстой.' },
        { en: "Children mustn't cross the road alone.", mn: 'Хүүхдүүд ганцаараа зам гаталж болохгүй.' },
      ],
      tips: [
        "must ≠ mustn't: must = хийх ёстой / mustn't = хийж болохгүй",
        "must vs have to: must = өөрийн дотоод үүрэг / have to = гаднаас тавигдсан дүрэм",
      ],
    },
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
    type: 'grammar', id: 'g14', title: "Should / Shouldn't", emoji: '💡', gs: 'G_MODAL',
    rule: "should = зөвлөгөө өгөх · shouldn't = зөвлөхгүй",
    example: "You should sleep early. You shouldn't eat junk food.",
    content: {
      explanation: "Should нь зөвлөгөө өгөх буюу зүйтэй гэж санагдаж байгаа зүйлийг хэлэхэд хэрэглэгдэнэ. Must-аас зөөлөн, шаардлага биш харин зөвлөгөө. Shouldn't нь тийм зүйл хийхгүй байхыг зөвлөхөд хэрэглэнэ.",
      table: {
        headers: ['Хэлбэр', 'Утга', 'Жишээ'],
        rows: [
          ['should', 'зөвлөгөө (хийх нь зүйтэй)', 'You should sleep early.'],
          ["shouldn't", 'зөвлөхгүй (хийхгүй нь дээр)', "You shouldn't eat junk food."],
        ],
      },
      examples: [
        { en: 'You should drink more water.', mn: 'Чи илүү их ус уух хэрэгтэй.' },
        { en: "You shouldn't stay up so late.", mn: 'Чи хэт орой унтах хэрэггүй.' },
        { en: 'I think you should see a doctor.', mn: 'Чи эмчид үзүүлэх хэрэгтэй гэж бодож байна.' },
        { en: "Students shouldn't use phones in class.", mn: 'Оюутнууд хичээлийн цагт утас ашиглах ёсгүй.' },
      ],
      tips: [
        "should (зөвлөгөө) < must (шаардлага): should = зүйтэй, must = заавал",
        "I think you should... / You really should... гэж зөвлөгөө өгнө",
      ],
    },
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
    content: {
      explanation: 'Would нь хэд хэдэн нөхцөлд хэрэглэгдэнэ: (1) эелдэг хүсэлт/санал өгөхөд, (2) нөхцөлт цагт (if + would), (3) өнгөрсөн дахин давтагдах дадлыг илэрхийлэхэд. Бүх нэр үгийн хувьд would хэвээрээ байна.',
      table: {
        headers: ['Хэрэглэх нөхцөл', 'Жишээ', 'Утга'],
        rows: [
          ['Эелдэг хүсэлт/санал', "Would you like coffee?", 'Кофе уух уу?'],
          ['Эелдэг хүсэлт (өөрийн)', "I'd like a coffee.", 'Кофе уумаар байна.'],
          ['Нөхцөлт цаг', "If I had time, I'd travel.", 'Цаг байсан бол аялах байсан.'],
          ['Өнгөрсөн дадал', 'She would read every night.', 'Тэр шөнө бүр уншдаг байлаа.'],
        ],
      },
      examples: [
        { en: 'Would you like some tea?', mn: 'Цай уух уу?' },
        { en: "I'd love to visit Japan someday.", mn: 'Нэгэн өдөр Японд очих байсан.' },
        { en: "If I were rich, I'd travel the world.", mn: 'Баян байсан бол дэлхийг тойрон аялах байсан.' },
        { en: 'She would always sing in the morning.', mn: 'Тэр өглөө бүр дуулдаг байлаа.' },
      ],
      tips: [
        "I would → I'd, He would → He'd, They would → They'd",
        "Would you like...? = Do you want...?-аас илүү эелдэг",
        "would rather: I'd rather stay home. = Гэртээ байхыг илүүд үзнэ.",
      ],
    },
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
    content: {
      explanation: 'Англи хэлэнд a, an, the гэсэн гурван нийтлэг үг байна. a/an нь тодорхойгүй буюу анхлан дурдаж байгаа зүйлд хэрэглэнэ. the нь хоёулаа мэддэг буюу тодорхой зүйлд хэрэглэнэ.',
      table: {
        headers: ['Нийтлэг үг', 'Хэзээ хэрэглэх', 'Жишээ'],
        rows: [
          ['a', 'гийгүүлэгч дуунаас эхлэх үг', 'a dog, a book, a car'],
          ['an', 'эгшиг дуунаас эхлэх үг', 'an apple, an hour, an idea'],
          ['the', 'тодорхой / хоёулаа мэдэх зүйл', 'the sun, the door, the Nile'],
        ],
      },
      examples: [
        { en: 'I saw a dog in the park.', mn: 'Би цэцэрлэгт нохой харлаа (ямар ч нохой).' },
        { en: 'The dog was very friendly.', mn: 'Тэр нохой маш найрсаг байлаа (дахин дурдаж байгаа).' },
        { en: 'She is an engineer.', mn: 'Тэр инженер (эгшгээс эхэлнэ).' },
        { en: 'The Nile is the longest river.', mn: 'Нил нь хамгийн урт гол (цорын ганц).' },
      ],
      tips: [
        "ДУУН-г харна: a university (ю-дуун), an hour (h дуугүй → эгшиг мэт)",
        "Нэр үг анх гарах: a cat → дараагийн удаа: the cat",
        "Цорын ганц зүйл (нар, сар): the sun, the moon, the sky",
      ],
    },
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
    content: {
      explanation: 'Байршлыг илэрхийлэх гурван гол урьдал үг: in (хаалттай орчин дотор), on (гадаргуу дээр, хана дээр гэх мэт), at (тодорхой цэг, байршил).',
      table: {
        headers: ['Урьдал үг', 'Хэрэглэх үе', 'Жишээ'],
        rows: [
          ['in', 'хаалттай орчин, хот/улс', 'in the box, in Paris, in Mongolia'],
          ['on', 'гадаргуу дээр, хананд', 'on the table, on the wall, on the floor'],
          ['at', 'тодорхой цэг/байршил', 'at the airport, at school, at home'],
          ['under', 'доор', 'under the bed, under the table'],
          ['near', 'ойр', 'near the school, near the river'],
        ],
      },
      examples: [
        { en: 'The book is on the table.', mn: 'Ном ширээн дээр байна.' },
        { en: 'She lives in Ulaanbaatar.', mn: 'Тэр Улаанбаатарт амьдардаг.' },
        { en: "I'll meet you at the airport.", mn: 'Нисэх буудал дээр уулзъя.' },
        { en: 'The cat is under the sofa.', mn: 'Муур диваны доор байна.' },
      ],
      tips: [
        "in = хаалттай орчин (in the room, in the bag)",
        "on = гадаргуутай хүрэлцсэн (on the desk, on the wall, on the bus)",
        "at = нарийн цэг (at the door, at the bus stop, at work)",
      ],
    },
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
    rule: "in (сар/жил/улирал) · on (өдөр/огноо) · at (цаг)",
    example: "in January, on Monday, at 7 o'clock.",
    content: {
      explanation: 'Цагийн урьдал үгс нь байршлын нэгэн адил in/on/at гурвыг ашигладаг. Цаг, он, сар, өдөр, улирлаас хамааран аль нэгийг сонгоно.',
      table: {
        headers: ['Урьдал үг', 'Хэрэглэх үе', 'Жишээ'],
        rows: [
          ['in', 'он, сар, улирал', 'in 2024, in January, in winter'],
          ['on', 'гаригийн өдөр, тодорхой огноо', 'on Monday, on June 5th, on my birthday'],
          ['at', 'тодорхой цаг, тусгай илэрхийлэл', "at 7 AM, at midnight, at night"],
        ],
      },
      examples: [
        { en: 'I was born in 2001.', mn: 'Би 2001 онд төрсөн.' },
        { en: 'We have class on Monday.', mn: 'Бид Даваа гарагт хичээлтэй.' },
        { en: 'The train leaves at 9 AM.', mn: 'Галт тэрэг 9 цагт хөдөлнө.' },
        { en: 'It always snows in winter.', mn: 'Өвөл үргэлж цас ордог.' },
      ],
      tips: [
        "in: жил/сар/улирал — in 2024, in July, in summer",
        "on: өдөр/огноо — on Friday, on March 8th, on New Year's Day",
        "at: тодорхой цаг — at 6 PM, at noon, at midnight, at night",
      ],
    },
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
    content: {
      explanation: 'Харьцуулах хэлбэр (Comparative) нь хоёр зүйлийг харьцуулахад хэрэглэнэ. Богино үгт -er нэмж than ашигладаг; урт үгт more + adj + than хэрэглэнэ.',
      table: {
        headers: ['Үгийн төрөл', 'Дүрэм', 'Жишээ'],
        rows: [
          ['1-2 үет богино', 'adj + -er + than', 'tall → taller than'],
          ['3+ үет урт', 'more + adj + than', 'beautiful → more beautiful than'],
          ['Тусгай дүрэм', 'irregular', 'good → better, bad → worse, far → farther'],
          ['y-ээр төгссөн', 'y → ier + than', 'happy → happier, funny → funnier'],
        ],
      },
      examples: [
        { en: 'She is taller than her sister.', mn: 'Тэр дүүгийнхээ дүүтэй харьцуулбал өндөр.' },
        { en: 'This book is more interesting than that one.', mn: 'Энэ ном тэрнийхээс илүү сонирхолтой.' },
        { en: 'He runs faster than me.', mn: 'Тэр намайс хурдан гүйдэг.' },
        { en: 'Today is colder than yesterday.', mn: 'Өнөөдөр өчигдрөөс хүйтэн.' },
      ],
      tips: [
        "Богино үг = 1-2 үет: cold → colder, big → bigger (хоёрдуулна)",
        "Урт үг = 3+ үет: interesting → more interesting, expensive → more expensive",
        "Тусгай: good → better, bad → worse, many/much → more",
      ],
    },
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
    content: {
      explanation: 'Дээд зэрэглэл (Superlative) нь гурав ба түүнээс дээш зүйлийн дотроос хамгийн ... гэдгийг илэрхийлнэ. Заавал the-тэй хэрэглэнэ.',
      table: {
        headers: ['Үгийн төрөл', 'Дүрэм', 'Жишээ'],
        rows: [
          ['1-2 үет богино', 'the + adj + -est', 'tall → the tallest'],
          ['3+ үет урт', 'the most + adj', 'beautiful → the most beautiful'],
          ['Тусгай дүрэм', 'irregular', 'good → the best, bad → the worst'],
          ['y-ээр төгссөн', 'the + adj(y→i) + est', 'funny → the funniest'],
        ],
      },
      examples: [
        { en: 'She is the tallest student in the class.', mn: 'Тэр ангийнхаа хамгийн өндөр оюутан.' },
        { en: 'This is the most expensive restaurant.', mn: 'Энэ хамгийн үнэтэй ресторан.' },
        { en: 'Mount Everest is the highest mountain.', mn: 'Эверест бол хамгийн өндөр уул.' },
        { en: 'That was the worst day of my life.', mn: 'Тэр миний амьдралын хамгийн муу өдөр байлаа.' },
      ],
      tips: [
        "Comparative vs Superlative: She is taller than me. / She is THE tallest.",
        "Заавал the хэрэглэнэ: ❌ She is tallest. → ✅ She is THE tallest.",
        "Тусгай: good → the best, bad → the worst, many/much → the most",
      ],
    },
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
