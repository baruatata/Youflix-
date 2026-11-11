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
  return (
    <div style={{ position: "relative" }}>
      <button className="icon-btn" type="button" aria-label="Ujumbe mpya" onClick={toggle} style={{ position: "relative" }}>
        <Icon name="bell" />
        {unread > 0 && <span style={{ position: "absolute", top: 1, right: 1, minWidth: 16, height: 16, borderRadius: 20, background: "#e50914", color: "#fff", fontSize: 10, lineHeight: "16px", textAlign: "center", padding: "0 3px" }}>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: "min(340px, calc(100vw - 24px))", maxHeight: "65vh", overflowY: "auto", zIndex: 1000, background: "var(--card)", color: "var(--tx)", border: "1px solid #ffffff22", borderRadius: 12, boxShadow: "0 12px 35px #0009", padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <b>Ujumbe wa Youflix</b>
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Funga</button>
          </div>
          {expiryNotice && (
            <button type="button" onClick={() => markRead(expiryNotice)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: 10, marginBottom: 7, border: 0, borderRadius: 9, background: expiryNotice.read_at ? "transparent" : "#e5091420", color: "inherit", cursor: "pointer" }}>
              <b style={{ display: "block", fontSize: 13 }}>{expiryNotice.title}</b>
              <span style={{ display: "block", fontSize: 13, whiteSpace: "normal", marginTop: 4 }}>{expiryNotice.message}</span>
              <small style={{ color: "var(--mut)" }}>{new Date(expiryNotice.created_at).toLocaleString("sw-TZ")}{!expiryNotice.read_at ? " · Mpya" : " · Imesomwa"}</small>
              <a href="#join" onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ display: "inline-block", color: "#ff5963", marginTop: 7, fontSize: 13 }}>Jiunge upya</a>
            </button>
          )}
          {busy && <p className="help">Inapakia...</p>}
          {!busy && allItems.length === 0 && <p className="help">Bado hujapokea ujumbe.</p>}
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => markRead(item)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: 10, marginBottom: 7, border: 0, borderRadius: 9, background: item.read_at ? "transparent" : "#e5091420", color: "inherit", cursor: "pointer" }}>
              <b style={{ display: "block", fontSize: 13 }}>{item.title}</b>
              <span style={{ display: "block", fontSize: 13, whiteSpace: "normal", marginTop: 4 }}>{item.message}</span>
              <small style={{ color: "var(--mut)" }}>{new Date(item.created_at).toLocaleString("sw-TZ")}{!item.read_at ? " · Mpya" : ""}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
