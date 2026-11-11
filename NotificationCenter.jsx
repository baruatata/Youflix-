import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import Icon from "./Icon";
import { useStore } from "./store.jsx";

const expiryKey = (userId, endsAt) => "youflix.expiry-notice." + userId + "." + endsAt;

export default function NotificationCenter() {
  const { state, me } = useStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [expiryNotice, setExpiryNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sub = state.subscription;
    if (!me?.id || !sub?.ends_at) { setExpiryNotice(null); return; }
    const end = new Date(sub.ends_at).getTime();
    if (!Number.isFinite(end) || end > clock || !["active", "expired"].includes(sub.status)) return;
    const key = expiryKey(me.id, sub.ends_at);
    try {
      const saved = localStorage.getItem(key);
      if (saved) { setExpiryNotice(JSON.parse(saved)); return; }
      const notice = {
        id: "local-expiry-" + me.id,
        title: "Kifurushi kimeisha",
        message: "Muda wa kifurushi chako umeisha. Chagua kifurushi kipya ili uendelee kutazama Youflix.",
        created_at: new Date(end).toISOString(),
        read_at: null,
        local: true,
      };
      localStorage.setItem(key, JSON.stringify(notice));
      setExpiryNotice(notice);
    } catch {
      setExpiryNotice({
        id: "local-expiry-" + me.id,
        title: "Kifurushi kimeisha",
        message: "Muda wa kifurushi chako umeisha. Chagua kifurushi kipya ili uendelee kutazama Youflix.",
        created_at: new Date(end).toISOString(),
        read_at: null,
        local: true,
      });
    }
  }, [me?.id, state.subscription, clock]);

  const load = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;
      const { data, error } = await supabase.functions.invoke("admin-messaging", {
        body: { action: "get_notifications" },
        headers: { Authorization: "Bearer " + token },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setItems(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (error) {
      console.error("Youflix notifications:", error);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const markRead = async (item) => {
    if (item.read_at) return;
    if (item.local) {
      const updated = { ...item, read_at: new Date().toISOString() };
      setExpiryNotice(updated);
      try {
        const sub = state.subscription;
        if (me?.id && sub?.ends_at) localStorage.setItem(expiryKey(me.id, sub.ends_at), JSON.stringify(updated));
      } catch {}
      return;
    }
    if (!supabase) return;
    const readAt = new Date().toISOString();
    setItems((current) => current.map((x) => x.id === item.id ? { ...x, read_at: readAt } : x));
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;
    const { data, error } = await supabase.functions.invoke("admin-messaging", {
      body: { action: "mark_notification_read", notification_id: item.id },
      headers: { Authorization: "Bearer " + token },
    });
    if (error || data?.error) {
      setItems((current) => current.map((x) => x.id === item.id ? { ...x, read_at: null } : x));
      console.error("Notification read update failed:", error || data?.error);
    }
  };

  const allItems = expiryNotice ? [expiryNotice, ...items] : items;
  const unread = allItems.filter((item) => !item.read_at).length;
  const messageCard = (item) => (
    <div key={item.id} style={{
      width: "100%", boxSizing: "border-box", padding: 16, marginBottom: 10,
      border: "1px solid #ffffff20", borderRadius: 12,
      background: item.read_at ? "transparent" : "#e5091418",
      color: "inherit", textAlign: "center", overflowWrap: "anywhere", wordBreak: "normal"
    }}>
      <button type="button" onClick={() => markRead(item)}
        style={{ display: "block", width: "100%", padding: 0, border: 0, background: "transparent", color: "inherit", cursor: "pointer", textAlign: "center", whiteSpace: "normal", overflowWrap: "anywhere" }}>
        <b style={{ display: "block", fontSize: 15, lineHeight: 1.4 }}>{item.title}</b>
        <span style={{ display: "block", fontSize: 14, lineHeight: 1.6, marginTop: 8, whiteSpace: "normal", overflowWrap: "anywhere" }}>{item.message}</span>
        <small style={{ display: "block", color: "var(--mut)", marginTop: 10 }}>{new Date(item.created_at).toLocaleString("sw-TZ")}{!item.read_at ? " · Mpya" : " · Imesomwa"}</small>
      </button>
      {item.local && <a href="#join" onClick={() => setOpen(false)} style={{ display: "inline-block", color: "#ff5963", marginTop: 12, fontSize: 14, fontWeight: 700 }}>JIUNGE UPYA</a>}
    </div>
  );

  return (
    <>
      <button className="icon-btn" type="button" aria-label="Ujumbe mpya" onClick={toggle} style={{ position: "relative" }}>
        <Icon name="bell" />
        {unread > 0 && <span style={{ position: "absolute", top: 1, right: 1, minWidth: 16, height: 16, borderRadius: 20, background: "#e50914", color: "#fff", fontSize: 10, lineHeight: "16px", textAlign: "center", padding: "0 3px" }}>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box", background: "#000b" }}>
          <section role="dialog" aria-modal="true" aria-label="Ujumbe wa Youflix"
            style={{ position: "relative", width: "min(440px, 100%)", maxHeight: "min(78vh, 620px)", overflowY: "auto", boxSizing: "border-box", margin: "auto", padding: 18, border: "1px solid #ffffff24", borderRadius: 16, background: "var(--card)", color: "var(--tx)", boxShadow: "0 18px 55px #000c", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", marginBottom: 16, minHeight: 36 }}>
              <b style={{ fontSize: 17 }}>Ujumbe wa Youflix</b>
              <button type="button" className="btn ghost" aria-label="Funga ujumbe" onClick={() => setOpen(false)} style={{ position: "absolute", right: 0, top: 0, padding: "6px 10px" }}>✕</button>
            </div>
            {busy && <p className="help">Inapakia...</p>}
            {!busy && allItems.length === 0 && <p className="help" style={{ textAlign: "center" }}>Bado hujapokea ujumbe.</p>}
            {expiryNotice && messageCard(expiryNotice)}
            {items.map(messageCard)}
          </section>
        </div>
      )}
    </>
  );
}
