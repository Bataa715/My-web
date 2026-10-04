'use client';

import dynamic from 'next/dynamic';

// localStorage-backed progress → client only
const FullStackApp = dynamic(() => import('@/features/fullstack/FullStackApp'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[200] bg-[#0b0f1c]" />,
});

export default function FullStackLearningPage() {
  return <FullStackApp />;
}
