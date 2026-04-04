/**
 * Public Layout — Umfasst Landing, Login, Register, Play.
 *
 * Parallel Route @auth ermoeglicht Intercepting Routes:
 * - Link-Klick von Landing → Login/Register als Modal
 * - Direkte URL → Normale Seite (Fallback)
 */

export default function PublicLayout({
  children,
  auth,
}: {
  children: React.ReactNode;
  auth: React.ReactNode;
}) {
  return (
    <>
      {children}
      {auth}
    </>
  );
}
