'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TechIconProps {
  techName: string;
  className?: string;
}

// Map technology names to Simple Icons slug names
const techIconMap: Record<string, { slug: string; color: string }> = {
  // Frontend Frameworks & Libraries
  react: { slug: 'react', color: '61DAFB' },
  'react native': { slug: 'react', color: '61DAFB' },
  reactnative: { slug: 'react', color: '61DAFB' },
  'next.js': { slug: 'nextdotjs', color: 'FFFFFF' },
  nextjs: { slug: 'nextdotjs', color: 'FFFFFF' },
  vue: { slug: 'vuedotjs', color: '4FC08D' },
  'vue.js': { slug: 'vuedotjs', color: '4FC08D' },
  vuejs: { slug: 'vuedotjs', color: '4FC08D' },
  nuxt: { slug: 'nuxtdotjs', color: '00DC82' },
  'nuxt.js': { slug: 'nuxtdotjs', color: '00DC82' },
  nuxtjs: { slug: 'nuxtdotjs', color: '00DC82' },
  angular: { slug: 'angular', color: 'DD0031' },
  svelte: { slug: 'svelte', color: 'FF3E00' },
  sveltekit: { slug: 'svelte', color: 'FF3E00' },
  solid: { slug: 'solid', color: '2C4F7C' },
  solidjs: { slug: 'solid', color: '2C4F7C' },
  remix: { slug: 'remix', color: 'FFFFFF' },
  astro: { slug: 'astro', color: 'FF5D01' },
  gatsby: { slug: 'gatsby', color: '663399' },
  ember: { slug: 'emberdotjs', color: 'E04E39' },
  'ember.js': { slug: 'emberdotjs', color: 'E04E39' },
  'alpine.js': { slug: 'alpinedotjs', color: '8BC0D0' },
  alpinejs: { slug: 'alpinedotjs', color: '8BC0D0' },
  preact: { slug: 'preact', color: '673AB8' },
  qwik: { slug: 'qwik', color: '18B6F6' },
  htmx: { slug: 'htmx', color: '3366CC' },

  // Languages
  typescript: { slug: 'typescript', color: '3178C6' },
  javascript: { slug: 'javascript', color: 'F7DF1E' },
  python: { slug: 'python', color: '3776AB' },
  java: { slug: 'openjdk', color: 'FFFFFF' },
  kotlin: { slug: 'kotlin', color: '7F52FF' },
  swift: { slug: 'swift', color: 'F05138' },
  go: { slug: 'go', color: '00ADD8' },
  golang: { slug: 'go', color: '00ADD8' },
  rust: { slug: 'rust', color: 'FFFFFF' },
  c: { slug: 'c', color: 'A8B9CC' },
  'c++': { slug: 'cplusplus', color: '00599C' },
  cpp: { slug: 'cplusplus', color: '00599C' },
  'c#': { slug: 'csharp', color: '239120' },
  csharp: { slug: 'csharp', color: '239120' },
  php: { slug: 'php', color: '777BB4' },
  ruby: { slug: 'ruby', color: 'CC342D' },
  dart: { slug: 'dart', color: '0175C2' },
  scala: { slug: 'scala', color: 'DC322F' },
  elixir: { slug: 'elixir', color: '4B275F' },
  haskell: { slug: 'haskell', color: '5D4F85' },
  lua: { slug: 'lua', color: '2C2D72' },
  r: { slug: 'r', color: '276DC3' },
  perl: { slug: 'perl', color: '39457E' },
  clojure: { slug: 'clojure', color: '5881D8' },
  erlang: { slug: 'erlang', color: 'A90533' },
  julia: { slug: 'julia', color: '9558B2' },
  zig: { slug: 'zig', color: 'F7A41D' },
  solidity: { slug: 'solidity', color: '363636' },
  english: { slug: 'googletranslate', color: '4285F4' },
  japanese: { slug: 'googletranslate', color: 'EA4335' },

  // Data Analysis
  'data analysis': { slug: 'googleanalytics', color: 'E37400' },
  dataanalysis: { slug: 'googleanalytics', color: 'E37400' },

  // Backend Frameworks
  'node.js': { slug: 'nodedotjs', color: '339933' },
  nodejs: { slug: 'nodedotjs', color: '339933' },
  node: { slug: 'nodedotjs', color: '339933' },
  express: { slug: 'express', color: 'FFFFFF' },
  'express.js': { slug: 'express', color: 'FFFFFF' },
  expressjs: { slug: 'express', color: 'FFFFFF' },
  nestjs: { slug: 'nestjs', color: 'E0234E' },
  'nest.js': { slug: 'nestjs', color: 'E0234E' },
  fastify: { slug: 'fastify', color: 'FFFFFF' },
  hono: { slug: 'hono', color: 'E36002' },
  django: { slug: 'django', color: '092E20' },
  flask: { slug: 'flask', color: 'FFFFFF' },
  fastapi: { slug: 'fastapi', color: '009688' },
  spring: { slug: 'spring', color: '6DB33F' },
  'spring boot': { slug: 'springboot', color: '6DB33F' },
  springboot: { slug: 'springboot', color: '6DB33F' },
  laravel: { slug: 'laravel', color: 'FF2D20' },
  rails: { slug: 'rubyonrails', color: 'CC0000' },
  'ruby on rails': { slug: 'rubyonrails', color: 'CC0000' },
  rubyonrails: { slug: 'rubyonrails', color: 'CC0000' },
  '.net': { slug: 'dotnet', color: '512BD4' },
  dotnet: { slug: 'dotnet', color: '512BD4' },
  'asp.net': { slug: 'dotnet', color: '512BD4' },
  gin: { slug: 'gin', color: '00ADD8' },
  fiber: { slug: 'gofiber', color: '00ACD7' },
  actix: { slug: 'actix', color: 'FFFFFF' },
  phoenix: { slug: 'phoenixframework', color: 'FD4F00' },

  // Databases
  postgresql: { slug: 'postgresql', color: '4169E1' },
  postgres: { slug: 'postgresql', color: '4169E1' },
  mysql: { slug: 'mysql', color: '4479A1' },
  mongodb: { slug: 'mongodb', color: '47A248' },
  mongo: { slug: 'mongodb', color: '47A248' },
  redis: { slug: 'redis', color: 'DC382D' },
  sqlite: { slug: 'sqlite', color: '003B57' },
  mariadb: { slug: 'mariadb', color: '003545' },
  oracle: { slug: 'oracle', color: 'F80000' },
  cassandra: { slug: 'apachecassandra', color: '1287B1' },
  couchdb: { slug: 'couchdb', color: 'E42528' },
  neo4j: { slug: 'neo4j', color: '4581C3' },
  dynamodb: { slug: 'amazondynamodb', color: '4053D6' },
  cockroachdb: { slug: 'cockroachlabs', color: '6933FF' },
  planetscale: { slug: 'planetscale', color: 'FFFFFF' },
  neon: { slug: 'neon', color: '00E599' },
  turso: { slug: 'turso', color: '4FF8D2' },
  influxdb: { slug: 'influxdb', color: '22ADF6' },
  timescale: { slug: 'timescale', color: 'FDB515' },

  // Cloud & DevOps
  firebase: { slug: 'firebase', color: 'FFCA28' },
  supabase: { slug: 'supabase', color: '3FCF8E' },
  aws: { slug: 'amazonaws', color: 'FF9900' },
  'amazon web services': { slug: 'amazonaws', color: 'FF9900' },
  gcp: { slug: 'googlecloud', color: '4285F4' },
  'google cloud': { slug: 'googlecloud', color: '4285F4' },
  azure: { slug: 'microsoftazure', color: '0078D4' },
  microsoft: { slug: 'microsoft', color: 'FFFFFF' },
  'microsoft 365': { slug: 'microsoft365', color: 'FFFFFF' },
  microsoft365: { slug: 'microsoft365', color: 'FFFFFF' },
  'power bi': { slug: 'powerbi', color: 'F2C811' },
  powerbi: { slug: 'powerbi', color: 'F2C811' },
  'microsoft excel': { slug: 'microsoftexcel', color: '217346' },
  excel: { slug: 'microsoftexcel', color: '217346' },
  'microsoft word': { slug: 'microsoftword', color: '2B579A' },
  word: { slug: 'microsoftword', color: '2B579A' },
  'microsoft powerpoint': { slug: 'microsoftpowerpoint', color: 'B7472A' },
  powerpoint: { slug: 'microsoftpowerpoint', color: 'B7472A' },
  digitalocean: { slug: 'digitalocean', color: '0080FF' },
  linode: { slug: 'linode', color: '00A95C' },
  heroku: { slug: 'heroku', color: '430098' },
  vercel: { slug: 'vercel', color: 'FFFFFF' },
  netlify: { slug: 'netlify', color: '00C7B7' },
  cloudflare: { slug: 'cloudflare', color: 'F38020' },
  railway: { slug: 'railway', color: 'FFFFFF' },
  render: { slug: 'render', color: '46E3B7' },
  'fly.io': { slug: 'flydotio', color: '8B5CF6' },
  flyio: { slug: 'flydotio', color: '8B5CF6' },

  // Containers & Orchestration
  docker: { slug: 'docker', color: '2496ED' },
  kubernetes: { slug: 'kubernetes', color: '326CE5' },
  k8s: { slug: 'kubernetes', color: '326CE5' },
  podman: { slug: 'podman', color: '892CA0' },
  helm: { slug: 'helm', color: '0F1689' },
  rancher: { slug: 'rancher', color: '0075A8' },
  openshift: { slug: 'redhatopenshift', color: 'EE0000' },

  // Infrastructure & CI/CD
  terraform: { slug: 'terraform', color: '7B42BC' },
  ansible: { slug: 'ansible', color: 'EE0000' },
  pulumi: { slug: 'pulumi', color: '8A3391' },
  jenkins: { slug: 'jenkins', color: 'D24939' },
  'github actions': { slug: 'githubactions', color: '2088FF' },
  githubactions: { slug: 'githubactions', color: '2088FF' },
  'gitlab ci': { slug: 'gitlab', color: 'FC6D26' },
  circleci: { slug: 'circleci', color: '343434' },
  'travis ci': { slug: 'travisci', color: '3EAAAF' },
  travisci: { slug: 'travisci', color: '3EAAAF' },
  argo: { slug: 'argo', color: 'EF7B4D' },
  argocd: { slug: 'argo', color: 'EF7B4D' },

  // CSS & Styling
  'tailwind css': { slug: 'tailwindcss', color: '06B6D4' },
  tailwindcss: { slug: 'tailwindcss', color: '06B6D4' },
  tailwind: { slug: 'tailwindcss', color: '06B6D4' },
  css: { slug: 'css3', color: '1572B6' },
  css3: { slug: 'css3', color: '1572B6' },
  sass: { slug: 'sass', color: 'CC6699' },
  scss: { slug: 'sass', color: 'CC6699' },
  less: { slug: 'less', color: '1D365D' },
  'styled-components': { slug: 'styledcomponents', color: 'DB7093' },
  styledcomponents: { slug: 'styledcomponents', color: 'DB7093' },
  emotion: { slug: 'emotion', color: 'C43BAD' },
  bootstrap: { slug: 'bootstrap', color: '7952B3' },
  'material ui': { slug: 'mui', color: '007FFF' },
  materialui: { slug: 'mui', color: '007FFF' },
  mui: { slug: 'mui', color: '007FFF' },
  'chakra ui': { slug: 'chakraui', color: '319795' },
  chakraui: { slug: 'chakraui', color: '319795' },
  'ant design': { slug: 'antdesign', color: '0170FE' },
  antdesign: { slug: 'antdesign', color: '0170FE' },
  radix: { slug: 'radixui', color: 'FFFFFF' },
  'radix ui': { slug: 'radixui', color: 'FFFFFF' },
  shadcn: { slug: 'shadcnui', color: 'FFFFFF' },
  'shadcn/ui': { slug: 'shadcnui', color: 'FFFFFF' },

  // HTML & Markup
  html: { slug: 'html5', color: 'E34F26' },
  html5: { slug: 'html5', color: 'E34F26' },
  markdown: { slug: 'markdown', color: 'FFFFFF' },
  mdx: { slug: 'mdx', color: '1B1F24' },

  // Build Tools
  vite: { slug: 'vite', color: '646CFF' },
  webpack: { slug: 'webpack', color: '8DD6F9' },
  rollup: { slug: 'rollupdotjs', color: 'EC4A3F' },
  esbuild: { slug: 'esbuild', color: 'FFCF00' },
  turbopack: { slug: 'turborepo', color: 'EF4444' },
  turborepo: { slug: 'turborepo', color: 'EF4444' },
  parcel: { slug: 'parcel', color: '21374B' },
  bun: { slug: 'bun', color: 'FBF0DF' },
  deno: { slug: 'deno', color: 'FFFFFF' },
  pnpm: { slug: 'pnpm', color: 'F69220' },
  npm: { slug: 'npm', color: 'CB3837' },
  yarn: { slug: 'yarn', color: '2C8EBB' },

  // Testing
  jest: { slug: 'jest', color: 'C21325' },
  vitest: { slug: 'vitest', color: '6E9F18' },
  cypress: { slug: 'cypress', color: '17202C' },
  playwright: { slug: 'playwright', color: '2EAD33' },
  selenium: { slug: 'selenium', color: '43B02A' },
  mocha: { slug: 'mocha', color: '8D6748' },
  jasmine: { slug: 'jasmine', color: '8A4182' },
  pytest: { slug: 'pytest', color: '0A9EDC' },
  'testing library': { slug: 'testinglibrary', color: 'E33332' },
  testinglibrary: { slug: 'testinglibrary', color: 'E33332' },
  storybook: { slug: 'storybook', color: 'FF4785' },

  // Version Control
  git: { slug: 'git', color: 'F05032' },
  github: { slug: 'github', color: 'FFFFFF' },
  gitlab: { slug: 'gitlab', color: 'FC6D26' },
  bitbucket: { slug: 'bitbucket', color: '0052CC' },

  // API & Data
  graphql: { slug: 'graphql', color: 'E10098' },
  apollo: { slug: 'apollographql', color: '311C87' },
  'apollo graphql': { slug: 'apollographql', color: '311C87' },
  rest: { slug: 'openapiinitiative', color: '6BA539' },
  'rest api': { slug: 'openapiinitiative', color: '6BA539' },
  trpc: { slug: 'trpc', color: '2596BE' },
  grpc: { slug: 'grpc', color: '4285F4' },
  swagger: { slug: 'swagger', color: '85EA2D' },
  postman: { slug: 'postman', color: 'FF6C37' },
  insomnia: { slug: 'insomnia', color: '4000BF' },

  // ORMs & Database Tools
  prisma: { slug: 'prisma', color: '2D3748' },
  drizzle: { slug: 'drizzle', color: 'C5F74F' },
  typeorm: { slug: 'typeorm', color: 'FE0803' },
  sequelize: { slug: 'sequelize', color: '52B0E7' },
  mongoose: { slug: 'mongoose', color: '880000' },

  // Mobile
  flutter: { slug: 'flutter', color: '02569B' },
  expo: { slug: 'expo', color: 'FFFFFF' },
  ionic: { slug: 'ionic', color: '3880FF' },
  capacitor: { slug: 'capacitor', color: '119EFF' },
  android: { slug: 'android', color: '3DDC84' },
  ios: { slug: 'apple', color: 'FFFFFF' },
  apple: { slug: 'apple', color: 'FFFFFF' },
  xcode: { slug: 'xcode', color: '147EFB' },
  'android studio': { slug: 'androidstudio', color: '3DDC84' },
  androidstudio: { slug: 'androidstudio', color: '3DDC84' },

  // State Management
  redux: { slug: 'redux', color: '764ABC' },
  zustand: { slug: 'zustand', color: '764ABC' },
  mobx: { slug: 'mobx', color: 'FF9955' },
  recoil: { slug: 'recoil', color: '3578E5' },
  jotai: { slug: 'jotai', color: 'FFFFFF' },
  xstate: { slug: 'xstate', color: '2C3E50' },
  pinia: { slug: 'pinia', color: 'FFD859' },
  vuex: { slug: 'vuex', color: '4FC08D' },

  // Auth & Security
  auth0: { slug: 'auth0', color: 'EB5424' },
  clerk: { slug: 'clerk', color: '6C47FF' },
  nextauth: { slug: 'nextdotjs', color: 'FFFFFF' },
  passport: { slug: 'passport', color: '34E27A' },
  oauth: { slug: 'oauth', color: 'FFFFFF' },
  jwt: { slug: 'jsonwebtokens', color: 'FFFFFF' },
  keycloak: { slug: 'keycloak', color: '4D4D4D' },

  // Message Queues & Streaming
  kafka: { slug: 'apachekafka', color: '231F20' },
  rabbitmq: { slug: 'rabbitmq', color: 'FF6600' },
  nats: { slug: 'nats', color: '27AAE1' },
  zeromq: { slug: 'zeromq', color: 'DF0000' },

  // Search & Analytics
  elasticsearch: { slug: 'elasticsearch', color: '005571' },
  algolia: { slug: 'algolia', color: '003DFF' },
  meilisearch: { slug: 'meilisearch', color: 'FF5CAA' },
  typesense: { slug: 'typesense', color: 'D52C5E' },

  // Monitoring & Observability
  prometheus: { slug: 'prometheus', color: 'E6522C' },
  grafana: { slug: 'grafana', color: 'F46800' },
  datadog: { slug: 'datadog', color: '632CA6' },
  sentry: { slug: 'sentry', color: '362D59' },
  newrelic: { slug: 'newrelic', color: '008C99' },
  splunk: { slug: 'splunk', color: '000000' },
  elastic: { slug: 'elastic', color: '005571' },
  logstash: { slug: 'logstash', color: '005571' },
  kibana: { slug: 'kibana', color: '005571' },

  // Design & Prototyping
  figma: { slug: 'figma', color: 'F24E1E' },
  sketch: { slug: 'sketch', color: 'F7B500' },
  framer: { slug: 'framer', color: '0055FF' },
  'adobe xd': { slug: 'adobexd', color: 'FF61F6' },
  adobexd: { slug: 'adobexd', color: 'FF61F6' },
  invision: { slug: 'invision', color: 'FF3366' },
  canva: { slug: 'canva', color: '00C4CC' },
  zeplin: { slug: 'zeplin', color: 'FDBD39' },

  // Payment & E-commerce
  stripe: { slug: 'stripe', color: '008CDD' },
  paypal: { slug: 'paypal', color: '00457C' },
  shopify: { slug: 'shopify', color: '7AB55C' },
  woocommerce: { slug: 'woocommerce', color: '96588A' },
  square: { slug: 'square', color: '3E4348' },

  // CMS & Content
  wordpress: { slug: 'wordpress', color: '21759B' },
  contentful: { slug: 'contentful', color: '2478CC' },
  sanity: { slug: 'sanity', color: 'F03E2F' },
  strapi: { slug: 'strapi', color: '4945FF' },
  ghost: { slug: 'ghost', color: '15171A' },
  directus: { slug: 'directus', color: '263238' },
  payload: { slug: 'payloadcms', color: 'FFFFFF' },
  keystonejs: { slug: 'keystonejs', color: '166BFF' },

  // AI & ML
  openai: { slug: 'openai', color: 'FFFFFF' },
  chatgpt: { slug: 'openai', color: '74AA9C' },
  tensorflow: { slug: 'tensorflow', color: 'FF6F00' },
  pytorch: { slug: 'pytorch', color: 'EE4C2C' },
  langchain: { slug: 'langchain', color: '1C3C3C' },
  huggingface: { slug: 'huggingface', color: 'FFD21E' },
  'hugging face': { slug: 'huggingface', color: 'FFD21E' },
  'scikit-learn': { slug: 'scikitlearn', color: 'F7931E' },
  opencv: { slug: 'opencv', color: '5C3EE8' },
  jupyter: { slug: 'jupyter', color: 'F37626' },
  pandas: { slug: 'pandas', color: '150458' },
  numpy: { slug: 'numpy', color: '013243' },
  'data analysis': { slug: 'googleanalytics', color: 'E37400' },
  dataanalysis: { slug: 'googleanalytics', color: 'E37400' },

  // Storage & CDN
  minio: { slug: 'minio', color: 'C72E49' },
  s3: { slug: 'amazons3', color: '569A31' },
  'amazon s3': { slug: 'amazons3', color: '569A31' },
  cloudinary: { slug: 'cloudinary', color: '3448C5' },
  uploadthing: { slug: 'uploadthing', color: 'F5424E' },
  imgix: { slug: 'imgix', color: 'FF5300' },

  // Game Development
  unity: { slug: 'unity', color: 'FFFFFF' },
  unreal: { slug: 'unrealengine', color: '0E1128' },
  'unreal engine': { slug: 'unrealengine', color: '0E1128' },
  godot: { slug: 'godotengine', color: '478BF0' },
  phaser: { slug: 'phaser', color: '8BC500' },
  'three.js': { slug: 'threedotjs', color: 'FFFFFF' },
  threejs: { slug: 'threedotjs', color: 'FFFFFF' },

  // Blockchain & Web3
  ethereum: { slug: 'ethereum', color: '3C3C3D' },
  solana: { slug: 'solana', color: '9945FF' },
  polygon: { slug: 'polygon', color: '8247E5' },
  web3: { slug: 'web3dotjs', color: 'F16822' },
  'web3.js': { slug: 'web3dotjs', color: 'F16822' },
  ethers: { slug: 'ethers', color: '2535A0' },
  hardhat: { slug: 'hardhat', color: 'F3DF49' },
  foundry: { slug: 'foundry', color: 'FFA500' },

  // Linux & OS
  linux: { slug: 'linux', color: 'FCC624' },
  ubuntu: { slug: 'ubuntu', color: 'E95420' },
  debian: { slug: 'debian', color: 'A81D33' },
  fedora: { slug: 'fedora', color: '51A2DA' },
  centos: { slug: 'centos', color: '262577' },
  'arch linux': { slug: 'archlinux', color: '1793D1' },
  archlinux: { slug: 'archlinux', color: '1793D1' },
  alpine: { slug: 'alpinelinux', color: '0D597F' },
  windows: { slug: 'windows', color: '0078D4' },
  macos: { slug: 'macos', color: 'FFFFFF' },

  // IDEs & Editors
  vscode: { slug: 'visualstudiocode', color: '007ACC' },
  'visual studio code': { slug: 'visualstudiocode', color: '007ACC' },
  intellij: { slug: 'intellijidea', color: 'FFFFFF' },
  'intellij idea': { slug: 'intellijidea', color: 'FFFFFF' },
  webstorm: { slug: 'webstorm', color: '00CDD7' },
  pycharm: { slug: 'pycharm', color: '21D789' },
  vim: { slug: 'vim', color: '019733' },
  neovim: { slug: 'neovim', color: '57A143' },
  'sublime text': { slug: 'sublimetext', color: 'FF9800' },
  sublimetext: { slug: 'sublimetext', color: 'FF9800' },
  atom: { slug: 'atom', color: '66595C' },
  cursor: { slug: 'cursor', color: 'FFFFFF' },

  // Animation & Graphics
  'framer motion': { slug: 'framer', color: '0055FF' },
  framermotion: { slug: 'framer', color: '0055FF' },
  gsap: { slug: 'greensock', color: '88CE02' },
  lottie: { slug: 'lottiefiles', color: '00DDB3' },
  d3: { slug: 'd3dotjs', color: 'F9A03C' },
  'd3.js': { slug: 'd3dotjs', color: 'F9A03C' },
  'chart.js': { slug: 'chartdotjs', color: 'FF6384' },
  chartjs: { slug: 'chartdotjs', color: 'FF6384' },

  // Communication
  'socket.io': { slug: 'socketdotio', color: '010101' },
  socketio: { slug: 'socketdotio', color: '010101' },
  pusher: { slug: 'pusher', color: '300D4F' },
  twilio: { slug: 'twilio', color: 'F22F46' },
  sendgrid: { slug: 'sendgrid', color: '1A82E2' },
  resend: { slug: 'resend', color: 'FFFFFF' },
  mailchimp: { slug: 'mailchimp', color: 'FFE01B' },

  // Misc
  electron: { slug: 'electron', color: '47848F' },
  tauri: { slug: 'tauri', color: 'FFC131' },
  webassembly: { slug: 'webassembly', color: '654FF0' },
  wasm: { slug: 'webassembly', color: '654FF0' },
  pwa: { slug: 'pwa', color: '5A0FC8' },
  nginx: { slug: 'nginx', color: '009639' },
  apache: { slug: 'apache', color: 'D22128' },
  caddy: { slug: 'caddy', color: '00ADD8' },
  traefik: { slug: 'traefik', color: '24A1C1' },
  vault: { slug: 'vault', color: 'FFEC6E' },
  consul: { slug: 'consul', color: 'F24C53' },
};

const TechIcon = ({ techName, className }: TechIconProps) => {
  const techKey = techName.toLowerCase();
  const tech = techIconMap[techKey];
  const [imageError, setImageError] = useState(false);

  // Special handling for language flags
  const languageFlags: Record<string, string> = {
    english: '🇬🇧',
    japanese: '🇯🇵',
  };

  // Check if it's a language with a flag
  if (languageFlags[techKey]) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden shadow-lg',
                className
              )}
            >
              <span className="text-2xl leading-none">
                {languageFlags[techKey]}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{techName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Simple Icons CDN URL
  const iconUrl = tech
    ? `https://cdn.simpleicons.org/${tech.slug}/${tech.color}`
    : null;

  if (!iconUrl || imageError) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-900',
                className
              )}
            >
              <span className="text-xs font-bold text-neutral-300">
                {techName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{techName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-black/50 p-1.5 overflow-hidden',
              className
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconUrl}
              alt={techName}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{techName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TechIcon;
