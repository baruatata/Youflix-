import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import { StoreProvider } from "./lib/store.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);

// Splash: sekunde 3 (inafifia yenyewe kwa CSS, hapa inaondolewa kabisa)
setTimeout(() => document.getElementById("splash")?.remove(), 3000);

// Offline: service worker (kwenye toleo la production tu)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
