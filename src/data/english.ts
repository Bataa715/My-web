import type { EnglishWord } from '@/lib/types';

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
