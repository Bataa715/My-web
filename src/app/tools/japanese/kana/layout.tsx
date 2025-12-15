export default function KanaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative">{children}</div>;
}
