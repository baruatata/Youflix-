import Icon from "./Icon";
import { useStore } from "./store.jsx";

export default function Footer({ onAdmin }) {
  const { t } = useStore();
  return (
    <footer className="foot">
      <div className="frow">
        <button className="lock" aria-label="Admin" onClick={onAdmin}><Icon name="lock" /></button>
        <span className="brand" role="img" aria-label="Youflix" />
      </div>
      <p className="ft">{t("foot_tag")}</p>
      <nav className="fl" aria-label="Footer">
        <a href="#home">{t("nav_home")}</a>
        <a href="#movies">{t("nav_movies")}</a>
        <a href="#series">{t("nav_series")}</a>
        <a href="#mylist">{t("nav_mylist")}</a>
      </nav>
      <p className="fc">&copy; {new Date().getFullYear()} Youflix &middot; {t("foot_rights")}</p>
    </footer>
  );
}
