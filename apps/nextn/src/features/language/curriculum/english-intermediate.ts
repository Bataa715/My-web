import type { GrammarLessonData } from './types';

/** English — intermediate (CEFR B1–B2) */
export const ENGLISH_INTERMEDIATE: GrammarLessonData[] = [
  /* ───────────────────────── Цагууд ───────────────────────── */
  {
    id: 'en-present-perfect',
    level: 'intermediate',
    category: 'Цагууд',
    title: 'Present Perfect',
    titleMn: 'Одоотой холбоотой өнгөрсөн',
    summary: 'Туршлага, үр дүн, одоог хүртэл үргэлжилсэн үйлдлийг хэлнэ.',
    explain: [
      'Present Perfect нь өнгөрсөн үйлдлийг ОДООТОЙ холбож өгүүлнэ. Хэзээ болсон нь чухал биш, харин туршлага эсвэл одоогийн үр дүн чухал үед хэрэглэнэ.',
      'Past Simple-тэй андуурч болохгүй: тодорхой өнгөрсөн цаг (yesterday, in 2020, last week) байвал Past Simple, байхгүй бол Present Perfect.',
    ],
    patterns: [
      { label: 'Эерэг', formula: 'have/has + V3 (past participle)', example: 'I have seen that film.' },
      { label: 'Үгүйсгэх', formula: "haven't / hasn't + V3", example: "She hasn't finished yet." },
      { label: 'Асуух', formula: 'Have/Has + subject + V3 …?', example: 'Have you ever been to Japan?' },
    ],
    tables: [
      {
        title: 'Хэрэглээ ба тэмдэгт үгс',
        headers: ['Хэрэглээ', 'Түлхүүр үг', 'Жишээ'],
        rows: [
          ['Туршлага', 'ever, never, before', 'I have never eaten sushi.'],
          ['Одоогийн үр дүн', 'just, already, yet', "I've just finished my homework."],
          ['Одоо хүртэл үргэлжилсэн', 'for + хугацаа, since + эхлэл', 'We have lived here for 5 years.'],
          ['Дуусаагүй хугацаа', 'today, this week, so far', 'I have read three books this month.'],
        ],
      },
    ],
    examples: [
      { t: "I've lost my keys, so I can't open the door.", mn: 'Би түлхүүрээ гээсэн тул хаалгаа нээж чадахгүй байна.' },
      { t: 'She has worked here since 2019.', mn: 'Тэр 2019 оноос хойш энд ажиллаж байна.' },
      { t: 'Have you ever tried Korean food?', mn: 'Чи солонгос хоол амсаж үзсэн үү?' },
      { t: "They haven't arrived yet.", mn: 'Тэд хараахан ирээгүй байна.' },
    ],
    mistakes: [
      { wrong: 'I have seen him yesterday.', right: 'I saw him yesterday.', why: 'yesterday тодорхой өнгөрсөн цаг → Past Simple.' },
      { wrong: 'I live here since 2020.', right: 'I have lived here since 2020.', why: 'since/for-той үргэлжилсэн үйлдэл → Present Perfect.' },
    ],
    tips: ['for = хугацааны урт (for two years), since = эхэлсэн цэг (since 2022).', 'been = очиж, буцаж ирсэн (I have been to Paris); gone = очоод одоо тэнд байгаа (He has gone to Paris).'],
    quiz: [
      { q: 'I ___ in this city for ten years.', options: ['live', 'lived', 'have lived'], answer: 2, why: 'for + хугацаа, одоо ч үргэлжилж байна → have lived.' },
      { q: 'She ___ just left.', options: ['has', 'have', 'is'], answer: 0, why: 'she → has + V3.' },
      { q: 'Which is correct?', options: ['I have visited Rome last year.', 'I visited Rome last year.', 'I have visit Rome last year.'], answer: 1, why: 'last year → Past Simple.' },
      { q: '___ you ever ___ a horse?', options: ['Did / ride', 'Have / ridden', 'Are / riding'], answer: 1, why: 'ever + туршлага → Have … ridden.' },
    ],
  },
  {
    id: 'en-past-continuous',
    level: 'intermediate',
    category: 'Цагууд',
    title: 'Past Continuous',
    titleMn: 'Өнгөрсөнд үргэлжилж байсан',
    summary: 'Өнгөрсөн мөчид үргэлжилж байсан үйлдэл, ард нь тохиосон ослыг хэлнэ.',
    explain: [
      'was/were + V-ing нь өнгөрсөн тодорхой мөчид үргэлжилж байсан үйлдлийг илэрхийлнэ. Ихэвчлэн үргэлжилж байсан үйлдэл (Past Continuous) дундуур огцом үйлдэл (Past Simple) тохиолддог.',
    ],
    patterns: [
      { label: 'Бүтэц', formula: 'was/were + V-ing', example: 'I was cooking when she called.' },
      { label: 'while / when', formula: 'while + Past Continuous, … Past Simple', example: 'While I was walking, it started to rain.' },
    ],
    examples: [
      { t: 'At 8 p.m. yesterday, I was watching TV.', mn: 'Өчигдөр орой 8 цагт би телевиз үзэж байсан.' },
      { t: 'She was sleeping when the phone rang.', mn: 'Утас дуугарахад тэр унтаж байсан.' },
      { t: 'They were playing chess while we were cooking.', mn: 'Бид хоол хийж байхад тэд шатар тоглож байсан.' },
    ],
    mistakes: [
      { wrong: 'I was knowing the answer.', right: 'I knew the answer.', why: 'know зэрэг төлөв үйл үг -ing авдаггүй.' },
    ],
    quiz: [
      { q: 'When I arrived, they ___ dinner.', options: ['had', 'were having', 'have'], answer: 1, why: 'Ирэх мөчид үргэлжилж байсан → were having.' },
      { q: 'I ___ a shower when the lights went out.', options: ['took', 'was taking', 'take'], answer: 1, why: 'Үргэлжилж байсан үйлдэл + огцом үйлдэл.' },
    ],
  },
  {
    id: 'en-past-perfect',
    level: 'intermediate',
    category: 'Цагууд',
    title: 'Past Perfect',
    titleMn: 'Өнгөрсөнөөс өмнөх өнгөрсөн',
    summary: 'Хоёр өнгөрсөн үйлдлийн аль нь түрүүлж болсныг ялгана.',
    explain: [
      'Өнгөрсөнд болсон хоёр үйлдлийн ӨМНӨХ нь Past Perfect (had + V3), ДАРААХ нь Past Simple байна.',
    ],
    patterns: [{ label: 'Бүтэц', formula: 'had + V3', example: 'When I arrived, the film had started.' }],
    examples: [
      { t: 'She had already left when I called.', mn: 'Би залгахад тэр аль хэдийн явчихсан байсан.' },
      { t: 'I was tired because I had worked all day.', mn: 'Би өдөржин ажилласан учраас ядарсан байсан.' },
      { t: 'He said he had never seen snow.', mn: 'Тэр цас хэзээ ч үзээгүй гэж хэлсэн.' },
    ],
    tips: ['before, after, by the time, already, just зэрэг үгстэй байнга хэрэглэгддэг.'],
    quiz: [
      { q: 'When we got to the station, the train ___.', options: ['left', 'had left', 'has left'], answer: 1, why: 'Галт тэрэг түрүүлж явсан → had left.' },
      { q: 'After she ___ dinner, she went to bed.', options: ['had eaten', 'has eaten', 'was eating'], answer: 0, why: 'Хоол идсэн нь өмнө → had eaten.' },
    ],
  },
  {
    id: 'en-future-advanced',
    level: 'intermediate',
    category: 'Цагууд',
    title: 'Future forms (continuous, perfect, present for plans)',
    titleMn: 'Ирээдүй цагийн нэмэлт хэлбэр',
    summary: 'Хуваарь, тодорхой мөчид болж байх үйлдэл, дуусах үйлдлийг ирээдүйд хэлнэ.',
    explain: [
      'Present Simple → хуваарь, цагийн хуваарьтай ирээдүй (The train leaves at 6). Present Continuous → хувийн тохиролцсон төлөвлөгөө. Future Continuous (will be + V-ing) → ирээдүйн тодорхой мөчид үргэлжилж байх. Future Perfect (will have + V3) → тодорхой хугацаанд дуусчихсан байх.',
    ],
    patterns: [
      { label: 'Future Continuous', formula: 'will be + V-ing', example: 'This time tomorrow, I will be flying to Seoul.' },
      { label: 'Future Perfect', formula: 'will have + V3', example: 'By 2030, I will have graduated.' },
    ],
    examples: [
      { t: 'The shop opens at 9 a.m. tomorrow.', mn: 'Дэлгүүр маргааш өглөө 9 цагт нээгдэнэ. (хуваарь)' },
      { t: "I'm meeting my teacher at 4.", mn: 'Би 4 цагт багштайгаа уулзана. (тохиролцсон)' },
      { t: 'At 10 tomorrow, I will be working.', mn: 'Маргааш 10 цагт би ажиллаж байх болно.' },
      { t: 'By next June, she will have finished her thesis.', mn: 'Ирэх зургаан сар гэхэд тэр дипломоо дуусгасан байх болно.' },
    ],
    quiz: [
      { q: 'By the time you arrive, I ___ dinner.', options: ['will cook', 'will have cooked', 'am cooking'], answer: 1, why: 'Тодорхой цаг гэхэд дууссан → will have cooked.' },
      { q: 'Don\'t call at 7. I ___ in a meeting.', options: ['will be sitting', 'will sit', 'sit'], answer: 0, why: 'Тэр мөчид үргэлжилж байх → will be sitting.' },
    ],
  },

  /* ───────────────────────── Modal, нөхцөл ───────────────────────── */
  {
    id: 'en-modals',
    level: 'intermediate',
    category: 'Modal үйл үг',
    title: 'Modals: must, have to, should, might, may',
    titleMn: 'Хэрэгцээ, зөвлөгөө, магадлал',
    summary: 'Үүрэг, зөвлөгөө, магадлалыг ялгаж хэрэглэнэ.',
    explain: [
      'Modal үйл үгийн дараа үйл үг энгийн хэлбэртэй ирнэ, -s авахгүй. Утга нь хэрэглэхэд өөр өөр байдаг.',
    ],
    tables: [
      {
        headers: ['Modal', 'Утга', 'Жишээ'],
        rows: [
          ['must', 'Заавал (өөрийн дотоод шийдвэр / хүчтэй дүрэм)', 'You must wear a seat belt.'],
          ['have to', 'Гаднаас ирсэн үүрэг', 'I have to wake up at 6 for work.'],
          ["mustn't", 'Хориотой', "You mustn't smoke here."],
          ["don't have to", 'Заавал биш', "You don't have to come."],
          ['should / ought to', 'Зөвлөгөө', 'You should see a doctor.'],
          ['might / may / could', 'Магадгүй (магадлал бага)', 'It might rain later.'],
        ],
      },
    ],
    examples: [
      { t: 'You should drink more water.', mn: 'Чи илүү их ус уух хэрэгтэй.' },
      { t: "We don't have to hurry. We have plenty of time.", mn: 'Бид яарах албагүй. Цаг их байна.' },
      { t: 'He might be at home now.', mn: 'Тэр одоо гэртээ байж магадгүй.' },
    ],
    mistakes: [
      { wrong: "You mustn't come if you don't want to.", right: "You don't have to come if you don't want to.", why: "mustn't = хориотой; don't have to = албагүй." },
    ],
    tips: ['mustn\'t (хориотой) ба don\'t have to (албагүй) бол ХОЁР өөр утга!'],
    quiz: [
      { q: 'You ___ park here. It\'s forbidden.', options: ["mustn't", "don't have to", "shouldn't have"], answer: 0, why: 'Хориотой → mustn\'t.' },
      { q: 'It\'s Sunday. I ___ go to work.', options: ["mustn't", "don't have to", "must"], answer: 1, why: 'Албагүй → don\'t have to.' },
      { q: 'She looks pale. She ___ see a doctor.', options: ['should', 'might to', 'has'], answer: 0, why: 'Зөвлөгөө → should.' },
    ],
  },
  {
    id: 'en-conditionals',
    level: 'intermediate',
    category: 'Modal үйл үг',
    title: 'Conditionals 0, 1, 2, 3',
    titleMn: 'Нөхцөлт өгүүлбэр',
    summary: '"Хэрвээ …" өгүүлбэрийн дөрвөн төрлийг ялгаж хэрэглэнэ.',
    explain: [
      'if + нөхцөл, үр дүн. Нөхцөлийн (if) хэсэг үр дүнгийн өмнө эсвэл дараа орж болно. if-ийн дараа will хэрэглэхгүй.',
    ],
    tables: [
      {
        headers: ['Төрөл', 'Утга', 'if хэсэг', 'Үр дүн', 'Жишээ'],
        rows: [
          ['0', 'Үргэлж үнэн', 'Present Simple', 'Present Simple', 'If you heat ice, it melts.'],
          ['1', 'Бодит ирээдүйн боломж', 'Present Simple', 'will + V', 'If it rains, I will stay home.'],
          ['2', 'Бодит бус / төсөөлөл (одоо)', 'Past Simple', 'would + V', 'If I had a car, I would drive.'],
          ['3', 'Өнгөрсөн, өөрчилж чадахгүй', 'Past Perfect', 'would have + V3', 'If I had studied, I would have passed.'],
        ],
      },
    ],
    examples: [
      { t: 'If you study hard, you will pass the exam.', mn: 'Хичээвэл чи шалгалтаа өгч тэнцэнэ.' },
      { t: 'If I were you, I would apologize.', mn: 'Би чи байсан бол уучлал гуйх байсан.' },
      { t: 'If she had left earlier, she wouldn\'t have missed the bus.', mn: 'Тэр эрт гарсан бол автобус алдахгүй байсан.' },
    ],
    mistakes: [
      { wrong: 'If it will rain, I will stay.', right: 'If it rains, I will stay.', why: 'if-ийн дараа ирээдүй цаг ашиглахгүй.' },
      { wrong: 'If I was you …', right: 'If I were you …', why: 'Төсөөллийн өгүүлбэрт were хэрэглэнэ.' },
    ],
    quiz: [
      { q: 'If I ___ rich, I would travel the world.', options: ['am', 'were', 'will be'], answer: 1, why: 'Тип 2 → were.' },
      { q: 'If it ___ tomorrow, we will cancel the picnic.', options: ['rains', 'will rain', 'rained'], answer: 0, why: 'Тип 1 → Present Simple.' },
      { q: 'If he ___ harder, he would have passed.', options: ['studied', 'had studied', 'would study'], answer: 1, why: 'Тип 3 → Past Perfect.' },
    ],
  },
  {
    id: 'en-used-to',
    level: 'intermediate',
    category: 'Modal үйл үг',
    title: 'Used to / be used to',
    titleMn: 'Урьд нь … байсан, дассан',
    summary: 'Өнгөрсөн хэвшил, төлөв, мөн "дассан"-ыг ялгана.',
    explain: [
      'used to + V = урьд нь тогтмол хийдэг/байдаг байсан, одоо биш. be used to + V-ing = (…-д) дассан.',
    ],
    patterns: [
      { label: 'used to', formula: 'used to + V', example: 'I used to play chess every day.' },
      { label: 'be used to', formula: 'am/is/are used to + V-ing / noun', example: 'I am used to getting up early.' },
    ],
    examples: [
      { t: 'We used to live in the countryside.', mn: 'Бид урьд нь хөдөө амьдардаг байсан.' },
      { t: "She didn't use to like coffee.", mn: 'Тэр урьд нь кофе дурладаггүй байсан.' },
      { t: "I'm used to the cold weather.", mn: 'Би хүйтэн цаг агаарт дассан.' },
    ],
    quiz: [
      { q: 'I ___ smoke, but I quit last year.', options: ['used to', 'am used to', 'use to'], answer: 0, why: 'Өнгөрсөн хэвшил → used to.' },
      { q: 'He is used to ___ early.', options: ['wake up', 'waking up', 'woke up'], answer: 1, why: 'be used to + V-ing.' },
    ],
  },

  /* ───────────────────────── Бүтэц ───────────────────────── */
  {
    id: 'en-passive',
    level: 'intermediate',
    category: 'Бүтэц',
    title: 'Passive voice',
    titleMn: 'Үйлдэгдэх хэв',
    summary: 'Үйлдлийг хийсэн хүнээс илүү үйлдэлд өртсөн зүйлийг онцолно.',
    explain: [
      'Passive нь үйлдлийг хийсэн хүн тодорхойгүй, чухал биш, эсвэл үр дүнг онцлох үед хэрэглэнэ. Бүтэц: be + V3. be-ийн хэлбэр нь цагийг заана.',
    ],
    tables: [
      {
        headers: ['Цаг', 'Active', 'Passive'],
        rows: [
          ['Present Simple', 'They make cars here.', 'Cars are made here.'],
          ['Past Simple', 'Someone stole my bike.', 'My bike was stolen.'],
          ['Present Perfect', 'They have finished the work.', 'The work has been finished.'],
          ['Future', 'They will announce the winner.', 'The winner will be announced.'],
          ['Modal', 'You must complete the form.', 'The form must be completed.'],
        ],
      },
    ],
    examples: [
      { t: 'English is spoken all over the world.', mn: 'Англи хэлээр дэлхий даяар ярьдаг.' },
      { t: 'The window was broken by the children.', mn: 'Цонхыг хүүхдүүд хагалсан.' },
      { t: 'The report will be sent tomorrow.', mn: 'Тайланг маргааш илгээнэ.' },
    ],
    mistakes: [
      { wrong: 'The cake was ate.', right: 'The cake was eaten.', why: 'be-ийн дараа V3 (eaten) хэрэглэнэ.' },
    ],
    quiz: [
      { q: 'This book ___ by a famous author.', options: ['wrote', 'was written', 'is writing'], answer: 1, why: 'Үйлдэгдэх хэв: was + V3.' },
      { q: 'The room ___ every day.', options: ['cleans', 'is cleaned', 'cleaned'], answer: 1, why: 'Present Simple Passive → is + V3.' },
    ],
  },
  {
    id: 'en-reported-speech',
    level: 'intermediate',
    category: 'Бүтэц',
    title: 'Reported speech',
    titleMn: 'Шууд бус ярианы хэлбэр',
    summary: 'Бусдын хэлсэн үгийг дамжуулан хэлнэ.',
    explain: [
      'Бусдын хэлсэн үгийг дамжуулахад үйл үгийн цаг ихэвчлэн нэг шат ухарна (backshift), төлөөний үг, цагийн үгс өөрчлөгдөнө.',
    ],
    tables: [
      {
        headers: ['Шууд ярианд', 'Шууд бус ярианд'],
        rows: [
          ['Present Simple (I work)', 'Past Simple (he said he worked)'],
          ['Present Continuous', 'Past Continuous'],
          ['Past Simple / Present Perfect', 'Past Perfect'],
          ['will / can', 'would / could'],
          ['today / tomorrow / here', 'that day / the next day / there'],
        ],
      },
    ],
    examples: [
      { t: '"I am tired," she said. → She said (that) she was tired.', mn: '"Би ядарсан" гэж тэр хэлсэн. → Тэр ядарсан гэж хэлсэн.' },
      { t: 'He asked me where I lived.', mn: 'Тэр намайг хаана амьдардаг вэ гэж асуусан.' },
      { t: 'She told me to close the door.', mn: 'Тэр надад хаалга хаа гэж хэлсэн.' },
    ],
    mistakes: [
      { wrong: 'He asked me where did I live.', right: 'He asked me where I lived.', why: 'Дамжуулсан асуулт өгүүлбэрийн дараалалтай (асуух дараалал биш).' },
    ],
    quiz: [
      { q: '"I will help you," he said. → He said he ___ help me.', options: ['will', 'would', 'can'], answer: 1, why: 'will → would.' },
      { q: '"Where do you live?" → She asked me where I ___.', options: ['live', 'lived', 'do live'], answer: 1, why: 'Backshift: live → lived.' },
    ],
  },
  {
    id: 'en-relative-clauses',
    level: 'intermediate',
    category: 'Бүтэц',
    title: 'Relative clauses: who, which, that, where',
    titleMn: 'Холбох үгтэй дагавар өгүүлбэр',
    summary: 'Хүн, юмыг нэмэлт мэдээллээр тодорхойлно.',
    explain: [
      'who → хүн, which → юм, that → хүн/юм (ерөнхий), where → газар, whose → эзэмшигч. Defining (тодорхойлох) өгүүлбэрт таслал байхгүй; non-defining (нэмэлт) өгүүлбэрт таслал байна.',
    ],
    examples: [
      { t: 'The man who lives next door is a doctor.', mn: 'Хажуу айлд амьдардаг эр эмч.' },
      { t: 'This is the book that I told you about.', mn: 'Энэ чамд ярьсан ном.' },
      { t: 'That is the café where we first met.', mn: 'Тэр бол бидний анх уулзсан кафе.' },
      { t: 'My brother, who lives in Seoul, is a designer.', mn: 'Сөүлд амьдардаг миний дүү дизайнер.' },
    ],
    mistakes: [
      { wrong: 'The girl which sits there is my sister.', right: 'The girl who sits there is my sister.', why: 'Хүнд who/that хэрэглэнэ.' },
    ],
    quiz: [
      { q: 'The woman ___ called you is my aunt.', options: ['who', 'which', 'where'], answer: 0, why: 'Хүн → who.' },
      { q: 'The city ___ I was born is small.', options: ['who', 'where', 'whose'], answer: 1, why: 'Газар → where.' },
    ],
  },
  {
    id: 'en-gerund-infinitive',
    level: 'intermediate',
    category: 'Бүтэц',
    title: 'Gerund vs infinitive',
    titleMn: 'V-ing эсвэл to + V',
    summary: 'Үйл үгийн дараа V-ing эсвэл to V аль нь орохыг мэднэ.',
    explain: [
      'Зарим үйл үг V-ing (gerund) авдаг, зарим нь to + V (infinitive) авдаг, зарим нь хоёуланг нь авдаг. Үүнийг цээжлэх хэрэгтэй.',
    ],
    tables: [
      {
        headers: ['+ V-ing', '+ to V', 'Хоёулаа (утга өөр)'],
        rows: [
          ['enjoy, finish, avoid, mind, suggest, keep, practise', 'want, need, hope, decide, plan, promise, learn, afford', 'stop, remember, forget, try'],
          ['I enjoy reading.', 'I want to travel.', 'I stopped smoking. / I stopped to smoke.'],
        ],
      },
    ],
    examples: [
      { t: 'She avoids eating sugar.', mn: 'Тэр чихэр идэхээс зайлсхийдэг.' },
      { t: 'We decided to move.', mn: 'Бид нүүхээр шийдсэн.' },
      { t: 'I remember meeting him. / Remember to call me.', mn: 'Би түүнтэй уулзсаныг санаж байна. / Над руу залгахаа битгий март.' },
    ],
    tips: ['Угтвар үгийн дараа үргэлж V-ing: interested in learning, good at swimming.'],
    quiz: [
      { q: 'I enjoy ___ to music.', options: ['listen', 'to listen', 'listening'], answer: 2, why: 'enjoy + V-ing.' },
      { q: 'We hope ___ you soon.', options: ['seeing', 'to see', 'see'], answer: 1, why: 'hope + to V.' },
      { q: 'She is good at ___.', options: ['to draw', 'draw', 'drawing'], answer: 2, why: 'Угтвар үгийн дараа V-ing.' },
    ],
  },
  {
    id: 'en-linking-words',
    level: 'intermediate',
    category: 'Бүтэц',
    title: 'Linking words & question tags',
    titleMn: 'Холбох үгс, баталгаажуулах асуулт',
    summary: 'Санааг уялдуулж, өгүүлбэрийн төгсгөлд баталгаажуулах асуулт тавина.',
    explain: [
      'Холбох үгс нь өгүүлбэрүүдийг утгаар нь холбоно. Question tag нь ярианд "…биз дээ?" гэж баталгаажуулдаг.',
    ],
    tables: [
      {
        headers: ['Утга', 'Үгс', 'Жишээ'],
        rows: [
          ['Нэмэх', 'and, also, moreover', 'She is smart and hardworking.'],
          ['Эсрэг тэсрэг', 'but, however, although, while', 'Although it was cold, we went out.'],
          ['Шалтгаан', 'because, since, as', 'I stayed home because I was ill.'],
          ['Үр дүн', 'so, therefore, as a result', 'It rained, so we cancelled.'],
        ],
      },
      {
        title: 'Question tags',
        headers: ['Өгүүлбэр', 'Tag'],
        rows: [
          ['Эерэг өгүүлбэр', 'үгүйсгэх tag: You like tea, don\'t you?'],
          ['Үгүйсгэх өгүүлбэр', 'эерэг tag: She isn\'t here, is she?'],
        ],
      },
    ],
    examples: [
      { t: 'He was tired; however, he kept working.', mn: 'Тэр ядарсан ч ажилласаар байсан.' },
      { t: "It's a nice day, isn't it?", mn: 'Сайхан өдөр байна, тийм биз дээ?' },
    ],
    mistakes: [
      { wrong: 'Although it was cold, but we went out.', right: 'Although it was cold, we went out.', why: 'although ба but-ыг хамт хэрэглэхгүй.' },
    ],
    quiz: [
      { q: '___ he was ill, he went to work.', options: ['Because', 'Although', 'So'], answer: 1, why: 'Эсрэг утга → although.' },
      { q: 'You are Tom, ___?', options: ["aren't you", 'are you', "don't you"], answer: 0, why: 'Эерэг + үгүйсгэх tag.' },
    ],
  },
  {
    id: 'en-phrasal-verbs',
    level: 'intermediate',
    category: 'Үгсийн сан',
    title: 'Common phrasal verbs',
    titleMn: 'Үйл үг + үгийн дагавар',
    summary: 'Өдөр тутмын хамгийн түгээмэл phrasal verb-үүдийг мэднэ.',
    explain: [
      'Phrasal verb = үйл үг + угтвар/дагавар. Утга нь ихэвчлэн үгсийн нийлбэрээс өөр байдаг тул бүхэлд нь цээжилнэ. Зарим нь салгаж болдог (turn off the light / turn the light off).',
    ],
    tables: [
      {
        headers: ['Phrasal verb', 'Утга', 'Жишээ'],
        rows: [
          ['look for', 'хайх', 'I am looking for my keys.'],
          ['look after', 'хараад хамгаалах', 'She looks after her grandmother.'],
          ['give up', 'бууж өгөх / хаях', "Don't give up!"],
          ['turn on / off', 'асаах / унтраах', 'Turn off the TV.'],
          ['find out', 'олж мэдэх', 'I found out the truth.'],
          ['get on with', 'сайн харьцах', 'I get on well with my colleagues.'],
          ['put off', 'хойшлуулах', 'They put off the meeting.'],
          ['carry on', 'үргэлжлүүлэх', 'Carry on working.'],
          ['run out of', 'дуусах', 'We ran out of milk.'],
          ['come across', 'санамсаргүй таарах', 'I came across an old photo.'],
        ],
      },
    ],
    examples: [
      { t: 'We ran out of time.', mn: 'Бидний цаг дууссан.' },
      { t: 'Please turn the music down.', mn: 'Хөгжмөө намсга.' },
    ],
    quiz: [
      { q: 'I\'m ___ my glasses. Have you seen them?', options: ['looking for', 'looking after', 'looking up'], answer: 0, why: 'look for = хайх.' },
      { q: 'We must ___ the meeting until Friday.', options: ['put off', 'give in', 'run out'], answer: 0, why: 'put off = хойшлуулах.' },
    ],
  },
  {
    id: 'en-too-enough',
    level: 'intermediate',
    category: 'Үгсийн сан',
    title: 'Quantifiers & comparisons (as … as, too / enough)',
    titleMn: 'Хэмжүүр үгс, харьцуулалтын нэмэлт',
    summary: 'as … as, too, enough зэргийг зөв хэрэглэнэ.',
    explain: [
      'as + adj + as = адил. too + adj = хэтэрхий (сөрөг утга). adj + enough = хангалттай. enough + noun = хангалттай хэмжээний.',
    ],
    patterns: [
      { label: 'as … as', formula: 'as + adj + as', example: 'He is as tall as his father.' },
      { label: 'too', formula: 'too + adj (+ to V)', example: 'It is too hot to go out.' },
      { label: 'enough', formula: 'adj + enough / enough + noun', example: 'She is old enough to drive. We have enough time.' },
    ],
    examples: [
      { t: 'This exam is not as difficult as I expected.', mn: 'Энэ шалгалт миний бодсон шиг хэцүү биш байлаа.' },
      { t: 'He speaks too fast for me to understand.', mn: 'Тэр надад ойлгогдохооргүй хэт хурдан ярьдаг.' },
    ],
    mistakes: [
      { wrong: 'I am enough tall.', right: 'I am tall enough.', why: 'Тэмдэг нэрийн ДАРАА enough ордог.' },
    ],
    quiz: [
      { q: 'The soup is ___ salty to eat.', options: ['too', 'enough', 'very much'], answer: 0, why: 'Хэтэрхий + to V → too.' },
      { q: 'She is not ___ to join the army.', options: ['enough old', 'old enough', 'too old enough'], answer: 1, why: 'adj + enough.' },
    ],
  },
];
