'use client';

import MaterialManager from '@/components/shared/MaterialManager';

export default function ListeningPage() {
  return (
    <MaterialManager
      collectionName="japaneseListening"
      pageTitle="Сонсох"
      pageDescription="Сонсох чадвараа сайжруулах дасгал, материалууд."
      dialogTitle="Шинэ сонсох материал нэмэх"
      dialogDescription="Материалын гарчиг, агуулга (жишээ нь, transcript), болон эх сурвалжийг оруулна уу."
    />
  );
}
