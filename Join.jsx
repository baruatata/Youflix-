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
  const { me, notify } = useStore();
  const [plan, setPlan] = useState("Siku");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const selected = PLANS.find((p) => p.id === plan) || PLANS[0];

  const request = async () => {
    if (!me) return onLogin();
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("subscription_requests").insert({
        full_name: me.name || "Mteja",
        phone: me.contact || "",
        plan: selected.id,
        price_tzs: selected.price,
        submitted_by: me.id,
      });
      if (error) throw error;
      setSent(true);
      notify("Ombi la kifurushi limetumwa.");
    } catch (err) {
      notify(err?.message || "Imeshindikana kutuma ombi. Jaribu tena.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="set" style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>
      <h2 className="sec">Jiunge na Youflix</h2>
      <p className="help">Chagua kifurushi unachotaka kutumia. Kifurushi kitaanza baada ya malipo kuthibitishwa na Admin.</p>
      {!me ? (
        <div className="toggle" style={{ marginTop: 16 }}>
          <span>Ingia kwenye akaunti yako ili kuomba kifurushi.</span>
          <button className="btn" onClick={onLogin}>Ingia</button>
        </div>
      ) : sent ? (
        <div className="toggle" style={{ marginTop: 16, display: "block" }}>
          <strong>Ombi limepokelewa.</strong>
          <p className="help">Admin atathibitisha malipo kabla kifurushi chako hakijaanza. Unaweza kuwasiliana na huduma kwa wateja kupitia WhatsApp: +255717001506.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {PLANS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                aria-pressed={plan === p.id}
                className={"toggle" + (plan === p.id ? " on" : "")}
                style={{ width: "100%", textAlign: "left", padding: 16, border: plan === p.id ? "2px solid #ff3445" : "1px solid var(--line, #444)", borderRadius: 12, background: "transparent", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>Kifurushi cha {p.id}</strong><small style={{ display: "block" }}>{p.days} {p.days === 1 ? "siku" : "siku"}</small></span>
                <strong>{money(p.price)}</strong>
              </button>
            ))}
          </div>
          <div className="toggle" style={{ marginTop: 16 }}>
            <span>Ulichagua: <strong>{selected.id}</strong></span>
            <strong>{money(selected.price)}</strong>
          </div>
          <p className="help">Njia ya malipo itaelekezwa baada ya kuthibitishwa na huduma kwa wateja. Usitume fedha kabla ya kupata maelekezo rasmi.</p>
          <button className="btn" type="button" disabled={busy} onClick={request}>
            {busy ? "Inatuma ombi..." : "Omba Kifurushi"}
          </button>
        </>
      )}
    </section>
  );
}
