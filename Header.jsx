import Icon from "./Icon";
import { useStore } from "./store.jsx";

export default function Header({ onMenu, onSearch, onAccount, searchOpen, query, setQuery }) {
  const { t, me } = useStore();
  return (
    <>
      <header className="top">
        <button className="icon-btn" aria-label={t("menu")} onClick={onMenu}><Icon name="menu" /></button>
        <a className="brand" href="#home" aria-label="Youflix" />
        <div className="tr">
          <button className="icon-btn" aria-label={t("search_ph")} onClick={onSearch}><Icon name="search" /></button>
          <button className="pill red" onClick={onAccount}>
            {me ? "👤 " + me.name.split(" ")[0] : t("login")}
          </button>
        </div>
      </header>
      {searchOpen && (
        <div className="searchbar">
          <input id="q" type="search" autoComplete="off" autoFocus value={query}
            placeholder={t("search_ph")} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}
    </>
  );
}
