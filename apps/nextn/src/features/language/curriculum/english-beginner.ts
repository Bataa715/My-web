import type { GrammarLessonData } from './types';

/** English — beginner (CEFR A1–A2) */
export const ENGLISH_BEGINNER: GrammarLessonData[] = [
  /* ───────────────────────── Суурь ───────────────────────── */
  {
    id: 'en-to-be',
    level: 'beginner',
    category: 'Суурь',
    title: 'To be: am / is / are',
    titleMn: '"Байх" үйл үг',
    summary: 'Өөрийгөө, бусдыг танилцуулж, юмыг тодорхойлж сурна.',
    explain: [
      'Англи хэлэнд өгүүлбэр бүр үйл үгтэй байх ёстой. Монголоор "Би оюутан" гэж хэлдэг ч англиар "I am a student" гэж хэлнэ — "am" нь "байна" гэсэн утгатай холбоос.',
      'To be нь одоо цагт гурван хэлбэртэй: I → am, he/she/it → is, you/we/they → are.',
    ],
    tables: [
      {
        headers: ['Хүн', 'To be', 'Богиноссон', 'Жишээ'],
        rows: [
          ['I', 'am', "I'm", "I'm a student."],
          ['He / She / It', 'is', "he's / she's / it's", 'She is a doctor.'],
          ['You / We / They', 'are', "you're / we're / they're", 'They are friends.'],
        ],
      },
    ],
    patterns: [
      { label: 'Эерэг', formula: 'Subject + am/is/are + …', example: 'He is tall.' },
      { label: 'Үгүйсгэх', formula: 'Subject + am/is/are + not + …', example: 'He is not tall.' },
      { label: 'Асуух', formula: 'Am/Is/Are + subject + …?', example: 'Is he tall?' },
    ],
    examples: [
      { t: 'I am from Mongolia.', mn: 'Би Монгол хүн.' },
      { t: 'My sister is ten years old.', mn: 'Миний эгч арван настай.' },
      { t: 'We are at school.', mn: 'Бид сургууль дээр байна.' },
      { t: 'Are you hungry?', mn: 'Чи өлсөж байна уу?' },
      { t: "It isn't expensive.", mn: 'Энэ үнэтэй биш.' },
    ],
    mistakes: [
      { wrong: 'I student.', right: 'I am a student.', why: 'To be-г орхиж болохгүй.' },
      { wrong: 'She are happy.', right: 'She is happy.', why: 'she-тэй is хэрэглэнэ.' },
      { wrong: 'I am agree.', right: 'I agree.', why: '"agree" өөрөө үйл үг, am хэрэггүй.' },
    ],
    tips: ['Асуухдаа to be-г өгүүлбэрийн эхэнд гаргана: You are → Are you?'],
    quiz: [
      { q: 'My parents ___ teachers.', options: ['is', 'am', 'are'], answer: 2, why: 'parents = олон тоо → are.' },
      { q: 'She ___ not at home.', options: ['are', 'is', 'am'], answer: 1, why: 'she → is.' },
      { q: '___ you a student?', options: ['Is', 'Are', 'Am'], answer: 1, why: 'you → Are.' },
      { q: 'I ___ 20 years old.', options: ['is', 'are', 'am'], answer: 2, why: 'I → am.' },
    ],
  },
  {
    id: 'en-articles',
    level: 'beginner',
    category: 'Суурь',
    title: 'Articles: a / an / the',
    titleMn: 'Тодотгогч үгс',
    summary: 'Хэзээ a, an, the хэрэглэх, хэзээ огт хэрэглэхгүйг мэднэ.',
    explain: [
      'Монгол хэлэнд a/the байдаггүй тул ихэвчлэн мартдаг. Гэхдээ англиар тоолж болох нэг тоот нэр үг өмнө нь заавал тодотгогч шаардана.',
      'a / an = "нэг, ямар нэг" (анх дурдаж байна). the = "тэр, тодорхой нэг" (хоёулаа мэдэж буй зүйл). a/an-ийг дуудлагын эхний дуу зөвөлсөн эсэхээр сонгоно: гийгүүлэгчээр → a, эгшгээр → an.',
    ],
    tables: [
      {
        headers: ['Хэзээ', 'Тодотгогч', 'Жишээ'],
        rows: [
          ['Гийгүүлэгчийн дуугаар эхэлбэл', 'a', 'a book, a university (ю-)'],
          ['Эгшгийн дуугаар эхэлбэл', 'an', 'an apple, an hour (ауэ-)'],
          ['Тодорхой / дахин дурдсан', 'the', 'The book is on the table.'],
          ['Нийтлэг утга (олон тоо, тоологдохгүй)', '— (хоосон)', 'I like music. Dogs are friendly.'],
        ],
      },
    ],
    examples: [
      { t: 'I have a dog. The dog is black.', mn: 'Надад нэг нохой бий. Тэр нохой хар.' },
      { t: 'She eats an apple every day.', mn: 'Тэр өдөр бүр нэг алим иддэг.' },
      { t: 'Please close the door.', mn: 'Хаалгыг хаачихаарай. (хоёулаа мэдэх хаалга)' },
      { t: 'The sun is hot today.', mn: 'Өнөөдөр нар халуун байна. (цорын ганц)' },
    ],
    mistakes: [
      { wrong: 'I am student.', right: 'I am a student.', why: 'Тоологдох нэг тоот нэр үгийн өмнө a/an хэрэгтэй.' },
      { wrong: 'He is an university student.', right: 'He is a university student.', why: '"university" нь "ю" гэж эхэлдэг (гийгүүлэгчийн дуу) → a.' },
    ],
    tips: ['Дуудлагаар нь шийд, бичгийн үсгээр биш: an hour, a university.'],
    quiz: [
      { q: 'She is ___ engineer.', options: ['a', 'an', 'the'], answer: 1, why: 'engineer эгшгээр эхэлнэ → an.' },
      { q: 'I saw a cat. ___ cat was white.', options: ['A', 'An', 'The'], answer: 2, why: 'Өмнө дурдсан, тодорхой муур → The.' },
      { q: 'He plays ___ football on Sundays.', options: ['a', 'the', '— (хоосон)'], answer: 2, why: 'Спортын нэрийн өмнө тодотгогч хэрэглэхгүй.' },
    ],
  },
  {
    id: 'en-plurals',
    level: 'beginner',
    category: 'Суурь',
    title: 'Plural nouns',
    titleMn: 'Олон тооны нэр үг',
    summary: 'Нэр үгийг олон тоонд зөв хувиргана.',
    explain: [
      'Ихэнх нэр үгийн төгсгөлд -s нэмж олон тоо болгоно. Гэхдээ төгсгөлөөс хамаарч дүрэм өөр байдаг, бас зарим үгс дүрэмгүй хувирдаг.',
    ],
    tables: [
      {
        headers: ['Дүрэм', 'Нэг тоо', 'Олон тоо'],
        rows: [
          ['Ихэнх үгэнд -s', 'book', 'books'],
          ['-s, -x, -ch, -sh, -z → -es', 'box / bus / watch', 'boxes / buses / watches'],
          ['Гийгүүлэгч + y → -ies', 'city / baby', 'cities / babies'],
          ['-f / -fe → -ves', 'knife / leaf', 'knives / leaves'],
          ['Дүрэмгүй', 'man / woman / child / foot / tooth / person', 'men / women / children / feet / teeth / people'],
          ['Нэг, олон ижил', 'sheep / fish / deer', 'sheep / fish / deer'],
        ],
      },
    ],
    examples: [
      { t: 'There are three boxes on the table.', mn: 'Ширээн дээр гурван хайрцаг байна.' },
      { t: 'The children are playing outside.', mn: 'Хүүхдүүд гадаа тоглож байна.' },
      { t: 'I have two babies in my family.', mn: 'Манай гэр бүлд хоёр нялх хүүхэд бий.' },
    ],
    mistakes: [
      { wrong: 'two childs', right: 'two children', why: 'child-ийн олон тоо дүрэмгүй: children.' },
      { wrong: 'many peoples', right: 'many people', why: 'people нь аль хэдийн олон тоо.' },
    ],
    quiz: [
      { q: 'One watch, two ___.', options: ['watchs', 'watches', 'watchies'], answer: 1, why: '-ch төгсгөл → -es.' },
      { q: 'One city, three ___.', options: ['citys', 'cities', 'cityes'], answer: 1, why: 'гийгүүлэгч + y → -ies.' },
      { q: 'One woman, two ___.', options: ['womans', 'womens', 'women'], answer: 2, why: 'Дүрэмгүй олон тоо: women.' },
    ],
  },
  {
    id: 'en-pronouns',
    level: 'beginner',
    category: 'Суурь',
    title: 'Pronouns & possessives',
    titleMn: 'Төлөөний үг, эзэмшихүй',
    summary: 'I/me/my/mine зэрэг хэлбэрүүдийг ялгаж хэрэглэнэ.',
    explain: [
      'Төлөөний үг нь өгүүлбэрт ямар үүрэгтэй байгаагаас хамаарч хэлбэрээ өөрчилнө: үйлдэгч (subject), үйлдлийн объект, эзэмшигч.',
    ],
    tables: [
      {
        headers: ['Subject', 'Object', 'Possessive adj.', 'Possessive pron.'],
        rows: [
          ['I', 'me', 'my', 'mine'],
          ['you', 'you', 'your', 'yours'],
          ['he', 'him', 'his', 'his'],
          ['she', 'her', 'her', 'hers'],
          ['it', 'it', 'its', '—'],
          ['we', 'us', 'our', 'ours'],
          ['they', 'them', 'their', 'theirs'],
        ],
      },
    ],
    examples: [
      { t: 'She loves her dog.', mn: 'Тэр өөрийн нохойд дуртай.' },
      { t: 'Can you help me?', mn: 'Чи надад тусалж чадах уу?' },
      { t: 'This bag is mine, not yours.', mn: 'Энэ цүнх минийх, чинийх биш.' },
      { t: 'They called us yesterday.', mn: 'Тэд өчигдөр бидэнд залгасан.' },
    ],
    mistakes: [
      { wrong: 'Me and John went home.', right: 'John and I went home.', why: 'Үйлдэгч байгаа тул subject хэлбэр I хэрэглэнэ.' },
      { wrong: "The dog wagged it's tail.", right: 'The dog wagged its tail.', why: "it's = it is; эзэмшихүй нь its (таслалгүй)." },
    ],
    quiz: [
      { q: 'Please call ___ tomorrow. (би)', options: ['I', 'me', 'my'], answer: 1, why: 'Үйл үгийн объект → me.' },
      { q: 'This is ___ book. (түүний, эрэгтэй)', options: ['he', 'him', 'his'], answer: 2, why: 'Нэр үгийн өмнө эзэмшихүй adjective → his.' },
      { q: 'That car is ___. (манай)', options: ['our', 'ours', 'us'], answer: 1, why: 'Нэр үггүй, дангаараа → ours.' },
    ],
  },
  {
    id: 'en-demonstratives',
    level: 'beginner',
    category: 'Суурь',
    title: 'This / that / these / those',
    titleMn: 'Заах төлөөний үг',
    summary: 'Ойр, хол байгаа нэг болон олон зүйлийг заана.',
    explain: [
      'Заах төлөөний үг нь тухайн зүйл хэр хол, хэдэн ширхэг байгаагаар сонгогдоно.',
    ],
    tables: [
      {
        headers: ['', 'Ойр', 'Хол'],
        rows: [
          ['Нэг тоо', 'this (энэ)', 'that (тэр)'],
          ['Олон тоо', 'these (эдгээр)', 'those (тэдгээр)'],
        ],
      },
    ],
    examples: [
      { t: 'This is my phone.', mn: 'Энэ миний утас.' },
      { t: 'That building is very old.', mn: 'Тэр барилга маш хуучин.' },
      { t: 'These shoes are comfortable.', mn: 'Эдгээр гутал эвтэйхэн.' },
      { t: 'Who are those people?', mn: 'Тэр хүмүүс хэн бэ?' },
    ],
    quiz: [
      { q: '___ apples here are fresh. (ойр, олон)', options: ['This', 'These', 'Those'], answer: 1, why: 'Ойр + олон тоо → these.' },
      { q: 'Look at ___ mountain over there!', options: ['this', 'these', 'that'], answer: 2, why: 'Хол + нэг тоо → that.' },
    ],
  },

  /* ───────────────────────── Одоо цаг ───────────────────────── */
  {
    id: 'en-there-is',
    level: 'beginner',
    category: 'Суурь',
    title: 'There is / There are',
    titleMn: '"…байна" (оршихуйг илэрхийлэх)',
    summary: 'Ямар нэг зүйл байгаа эсэхийг хэлж сурна.',
    explain: [
      'Ямар нэг зүйл ямар нэг газар байгааг хэлэхэд "There is / There are" хэрэглэнэ. Нэг тоотой is, олон тоотой are.',
    ],
    patterns: [
      { label: 'Нэг тоо', formula: 'There is + a/an + noun', example: 'There is a park near here.' },
      { label: 'Олон тоо', formula: 'There are + plural noun', example: 'There are two cafés.' },
      { label: 'Үгүйсгэх', formula: 'There isn\'t / aren\'t + any …', example: "There aren't any chairs." },
      { label: 'Асуух', formula: 'Is there …? / Are there …?', example: 'Is there a bank nearby?' },
    ],
    examples: [
      { t: 'There is a cat under the table.', mn: 'Ширээний доор муур байна.' },
      { t: 'There are many people in the park.', mn: 'Цэцэрлэгт хүрээлэнд олон хүн байна.' },
      { t: 'Is there any milk in the fridge?', mn: 'Хөргөгчинд сүү байгаа юу?' },
    ],
    mistakes: [
      { wrong: 'There is three books.', right: 'There are three books.', why: 'Олон тоотой are.' },
    ],
    quiz: [
      { q: 'There ___ a lot of snow in winter.', options: ['is', 'are'], answer: 0, why: 'snow тоологдохгүй нэр үг → is.' },
      { q: '___ there any questions?', options: ['Is', 'Are'], answer: 1, why: 'questions олон тоо → Are.' },
    ],
  },
  {
    id: 'en-present-simple',
    level: 'beginner',
    category: 'Цагууд',
    title: 'Present Simple',
    titleMn: 'Энгийн одоо цаг',
    summary: 'Хэвшил, тогтмол үйлдэл, үнэн баримтыг хэлнэ.',
    explain: [
      'Өдөр бүр, ихэвчлэн давтагддаг зүйл болон үнэн баримтыг Present Simple-ээр хэлнэ. Үйл үг энгийн хэлбэрээрээ байна, гэхдээ he/she/it-тэй бол төгсгөлд -s/-es нэмнэ.',
      'Үгүйсгэх, асуухад do/does туслах үйл үг хэрэгтэй. does ирэхэд гол үйл үг дахиж -s авахгүй.',
    ],
    patterns: [
      { label: 'Эерэг', formula: 'I/you/we/they + V   |   he/she/it + V-s/es', example: 'She works in a bank.' },
      { label: 'Үгүйсгэх', formula: 'do not (don\'t) / does not (doesn\'t) + V', example: "He doesn't like coffee." },
      { label: 'Асуух', formula: 'Do/Does + subject + V …?', example: 'Does she live here?' },
    ],
    tables: [
      {
        title: 'he/she/it + үйл үг (-s дүрэм)',
        headers: ['Дүрэм', 'Үйл үг', 'he/she/it'],
        rows: [
          ['Ихэнх үйл үг + s', 'work, play, eat', 'works, plays, eats'],
          ['-s, -sh, -ch, -x, -o + es', 'watch, go, wash', 'watches, goes, washes'],
          ['Гийгүүлэгч + y → -ies', 'study, fly', 'studies, flies'],
          ['Дүрэмгүй', 'have', 'has'],
        ],
      },
      {
        title: 'Давтамжийн үгс',
        headers: ['Үг', 'Утга'],
        rows: [
          ['always', 'үргэлж'], ['usually', 'ихэвчлэн'], ['often', 'олонтаа'],
          ['sometimes', 'заримдаа'], ['rarely / seldom', 'ховор'], ['never', 'хэзээ ч үгүй'],
          ['every day / week', 'өдөр бүр / долоо хоног бүр'],
        ],
      },
    ],
    examples: [
      { t: 'I wake up at 7 every morning.', mn: 'Би өглөө бүр 7 цагт сэрдэг.' },
      { t: 'My father works at a hospital.', mn: 'Миний аав эмнэлэгт ажилладаг.' },
      { t: "They don't eat meat.", mn: 'Тэд мах иддэггүй.' },
      { t: 'Does she speak English?', mn: 'Тэр англиар ярьдаг уу?' },
      { t: 'Water boils at 100 degrees.', mn: 'Ус 100 градуст буцалдаг.' },
    ],
    mistakes: [
      { wrong: 'She work every day.', right: 'She works every day.', why: 'she-тэй -s нэмнэ.' },
      { wrong: 'Does he likes music?', right: 'Does he like music?', why: 'does ирсэн бол үйл үг энгийн хэлбэртэй.' },
      { wrong: 'He don\'t know.', right: "He doesn't know.", why: 'he-тэй doesn\'t.' },
    ],
    tips: ['always/never зэрэг давтамжийн үг to be-ийн ДАРАА, бусад үйл үгийн ӨМНӨ орно: She is always late. / She always arrives late.'],
    quiz: [
      { q: 'He ___ to school by bus.', options: ['go', 'goes', 'going'], answer: 1, why: 'he + go → goes.' },
      { q: 'She ___ like spicy food.', options: ["don't", "doesn't", "isn't"], answer: 1, why: 'she-тэй үгүйсгэхэд doesn\'t.' },
      { q: '___ your brother play football?', options: ['Do', 'Does', 'Is'], answer: 1, why: 'brother = he → Does.' },
      { q: 'My sister ___ English at university.', options: ['study', 'studys', 'studies'], answer: 2, why: 'гийгүүлэгч + y → -ies.' },
    ],
  },
  {
    id: 'en-present-continuous',
    level: 'beginner',
    category: 'Цагууд',
    title: 'Present Continuous',
    titleMn: 'Үргэлжилж буй одоо цаг',
    summary: 'Яг одоо болж буй болон ойрын төлөвлөгөөг хэлнэ.',
    explain: [
      'Ярьж байгаа мөчид үргэлжилж буй үйлдлийг am/is/are + V-ing-ээр илэрхийлнэ. "Яг одоо", "энэ долоо хоногт" гэх мэт.',
    ],
    patterns: [
      { label: 'Эерэг', formula: 'Subject + am/is/are + V-ing', example: 'I am reading a book.' },
      { label: 'Үгүйсгэх', formula: 'Subject + am/is/are + not + V-ing', example: "She isn't sleeping." },
      { label: 'Асуух', formula: 'Am/Is/Are + subject + V-ing?', example: 'Are they playing?' },
    ],
    tables: [
      {
        title: '-ing нэмэх дүрэм',
        headers: ['Дүрэм', 'Үйл үг', '-ing'],
        rows: [
          ['Ихэнх үйл үг + ing', 'work, play', 'working, playing'],
          ['-e төгсгөлийг хасна', 'make, write', 'making, writing'],
          ['Богино: гийгүүлэгчийг давхарлана', 'run, sit, swim', 'running, sitting, swimming'],
        ],
      },
    ],
    examples: [
      { t: 'I am studying English now.', mn: 'Би одоо англи хэл сурч байна.' },
      { t: 'It is raining outside.', mn: 'Гадаа бороо орж байна.' },
      { t: 'What are you doing?', mn: 'Чи юу хийж байна?' },
      { t: 'We are meeting Tom tomorrow.', mn: 'Бид маргааш Томтой уулзана. (төлөвлөсөн)' },
    ],
    mistakes: [
      { wrong: 'I am know the answer.', right: 'I know the answer.', why: 'know, like, love, want, need зэрэг төлөв үйл үг -ing авдаггүй.' },
      { wrong: 'She is work now.', right: 'She is working now.', why: 'am/is/are-ийн дараа V-ing.' },
    ],
    quiz: [
      { q: 'Look! The baby ___.', options: ['sleeps', 'is sleeping', 'sleep'], answer: 1, why: '"Look!" — яг одоо болж буй → is sleeping.' },
      { q: 'They ___ football at the moment.', options: ['play', 'are playing', 'plays'], answer: 1, why: 'at the moment → Continuous.' },
      { q: 'He is ___ a letter.', options: ['writeing', 'writing', 'writting'], answer: 1, why: '-e хасаад -ing: writing.' },
    ],
  },
  {
    id: 'en-simple-past',
    level: 'beginner',
    category: 'Цагууд',
    title: 'Past Simple',
    titleMn: 'Энгийн өнгөрсөн цаг',
    summary: 'Өнгөрсөн хугацаанд дууссан үйлдлийг ярина.',
    explain: [
      'Тодорхой өнгөрсөн цагт дууссан үйлдлийг (yesterday, last week, in 2020, ago) Past Simple-ээр хэлнэ. Ердийн үйл үгэнд -ed нэмнэ, зарим нь дүрэмгүй хувирна (go → went).',
      'Үгүйсгэх, асуухад did ашиглана, тэгэхэд гол үйл үг энгийн хэлбэртээ буцна.',
    ],
    patterns: [
      { label: 'Эерэг', formula: 'Subject + V-ed (эсвэл дүрэмгүй 2-р хэлбэр)', example: 'I visited my aunt.' },
      { label: 'Үгүйсгэх', formula: 'Subject + did not (didn\'t) + V', example: "She didn't call me." },
      { label: 'Асуух', formula: 'Did + subject + V …?', example: 'Did you see the film?' },
    ],
    tables: [
      {
        title: '-ed нэмэх дүрэм',
        headers: ['Дүрэм', 'Нэг', 'Өнгөрсөн'],
        rows: [
          ['Ихэнх', 'work', 'worked'],
          ['-e-ээр төгсвөл -d', 'live', 'lived'],
          ['Гийгүүлэгч + y → -ied', 'study', 'studied'],
          ['Богино: гийгүүлэгч давхарлана', 'stop', 'stopped'],
        ],
      },
      {
        title: 'Түгээмэл дүрэмгүй үйл үг',
        headers: ['V1', 'V2 (past)', 'Утга'],
        rows: [
          ['go', 'went', 'явах'], ['have', 'had', 'байх'], ['see', 'saw', 'харах'],
          ['eat', 'ate', 'идэх'], ['buy', 'bought', 'худалдаж авах'], ['take', 'took', 'авах'],
          ['come', 'came', 'ирэх'], ['make', 'made', 'хийх'], ['write', 'wrote', 'бичих'],
        ],
      },
    ],
    examples: [
      { t: 'I watched a movie last night.', mn: 'Би өчигдөр орой кино үзсэн.' },
      { t: 'She went to Japan in 2022.', mn: 'Тэр 2022 онд Японд очсон.' },
      { t: "We didn't have time.", mn: 'Бидэнд цаг байгаагүй.' },
      { t: 'Did he buy a new phone?', mn: 'Тэр шинэ утас авсан уу?' },
    ],
    mistakes: [
      { wrong: 'Did you went there?', right: 'Did you go there?', why: 'did ирсэн бол үйл үг энгийн хэлбэртэй.' },
      { wrong: 'I eated lunch.', right: 'I ate lunch.', why: 'eat → ate (дүрэмгүй).' },
    ],
    quiz: [
      { q: 'We ___ to the park yesterday.', options: ['go', 'goed', 'went'], answer: 2, why: 'go → went.' },
      { q: 'She ___ her keys last week.', options: ['lose', 'lost', 'losed'], answer: 1, why: 'lose → lost.' },
      { q: '___ they come to the party?', options: ['Do', 'Did', 'Does'], answer: 1, why: 'Өнгөрсөн цаг → Did.' },
      { q: 'He ___ not finish his homework.', options: ['do', 'does', 'did'], answer: 2, why: 'Өнгөрсөн цагийн үгүйсгэл → did not.' },
    ],
  },
  {
    id: 'en-future-basic',
    level: 'beginner',
    category: 'Цагууд',
    title: 'Future: will / be going to',
    titleMn: 'Ирээдүй цаг',
    summary: 'Төлөвлөгөө, таамаг, амлалтыг ирээдүйд хэлнэ.',
    explain: [
      'be going to — урьдаас шийдсэн төлөвлөгөө эсвэл одоо харагдаж буй шинж тэмдгээс гарсан таамаг. will — яг ярьж байхдаа шийдсэн зүйл, амлалт, ерөнхий таамаг.',
    ],
    patterns: [
      { label: 'going to', formula: 'am/is/are + going to + V', example: "I'm going to visit Paris next year." },
      { label: 'will', formula: 'will (not / won\'t) + V', example: "I'll help you with that." },
    ],
    examples: [
      { t: "I'm going to study medicine.", mn: 'Би анагаах ухаан сурахаар төлөвлөж байна.' },
      { t: 'Look at those clouds. It is going to rain.', mn: 'Тэр үүлийг хар. Бороо орох нь.' },
      { t: "Wait, I'll open the door for you.", mn: 'Түр хүлээ, би чамд хаалга нээж өгье.' },
      { t: "I won't tell anyone.", mn: 'Би хэнд ч хэлэхгүй. (амлалт)' },
    ],
    mistakes: [
      { wrong: 'I will to go.', right: 'I will go.', why: 'will-ийн дараа to хэрэггүй.' },
    ],
    quiz: [
      { q: 'The phone is ringing. — I ___ answer it.', options: ["'ll", "'m going to", 'am'], answer: 0, why: 'Тэр дор нь гаргасан шийдвэр → will.' },
      { q: 'We have tickets. We ___ see a concert tonight.', options: ['will', 'are going to', 'are'], answer: 1, why: 'Урьдчилж төлөвлөсөн → going to.' },
    ],
  },

  /* ───────────────────────── Үгсийн сан-дүрэм ───────────────────────── */
  {
    id: 'en-can-modal',
    level: 'beginner',
    category: 'Үйл үг',
    title: 'Can / can\'t / could',
    titleMn: 'Чадах, зөвшөөрөл, гуйлт',
    summary: 'Чадвар, зөвшөөрөл, эелдэг гуйлтыг илэрхийлнэ.',
    explain: [
      'can нь чадвар (чадна), зөвшөөрөл (болно) илэрхийлнэ. Дараа нь үйл үг энгийн хэлбэрээр ирнэ (to хэрэггүй, -s хэрэггүй). could нь can-ийн өнгөрсөн хэлбэр эсвэл эелдэг гуйлт.',
    ],
    patterns: [
      { label: 'Эерэг', formula: 'Subject + can + V', example: 'She can swim.' },
      { label: 'Үгүйсгэх', formula: 'Subject + can\'t (cannot) + V', example: "I can't drive." },
      { label: 'Асуух / гуйлт', formula: 'Can/Could + subject + V …?', example: 'Could you help me, please?' },
    ],
    examples: [
      { t: 'I can speak three languages.', mn: 'Би гурван хэлээр ярьж чадна.' },
      { t: 'You can sit here.', mn: 'Та энд суугаарай (болно).' },
      { t: 'When I was five, I could ride a bike.', mn: 'Таван настайдаа би дугуй унаж чаддаг байсан.' },
      { t: 'Could I have some water, please?', mn: 'Надад ус өгч болох уу?' },
    ],
    mistakes: [
      { wrong: 'She cans swim.', right: 'She can swim.', why: 'can нь -s авахгүй.' },
      { wrong: 'I can to swim.', right: 'I can swim.', why: 'can-ийн дараа to хэрэггүй.' },
    ],
    quiz: [
      { q: 'He ___ play the guitar very well.', options: ['cans', 'can', 'can to'], answer: 1, why: 'can + энгийн үйл үг.' },
      { q: '___ you open the window, please?', options: ['Can', 'Do', 'Are'], answer: 0, why: 'Гуйлт → Can/Could.' },
    ],
  },
  {
    id: 'en-imperatives',
    level: 'beginner',
    category: 'Үйл үг',
    title: 'Imperatives',
    titleMn: 'Тушаах, зөвлөх өгүүлбэр',
    summary: 'Заавар, тушаал, анхааруулга, урилгыг хэлнэ.',
    explain: [
      'Тушаах өгүүлбэр нь үйл үгийн энгийн хэлбэрээр эхэлнэ, subject хэрэггүй. Эелдэг болгохдоо please нэмнэ. Үгүйсгэхдээ Don\'t + V.',
    ],
    patterns: [
      { label: 'Эерэг', formula: 'V + …', example: 'Open your book.' },
      { label: 'Үгүйсгэх', formula: "Don't + V + …", example: "Don't be late." },
      { label: 'Урилга', formula: "Let's + V", example: "Let's go to the cinema." },
    ],
    examples: [
      { t: 'Sit down, please.', mn: 'Суугаарай.' },
      { t: "Don't touch that!", mn: 'Тэрийг бүү барь!' },
      { t: 'Turn left at the corner.', mn: 'Буланд зүүн тийш эргэ.' },
      { t: "Let's have lunch together.", mn: 'Хамт өдрийн хоол идье.' },
    ],
    quiz: [
      { q: '___ your phone in class.', options: ["Don't use", 'Not use', "Doesn't use"], answer: 0, why: "Тушаал үгүйсгэх → Don't + V." },
    ],
  },
  {
    id: 'en-question-words',
    level: 'beginner',
    category: 'Үйл үг',
    title: 'Question words',
    titleMn: 'Асуух үгс',
    summary: 'Who, what, where, when, why, how-оор асуулт үүсгэнэ.',
    explain: [
      'Асуух үгийг өгүүлбэрийн эхэнд тавьж, дараа нь туслах үйл үг + subject дарааллаар үргэлжлүүлнэ.',
    ],
    tables: [
      {
        headers: ['Үг', 'Утга', 'Жишээ'],
        rows: [
          ['who', 'хэн', 'Who is that man?'],
          ['what', 'юу', 'What do you do?'],
          ['where', 'хаана', 'Where do you live?'],
          ['when', 'хэзээ', 'When does the class start?'],
          ['why', 'яагаад', 'Why are you sad?'],
          ['how', 'хэрхэн', 'How do you go to work?'],
          ['how much / how many', 'хэдэн (тоологдохгүй / тоологдох)', 'How many books do you have?'],
          ['which', 'аль', 'Which color do you like?'],
        ],
      },
    ],
    patterns: [
      { label: 'Бүтэц', formula: 'Question word + do/does/did/am/is/are + subject + V?', example: 'Where does she work?' },
    ],
    examples: [
      { t: 'What time is it?', mn: 'Хэдэн цаг болж байна?' },
      { t: 'Why did you leave early?', mn: 'Чи яагаад эрт явсан бэ?' },
      { t: 'How much is this jacket?', mn: 'Энэ жакет хэд вэ?' },
    ],
    mistakes: [
      { wrong: 'Where you live?', right: 'Where do you live?', why: 'Туслах үйл үг do хэрэгтэй.' },
    ],
    quiz: [
      { q: '___ do you get up? — At 6 o\'clock.', options: ['Where', 'When / What time', 'Who'], answer: 1, why: 'Цагийн талаар → When / What time.' },
      { q: '___ is your birthday? — In May.', options: ['When', 'Who', 'Why'], answer: 0, why: 'Хугацаа → When.' },
    ],
  },
  {
    id: 'en-prepositions',
    level: 'beginner',
    category: 'Үйл үг',
    title: 'Prepositions: in / on / at',
    titleMn: 'Угтвар үгс (цаг, газар)',
    summary: 'in, on, at-г цаг болон газарт зөв ялгана.',
    explain: [
      'in / on / at нь "том → жижиг" зарчмаар сонгогддог: in = том хүрээ (сар, жил, хот), on = өдөр, гараг, гадаргуу, at = нарийвчилсан цэг (цаг, хаяг).',
    ],
    tables: [
      {
        headers: ['', 'in', 'on', 'at'],
        rows: [
          ['Цаг хугацаа', 'in May, in 2024, in the morning, in summer', 'on Monday, on 5 May, on my birthday', 'at 7 o\'clock, at night, at noon, at the weekend'],
          ['Газар', 'in Mongolia, in a car, in the room', 'on the table, on the wall, on the bus', 'at home, at school, at the bus stop'],
        ],
      },
    ],
    examples: [
      { t: 'The meeting is on Friday at 3 p.m.', mn: 'Хурал баасан гарагт 15 цагт болно.' },
      { t: 'I was born in 2003 in Ulaanbaatar.', mn: 'Би 2003 онд Улаанбаатарт төрсөн.' },
      { t: 'The keys are on the table.', mn: 'Түлхүүр ширээн дээр байна.' },
    ],
    mistakes: [
      { wrong: 'I get up in 7 o\'clock.', right: 'I get up at 7 o\'clock.', why: 'Тодорхой цагт at.' },
    ],
    quiz: [
      { q: 'We have English ___ Wednesdays.', options: ['in', 'on', 'at'], answer: 1, why: 'Гарагийн өмнө on.' },
      { q: 'She lives ___ Japan.', options: ['in', 'on', 'at'], answer: 0, why: 'Улс → in.' },
      { q: 'See you ___ 8 p.m.', options: ['in', 'on', 'at'], answer: 2, why: 'Нарийн цаг → at.' },
    ],
  },
  {
    id: 'en-countable',
    level: 'beginner',
    category: 'Нэр үг',
    title: 'Countable / uncountable: some, any, much, many',
    titleMn: 'Тоологдох, тоологдохгүй нэр үг',
    summary: 'much/many, some/any-г зөв сонгоно.',
    explain: [
      'Тоологдох нэр үгийг тоолж болно (a book, two books). Тоологдохгүй нэр үгийг тоолж болохгүй (water, rice, money, information) — олон тоонд -s авахгүй.',
      'Тоо хэмжээний үгс: many → тоологдох олон тоотой; much → тоологдохгүйтэй (голдуу асуух, үгүйсгэх); a lot of → хоёуланд нь. some → эерэг, any → асуух ба үгүйсгэх.',
    ],
    tables: [
      {
        headers: ['Төрөл', 'Эерэг', 'Үгүйсгэх / Асуух'],
        rows: [
          ['Тоологдох (олон)', 'some apples, a lot of apples', "any apples / How many apples?"],
          ['Тоологдохгүй', 'some water, a lot of water', 'any water / How much water?'],
        ],
      },
    ],
    examples: [
      { t: 'I need some information.', mn: 'Надад мэдээлэл хэрэгтэй.' },
      { t: 'How much money do you have?', mn: 'Чамд хэдэн мөнгө байна?' },
      { t: "There aren't many people here.", mn: 'Энд олон хүн алга.' },
    ],
    mistakes: [
      { wrong: 'I need an information.', right: 'I need some information.', why: 'information тоологдохгүй: a/an болон -s байхгүй.' },
      { wrong: 'How many water?', right: 'How much water?', why: 'water тоологдохгүй → much.' },
    ],
    quiz: [
      { q: 'We don\'t have ___ milk.', options: ['some', 'any', 'many'], answer: 1, why: 'Үгүйсгэхэд any.' },
      { q: 'How ___ students are in your class?', options: ['much', 'many', 'any'], answer: 1, why: 'students тоологдох → many.' },
      { q: 'Which is uncountable?', options: ['chair', 'apple', 'rice'], answer: 2, why: 'rice тоологдохгүй.' },
    ],
  },
  {
    id: 'en-adjectives',
    level: 'beginner',
    category: 'Нэр үг',
    title: 'Adjectives & comparatives',
    titleMn: 'Тэмдэг нэр, харьцуулал',
    summary: 'Юмыг тодорхойлж, харьцуулж, хамгийн-ийг хэлнэ.',
    explain: [
      'Тэмдэг нэр нэр үгийн өмнө ордог, олон тоонд -s авахгүй (a big house, two big houses). Харьцуулахад -er + than, хамгийн-д the + -est.',
    ],
    tables: [
      {
        headers: ['Төрөл', 'Энгийн', 'Харьцуулсан', 'Хамгийн'],
        rows: [
          ['1 үедтэй', 'tall', 'taller', 'the tallest'],
          ['-e төгсгөл', 'large', 'larger', 'the largest'],
          ['y → -ier', 'happy', 'happier', 'the happiest'],
          ['Урт (2+ үе)', 'expensive', 'more expensive', 'the most expensive'],
          ['Дүрэмгүй', 'good / bad / far', 'better / worse / further', 'the best / worst / furthest'],
        ],
      },
    ],
    examples: [
      { t: 'My room is bigger than yours.', mn: 'Миний өрөө чинийхээс том.' },
      { t: 'This is the most interesting book I know.', mn: 'Энэ миний мэдэх хамгийн сонирхолтой ном.' },
      { t: 'Today is colder than yesterday.', mn: 'Өнөөдөр өчигдрөөс хүйтэн.' },
    ],
    mistakes: [
      { wrong: 'more taller', right: 'taller', why: 'Хоёр дахин харьцуулал хэрэглэж болохгүй.' },
      { wrong: 'He is more fast than me.', right: 'He is faster than me.', why: 'Богино тэмдэг нэр -er авна.' },
    ],
    quiz: [
      { q: 'This bag is ___ than that one.', options: ['heavy', 'heavier', 'more heavy'], answer: 1, why: 'heavy → heavier.' },
      { q: 'She is ___ student in the class.', options: ['the best', 'better', 'the better'], answer: 0, why: 'Хамгийн → the best.' },
      { q: 'This test is ___ than the last one.', options: ['difficulter', 'more difficult', 'most difficult'], answer: 1, why: 'Урт үг → more + adj.' },
    ],
  },
];
