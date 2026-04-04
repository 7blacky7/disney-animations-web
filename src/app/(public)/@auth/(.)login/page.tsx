import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * Intercepting Route: /login als Modal-Overlay.
 * Wird aktiv wenn von der Landing Page per Link navigiert wird.
 * Direkte URL /login zeigt die Standalone-Seite.
 */
export default function LoginModal() {
  return (
    <Modal>
      <LoginForm isModal />
    </Modal>
  );
}
