
import type { ProgrammingConcept, CheatSheetItem, ProgressItem } from '@/lib/types';

export const initialConcepts: Omit<ProgrammingConcept, 'id'>[] = [
  { title: "Variable", emoji: "📦", explanation: "A variable is a container for storing data values, like a number or a string." },
  { title: "Function", emoji: "🔧", explanation: "A function is a block of code designed to perform a particular task." },
  { title: "If/Else", emoji: "🤔", explanation: "Conditional statements used to perform different actions based on different conditions." },
  { title: "Loop", emoji: "🔄", explanation: "Loops can execute a block of code a number of times." },
  { title: "Array", emoji: "[]", explanation: "Arrays are used to store multiple values in a single variable." },
  { title: "Object", emoji: "{}", explanation: "Objects are variables too. But objects can contain many values as key-value pairs." },
];

export const initialCheatSheetItems: Omit<CheatSheetItem, 'id'>[] = [
    { title: "Arrow Function", snippet: "const myFunction = (param1, param2) => {\n  return param1 + param2;\n};" },
    { title: "Array.map()", snippet: "const newArray = oldArray.map(item => item * 2);" },
    { title: "Async/Await", snippet: "async function getData() {\n  const response = await fetch(url);\n  const data = await response.json();\n  return data;\n}" },
];

export const initialProgressItems: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>[] = [
    { label: "JavaScript Basics" },
    { label: "DOM Manipulation" },
    { label: "Asynchronous JavaScript (Promises, async/await)" },
    { label: "React Fundamentals" },
    { label: "State Management (e.g., Context, Redux)" },
    { label: "Next.js App Router" },
];
