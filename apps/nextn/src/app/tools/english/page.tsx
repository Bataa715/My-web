'use client';

import ToolPageShell from '@/features/tools/ToolPageShell';
import { CURRICULA } from '@/features/language/curriculum';
import LanguageHub from '@/features/language/components/curriculum/LanguageHub';

export default function EnglishDashboardPage() {
  return (
    <ToolPageShell
      title="English"
      description="Англи хэлийг дүрэм → үг → дадлага дарааллаар сур."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Англи хэл' },
      ]}
    >
      <LanguageHub
        lang="english"
        intro="Шинээр эхэлж байгаа бол 1-р алхмаас эхлээд дарааллаар нь яв. Дүрэм бүрийн хичээл тайлбар, жишээ, богино дасгалтай; ахиц чинь энэ төхөөрөмж дээр хадгалагдана."
        steps={[
          {
            id: 'grammar',
            title: 'Дүрэм',
            what: `Анхан (A1–A2) ба дунд (B1–B2) шатны ${CURRICULA.english.lessons.length} хичээл.`,
            why: 'To be-ээс эхлээд цагууд, нөхцөл, хэв хүртэл — өгүүлбэр зөв бүтээх үндэс.',
            href: '/tools/english/grammar',
            grammar: true,
          },
          {
            id: 'vocabulary',
            title: 'Үгсийн сан',
            what: 'Өөрийн үгсийн санг нэмж, цээжилсэн үгээ тэмдэглэнэ.',
            why: 'Карт, тест, тааруулах тоглоомоор давтана.',
            href: '/tools/english/vocabulary',
          },
          {
            id: 'irregular-verbs',
            title: 'Дүрмийн бус үйл үг',
            what: 'go – went – gone гэх мэт 3 хэлбэрийг хайж, сонсож цээжилнэ.',
            why: 'Past Simple, Present Perfect-д заавал хэрэгтэй.',
            href: '/tools/english/irregular-verbs',
          },
          {
            id: 'mylingo',
            title: 'MyLingo — дасгал',
            what: 'Тоглоом маягийн түвшин тус бүрийн үг ба дүрмийн сорил.',
            why: 'Сурсан зүйлээ бататгах, түвшнээ шалгах.',
            href: '/tools/english/mylingo',
          },
        ]}
      />
    </ToolPageShell>
  );
}
