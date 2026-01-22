'use client';

import MaterialManager from '@/components/shared/MaterialManager';

export default function ReadingPage() {
  return (
    <MaterialManager
      collectionName="japaneseReading"
      pageTitle="Унших"
      pageDescription="Унших чадвараа сайжруулах текст, материалууд."
      dialogTitle="Шинэ унших материал нэмэх"
      dialogDescription="Материалын гарчиг, унших эх, болон эх сурвалжийг оруулна уу."
    />
  );
}
