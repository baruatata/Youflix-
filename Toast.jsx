import { useStore } from "./store.jsx";

export default function Toast() {
  const { toast } = useStore();
  return toast ? <div className="toast" role="status">{toast}</div> : null;
}
