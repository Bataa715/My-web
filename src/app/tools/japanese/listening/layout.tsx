export default function ListeningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative">{children}</div>;
}
