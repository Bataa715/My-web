/**
 * Single visual identity: Attack on Titan official-site look
 * (hunter green · worn amber · parchment over forest charcoal).
 */
export type PaletteId = 'aot';

export interface PaletteMeta {
  id: PaletteId;
  label: string;
  description: string;
  swatch: [string, string];
}

export const DEFAULT_PALETTE: PaletteId = 'aot';

export const palettes: PaletteMeta[] = [
  {
    id: 'aot',
    label: '進撃の巨人',
    description: 'Attack on Titan',
    swatch: ['#3fae76', '#cf8a3e'],
  },
];

export function isPaletteId(v: unknown): v is PaletteId {
  return v === 'aot';
}

export type Theme = { name: string; primary: string };
export const themes: Theme[] = [{ name: 'default', primary: '152 44% 46%' }];
