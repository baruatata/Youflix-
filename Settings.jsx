import { useStore } from "./store.jsx";
import { fmtPhone } from "./utils.js";

const dateText = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("sw-TZ", { day: "numeric", month: "long", year: "numeric" });
};

export default function Settings({ onLogin }) {
  const { t, me, logout, state } = useStore();
  const sub = state.subscription;
  const active = !!sub && sub.status === "active" && (!sub.ends_at || new Date(sub.ends_at).getTime() > Date.now());
  const remaining = active && sub.ends_at ? Math.max(0, Math.ceil((new Date(sub.ends_at).getTime() - Date.now()) / 86400000)) : null;

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

      <h2 className="sec">Hali ya kifurushi</h2>
      <div className="set">
        {!me ? (
          <p className="help">Ingia kwenye akaunti yako ili kuona hali ya kifurushi.</p>
        ) : !sub ? (
          <div className="toggle"><span>Huna kifurushi kilichowashwa kwa sasa.</span></div>
        ) : (
          <>
            <div className="toggle"><span>Kifurushi</span><strong>{sub.plan || "—"}</strong></div>
            <div className="toggle"><span>Hali</span><strong>{active ? "Kinaendelea" : (sub.status || "Hakijaamilishwa")}</strong></div>
            <div className="toggle"><span>Tarehe ya kuanza</span><strong>{dateText(sub.starts_at)}</strong></div>
            <div className="toggle"><span>Tarehe ya mwisho</span><strong>{dateText(sub.ends_at)}</strong></div>
            {remaining !== null && <div className="toggle"><span>Muda uliobaki</span><strong>{remaining} siku</strong></div>}
          </>
        )}
      </div>
      {me && !active && (
        <div className="set" style={{ marginTop: 14 }}>
          <a className="btn" href="#join" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>Jiunge na Youflix</a>
        </div>
      )}
      <p className="help">Hapa unaweza kuona kifurushi chako na muda uliobaki.</p>
    </>
  );
}
