export default function VocabularyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative">{children}</div>;
}
