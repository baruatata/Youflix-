import { useState } from "react";
import Icon from "./Icon";
import { useStore } from "./store.jsx";
import { supabase } from "./supabase.js";
import { fmtPhone, normPhone } from "./utils.js";

const SIGNUP_PLANS = [
  { id: "Siku", days: 1, price: 500 },
  { id: "Wiki", days: 7, price: 2000 },
  { id: "Mwezi", days: 30, price: 7000 },
];

export default function Auth({ onClose }) {
  const { state, update, t, notify } = useStore();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("login");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [keptPass, setKeptPass] = useState("");
  const [name, setName] = useState("");
  const [signupPlan, setSignupPlan] = useState("Siku");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState(null);

  const valid =
    step === 1 ? !!normPhone(phoneRaw) && (mode === "login" || agree) :
    step === 2 ? pass.length >= 8 :
    name.trim().length >= 2;

  const completeLogin = async (data, closeAfterLogin = true) => {
    if (!data?.session?.access_token || !data?.session?.refresh_token || !data?.user?.id) {
      throw new Error("Session ya akaunti haijapatikana. Jaribu tena.");
    }
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (sessionError) throw sessionError;

    const u = {
      id: data.user.id,
      name: data.user.name || "Mteja",
      contact: String(data.user.phone || phone),
    };
    update((s) => ({
      users: [...(s.users || []).filter((x) => x.id !== u.id), u],
      me: u.id,
    }));
    notify(t("a_welcome") + ", " + u.name.split(" ")[0]);
    if (closeAfterLogin) onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    if (step === 1) {
      const ph = normPhone(phoneRaw);
      setPhone(ph);
      setPass("");
      setStep(2);
      return;
    }

    if (!supabase) return notify("Huduma ya akaunti haijaunganishwa. Jaribu tena baadaye.");
    setBusy(true);
    try {
      if (step === 2 && mode === "login") {
        const { data, error } = await supabase.functions.invoke("phone-account-auth", {
          body: { action: "login", phone, password: pass },
        });
        if (error) throw new Error(data?.error || error.message || "Imeshindikana kuingia.");
        if (data?.error) throw new Error(data.error);
        await completeLogin(data);
      } else if (step === 2) {
        setKeptPass(pass);
        setPass("");
        setStep(3);
      } else {
        const { data, error } = await supabase.functions.invoke("phone-account-auth", {
          body: { action: "signup", phone, password: keptPass, full_name: name.trim() },
        });
        if (error) throw new Error(data?.error || error.message || "Usajili haukufanikiwa.");
        if (data?.error) throw new Error(data.error);
        const chosenPlan = SIGNUP_PLANS.find((p) => p.id === signupPlan) || SIGNUP_PLANS[0];
        const { error: requestError } = await supabase.from("subscription_requests").insert({
          full_name: name.trim(),
          phone,
          plan: chosenPlan.id,
          price_tzs: chosenPlan.price,
          submitted_by: data.user.id,
        });
        await completeLogin(data, false);
        if (requestError) {
          notify("Akaunti imetengenezwa, lakini ombi la kifurushi halikutumwa: " + requestError.message);
          onClose();
        } else {
          setPaymentNotice({ name: name.trim(), phone, plan: chosenPlan.id, price: chosenPlan.price });
        }
      }
    } catch (err) {
      notify(err?.message || "Imeshindikana. Tafadhali jaribu tena.");
    } finally {
      setBusy(false);
    }
  };

  const c = (k) => (step === k ? "on" : step > k ? "done" : "");
  const title = step === 1 ? t("a_wb") : step === 2 ? t(mode === "login" ? "a_pass_title_login" : "a_new_title") : t("a_name_title");
  const sub = step === 1 ? t("a_wb_sub") : step === 2 ? t(mode === "login" ? "a_pass_sub_login" : "a_new_sub") : t("a_name_sub");
  const btn = step === 1 ? t("a_continue") : step === 2 ? t(mode === "login" ? "login" : "a_continue") : t("a_finish");

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
              {mode === "signup" && (
                <label className="agree">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span className="bx"><Icon name="check" size={18} /></span>
                  <span>{t("a_terms_pre")}<em>{t("a_terms")}</em>{t("a_and")}<em>{t("a_privacy")}</em></span>
                </label>
              )}
              <div className="auth-mode-switch" role="group" aria-label="Aina ya akaunti" style={{ display: "flex", gap: 10, margin: "4px 0 18px" }}>
                <button type="button" className="ap-link" aria-pressed={mode === "login"}
                  onClick={() => { setMode("login"); setAgree(false); setPass(""); }}
                  style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRadius: 10, border: mode === "login" ? "1px solid #ff3b47" : "1px solid #ffffff30", background: mode === "login" ? "#ff1f2d20" : "transparent", color: mode === "login" ? "#ff5963" : "#fff", fontWeight: 700 }}>
                  Ingia
                </button>
                <button type="button" className="ap-link" aria-pressed={mode === "signup"}
                  onClick={() => { setMode("signup"); setAgree(false); setPass(""); }}
                  style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRadius: 10, border: mode === "signup" ? "1px solid #ff3b47" : "1px solid #ffffff30", background: mode === "signup" ? "#ff1f2d20" : "transparent", color: mode === "signup" ? "#ff5963" : "#fff", fontWeight: 700 }}>
                  Jisajili
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" className="ap-link" onClick={() => setStep(1)}>{t("a_change")} ({fmtPhone(phone)})</button>
              <label className="ap-label" htmlFor="apPass">{t("a_pass_label")}</label>
              <div className="fieldwrap">
                <input id="apPass" type={show ? "text" : "password"} autoFocus placeholder="••••••••" maxLength={72}
                  autoComplete={mode === "login" ? "current-password" : "new-password"} value={pass} onChange={(e) => setPass(e.target.value)} />
                <button type="button" className="eye" onClick={() => setShow((x) => !x)}>{t(show ? "a_hide" : "a_show")}</button>
              </div>
              <p className="help">Nenosiri liwe na angalau herufi 8.</p>
            </>
          )}

          {step === 3 && (
            <>
              <label className="ap-label" htmlFor="apName">{t("a_name_label")}</label>
              <div className="fieldwrap">
                <input id="apName" type="text" autoFocus autoComplete="name" maxLength={60} value={name}
                  onChange={(e) => setName(e.target.value)} />
              </div>
              <label className="ap-label" htmlFor="signupPlan">Chagua kifurushi</label>
              <select id="signupPlan" value={signupPlan} onChange={(e) => setSignupPlan(e.target.value)}
                style={{ width: "100%", minHeight: 48, marginTop: 8, padding: "10px 12px", borderRadius: 10 }}>
                {SIGNUP_PLANS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id === "Siku" ? "Siku 1" : p.id === "Wiki" ? "Wiki 7" : "Mwezi 30"} — TSh {p.price.toLocaleString("en-US")}
                  </option>
                ))}
              </select>
              <p className="help">Kifurushi kitaanza baada ya Admin kuthibitisha malipo. Hakuna malipo ya moja kwa moja yanayokatwa hapa.</p>
            </>
          )}

          <button className={"ap-btn" + (valid ? " on" : "")} type="submit" disabled={!valid || busy}>
            {busy ? "Inahakiki..." : btn} <Icon name="arrow" size={20} />
          </button>
        </div>
        <p className="ap-foot">{t("a_secure")}</p>
      </form>
      {paymentNotice && (
        <div role="dialog" aria-modal="true" aria-labelledby="payment-title"
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 440, background: "#151515", color: "#fff", border: "1px solid #ffffff25", borderRadius: 18, padding: 24, boxShadow: "0 20px 60px #000" }}>
            <h2 id="payment-title" style={{ marginTop: 0 }}>USAJILI UMEPOKELEWA</h2>
            <p>Kifurushi: <b>{paymentNotice.plan}</b></p>
            <p>Kiasi: <b>TSh {paymentNotice.price.toLocaleString("en-US")}</b></p>
            <p>Fanya malipo kupitia Mixx by Yas:</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#ff5963" }}>0717001506</p>
            <p>Jina: <b>JUMAA SAIDI</b></p>
            <p style={{ lineHeight: 1.5 }}>Baada ya kulipa, bonyeza kitufe hapa chini kutuma taarifa za muamala WhatsApp. Kifurushi kitaanza baada ya Admin kuthibitisha malipo.</p>
            <a href={`https://wa.me/255717001506?text=${encodeURIComponent("Habari Youflix, nimelipia kifurushi.\nJina: " + paymentNotice.name + "\nNamba ya akaunti: " + paymentNotice.phone + "\nKifurushi: " + paymentNotice.plan + "\nKiasi: TSh " + paymentNotice.price.toLocaleString("en-US") + "\nTafadhali nathibitishieni malipo. Nitatuma uthibitisho wa muamala hapa.")}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", textDecoration: "none", background: "#20c767", color: "#071b10", fontWeight: 800, padding: "15px 18px", borderRadius: 12, marginTop: 20 }}>
              TUMA TAARIFA WHATSAPP
            </a>
            <button type="button" onClick={() => { setPaymentNotice(null); onClose(); }}
              style={{ width: "100%", marginTop: 12, padding: 12, border: "1px solid #ffffff35", borderRadius: 10, background: "transparent", color: "#fff", fontWeight: 700 }}>
              Funga
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
