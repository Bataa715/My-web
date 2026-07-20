export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Transparent — the About page floats directly on the global 3D cosmos
     backdrop. (The old opaque bg-background here was hiding the canvas.) */
  return <div className="relative min-h-screen">{children}</div>;
}
