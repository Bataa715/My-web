'use client';

import Link from 'next/link';
import { AOT_IMAGES } from '@/lib/aot-images';

interface AuthShellProps {
  title: string;
  subtitle: string;
  switchLabel: string;
  switchHref: string;
  switchCta: string;
  children: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  switchLabel,
  switchHref,
  switchCta,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f3f1ee] text-[#111]">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${AOT_IMAGES.portal})` }}
      />

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center">
            <Link
              href="/"
              className="brand-mark relative text-4xl text-[#111] sm:text-5xl"
            >
              進撃の巨人
              <span
                aria-hidden
                className="absolute left-[-4%] right-[-4%] top-[52%] h-[2px] bg-[#c41212]"
              />
            </Link>
          </div>

          <div className="border border-[#111] bg-[#f3f1ee]/90 px-6 py-8 sm:px-8">
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-[#111]/55">{subtitle}</p>
            </div>

            {children}

            <div className="mt-6 border-t border-[#111]/20 pt-5 text-center text-sm text-[#111]/55">
              {switchLabel}{' '}
              <Link href={switchHref} className="font-semibold text-[#c41212]">
                {switchCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
