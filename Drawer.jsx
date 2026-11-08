import { useState } from "react";
import Icon from "./Icon";
import { useStore } from "./store.jsx";

const CATS = [
  ["drama", "drama", "c_drama"],
  ["story", "story", "c_story"],
  ["movie", "movies", "c_movie"],
  ["comedy", "comedy", "c_comedy"],
];

// Menyu ya kushoto: lugha, utafutaji, makundi, mipangilio na akaunti
export default function Drawer({ open, onClose, route, filt, onCategory, onSearch, onLogin }) {
  const { state, update, t, me, logout } = useStore();
  const [dq, setDq] = useState("");
  const home = route === "home";

  const cat = (k, icon, label) => (
    <a key={k} href="#home" className={home && filt === k ? "on" : ""}
      onClick={(e) => { e.preventDefault(); onCategory(k); }}>
      <Icon name={icon} /><span>{label}</span>
    </a>
  );

  return (
    <>
      <div className={"scrim" + (open ? " on" : "")} onClick={onClose} />
      <aside className={"drawer" + (open ? " on" : "")} aria-label={t("menu")} aria-hidden={!open}>
        <div className="dr-head">
          <a className="brand" href="#home" aria-label="Youflix" onClick={onClose} />
          <button className="icon-btn" aria-label={t("close")} onClick={onClose}><Icon name="back" /></button>
        </div>

        <div className="seg">
          {["en", "sw"].map((l) => (
            <button key={l} type="button" className={state.lang === l ? "on" : ""}
              onClick={() => update({ lang: l })}>{l.toUpperCase()}</button>
          ))}
        </div>

        <form className="dr-search" onSubmit={(e) => { e.preventDefault(); onSearch(dq); setDq(""); }}>
          <Icon name="search" />
          <input type="search" autoComplete="off" value={dq} placeholder={t("search_ph")}
            onChange={(e) => setDq(e.target.value)} />
        </form>

        <nav className="dr-nav">
          <a href="#home" className={home && filt === "all" ? "on" : ""}
            onClick={(e) => { e.preventDefault(); onCategory("all"); }}>
            <Icon name="home" /><span>{t("nav_home")}</span>
          </a>
          <div className="dr-sep" />
          <p className="dr-h">{t("categories")}</p>
          {CATS.map(([k, icon, label]) => cat(k, icon, t(label)))}
          <div className="dr-sep" />
          <a href="#settings" className={route === "settings" ? "on" : ""} onClick={onClose}>
            <Icon name="settings" /><span>{t("nav_settings")}</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onClose(); me ? logout() : onLogin(); }}>
            <Icon name="user" /><span>{me ? me.name + " · " + t("a_logout") : t("login")}</span>
          </a>
        </nav>
      </aside>
    </>
  );
}
