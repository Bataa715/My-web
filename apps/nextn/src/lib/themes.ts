export type Theme = {
  name: string;
  primary: string;
};

/** Single unified cosmos theme — the old multi-theme switcher was removed. */
export const themes: Theme[] = [
  { name: 'default', primary: '217 100% 68%' },
];
