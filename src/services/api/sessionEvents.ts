// Tiny pub/sub so the API layer can announce "the backend rejected our
// session (401)" without importing React. AuthProvider subscribes and shows
// the session-expired UI.
type Listener = () => void;
const listeners = new Set<Listener>();

export const onSessionExpired = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitSessionExpired = () => listeners.forEach(l => l());
