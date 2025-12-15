export default function ReadingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative">{children}</div>;
}
