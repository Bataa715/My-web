'use client';

import ToolPageShell from '@/features/tools/ToolPageShell';
import { CURRICULA } from '@/features/language/curriculum';
import LanguageHub from '@/features/language/components/curriculum/LanguageHub';

export default function JapaneseToolsPage() {
  return (
    <ToolPageShell
      title="Япон хэл"
      description="Кана → дүрэм → үгсийн сан дарааллаар сур."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл' },
      ]}
    >
      <LanguageHub
        lang="japanese"
        intro="Япон хэлийг эхнээс нь сурч байгаа бол эхлээд кана үсгээ (хирагана, катакана) цээжил, дараа нь дүрмийн хичээлүүдээр өгүүлбэр бүтээж сур. Хичээл бүр ромажи уншлагатай."
        steps={[
          {
            id: 'kana',
            title: 'Кана үсэг',
            what: 'Хирагана ба катакана — бичих, таних, дасгал.',
            why: 'Бусад бүх хичээлийн үндэс. Эхлээд энийг сур.',
            href: '/tools/japanese/kana',
          },
          {
            id: 'grammar',
            title: 'Дүрэм',
            what: `JLPT N5 (анхан) ба N4 (дунд) шатны ${CURRICULA.japanese.lessons.length} хичээл.`,
            why: 'です/ます, бөөм, үйл үг, тэмдэг нэр, て-хэлбэр, нөхцөл, эелдэг хэл.',
            href: '/tools/japanese/grammar',
            grammar: true,
          },
          {
            id: 'vocabulary',
            title: 'Үгсийн сан',
            what: 'N5 түвшний ~150 үг бэлэн орсон; өөрийнхөө үгийг нэмж болно.',
            why: 'Карт, тест, тааруулах тоглоомоор давтана.',
            href: '/tools/japanese/vocabulary',
          },
        ]}
      />
    </ToolPageShell>
  );
}
