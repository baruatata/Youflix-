import { useState } from "react";
import Icon from "./Icon";
import { useStore } from "./store.jsx";
import { fmtPhone, newSalt, normPhone, sha } from "./utils.js";

// Kuingia: ukurasa kamili wa hatua 3 (namba ya simu → nenosiri → jina).
// Akaunti zinahifadhiwa kwenye kifaa hiki tu (nenosiri limesimbwa kwa SHA-256 + salt).
export default function Auth({ onClose }) {
  const { state, update, t, notify } = useStore();
  const [step, setStep] = useState(1);
  const [phoneRaw, setPhoneRaw] = useState("");
  const [agree, setAgree] = useState(false);
  const [phone, setPhone] = useState("");
  const [exists, setExists] = useState(false);
  const [pass, setPass] = useState("");
  const [keptPass, setKeptPass] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const valid =
    step === 1 ? !!normPhone(phoneRaw) && agree :
    step === 2 ? pass.length >= (exists ? 1 : 4) :
    name.trim().length >= 2;

  const loginAs = (u) => {
    update({ me: u.id });
    notify(t("a_welcome") + ", " + u.name.split(" ")[0]);
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    if (step === 1) {
      const ph = normPhone(phoneRaw);
      setPhone(ph);
      setExists(state.users.some((u) => u.contact === ph));
      setPass("");
      setStep(2);
    } else if (step === 2) {
      if (exists) {
        const user = state.users.find((u) => u.contact === phone);
        setBusy(true);
        sha(user.salt + pass).then((hash) => {
          setBusy(false);
          if (hash !== user.hash) { notify(t("a_bad")); setPass(""); return; }
          loginAs(user);
        });
      } else {
        setKeptPass(pass);
        setStep(3);
      }
    } else {
      const salt = newSalt();
      setBusy(true);
      sha(salt + keptPass).then((hash) => {
        const u = { id: "u" + Date.now(), name: name.trim(), contact: phone, salt, hash };
        update((s) => ({ users: [...s.users, u] }));
        loginAs(u);
      });
    }
  };

  const c = (k) => (step === k ? "on" : step > k ? "done" : "");
  const title = step === 1 ? t("a_wb") : step === 2 ? t(exists ? "a_pass_title_login" : "a_new_title") : t("a_name_title");
  const sub = step === 1 ? t("a_wb_sub") : step === 2 ? t(exists ? "a_pass_sub_login" : "a_new_sub") : t("a_name_sub");
  const btn = step === 1 ? t("a_continue") : step === 2 ? t(exists ? "login" : "a_continue") : t("a_finish");

  return (
    <div id="auth" className="modal">
      <form className="ap" onSubmit={submit} noValidate>
        <div className="ap-top">
          <button type="button" className="ap-back" onClick={onClose}><Icon name="arrowLeft" size={20} />{t("back_home")}</button>
          <span className="brand" role="img" aria-label="Youflix" />
        </div>
        <span className="wpill"><Icon name="sparkle" size={18} />{t("a_welcome_pill")}</span>
        <p className="ap-sub">{t("a_tagline")}</p>
        <div className="ap-feats">
          <span><Icon name="movies" />{t("feat1")}</span>
          <span><Icon name="kids" />{t("c_kids")}</span>
          <span><Icon name="mylist" />{t("nav_mylist")}</span>
          <span><Icon name="series" />{t("feat4")}</span>
        </div>

        <div className="ap-card">
          <div className="steps">
            <b className={c(1)}>{step > 1 ? <Icon name="check" size={18} /> : "1"}</b><i />
            <b className={c(2)}>{step > 2 ? <Icon name="check" size={18} /> : "2"}</b><i />
            <b className={c(3)}>3</b>
          </div>
          <h2>{title}</h2>
          <p className="sub">{sub}</p>

          {step === 1 && (
            <>
              <label className="ap-label" htmlFor="apPhone">{t("a_phone")}</label>
              <div className="phone">
                <span className="cc"><i className="flag" /><Icon name="down" size={18} style={{ color: "#a8a8ad" }} /></span>
                <span className="pre">+255</span>
                <input id="apPhone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="000 000 000"
                  maxLength={14} value={phoneRaw} onChange={(e) => setPhoneRaw(e.target.value)} />
              </div>
              <p className="help">{t("a_phone_help")}</p>
              <label className="agree">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="bx"><Icon name="check" size={18} /></span>
                <span>{t("a_terms_pre")}<em>{t("a_terms")}</em>{t("a_and")}<em>{t("a_privacy")}</em></span>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" className="ap-link" onClick={() => setStep(1)}>{t("a_change")} ({fmtPhone(phone)})</button>
              <label className="ap-label" htmlFor="apPass">{t(exists ? "a_pass_label" : "a_pass_label")}</label>
              <div className="fieldwrap">
                <input id="apPass" type={show ? "text" : "password"} autoFocus placeholder="••••" maxLength={60}
                  autoComplete={exists ? "current-password" : "new-password"} value={pass} onChange={(e) => setPass(e.target.value)} />
                <button type="button" className="eye" onClick={() => setShow((x) => !x)}>{t(show ? "a_hide" : "a_show")}</button>
              </div>
              <p className="help" />
            </>
          )}

          {step === 3 && (
            <>
              <label className="ap-label" htmlFor="apName">{t("a_name_label")}</label>
              <div className="fieldwrap">
                <input id="apName" type="text" autoFocus autoComplete="name" maxLength={40} value={name}
                  onChange={(e) => setName(e.target.value)} />
              </div>
              <p className="help" />
            </>
          )}

          <button className={"ap-btn" + (valid ? " on" : "")} type="submit" disabled={!valid || busy}>
            {btn} <Icon name="arrow" size={20} />
          </button>
        </div>
        <p className="ap-foot">{t("a_secure")}</p>
      </form>
    </div>
  );
}
