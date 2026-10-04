// CEH домэйнуудын хос хэл (Монгол + English) метадата.
// Quiz-ийн Domain төрөлтэй нэг мөр — асуултын сан болон сургалтын хөтөлбөрийг холбоно.

import type { Domain } from '@/features/cyber/quiz/questions';

export interface DomainMeta {
  id: Domain;
  icon: string;
  en: string; // CEH-ийн албан ёсны нэр (англиар)
  mn: string; // Монгол тайлбар нэр
  blurb: string; // товч тайлбар (монголоор)
}

export const DOMAIN_META: Record<Domain, DomainMeta> = {
  'Intro & Recon': {
    id: 'Intro & Recon', icon: '🔍', en: 'Footprinting & Reconnaissance', mn: 'Танилцуулга ба тагнуул',
    blurb: 'Ёс зүйн хакингийн үндэс, халдлагын үе шат, идэвхтэй/идэвхгүй тагнуул, OSINT.',
  },
  'Scanning & Enum': {
    id: 'Scanning & Enum', icon: '📡', en: 'Scanning & Enumeration', mn: 'Сканнердах ба тоолол',
    blurb: 'Nmap, порт сканнердах, TCP/IP, үйлчилгээ илрүүлэх, хэрэглэгч/нөөц задлах.',
  },
  'Vuln & System Hacking': {
    id: 'Vuln & System Hacking', icon: '💻', en: 'Vulnerability Analysis & System Hacking', mn: 'Эмзэг байдал ба систем эвдэлт',
    blurb: 'Эмзэг байдлын үнэлгээ, эрх өсгөх, нууц үг таах, exploit, мөр арчих.',
  },
  'Malware': {
    id: 'Malware', icon: '🦠', en: 'Malware Threats', mn: 'Хортой програм',
    blurb: 'Virus, worm, trojan, ransomware, rootkit, botnet ба анализ.',
  },
  'Sniffing & MITM': {
    id: 'Sniffing & MITM', icon: '🕵️', en: 'Sniffing & MITM', mn: 'Сонсох ба дундаас халдлага',
    blurb: 'Пакет барих, ARP/DNS spoofing, MITM, MAC flooding.',
  },
  'Social Engineering': {
    id: 'Social Engineering', icon: '🎭', en: 'Social Engineering', mn: 'Нийгмийн инженерчлэл',
    blurb: 'Phishing, pretexting, tailgating, хүний хүчин зүйлийг ашиглах.',
  },
  'DoS & Hijacking': {
    id: 'DoS & Hijacking', icon: '💥', en: 'DoS & Session Hijacking', mn: 'Үйлчилгээ таслах ба session булаах',
    blurb: 'DoS/DDoS, SYN flood, amplification, session hijacking.',
  },
  'IDS/FW & Web': {
    id: 'IDS/FW & Web', icon: '🛡️', en: 'IDS, Firewalls & Web Servers', mn: 'IDS, Firewall ба вэб сервер',
    blurb: 'Firewall, IDS/IPS, honeypot, WAF, вэб сервер халдлага ба evasion.',
  },
  'SQLi & Web Apps': {
    id: 'SQLi & Web Apps', icon: '🌐', en: 'Web Application Security & SQLi', mn: 'Вэб апп аюулгүй байдал ба SQLi',
    blurb: 'SQL injection, XSS, CSRF, SSRF, IDOR, OWASP Top 10.',
  },
  'Wireless & Mobile': {
    id: 'Wireless & Mobile', icon: '📶', en: 'Wireless & Mobile Security', mn: 'Утасгүй ба мобайл аюулгүй байдал',
    blurb: 'WEP/WPA2/WPA3, evil twin, deauth, мобайл эрсдэл, MDM.',
  },
  'Cloud & IoT': {
    id: 'Cloud & IoT', icon: '☁️', en: 'Cloud & IoT Security', mn: 'Cloud ба IoT аюулгүй байдал',
    blurb: 'Хуваалцсан хариуцлага, misconfiguration, IoT, container, IAM.',
  },
  'Cryptography': {
    id: 'Cryptography', icon: '🔐', en: 'Cryptography', mn: 'Криптограф',
    blurb: 'Симметрик/асимметрик, hash, PKI, TLS, дижитал гарын үсэг.',
  },
};

export function domainLabel(id: Domain, lang: 'both' | 'en' | 'mn'): string {
  const m = DOMAIN_META[id];
  if (lang === 'en') return m.en;
  if (lang === 'mn') return m.mn;
  return `${m.mn} · ${m.en}`;
}
