import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import Icon from "./Icon";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("admin_notifications")
        .select("id,title,message,created_at,read_at")
        .order("created_at", { ascending: false }).limit(15);
      if (error) throw error;
      setItems(Array.isArray(data) ? data : []);
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
    if (item.read_at || !supabase) return;
    const readAt = new Date().toISOString();
    setItems((current) => current.map((x) => x.id === item.id ? { ...x, read_at: readAt } : x));
    const { error } = await supabase.from("admin_notifications").update({ read_at: readAt }).eq("id", item.id);
    if (error) {
      setItems((current) => current.map((x) => x.id === item.id ? { ...x, read_at: null } : x));
      console.error("Notification read update failed:", error);
    }
  };

  const unread = items.filter((item) => !item.read_at).length;
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
          {busy && <p className="help">Inapakia...</p>}
          {!busy && items.length === 0 && <p className="help">Bado hujapokea ujumbe.</p>}
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
