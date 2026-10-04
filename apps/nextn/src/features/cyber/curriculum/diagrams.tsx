// Хичээлийн визуал диаграмууд — inline SVG (portal light palette).
// Responsive: viewBox + width 100%.

const C = {
  cspc: '#c41212',
  alt: '#111111',
  txt: '#111111',
  dim: '#6b675f',
  line: '#cfc9bd',
  bg: '#ffffff',
  ok: '#15803d',
  err: '#b91c1c',
  warn: '#b45309',
};

export type DiagramId =
  | 'tcp-handshake'
  | 'port-states'
  | 'kill-chain'
  | 'cia-triad'
  | 'mitm-arp'
  | 'sym-asym';

function Frame({ vb, children }: { vb: string; children: React.ReactNode }) {
  return (
    <svg viewBox={vb} width="100%" style={{ maxWidth: 640, display: 'block', margin: '0 auto', fontFamily: 'inherit' }} role="img">
      {children}
    </svg>
  );
}

function TcpHandshake() {
  return (
    <Frame vb="0 0 480 220">
      <text x="90" y="22" fill={C.cspc} fontSize="14" fontWeight="700" textAnchor="middle">Client</text>
      <text x="390" y="22" fill={C.alt} fontSize="14" fontWeight="700" textAnchor="middle">Server</text>
      <line x1="90" y1="30" x2="90" y2="200" stroke={C.line} strokeWidth="2" />
      <line x1="390" y1="30" x2="390" y2="200" stroke={C.line} strokeWidth="2" />
      {/* SYN */}
      <line x1="90" y1="60" x2="384" y2="90" stroke={C.cspc} strokeWidth="2" markerEnd="url(#a1)" />
      <text x="240" y="66" fill={C.txt} fontSize="12" textAnchor="middle">1. SYN</text>
      {/* SYN/ACK */}
      <line x1="390" y1="115" x2="96" y2="145" stroke={C.alt} strokeWidth="2" markerEnd="url(#a2)" />
      <text x="240" y="123" fill={C.txt} fontSize="12" textAnchor="middle">2. SYN / ACK</text>
      {/* ACK */}
      <line x1="90" y1="168" x2="384" y2="188" stroke={C.ok} strokeWidth="2" markerEnd="url(#a3)" />
      <text x="240" y="174" fill={C.txt} fontSize="12" textAnchor="middle">3. ACK → холбогдлоо</text>
      <defs>
        <marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.cspc} /></marker>
        <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.alt} /></marker>
        <marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.ok} /></marker>
      </defs>
    </Frame>
  );
}

function PortStates() {
  const items = [
    { s: 'open', c: C.ok, d: 'Үйлчилгээ сонсож байна (SYN/ACK)' },
    { s: 'closed', c: C.err, d: 'Хүрдэг ч сонсогчгүй (RST)' },
    { s: 'filtered', c: C.warn, d: 'Firewall хааж байна (хариугүй)' },
  ];
  return (
    <Frame vb="0 0 480 170">
      {items.map((it, i) => {
        const y = 15 + i * 50;
        return (
          <g key={it.s}>
            <rect x="15" y={y} width="110" height="38" rx="6" fill={C.bg} stroke={it.c} strokeWidth="1.5" />
            <text x="70" y={y + 24} fill={it.c} fontSize="14" fontWeight="700" textAnchor="middle">{it.s}</text>
            <text x="140" y={y + 24} fill={C.txt} fontSize="12">{it.d}</text>
          </g>
        );
      })}
    </Frame>
  );
}

function KillChain() {
  const steps = ['Recon', 'Weaponize', 'Deliver', 'Exploit', 'Install', 'C2', 'Actions'];
  return (
    <Frame vb="0 0 500 90">
      {steps.map((s, i) => {
        const x = 8 + i * 70;
        return (
          <g key={s}>
            <rect x={x} y="28" width="60" height="34" rx="6" fill={C.bg} stroke={i === 0 ? C.cspc : C.line} strokeWidth="1.5" />
            <text x={x + 30} y="49" fill={i === 0 ? C.cspc : C.txt} fontSize="10" fontWeight="600" textAnchor="middle">{s}</text>
            {i < steps.length - 1 && <line x1={x + 60} y1="45" x2={x + 70} y2="45" stroke={C.dim} strokeWidth="1.5" markerEnd="url(#kc)" />}
          </g>
        );
      })}
      <text x="250" y="18" fill={C.dim} fontSize="11" textAnchor="middle">Cyber Kill Chain (Lockheed Martin)</text>
      <defs><marker id="kc" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 Z" fill={C.dim} /></marker></defs>
    </Frame>
  );
}

function CiaTriad() {
  return (
    <Frame vb="0 0 360 220">
      <polygon points="180,25 320,190 40,190" fill="none" stroke={C.cspc} strokeWidth="2" />
      <text x="180" y="18" fill={C.cspc} fontSize="13" fontWeight="700" textAnchor="middle">Confidentiality</text>
      <text x="180" y="34" fill={C.dim} fontSize="10" textAnchor="middle">Нууцлал</text>
      <text x="330" y="205" fill={C.alt} fontSize="13" fontWeight="700" textAnchor="end">Integrity</text>
      <text x="330" y="219" fill={C.dim} fontSize="10" textAnchor="end">Бүрэн бүтэн</text>
      <text x="30" y="205" fill={C.ok} fontSize="13" fontWeight="700">Availability</text>
      <text x="30" y="219" fill={C.dim} fontSize="10">Хүртээмж</text>
      <text x="180" y="140" fill={C.txt} fontSize="12" fontWeight="700" textAnchor="middle">CIA</text>
    </Frame>
  );
}

