'use client';

import { AOT_IMAGES } from '@/lib/aot-images';

export default function AotBackground() {
  return (
    <div aria-hidden className="aot-bg">
      <div
        className="aot-bg__photo"
        style={{ backgroundImage: `url(${AOT_IMAGES.portal})` }}
      />
    </div>
  );
}
