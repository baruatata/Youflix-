import { useEffect, useState } from "react";
import { useStore } from "./store.jsx";
import { fmtPhone } from "./utils.js";

const dateText = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
};

export default function Settings({ onLogin }) {
  const { t, me, logout, state, notify } = useStore();
  const [cacheBusy, setCacheBusy] = useState(false);

  const clearYouflixCache = async () => {
    if (cacheBusy) return;
    setCacheBusy(true);
    try {
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("youflix-react-")).map((key) => window.caches.delete(key)));
      }
      notify("Cache ya Youflix imesafishwa. Inasasisha maudhui...");
      window.location.reload();
    } catch (error) {
      setCacheBusy(false);
      notify("Imeshindikana kusafisha cache. Tafadhali jaribu tena.");
    }
  };
  const sub = state.subscription;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const startsAt = sub?.starts_at ? new Date(sub.starts_at).getTime() : null;
  const endsAt = sub?.ends_at ? new Date(sub.ends_at).getTime() : null;
  const validStart = startsAt === null || Number.isFinite(startsAt) && startsAt <= now;
  const validEnd = endsAt !== null && Number.isFinite(endsAt);
  const active = !!sub && sub.status === "active" && validStart && validEnd && endsAt > now;
  const expired = !!sub && (sub.status === "expired" || sub.status === "active" && validEnd && endsAt <= now);
  const remaining = active ? Math.max(0, Math.ceil((endsAt - now) / 86400000)) : null;
  const statusLabel = active ? "KINAENDELEA" : expired ? "KIMEISHA" :
    sub?.status === "pending" ? "INASUBIRI UTHIBITISHO" :
    sub?.status === "cancelled" ? "IMEFUTWA" : sub?.status || "HAIJAAMILISHWA";

  return (
    <>
      <h2 className="sec">Akaunti</h2>
      <div className="set">
        <div className="toggle">
          <span>{me ? <>{me.name} <small style={{ color: "var(--mut)" }}>{fmtPhone(me.contact)}</small></> : "Hujaingia kwenye akaunti"}</span>
          {me
            ? <button className="btn ghost" onClick={logout}>{t("a_logout")}</button>
            : <button className="btn" onClick={onLogin}>{t("login")}</button>}
        </div>
      </div>

      <h2 className="sec">Sasisha Youflix</h2>
      <div className="set">
        <p className="help">Ikiwa picha za matangazo au mabango ya Hero hazijasasishwa, safisha cache ili Youflix ipakue taarifa mpya.</p>
        <button className="btn" type="button" onClick={clearYouflixCache} disabled={cacheBusy}>
          {cacheBusy ? "Inasafisha..." : "Safisha Cache na Sasisha"}
        </button>
        <p className="help">Haitafuta akaunti, vifurushi, historia au video zako.</p>
      </div>

      <h2 className="sec">Hali ya kifurushi</h2>
      <div className="set">
        {!me ? (
          <p className="help">Ingia kwenye akaunti yako ili kuona hali ya kifurushi.</p>
        ) : !sub ? (
          <div className="toggle"><span>Huna kifurushi kilichowashwa kwa sasa.</span></div>
        ) : (
          <>
            <div className="toggle"><span>Kifurushi</span><strong>{sub.plan || "—"}</strong></div>
            <div className="toggle">
              <span>Hali</span>
              <strong style={{ color: active ? "#35d07f" : expired ? "#ff5963" : "var(--tx)" }}>{statusLabel}</strong>
            </div>
            <div className="toggle"><span>Tarehe ya kuanza</span><strong>{dateText(sub.starts_at)}</strong></div>
            <div className="toggle"><span>Tarehe ya mwisho</span><strong>{dateText(sub.ends_at)}</strong></div>
            {active && remaining !== null && <div className="toggle"><span>Muda uliobaki</span><strong>{remaining} {remaining === 1 ? "siku" : "siku"}</strong></div>}
            {expired && (
              <div role="alert" style={{ padding: 15, borderRadius: 10, border: "1px solid #e5091466", background: "#e5091418" }}>
                <strong style={{ color: "#ff5963" }}>KIFURUSHI CHAKO KIMEISHA</strong>
                <p style={{ margin: "7px 0 12px", color: "var(--tx)", fontSize: 14 }}>
                  Muda wa kifurushi hiki umefika mwisho. Ili kuendelea kutazama filamu na tamthilia, tafadhali omba kifurushi kipya.
                </p>
                <a className="btn" href="#join" style={{ display: "inline-block", textAlign: "center" }}>JIUNGE UPYA</a>
              </div>
            )}
            {!active && !expired && sub.status === "pending" && (
              <p className="help">Malipo yako yanahakikiwa. Kifurushi kitaanza baada ya Admin kuthibitisha malipo.</p>
            )}
          </>
        )}
      </div>
      {me && !active && !expired && !sub && (
        <div className="set" style={{ marginTop: 14 }}>
          <a className="btn" href="#join" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>Jiunge na Youflix</a>
        </div>
      )}
      <p className="help">Hapa unaweza kuona kifurushi chako na muda uliobaki.</p>

    </>
  );
}
