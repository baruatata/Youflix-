import { useStore } from "./store.jsx";
import { fmtPhone } from "./utils.js";

export default function Settings({ onLogin }) {
  const { state, update, t, notify, me, logout } = useStore();
  return (
    <>
      <h2 className="sec">{t("account")}</h2>
      <div className="set">
        <div className="toggle">
          <span>
            {me ? <>{me.name} <small style={{ color: "var(--mut)" }}>{fmtPhone(me.contact)}</small></> : t("a_guest")}
          </span>
          {me
            ? <button className="btn ghost" onClick={logout}>{t("a_logout")}</button>
            : <button className="btn" onClick={onLogin}>{t("login")}</button>}
        </div>
      </div>

      <h2 className="sec">{t("set_title")}</h2>
      <div className="set">
        <div className="toggle">
          <span>{t("saver")}</span>
          <input type="checkbox" checked={state.saver} onChange={(e) => update({ saver: e.target.checked })} />
        </div>
        <div className="toggle">
          <span>{t("light")}</span>
          <input type="checkbox" checked={state.light} onChange={(e) => update({ light: e.target.checked })} />
        </div>
      </div>
      <div className="set">
        <button className="btn ghost" onClick={() => { update({ progress: {} }); notify(t("cleared")); }}>{t("clearhist")}</button>
      </div>
    </>
  );
}
