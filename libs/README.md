# Shared Libraries

Энэ фолдер нь ирээдүйд хэрэглэгдэх shared libraries-д зориулагдсан.

## Ирээдүйн төлөвлөгөө

```
libs/
├── ui/                 # Shared UI components
├── utils/              # Utility functions
├── types/              # TypeScript types
└── firebase/           # Firebase shared logic
```

## Library үүсгэх

```bash
nx g @nx/js:lib ui --directory=libs/ui
```
