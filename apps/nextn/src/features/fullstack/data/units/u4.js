// Нэгж 4 — Шаардлагын тал
// Эх сурвалж: Module 1 / Lesson 10 (Requirements)

export default {
  id: 'u4',
  town: 'Шаардлагын тал',
  title: 'Requirements: SRS, URS, SysRS',
  blurb: 'Уудам тал. Хаашаа явахаа мэдэхгүй бол хаашаа ч хүрэхгүй — шаардлага бол чиглэл.',
  hue: 265,
  icon: '📋',
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: 'u4l1',
      kind: 'lesson',
      icon: '🔍',
      title: 'Зургаан алхам',
      subtitle: 'Шаардлага цуглуулах үйл явц',
      teach: {
        lead:
          '**Requirement gathering** буюу шаардлага цуглуулах гэдэг нь **шийдвэрлэх асуудлыг тодорхойлж, ' +
          'түүнийг хэрхэн шийдэхийг баримтжуулах** зургаан алхамт үйл явц юм.',
        sections: [
          {
            h: 'Зургаан алхам',
            numbered: [
              '**Stakeholder-уудыг тодорхойлох** (identifying stakeholders)',
              '**Goal ба objective тогтоох** (establishing goals and objectives)',
              '**Шаардлагыг гаргаж авах** (eliciting requirements)',
              '**Баримтжуулах** (documenting the requirements)',
              '**Шинжилж, батлах** (analyzing and confirming)',
              '**Эрэмбэлэх** (prioritizing)',
            ],
            note:
              'Дунд гурван алхам — **elicit, document, confirm** — ихэвчлэн **давталттайгаар (iteratively)** ' +
              'хийгддэг. Нэг удаа шулуун явдаггүй.',
          },
          {
            h: '1. Stakeholder-ууд хэн бэ?',
            p: [
              'Ерөнхийдөө оролцогч талууд нь программ бүтээхийг **захиалж буй байгууллагад** ажилладаг. ' +
                'Байгууллагын гол ажилтнуудад дараах хүмүүс орж болно:',
            ],
            list: [
              '**Шийдвэр гаргагчид (decision-makers)**',
              '**Эцсийн хэрэглэгчид (end-users)**',
              '**Систем администраторууд**',
              '**Инженерчлэл (engineering)**',
              '**Маркетинг**',
              '**Борлуулалт (sales)**',
              '**Харилцагчийн үйлчилгээний ажилтнууд (customer support)**',
            ],
            p2: [],
            note: 'Бүтээгдэхүүнд **нөлөөлөх бүлэг бүрээс төлөөлөлтэй** байх нь сайн.',
          },
          {
            h: '2. Goal ба objective',
            p: [
              'Бүтээгдэхүүний зорилгыг **тодорхой** тогтоох ёстой.',
            ],
            table: {
              head: ['', 'Goal (зорилго)', 'Objective (зорилт)'],
              rows: [
                ['Хамрах хүрээ', '**Өргөн (broad)**', '**Тодорхой (specific)**'],
                ['Хугацаа', '**Урт хугацааны** хүрэх үр дүн', 'Ойрын'],
                ['Шинж', 'Ерөнхий чиглэл', '**Үйлдэл болгож болох (actionable)** ба **хэмжигдэхүйц (measurable)**'],
                ['Юуг агуулна', 'Хэрэглэгчийн үр дүн, бизнесийн зорилго', 'Goal-д хүрэх тодорхой алхмууд'],
              ],
            },
          },
          {
            h: '3. Elicitation — шаардлагыг гаргаж авах',
            p: ['Шаардлагыг stakeholder-аас гаргаж авахад дараах аргуудыг ашиглана:'],
            list: [
              '**Судалгаа (surveys)**',
              '**Асуулга (questionnaires)**',
              '**Ярилцлага (interviews)**',
            ],
            p2: [],
            note:
              'Кодын review нь шаардлага гаргаж авах арга **биш** — энэ нь хөгжүүлэлтийн үе шатны дадал.',
          },
          {
            h: '4–5. Баримтжуулах ба батлах',
            p: [
              'Шаардлага гарч ирэх тусам тэдгээрийг **баримтжуулж**, goal болон objective-той **нийцэж ' +
                'байгаа эсэхийг шалгана**. Баримтжуулсан шаардлагыг оролцогч талууд болон төслийн баг ' +
                '**амархан ойлгодог** байх ёстой.',
              'Шаардлагыг **батлахын тулд** тэдгээрийг дараах гурван шалгуураар шинжилнэ:',
            ],
            list: [
              '**Consistency** — уялдаа, зөрчилгүй байдал',
              '**Clarity** — тодорхой байдал',
              '**Completeness** — бүрэн байдал',
            ],
            p2: [],
            note: 'Шинжилгээний дараа шаардлагыг stakeholder-уудтай **хуваалцаж, батлуулах** ёстой.',
          },
          {
            h: '6. Эрэмбэлэх',
            p: [
              'Баталгаажсаны дараа шаардлагыг **эрэмбэлнэ**. Дараах шошгууд ашиглах нь тустай:',
            ],
            numbered: [
              '**"Must-have"** — заавал байх',
              '**"Highly desired"** — маш их хүсэмжтэй',
              '**"Nice to have"** — байвал сайн',
            ],
            note: 'Боломжтой бол эдгээр ангилал **дотор нь** ч шаардлагуудыг эрэмбэлэх нь зүйтэй.',
          },
          {
            h: 'Гарах гурван баримт',
            p: [
              'Шаардлага цуглуулах үйл явцын үр дүнд ихэвчлэн **гурван баримт** гарч болно: ' +
                '**SRS** (software requirements specification), **URS** (user requirements specification), ' +
                '**SysRS** (system requirements specification). Эдгээрээс **хамгийн түгээмэл** нь **SRS**. ' +
                'Эдгээрийг дараагийн хоёр хичээлд дэлгэрэнгүй үзнэ.',
            ],
          },
        ],
        terms: [
          ['Requirement gathering', 'Шийдвэрлэх асуудлыг тодорхойлж, шийдэх аргыг баримтжуулах 6 алхамт үйл явц.'],
          ['Goal', 'Өргөн, урт хугацааны хүрэх үр дүн.'],
          ['Objective', 'Тодорхой, үйлдэл болгож болох, хэмжигдэхүйц зорилт.'],
          ['Elicitation', 'Шаардлагыг stakeholder-аас гаргаж авах үйл явц — судалгаа, асуулга, ярилцлага.'],
          ['Must-have', 'Хамгийн өндөр эрэмбийн шошго — энэ шаардлагагүйгээр бүтээгдэхүүн ажиллахгүй.'],
        ],
        recap: [
          '6 алхам: **stakeholder → goal/objective → elicit → document → confirm → prioritize**.',
          '**Elicit, document, confirm** гурав **давталттай** хийгддэг.',
          'Goal = **өргөн, урт хугацааны**; Objective = **тодорхой, хэмжигдэхүйц, үйлдэл болгож болох**.',
          'Elicitation: **судалгаа, асуулга, ярилцлага**.',
          'Батлах шалгуур: **consistency, clarity, completeness**.',
          'Эрэмбэ: **must-have → highly desired → nice to have**.',
        ],
      },
      exercises: [
        {
          t: 'order',
          q: 'Шаардлага цуглуулах 6 алхмыг эрэмбэл',
          items: [
            'Stakeholder-уудыг тодорхойлох',
            'Goal ба objective тогтоох',
            'Шаардлагыг гаргаж авах (elicit)',
            'Баримтжуулах',
            'Шинжилж, батлах',
            'Эрэмбэлэх',
          ],
          why: 'Elicit → document → confirm гурав нь ихэвчлэн давталттайгаар хийгддэг.',
        },
        {
          t: 'choice',
          q: 'Goal ба objective-ийн ялгаа юу вэ?',
          options: [
            'Ялгаа байхгүй',
            'Goal нь өргөн, урт хугацааны; objective нь тодорхой, хэмжигдэхүйц, үйлдэл болгож болох',
            'Objective нь үргэлж санхүүгийн',
            'Goal-ыг зөвхөн хөгжүүлэгч тогтоодог',
          ],
          a: 1,
          why: 'Goal = broad, long-term. Objective = specific, actionable, measurable.',
        },
        {
          t: 'multi',
          q: 'Stakeholder-т хэн багтаж болох вэ?',
          options: ['Шийдвэр гаргагчид ба эцсийн хэрэглэгчид', 'Систем администраторууд', 'Маркетинг, борлуулалт, харилцагчийн үйлчилгээ', 'Инженерчлэлийн баг'],
          a: [0, 1, 2, 3],
          why: 'Бүтээгдэхүүнд нөлөөлөх бүлэг бүрээс төлөөлөлтэй байх нь сайн.',
        },
        {
          t: 'multi',
          q: 'Elicitation-ийг ямар аргаар хийдэг вэ?',
          options: ['Судалгаа (survey)', 'Асуулга (questionnaire)', 'Ярилцлага (interview)', 'Кодын review'],
          a: [0, 1, 2],
          why: 'Гурван арга: survey, questionnaire, interview.',
        },
        {
          t: 'multi',
          q: 'Шаардлагыг батлахын тулд юуг шалгах ёстой вэ?',
          options: ['Consistency — уялдаа', 'Clarity — тодорхой байдал', 'Completeness — бүрэн байдал', 'Кодын урт'],
          a: [0, 1, 2],
          why: 'Гурван шалгуур: consistency, clarity, completeness. Дараа нь stakeholder батална.',
        },
        {
          t: 'order',
          q: 'Эрэмбийн шошгыг чухлаас нь эрэмбэл',
          items: ['Must-have', 'Highly desired', 'Nice to have'],
          why: 'Заавал байх → маш их хүсэмжтэй → байвал сайн.',
        },
        {
          t: 'tf',
          q: 'Elicit, document, confirm гурван алхам ихэвчлэн давталттайгаар хийгддэг.',
          a: true,
          why: 'Тийм — эдгээр гурав iteratively хийгддэг.',
        },
        {
          t: 'choice',
          q: 'Шаардлага цуглуулах үйл явцаас ямар гурван баримт гарч болох вэ?',
          options: ['SRS, URS, SysRS', 'UAT, GA, MVP', 'CASE, SDLC, API', 'README, guide, manual'],
          a: 0,
          why: 'SRS (software), URS (user), SysRS (system) — эдгээрээс SRS хамгийн түгээмэл.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'u4l2',
      kind: 'lesson',
      icon: '📄',
      title: 'SRS баримт',
      subtitle: 'Бүтэц ба шаардлагын 4 ангилал',
      teach: {
        lead:
          '**Software Requirements Specification (SRS)** нь программ **гүйцэтгэх ёстой функционалуудыг** ' +
          'тэмдэглэж, мөн түүний гүйцэтгэлийн **жишиг буюу үйлчилгээний түвшинг** тогтоодог баримт юм. ' +
          'Гурван баримтаас **хамгийн түгээмэл** нь энэ.',
        sections: [
          {
            h: 'SRS-ийн үндсэн хэсгүүд',
            numbered: [
              '**Purpose statement** — зориулалтын мэдэгдэл: SRS-ийн зорилтот хэрэглээ, **сонсогч ' +
                '(audience)** ба **scope**',
              '**Constraints, assumptions and dependencies** — хязгаарлалт, таамаглал, хамаарал',
              '**Requirements** — шаардлагууд, дөрвөн ангилалд хуваагдана',
            ],
          },
          {
            h: 'Purpose ба scope',
            p: [
              'Бүтээгдэхүүний **purpose** нь **хэн SRS-д хандах эрхтэй** болон **тэд үүнийг хэрхэн ашиглах ' +
                'ёстойг** тайлбарлана.',
              '**Scope** нь программын **ашиг тус, goal болон objective**-ийг тайлбарладаг.',
            ],
          },
          {
            h: 'Constraints, assumptions, dependencies',
            table: {
              head: ['Ойлголт', 'Тайлбар'],
              rows: [
                [
                  '**Constraints** (хязгаарлалт)',
                  'Бүтээгдэхүүн **өгөгдсөн нөхцөлд хэрхэн ажиллах ёстойг** заасан, **зохиомжийн шатанд ' +
                    'сонголтыг хязгаарлаж болох** нөхцлүүд — жишээ нь **стандартад нийцэх** эсвэл ' +
                    '**hardware-ийн хязгаарлалт**.',
                ],
                [
                  '**Assumptions** (таамаглал)',
                  'Программ ажиллахад **шаардлагатай үйлдлийн систем эсвэл hardware** зэрэг зүйлс.',
                ],
                [
                  '**Dependencies** (хамаарал)',
                  'Бусад программ хангамжийн бүтээгдэхүүнээс хамаарах хамаарлыг мөн тэмдэглэх ёстой.',
                ],
              ],
            },
          },
          {
            h: 'Шаардлагын дөрвөн ангилал',
            table: {
              head: ['Ангилал', 'Юуг хамардаг вэ', 'Жишээ'],
              rows: [
                ['**Functional**', 'Программын **функционалуудыг** хамарна', 'Хэрэглэгч нэвтэрч чадна'],
                [
                  '**External interface**',
                  'Программын **гадаад биетүүдтэй** харилцах зан төлөв — хэрэглэгчид болон бусад **hardware ' +
                    'эсвэл software**-тэй харилцан үйлчлэл',
                  'Төлбөрийн гуравдагч API-тай холбогдоно',
                ],
                [
                  '**System features**',
                  'Функционал шаардлагын **дэд олонлог** — систем ажиллахад **зайлшгүй шаардлагатай** ' +
                    'feature-ууд',
                  'Систем ажиллахад шаардлагатай зайлшгүй feature',
                ],
                [
                  '**Non-functional**',
                  '**Гүйцэтгэл, аюулгүй байдал, найдвартай ажиллагаа (safety), чанарын стандарт**',
                  'Хуудас 2 секундэд ачаалагдана',
                ],
              ],
            },
            note:
              'Зөвхөн **UI** гэсэн үг гарвал энэ нь ихэвчлэн **external and User Interface** ангилалд ' +
              'хамаарна — өөрөөр хэлбэл external interface requirements.',
          },
        ],
        terms: [
          ['SRS', 'Программын гүйцэтгэх функционалуудыг тэмдэглэж, гүйцэтгэлийн жишгийг тогтоосон хамгийн түгээмэл баримт.'],
          ['Purpose statement', 'SRS-ийн зорилтот хэрэглээ, сонсогч ба scope-ыг тодорхойлсон хэсэг.'],
          ['Scope', 'Программын ашиг тус, goal, objective-ийг тайлбарлах хэсэг.'],
          ['Constraints', 'Өгөгдсөн нөхцөлд бүтээгдэхүүн хэрхэн ажиллах ёстойг заасан, design-ийн сонголтыг хязгаарлах нөхцлүүд.'],
          ['Assumptions', 'Программ ажиллахад шаардлагатай ОС, hardware зэрэг таамаглалууд.'],
          ['Non-functional requirement', 'Гүйцэтгэл, аюулгүй байдал, найдвартай ажиллагаа, чанарын стандартын шаардлага.'],
        ],
        recap: [
          'SRS = гүйцэтгэх **функционал** + гүйцэтгэлийн **жишиг**. Гурваас **хамгийн түгээмэл**.',
          'Хэсгүүд: **purpose** (audience, scope) → **constraints/assumptions/dependencies** → **requirements**.',
          '**Scope** = ашиг тус, goal, objective.',
          '4 ангилал: **functional, external interface, system features, non-functional**.',
          '**System features** = функционал шаардлагын **дэд олонлог**.',
        ],
      },
      exercises: [
        {
          t: 'multi',
          q: 'SRS-ийн шаардлагын 4 ангилал аль нь вэ?',
          options: ['Functional', 'External interface', 'System features', 'Non-functional'],
          a: [0, 1, 2, 3],
          why: 'Дөрвүүлээ — энэ бол SRS-ийн стандарт ангилал.',
        },
        {
          t: 'match',
          q: 'Шаардлагын ангиллыг жишээтэй нь холбо',
          pairs: [
            ['Functional', 'Хэрэглэгч нэвтэрч чадна'],
            ['External interface', 'Төлбөрийн гуравдагч API-тай холбогдоно'],
            ['Non-functional', 'Хуудас 2 секундэд ачаалагдана'],
            ['System features', 'Систем ажиллахад шаардлагатай зайлшгүй feature'],
          ],
        },
        {
          t: 'choice',
          q: 'Constraints гэж юу вэ?',
          options: [
            'Багийн гишүүдийн тоо',
            'Design шатны сонголтыг хязгаарлаж болох нөхцлүүд (стандартад нийцэх, hardware хязгаарлалт)',
            'Хувилбарын дугаар',
            'Тестийн тоо',
          ],
          a: 1,
          why: 'Constraints бол өгөгдсөн нөхцөлд бүтээгдэхүүн хэрхэн ажиллах ёстойг заасан хязгаарлалтууд.',
        },
        {
          t: 'blank',
          q: 'SRS-ийн ___ хэсэг нь программын ашиг тус, goal, objective-ийг тайлбарладаг.',
          bank: ['scope', 'constraint', 'appendix', 'index'],
          a: 'scope',
          why: 'Scope нь программын ашиг тус, зорилго, зорилтуудыг тайлбарлана.',
        },
        {
          t: 'tf',
          q: 'System features нь functional requirement-ийн дэд олонлог юм.',
          a: true,
          why: 'Тийм — system features бол функционал шаардлагын subset, систем ажиллахад зайлшгүй шаардлагатай feature-ууд.',
        },
        {
          t: 'choice',
          q: 'Assumptions-д ямар зүйл багтаж болох вэ?',
          options: [
            'Программ ажиллахад шаардлагатай үйлдлийн систем эсвэл hardware',
            'Багийн цалингийн хэмжээ',
            'Маркетингийн төлөвлөгөө',
            'Кодын мөрийн тоо',
          ],
          a: 0,
          why: 'Assumptions нь шаардлагатай ОС, hardware зэргийг агуулна.',
        },
        {
          t: 'choice',
          q: 'SRS-ийн purpose хэсэг юуг тайлбарладаг вэ?',
          options: [
            'Хэн SRS-д хандах эрхтэй, тэд үүнийг хэрхэн ашиглах ёстой',
            'Кодын мөр бүрийг',
            'Тестийн үр дүнг',
            'Цалингийн санг',
          ],
          a: 0,
          why: 'Purpose нь audience болон хэрэглээг тодорхойлно.',
        },
        {
          t: 'choice',
          q: 'Аль нь non-functional requirement-ийн жишээ вэ?',
          options: [
            'Хэрэглэгч бүртгүүлж чадна',
            'Хуудас 2 секундэд ачаалагдана',
            'Систем PDF үүсгэнэ',
            'Хэрэглэгч зураг байршуулна',
          ],
          a: 1,
          why: 'Non-functional нь гүйцэтгэл, аюулгүй байдал, чанарын стандартыг заана — хурд бол гүйцэтгэлийн шаардлага.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'u4l3',
      kind: 'lesson',
      icon: '👤',
      title: 'URS ба SysRS',
      subtitle: 'Хэрэглэгч ба систем',
      teach: {
        lead:
          '**URS** нь хэрэглэгчийн хэрэгцээг **user story** хэлбэрээр, **SysRS** нь **бүхэл системийн** ' +
          'шаардлагыг тодорхойлно. Гурвуулангийн ялгааг сайн салгаж мэдэх нь шалгалтад чухал.',
        sections: [
          {
            h: 'URS — User Requirements Specification',
            p: [
              '**User requirements** нь программын системээс эцсийн хэрэглэгчийн хүлээх **бизнесийн ' +
                'хэрэгцээ ба хүлээлтийг** тодорхойлно.',
              'Хэрэглэгчийн шаардлагыг **"user story"** эсвэл **"use case"** хэлбэрээр бичдэг. Эдгээр нь ' +
                '**гурван асуултад** хариулна:',
            ],
            numbered: [
              '**Хэрэглэгч хэн бэ?** (Who is the user?)',
              '**Ямар функц гүйцэтгэх шаардлагатай вэ?** (What is the function that needs to be performed?)',
              '**Яагаад хэрэглэгч энэ функцийг хүсэж байна вэ?** (Why does the user want this functionality?)',
            ],
            note:
              '**User acceptance testing** нь эдгээр шаардлага **биелсэн эсэхийг** тодорхойлдог.',
          },
          {
            h: 'URS ба SRS ихэвчлэн нийлдэг',
            p: [
              'Практикт хэрэглэгчийн шаардлага ба программын шаардлагыг **нэг SRS баримт** болгон нэгтгэдэг. ' +
                'SRS нь программын системээс хүлээх зүйлсийг нарийвчлан заана.',
            ],
          },
          {
            h: 'SysRS — System Requirements Specification',
            p: [
              '**System Requirement Specification (SysRS)** — SRS-ээс ялгахын тулд ингэж нэрлэдэг — нь ' +
                '**бүхэл системийн** шаардлагыг тодорхой заана.',
              'SysRS-ийг ихэвчлэн software requirement specification-тай **сольж хэрэглэдэг** ч, SysRS нь ' +
                'SRS-ээс **хамрах хүрээ илүү өргөн** байдаг.',
              'Олон программын төсөл SysRS биш **SRS л боловсруулдаг**.',
            ],
          },
          {
            h: 'SysRS юу агуулдаг вэ?',
            p: ['SysRS дараах зүйлсийг агуулна:'],
            list: [
              '**Системийн боломжууд (system capabilities)**',
              '**Интерфэйсүүд (interfaces)**',
              '**Хэрэглэгчийн шинж чанарууд (user characteristics)**',
              '**Бодлогын шаардлага (policy requirements)**',
              '**Зохицуулалтын шаардлага (regulation requirements)**',
              '**Боловсон хүчний шаардлага (personnel requirements)**',
              '**Гүйцэтгэлийн шаардлага (performance requirements)**',
              '**Аюулгүй байдлын шаардлага (security requirements)**',
              '**Системийн хүлээн авах шалгуур (system acceptance criteria)**',
              'Программын шаардлагаас гадна системд шаардагдах **hardware**-ийн хүлээлт',
            ],
          },
          {
            h: 'Гурвыг ялгах хүснэгт',
            table: {
              head: ['Баримт', 'Гол агуулга', 'Хамрах хүрээ'],
              rows: [
                ['**SRS**', 'Функционал, external interface, system features, non-functional шаардлага', 'Программ'],
                ['**URS**', 'Голчлон **use case** болон user story-ууд', 'Хэрэглэгчийн хэрэгцээ'],
                ['**SysRS**', '**Системийн боломж** ба **хүлээн авах шалгуур**, бодлого, зохицуулалт, hardware', '**Хамгийн өргөн**'],
              ],
            },
            note:
              'Шалгалтын анхаарах зүйл: "URS-ийг хамгийн зөв тодорхойлсон мэдэгдэл" гэсэн асуултын хариулт ' +
              'нь **"Голчлон use case-үүдийг агуулна"**. Бусад сонголтууд нь SRS (functional/external/' +
              'non-functional) эсвэл SysRS (policy/regulation)-ийн шинж. **SysRS нь SRS болон URS-д ' +
              'байхгүй системийн боломжуудыг агуулдаг.**',
          },
        ],
        terms: [
          ['URS', 'User Requirements Specification — эцсийн хэрэглэгчийн бизнесийн хэрэгцээ ба хүлээлт, user story хэлбэрээр.'],
          ['User story', 'Who / What / Why гурван асуултад хариулсан хэрэглэгчийн шаардлагын бичлэг.'],
          ['Use case', 'Хэрэглээний тодорхой тохиолдлыг тайлбарласан бичлэг.'],
          ['SysRS', 'System Requirements Specification — бүхэл системийн шаардлага; SRS-ээс өргөн.'],
          ['System acceptance criteria', 'Системийг хүлээн авахад хангасан байх ёстой шалгуурууд — SysRS-д ордог.'],
        ],
        recap: [
          '**URS** = хэрэглэгчийн хэрэгцээ, голчлон **use case / user story**.',
          'User story: **Who? What? Why?**',
          'URS биелсэн эсэхийг **User acceptance testing** тодорхойлно.',
          'URS ба SRS ихэвчлэн **нэг SRS баримт** болж нийлдэг.',
          '**SysRS нь SRS-ээс өргөн** — системийн боломж, бодлого, зохицуулалт, боловсон хүчин, hardware, хүлээн авах шалгуур.',
          'Ихэнх төсөл **SRS л** боловсруулдаг.',
        ],
      },
      exercises: [
        {
          t: 'choice',
          q: 'URS-ийг хамгийн зөв тодорхойлсон мэдэгдэл аль нь вэ?',
          options: [
            'Functional, external interface, non-functional шаардлагыг агуулна',
            'Бодлого ба зохицуулалтын шаардлагыг агуулна',
            'SRS-тэй нийлж SysRS үүсгэдэг',
            'Голчлон use case-үүдийг агуулна',
          ],
          a: 3,
          why: 'URS нь user story / use case хэлбэрээр бичигддэг. Бусад сонголтууд SRS эсвэл SysRS-ийн шинж. (Модулийн шалгалтын асуулт)',
        },
        {
          t: 'multi',
          q: 'User story ямар гурван асуултад хариулдаг вэ?',
          options: [
            'Хэрэглэгч хэн бэ?',
            'Ямар функц гүйцэтгэх ёстой вэ?',
            'Яагаад хэрэглэгч энэ функцийг хүсэж байна вэ?',
            'Хэдэн мөр код бичих вэ?',
          ],
          a: [0, 1, 2],
          why: 'Who / What / Why — гурван асуулт.',
        },
        {
          t: 'choice',
          q: 'SysRS ба SRS-ийн харилцаа юу вэ?',
          options: [
            'SysRS нь SRS-ээс өргөн хүрээтэй',
            'SysRS нь SRS-ээс нарийн',
            'Хоёр нь яг ижил',
            'SysRS нь зөвхөн код агуулна',
          ],
          a: 0,
          why: 'SysRS нь бүхэл системийг хамардаг тул SRS-ээс өргөн. Олон төсөл SysRS биш SRS л боловсруулдаг.',
        },
        {
          t: 'multi',
          q: 'SysRS-д юу багтдаг вэ?',
          options: [
            'Системийн боломжууд, интерфэйс, хэрэглэгчийн шинж',
            'Бодлого ба зохицуулалтын шаардлага',
            'Боловсон хүчин, гүйцэтгэл, аюулгүй байдлын шаардлага',
            'Шаардагдах hardware ба системийн хүлээн авах шалгуур',
          ],
          a: [0, 1, 2, 3],
          why: 'Дөрвүүлээ SysRS-д ордог.',
        },
        {
          t: 'match',
          q: 'Баримтыг гол агуулгатай нь холбо',
          pairs: [
            ['SRS', 'Функционал, external, system, non-functional шаардлага'],
            ['URS', 'User story-ууд'],
            ['SysRS', 'Системийн боломж ба хүлээн авах шалгуур'],
          ],
        },
        {
          t: 'tf',
          q: 'Ихэнх программын төсөл SysRS биш SRS боловсруулдаг.',
          a: true,
          why: 'Тийм — SRS хамгийн түгээмэл.',
        },
        {
          t: 'blank',
          q: 'URS-ийн шаардлага биелсэн эсэхийг ___ testing-ээр тодорхойлно.',
          bank: ['User acceptance', 'Unit', 'Integration', 'Regression'],
          a: 'User acceptance',
          why: 'UAT нь хэрэглэгчийн шаардлага биелсэн эсэхийг шалгана.',
        },
        {
          t: 'tf',
          q: 'Ихэвчлэн хэрэглэгчийн шаардлага ба программын шаардлагыг нэг SRS баримт болгон нэгтгэдэг.',
          a: true,
          why: 'Тийм — практикт URS ба SRS нэг баримт болж нийлдэг.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'u4c1',
      kind: 'code',
      icon: '⌨️',
      title: 'Шаардлагын код',
      subtitle: 'Обьект, эрэмбэлэлт, шалгалт',
      teach: {
        lead: 'Обьект дээр ажиллаж, жагсаалт эрэмбэлж, бүрэн байдлыг шалгах кодыг бичье.',
        sections: [
          {
            h: 'Обьектийн талбарт хандах',
            p: ['Обьектийн талбарт цэгээр эсвэл хаалтаар хандана. Хувьсагчаар хандах бол хаалт хэрэглэнэ.'],
            example:
              'const s = { who: "Оюутан", what: "хичээл үзэх" };\n' +
              's.who        // → "Оюутан"\n' +
              'const k = "what";\n' +
              's[k]         // → "хичээл үзэх"',
          },
          {
            h: 'sort — эрэмбэлэлт',
            p: [
              '`sort` нь **анхны массивыг өөрчилдөг** тул эхлээд `[...arr]` гэж хуулбар авах нь зөв дадал. ' +
                'Харьцуулах функц нь сөрөг тоо буцаавал `a` урд, эерэг бол `b` урд орно.',
              'Дараалалд оноо өгөх хамгийн хялбар арга бол **зэрэглэлийн обьект** үүсгэх:',
            ],
            example:
              'const RANK = { "must-have": 0, "highly desired": 1, "nice to have": 2 };\n' +
              'return [...reqs].sort((a, b) => RANK[a.priority] - RANK[b.priority]);',
            note:
              'JavaScript-ийн `sort` нь **тогтвортой (stable)** — ижил оноотой элементүүдийн анхны дараалал ' +
              'хадгалагдана.',
          },
          {
            h: 'every-ээр бүрэн байдал шалгах',
            p: [
              'Шаардлагатай талбарууд бүгд бөглөгдсөн эсэхийг шалгахад талбаруудын нэрсийг массивт хийгээд ' +
                '`every` ажиллуулна.',
            ],
            example:
              'const NEEDED = ["purpose", "scope", "constraints", "requirements"];\n' +
              'return NEEDED.every(k => Boolean(srs[k]) && srs[k].length > 0);',
            note:
              'Талбар огт байхгүй бол `srs[k]` нь `undefined` — `undefined.length` алдаа өгнө. Тиймээс ' +
              'эхлээд оршин байгаа эсэхийг шалгах хэрэгтэй.',
          },
        ],
        terms: [
          ['sort', 'Массивыг эрэмбэлнэ; анхны массивыг өөрчилдөг тул хуулбар авах нь зөв.'],
          ['Stable sort', 'Ижил утгатай элементүүдийн анхны дараалал хадгалагдах эрэмбэлэлт.'],
          ['Spread `[...arr]`', 'Массивын хуулбар үүсгэх бичлэг.'],
        ],
        recap: [
          '`[...arr].sort(...)` — анхны массивыг хамгаална.',
          'Зэрэглэлийн обьектоор дарааллыг тоо болгож харьцуул.',
          '`every` + оршин байгаа эсэхийн шалгалт — бүрэн байдал шалгахад.',
        ],
      },
      exercises: [
        {
          t: 'code',
          q: 'User story үүсгэгч',
          brief: '`{ who, what, why }` обьект авч `"[who] хүн [what] хийхийг хүсдэг, учир нь [why]."` мөр буцаах `userStory` функц бич.',
          fn: 'userStory',
          starter: 'function userStory(s) {\n  \n}\n',
          cases: [
            {
              args: [{ who: 'Оюутан', what: 'хичээл үзэх', why: 'мэдлэг авахын тулд' }],
              expect: 'Оюутан хүн хичээл үзэх хийхийг хүсдэг, учир нь мэдлэг авахын тулд.',
            },
            {
              args: [{ who: 'Админ', what: 'хэрэглэгч устгах', why: 'аюулгүй байдал' }],
              expect: 'Админ хүн хэрэглэгч устгах хийхийг хүсдэг, учир нь аюулгүй байдал.',
            },
          ],
          hint: 'return `${s.who} хүн ${s.what} хийхийг хүсдэг, учир нь ${s.why}.`',
          solution: 'function userStory(s) {\n  return `${s.who} хүн ${s.what} хийхийг хүсдэг, учир нь ${s.why}.`;\n}',
        },
        {
          t: 'code',
          q: 'Эрэмбийн жагсаалт',
          brief:
            'Шаардлагын массивыг эрэмбээр нь эрэмбэлэх `prioritize` функц бич. Дараалал: must-have → highly desired → nice to have. Ижил эрэмбэтэй бол анхны дараалал хадгалагдана.',
          fn: 'prioritize',
          starter: 'const RANK = { "must-have": 0, "highly desired": 1, "nice to have": 2 };\n\nfunction prioritize(reqs) {\n  \n}\n',
          cases: [
            {
              args: [
                [
                  { name: 'A', priority: 'nice to have' },
                  { name: 'B', priority: 'must-have' },
                  { name: 'C', priority: 'highly desired' },
                ],
              ],
              expect: [
                { name: 'B', priority: 'must-have' },
                { name: 'C', priority: 'highly desired' },
                { name: 'A', priority: 'nice to have' },
              ],
            },
          ],
          hint: '[...reqs].sort((a, b) => RANK[a.priority] - RANK[b.priority])',
          solution:
            'const RANK = { "must-have": 0, "highly desired": 1, "nice to have": 2 };\n\nfunction prioritize(reqs) {\n  return [...reqs].sort((a, b) => RANK[a.priority] - RANK[b.priority]);\n}',
        },
        {
          t: 'code',
          q: 'SRS бүрэн үү?',
          brief: 'SRS обьект авч `purpose`, `scope`, `constraints`, `requirements` бүх талбар нь хоосон биш байвал `true` буцаах `isComplete` функц бич.',
          fn: 'isComplete',
          starter: 'const NEEDED = ["purpose", "scope", "constraints", "requirements"];\n\nfunction isComplete(srs) {\n  \n}\n',
          cases: [
            { args: [{ purpose: 'a', scope: 'b', constraints: 'c', requirements: 'd' }], expect: true },
            { args: [{ purpose: 'a', scope: '', constraints: 'c', requirements: 'd' }], expect: false },
            { args: [{ purpose: 'a' }], expect: false },
          ],
          hint: 'NEEDED.every(k => srs[k] && srs[k].length > 0)',
          solution:
            'const NEEDED = ["purpose", "scope", "constraints", "requirements"];\n\nfunction isComplete(srs) {\n  return NEEDED.every(k => Boolean(srs[k]) && srs[k].length > 0);\n}',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'u4r1',
      kind: 'review',
      icon: '🔁',
      title: 'Талын зогсоол',
      subtitle: 'Нэгж 3–4 давталт',
      teach: {
        lead: 'Чанар ба шаардлагын хоёр нэгжийг нэгтгэн давтъя. Шинэ зүйл байхгүй — бүгд өмнөх хичээлүүдээс.',
        sections: [
          {
            h: 'Товчлолын толь',
            table: {
              head: ['Товчлол', 'Задаргаа'],
              rows: [
                ['**SRS**', 'Software Requirements Specification'],
                ['**URS**', 'User Requirements Specification'],
                ['**SysRS**', 'System Requirements Specification'],
                ['**UAT**', 'User Acceptance Testing'],
                ['**GA**', 'General Availability'],
              ],
            },
          },
          {
            h: 'Чанар (Нэгж 3)',
            list: [
              'Зургаан үйл явц: **Requirements gathering → Design → Coding for quality → Testing → Releases → Documenting**',
              'Кодын чанар: maintainability, readability, testability, security',
              'Release-ийн **төрлүүд бол зөвхөн alpha, beta, GA** — "gamma" гэж байхгүй',
              'Тестийн **түвшин**: unit → integration → system → acceptance',
              'Тестийн **төрөл**: functional, non-functional, regression',
            ],
          },
          {
            h: 'Шаардлага (Нэгж 4)',
            list: [
              'Эхний алхам бол **stakeholder-уудыг тодорхойлох** — хэнтэй ярихаа эхлээд мэдэх',
              '**Non-functional** шаардлагад **гүйцэтгэл, аюулгүй байдал, найдвартай ажиллагаа, чанарын ' +
                'стандарт** ордог',
              'Эрэмбэ: must-have → highly desired → nice to have',
              'SysRS нь SRS-ээс өргөн',
            ],
          },
        ],
        recap: [
          'Release **зөвхөн 3 төрөл**: alpha, beta, GA.',
          'Шаардлага цуглуулах **эхний алхам = stakeholder тодорхойлох**.',
          '**Non-functional** = гүйцэтгэл, аюулгүй байдал, чанарын стандарт.',
          '6 үйл явц: requirements → design → coding → testing → releases → documenting.',
        ],
      },
      exercises: [
        {
          t: 'choice',
          q: 'Аль нь release-ийн ТӨРӨЛ БИШ вэ?',
          options: ['Alpha', 'Beta', 'GA', 'Gamma'],
          a: 3,
          why: 'Gamma гэж release байхгүй. Alpha, Beta, GA гурав.',
        },
        {
          t: 'choice',
          q: 'Шаардлага цуглуулах эхний алхам юу вэ?',
          options: ['Эрэмбэлэх', 'Stakeholder-уудыг тодорхойлох', 'Баримтжуулах', 'Тест бичих'],
          a: 1,
          why: 'Эхлээд хэнтэй ярихаа мэдэх — stakeholder-уудыг тодорхойлно.',
        },
        {
          t: 'match',
          q: 'Товчлолыг утгатай нь холбо',
          pairs: [
            ['SRS', 'Software Requirements Specification'],
            ['URS', 'User Requirements Specification'],
            ['SysRS', 'System Requirements Specification'],
            ['UAT', 'User Acceptance Testing'],
            ['GA', 'General Availability'],
          ],
        },
        {
          t: 'tf',
          q: 'Non-functional шаардлагад гүйцэтгэл, аюулгүй байдал, чанарын стандарт ордог.',
          a: true,
          why: 'Тийм — performance, safety, security, quality standards.',
        },
        {
          t: 'order',
          q: 'Чанартай программ бүтээх 6 үйл явцыг эрэмбэл',
          items: ['Requirements gathering', 'Design', 'Coding for quality', 'Testing', 'Releases', 'Documenting'],
          why: 'Lesson 9-ийн дараалал.',
        },
      ],
    },
  ],
}
