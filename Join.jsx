import { useState } from "react";
import { useStore } from "./store.jsx";
import { supabase } from "./supabase.js";

const PLANS = [
  { id: "Siku", days: 1, price: 500 },
  { id: "Wiki", days: 7, price: 2000 },
  { id: "Mwezi", days: 30, price: 7000 },
];

const money = (n) => "TSh " + Number(n).toLocaleString("en-US");

export default function Join({ onLogin }) {
  const { me, state, notify } = useStore();
  const [plan, setPlan] = useState("Siku");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const selected = PLANS.find((p) => p.id === plan) || PLANS[0];
  const current = state.subscription;
  const hasActivePlan = !!current && current.status === "active" &&
    Number.isFinite(Date.parse(current.ends_at)) && Date.parse(current.ends_at) > Date.now();

  const request = async () => {
    if (!me) return onLogin();
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { data: pending, error: pendingError } = await supabase.from("subscription_requests")
        .select("id").eq("submitted_by", me.id).eq("status", "pending").limit(1);
      if (pendingError) throw pendingError;
      if (pending?.length) throw new Error("Tayari una ombi la kifurushi linalosubiri Admin. Subiri lijibiwe kwanza.");
      const { error } = await supabase.from("subscription_requests").insert({
        full_name: me.name || "Mteja",
        phone: me.contact || "",
        plan: selected.id,
        price_tzs: selected.price,
        submitted_by: me.id,
        admin_notes: hasActivePlan ? "CHANGE_PLAN_REQUEST" : null,
      });
      if (error) throw error;
      setSent(true);
      notify(hasActivePlan ? "Ombi la kubadilishiwa kifurushi limetumwa kwa Admin." : "Ombi la kifurushi limetumwa.");
    } catch (err) {
      notify(err?.message || "Imeshindikana kutuma ombi. Jaribu tena.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="set" style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>
      <h2 className="sec">Jiunge na Youflix</h2>
      <p className="help">{hasActivePlan
        ? "Una kifurushi kinachoendelea. Ukichagua kingine, ombi lako litaenda kwa Admin kwa idhini; kifurushi hakitabadilika mpaka Admin akubali."
        : "Chagua kifurushi unachotaka kutumia. Kifurushi kitaanza baada ya malipo kuthibitishwa na Admin."}</p>
      {!me ? (
        <div className="toggle" style={{ marginTop: 16 }}>
          <span>Ingia kwenye akaunti yako ili kuomba kifurushi.</span>
          <button className="btn" onClick={onLogin}>Ingia</button>
        </div>
      ) : sent ? (
        <div className="toggle" style={{ marginTop: 16, display: "block" }}>
          <strong>Ombi limepokelewa.</strong>
          <p className="help">{hasActivePlan
            ? "Ombi lako la kubadilisha kifurushi limepokelewa. Lipa kifurushi kipya kisha tuma taarifa za malipo WhatsApp. Kifurushi chako cha sasa kitaendelea mpaka Admin athibitishe malipo na kuidhinisha mabadiliko."
            : "Admin atathibitisha malipo kabla kifurushi chako hakijaanza."}</p>
          <div style={{ marginTop: 18, padding: 16, border: "1px solid #ffffff30", borderRadius: 12, background: "#151515", color: "#fff" }}>
            <h3 style={{ marginTop: 0 }}>YOUFLIX – MAELEKEZO YA MALIPO</h3>
            <p>Asante {hasActivePlan ? "kwa kuomba kubadilisha kifurushi cha Youflix." : "kwa kujiunga na Youflix."}</p>
            <p>Tafadhali lipia kifurushi ulichochagua kupitia:</p>
            <p>Mtandao: <b>Mixx by Yas</b></p>
            <p>Namba: <b style={{ fontSize: 20, color: "#ff5963" }}>0717001506</b></p>
            <p>Jina: <b>JUMAA SAIDI</b></p>
            <p>Kifurushi: <b>{selected.id}</b> · Kiasi: <b>{money(selected.price)}</b></p>
            <p>{hasActivePlan
              ? "Baada ya kufanya malipo, tuma taarifa zake WhatsApp. Admin akithibitisha malipo na kuidhinisha ombi, kifurushi kipya kitaanza. Kifurushi chako cha sasa kitaendelea hadi hapo."
              : "Baada ya kufanya malipo, subiri Admin athibitishe kupokea malipo yako. Kifurushi kitaanza baada ya kuthibitishwa."}</p>
            <a href={`https://wa.me/255717001506?text=${encodeURIComponent("YOUFLIX – TAARIFA ZA MALIPO\\nOmbi: " + (hasActivePlan ? "Kubadilisha kifurushi" : "Kujiunga") + "\\nKifurushi: " + selected.id + "\\nKiasi: " + money(selected.price) + "\\nNimetuma malipo kupitia Mixx by Yas kwenda 0717001506. Tafadhali thibitisheni malipo yangu.")}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", textDecoration: "none", background: "#20c767", color: "#071b10", fontWeight: 800, padding: "14px 16px", borderRadius: 10, marginTop: 16 }}>
              TUMA TAARIFA WHATSAPP
            </a>
          </div>
          <p className="help">Huduma kwa wateja: WhatsApp +255717001506.</p>
        </div>
      ) : (
        <>
          {hasActivePlan && (
            <div className="toggle" style={{ marginTop: 16 }}>
              <span>Kifurushi cha sasa: <strong>{current.plan}</strong></span>
              <small>Hadi {new Date(current.ends_at).toLocaleDateString("sw-TZ")}</small>
            </div>
          )}
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {PLANS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                aria-pressed={plan === p.id}
                className={"toggle" + (plan === p.id ? " on" : "")}
                style={{ width: "100%", textAlign: "left", padding: 16, border: plan === p.id ? "2px solid #ff3445" : "1px solid var(--line, #444)", borderRadius: 12, background: "transparent", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>Kifurushi cha {p.id}</strong><small style={{ display: "block" }}>{p.days} siku</small></span>
                <strong>{money(p.price)}</strong>
              </button>
            ))}
          </div>
          <div className="toggle" style={{ marginTop: 16 }}>
            <span>Ulichagua: <strong>{selected.id}</strong></span>
            <strong>{money(selected.price)}</strong>
          </div>
          <p className="help">{hasActivePlan
            ? "Ombi lako litahitaji idhini ya Admin kabla ya kifurushi kubadilika."
            : "Njia ya malipo itaelekezwa baada ya kuthibitishwa na huduma kwa wateja. Usitume fedha kabla ya kupata maelekezo rasmi."}</p>
          <button className="btn" type="button" disabled={busy} onClick={request}>
            {busy ? "Inatuma ombi..." : hasActivePlan ? "Omba Kubadilishiwa Kifurushi" : "Omba Kifurushi"}
          </button>
        </>
      )}
    </section>
  );
}
