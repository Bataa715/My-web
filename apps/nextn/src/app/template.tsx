/**
 * Re-mounts on every navigation, giving each page a gentle fade-in.
 * Opacity only (no transform) so `position: fixed/sticky` children keep working.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-300 motion-reduce:animate-none">
      {children}
    </div>
  );
}
