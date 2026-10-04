'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const homeTools = [
  {
    id: 'english',
    title: 'Англи хэл',
    description: 'Үг сурах · Дүрэм · Дасгал',
    href: '/tools/english',
    tag: 'LANGUAGE',
  },
  {
    id: 'japanese',
    title: 'Япон хэл',
    description: 'Hiragana · Katakana · Kanji',
    href: '/tools/japanese',
    tag: 'LANGUAGE',
  },
  {
    id: 'programming',
    title: 'Програмчлал',
    description: 'Алгоритм · HTML · JS',
    href: '/tools/programming',
    tag: 'CODE',
  },
  {
    id: 'todo',
    title: 'Todo List',
    description: 'Хийх ажил · Тэмдэглэл',
    href: '/tools/todo',
    tag: 'WORK',
  },
  {
    id: 'fitness',
    title: 'Fitness',
    description: 'Дасгал · Биеийн жин',
    href: '/tools/fitness',
    tag: 'BODY',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro',
    description: 'Төвлөрөл · 25 минут',
    href: '/tools/pomodoro',
    tag: 'FOCUS',
  },
  {
    id: 'finance',
    title: 'Санхүү',
    description: 'Орлого · Зарлага',
    href: '/tools/finance',
    tag: 'MONEY',
  },
];

export default function ToolsSection() {
  return (
    <section
      id="tools"
      data-section="tools"
      className="relative scroll-mt-24 bg-[#f3f1ee] px-4 pb-24 pt-10 text-[#111] sm:px-8"
    >
      <h2 className="portal-title">Tools</h2>
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
        {homeTools.map(tool => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group flex items-start justify-between gap-4 border border-[#111] px-5 py-6 transition-colors hover:border-[#c41212]"
          >
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
                {tool.tag}
              </span>
              <span className="mt-2 block text-lg">{tool.title}</span>
              <span className="mt-1 block text-xs text-[#111]/50">
                {tool.description}
              </span>
            </span>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
