import { useStore } from "./store.jsx";

const L = [
  ["all", "Video zote"],
  ["drama", "Tamthilia"],
  ["movie", "Filamu"],
  ["mawaidha", "Mawaidha"],
  ["comedy", "Vichekesho"],
];

// Makundi manne rasmi ya video yanayotumika Admin na Home.
export default function Chips({ filt, setFilt }) {
  useStore();
  return (
    <div className="chips">
      {L.map(([key, label]) => (
        <button key={key} className={"chip" + (filt === key ? " on" : "")}
          onClick={() => setFilt(key)}>{label}</button>
      ))}
    </div>
  );
}
