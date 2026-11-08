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
      <p className="fc">&copy; {new Date().getFullYear()} Youflix &middot; {t("foot_rights")}</p>
    </footer>
  );
}
