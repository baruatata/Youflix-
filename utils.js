// Vifaa vya msaada visivyotegemea React.

export function ytId(u) {
  const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function hue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

// Picha ya jalada; ikikosekana (au Hifadhi Data imewashwa) inatumia rangi laini kulingana na jina.
export function posterStyle(v, saver) {
  if (v.poster && !saver) return { backgroundImage: `url(${JSON.stringify(v.poster)})` };
  const h = hue(v.title || "");
  return { backgroundImage: `linear-gradient(160deg,hsl(${h},60%,28%),hsl(${(h + 40) % 360},70%,10%))` };
}

// Normalize old genre names and database categories to the four official genres.
export function canonicalGenre(value) {
 const s = String(value || "").trim().toLowerCase();
 if (/tamthilia|thamthilia|mfululizo|drama/.test(s)) return "Tamthilia";
 if (/filamu|movie/.test(s)) return "Filamu";
 if (/mawaidha|mahubiri|nasaha|hadithi|nyaraka|documentary/.test(s)) return "Mawaidha";
 if (/vichekesho|comedy/.test(s)) return "Vichekesho";
 return "";
}

// Chips / makundi
const RX = {
  drama: /tamthilia|thamthilia|mfululizo|drama/i,
  movie: /filamu|movie/i,
  mawaidha: /mawaidha|mahubiri|nasaha|hadithi|nyaraka|documentary/i,
  comedy: /vichekesho|comedy/i,
};
export function filterVideos(videos, filt) {
  if (filt === "drama") return videos.filter((x) => canonicalGenre(x.genre) === "Tamthilia");
  if (RX[filt]) return videos.filter((x) => RX[filt].test(x.genre || ""));
  return videos;
}

// SHA-256 (kama kivinjari kinaruhusu), vinginevyo alama rahisi — ulinzi wa kifaa tu, si wa seva.
export function sha(str) {
  if (window.crypto && crypto.subtle && window.TextEncoder) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then((b) =>
      Array.from(new Uint8Array(b)).map((x) => ("0" + x.toString(16)).slice(-2)).join("")
    );
  }
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Promise.resolve("f" + h);
}
export const newSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// 0712 345 678 | 712345678 | +255712345678  →  "255712345678"
export function normPhone(raw) {
  let d = String(raw).replace(/\D/g, "");
  if (d.indexOf("255") === 0 && d.length > 9) d = d.slice(3);
  if (d.charAt(0) === "0") d = d.slice(1);
  return d.length === 9 ? "255" + d : "";
}
export function fmtPhone(c) {
  const m = /^255(\d{3})(\d{3})(\d{3})$/.exec(c || "");
  return m ? `+255 ${m[1]} ${m[2]} ${m[3]}` : String(c || "");
}

export const okImg = (s) => typeof s === "string" && /^(https?:\/\/|data:image\/(jpeg|png|webp);base64,)/i.test(s);

// Punguza picha iliyochaguliwa kuwa JPEG nyepesi (data URL)
export function readImage(file, maxW, cb) {
  const r = new FileReader();
  r.onerror = () => cb(null);
  r.onload = () => {
    const im = new Image();
    im.onerror = () => cb(null);
    im.onload = () => {
      const w = Math.min(maxW, im.width), h = Math.round((im.height * w) / im.width);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(im, 0, 0, w, h);
      cb(c.toDataURL("image/jpeg", 0.72));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
}

export function download(name, text, mime) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 600);
}
