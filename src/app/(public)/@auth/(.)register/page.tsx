import { Modal } from "@/components/Modal";
import { RegisterForm } from "@/components/auth/RegisterForm";

/**
 * Intercepting Route: /register als Modal-Overlay.
 * Wird aktiv wenn von der Landing Page per Link navigiert wird.
 * Direkte URL /register zeigt die Standalone-Seite.
 */
export default function RegisterModal() {
  return (
    <Modal>
      <RegisterForm isModal />
    </Modal>
  );
}
