/**
 * Game layout - minimal wrapper
 * The GameNavbar is rendered inside GamePageClient for better access to game state
 */
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
