import { useStore } from "./store.jsx";

const L = [
  ["drama", "Tamthilia"],
  ["movie", "Filamu"],
  ["mawaidha", "Mawaidha"],
  ["comedy", "Vichekesho"],
];

// Makundi manne rasmi ya video yanayotumika Admin na Home.
export default function Chips({ filt, setFilt }) {
  const { t } = useStore();
  return (
    <>
      <h2 className="sec">{t("categories")}</h2>
      <div className="chips">
        {L.map(([key, label]) => (
          <button key={key} className={"chip" + (filt === key ? " on" : "")}
            onClick={() => setFilt(filt === key ? "all" : key)}>{label}</button>
        ))}
      </div>
    </>
  );
}