function MitmArp() {
  return (
    <Frame vb="0 0 480 200">
      <rect x="20" y="80" width="90" height="42" rx="6" fill={C.bg} stroke={C.cspc} strokeWidth="1.5" />
      <text x="65" y="100" fill={C.cspc} fontSize="12" fontWeight="700" textAnchor="middle">Client</text>
      <text x="65" y="115" fill={C.dim} fontSize="9" textAnchor="middle">192.168.1.10</text>

      <rect x="370" y="80" width="90" height="42" rx="6" fill={C.bg} stroke={C.alt} strokeWidth="1.5" />
      <text x="415" y="100" fill={C.alt} fontSize="12" fontWeight="700" textAnchor="middle">Gateway</text>
      <text x="415" y="115" fill={C.dim} fontSize="9" textAnchor="middle">192.168.1.1</text>

      <rect x="195" y="150" width="90" height="42" rx="6" fill={C.bg} stroke={C.err} strokeWidth="1.5" />
      <text x="240" y="170" fill={C.err} fontSize="12" fontWeight="700" textAnchor="middle">Attacker</text>
      <text x="240" y="185" fill={C.dim} fontSize="9" textAnchor="middle">MITM (ARP spoof)</text>

      {/* traffic redirected through attacker */}
      <line x1="110" y1="101" x2="240" y2="150" stroke={C.err} strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#m1)" />
      <line x1="240" y1="150" x2="370" y2="101" stroke={C.err} strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#m1)" />
      <text x="240" y="60" fill={C.dim} fontSize="11" textAnchor="middle">Траффик халдагчаар дамжина</text>
      <line x1="110" y1="95" x2="370" y2="95" stroke={C.line} strokeWidth="1.5" strokeDasharray="2 4" />
      <defs><marker id="m1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.err} /></marker></defs>
    </Frame>
  );
}

function SymAsym() {
  return (
    <Frame vb="0 0 480 200">
      {/* symmetric */}
      <text x="120" y="22" fill={C.cspc} fontSize="12" fontWeight="700" textAnchor="middle">Symmetric (AES)</text>
      <rect x="20" y="35" width="70" height="34" rx="6" fill={C.bg} stroke={C.line} /><text x="55" y="57" fill={C.txt} fontSize="11" textAnchor="middle">Plain</text>
      <rect x="150" y="35" width="70" height="34" rx="6" fill={C.bg} stroke={C.line} /><text x="185" y="57" fill={C.txt} fontSize="11" textAnchor="middle">Cipher</text>
      <line x1="90" y1="52" x2="145" y2="52" stroke={C.cspc} strokeWidth="2" markerEnd="url(#s1)" />
      <text x="118" y="46" fill={C.dim} fontSize="9" textAnchor="middle">🔑 нэг түлхүүр</text>
      <text x="120" y="90" fill={C.dim} fontSize="10" textAnchor="middle">Хурдан · түлхүүр солилцох асуудалтай</text>

      {/* asymmetric */}
      <text x="120" y="128" fill={C.alt} fontSize="12" fontWeight="700" textAnchor="middle">Asymmetric (RSA)</text>
      <rect x="20" y="140" width="70" height="34" rx="6" fill={C.bg} stroke={C.line} /><text x="55" y="162" fill={C.txt} fontSize="11" textAnchor="middle">Plain</text>
      <rect x="150" y="140" width="70" height="34" rx="6" fill={C.bg} stroke={C.line} /><text x="185" y="162" fill={C.txt} fontSize="11" textAnchor="middle">Cipher</text>
      <line x1="90" y1="157" x2="145" y2="157" stroke={C.alt} strokeWidth="2" markerEnd="url(#s2)" />
      <text x="118" y="151" fill={C.dim} fontSize="9" textAnchor="middle">🔓 public түлхүүр</text>
      <text x="300" y="150" fill={C.txt} fontSize="11">Тайлах: 🔑 private түлхүүр</text>
      <text x="300" y="168" fill={C.dim} fontSize="10">Түлхүүр солилцоог шийднэ · удаан</text>

      <defs>
        <marker id="s1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.cspc} /></marker>
        <marker id="s2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.alt} /></marker>
      </defs>
    </Frame>
  );
}

export const DIAGRAMS: Record<DiagramId, { title: string; Comp: () => React.ReactElement }> = {
  'tcp-handshake': { title: 'TCP гурван шатт гар барьцаа (3-way handshake)', Comp: TcpHandshake },
  'port-states': { title: 'Nmap портын төлөв (open / closed / filtered)', Comp: PortStates },
  'kill-chain': { title: 'Cyber Kill Chain — халдлагын 7 үе шат', Comp: KillChain },
  'cia-triad': { title: 'CIA гурвал', Comp: CiaTriad },
  'mitm-arp': { title: 'ARP spoofing → MITM', Comp: MitmArp },
  'sym-asym': { title: 'Симметрик vs Асимметрик шифрлэлт', Comp: SymAsym },
};
