import type { EnglishWord, GrammarRule } from '@/lib/types';

export const initialEnglishWords: Omit<EnglishWord, 'id' | 'memorized' | 'favorite'>[] = [
  { word: 'apple', translation: 'алим', definition: 'A round fruit with firm, white flesh and a green or red skin.' },
  { word: 'book', translation: 'ном', definition: 'A written or printed work consisting of pages glued or sewn together along one side and bound in covers.' },
  { word: 'car', translation: 'машин', definition: 'A road vehicle, typically with four wheels, powered by an internal combustion engine or electric motor and able to carry a small number of people.' },
  { word: 'dog', translation: 'нохой', definition: 'A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, nonretractable claws, and a barking, howling, or whining voice.' },
  { word: 'house', translation: 'байшин', definition: 'A building for human habitation, especially one that is lived in by a family or small group of people.' },
  { word: 'computer', translation: 'компьютер', definition: 'An electronic device for storing and processing data, typically in binary form, according to instructions given to it in a variable program.' },
  { word: 'water', translation: 'ус', definition: 'A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain and is the basis of the fluids of living organisms.' },
  { word: 'friend', translation: 'найз', definition: 'A person with whom one has a bond of mutual affection, typically one exclusive of sexual or family relations.' },
  { word: 'work', translation: 'ажил', definition: 'Activity involving mental or physical effort done in order to achieve a purpose or result.' },
  { word: 'school', translation: 'сургууль', definition: 'An institution for educating children.' },
];

export const initialEnglishRule: Omit<GrammarRule, 'id' | 'createdAt'> = {
  title: "Present Simple Tense",
  category: "Tense",
  introduction: "Тогтмол давтагддаг үйлдэл, ерөнхий үнэн, хуваарь зэргийг илэрхийлэхэд хэрэглэгддэг англи хэлний хамгийн энгийн бөгөөд чухал цаг.",
  usage: [
    { condition: "Тогтмол давтагддаг, зуршил болсон үйлдэл", example: "I drink coffee every morning." },
    { condition: "Байгалийн хууль, ерөнхий үнэн баримт", example: "The Earth goes around the Sun." },
    { condition: "Хуваарийн дагуух үйл явдал (галт тэрэг, хичээл)", example: "The train leaves at 8 AM." }
  ],
  form: {
    regular: "Ихэнх үйл үгэнд **-s** залгана. Жишээ: work -> work**s**, eat -> eat**s**.\n\n-s, -ss, -sh, -ch, -x, -o-өөр төгссөн бол **-es** залгана. Жишээ: watch -> watch**es**, go -> go**es**.\n\nГийгүүлэгч + y-ээр төгссөн бол 'y' үсгийг 'i' болгож **-es** залгана. Жишээ: study -> stud**ies**.",
    irregular: "`Have` -> `has`\n\n`Be` үйл үг нь субъектээс хамаарч `am, is, are` болж хувирдаг."
  },
  structure: {
    positive: {
      formula: "| Subject | Verb (s/es) | ... |\n|---|---|---|\n| I / You / We / They | work | late. |\n| He / She / It | work**s** | late. |",
      examples: ["She plays the piano.", "They live in Mongolia."]
    },
    negative: {
      formula: "| Subject | do/does + not | Verb (base) | ... |\n|---|---|---|---|\n| I / You / We / They | do not (don't) | work | late. |\n| He / She / It | does not (doesn't) | work | late. |",
      examples: ["He doesn’t eat meat.", "We don't watch TV."]
    },
    question: {
      formula: "| Do/Does | Subject | Verb (base) | ...? |\n|---|---|---|---|\n| Do | I / you / we / they | work | late? |\n| Does | he / she / it | work | late? |",
      examples: ["Do you play tennis?", "Does she like coffee?"]
    }
  },
  timeExpressions: [
    { word: "always", translation: "үргэлж" },
    { word: "usually", translation: "ихэвчлэн" },
    { word: "often", translation: "байнга" },
    { word: "sometimes", translation: "заримдаа" },
    { word: "never", translation: "хэзээ ч" },
    { word: "every day/week/year", translation: "өдөр/долоо хоног/жил бүр" }
  ],
  practice: [
    {
      question: "She ____ to school every day.",
      options: ["go", "goes", "is going"],
      correctAnswer: "goes",
      explanation: "“She” гэдэг нь “he/she/it” тул үйл үгэнд “-es” нэмэгдэнэ: go → goes"
    },
    {
      question: "I ____ breakfast at 7 AM.",
      options: ["has", "is having", "have"],
      correctAnswer: "have",
      explanation: "“I” гэх үед үйл үг үндсэн хэлбэрээрээ хэрэглэгдэнэ. “has” зөвхөн he/she/it-д хэрэглэгдэнэ."
    },
    {
      question: "____ they live in Paris?",
      options: ["Do", "Does", "Are"],
      correctAnswer: "Do",
      explanation: "“They” бол олон тооны субъект тул \"Do\" туслах үйл үг ашиглана. “Does” зөвхөн he/she/it-д."
    },
    {
      question: "My brother ____ football on Sundays.",
      options: ["play", "plays", "is playing"],
      correctAnswer: "plays",
      explanation: "“My brother” нь “he” гэсэнтэй ижил тул “play” → “plays” болно."
    },
    {
      question: "He ____ like chocolate.",
      options: ["don't", "doesn't", "isn't"],
      correctAnswer: "doesn't",
      explanation: "“He” дээр үгүйсгэсэн хэлбэрт “doesn’t” хэрэглэнэ. Үйл үг “like” үндсэн хэлбэрээрээ байна."
    }
  ]
};
