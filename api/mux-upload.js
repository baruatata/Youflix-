import { createClient } from "@supabase/supabase-js";

const MUX_API = "https://api.mux.com/video/v1";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json").json(body);
}

async function requireAdmin(req) {
  const auth = req.headers.authorization || "";
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !supabaseUrl || !supabaseKey) throw new Error("MISSING_AUTH");
  const sb = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: "Bearer " + token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw new Error("UNAUTHORIZED");
  const { data: profile, error: profileError } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (profileError || profile?.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

function muxHeaders() {
  const id = process.env.MUX_TOKEN_ID;
  const secret = process.env.MUX_TOKEN_SECRET;
  if (!id || !secret) throw new Error("MUX_NOT_CONFIGURED");
  return {
    Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64"),
    "Content-Type": "application/json",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    await requireAdmin(req);
    const { action } = req.body || {};
    const headers = muxHeaders();

    if (action === "create") {
      const origin = req.headers.origin || "";
      const payload = {
        new_asset_settings: {
          playback_policy: ["public"],
          video_quality: "basic",
        },
      };
      if (origin) payload.cors_origin = origin;
      const response = await fetch(MUX_API + "/uploads", {
        method: "POST", headers, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) return json(res, response.status, { error: result?.error?.messages?.join(", ") || "Mux imeshindwa kuanzisha upload." });
      return json(res, 200, { uploadId: result.data.id, uploadUrl: result.data.url });
    }

    if (action === "status") {
      const uploadId = String(req.body?.uploadId || "");
      if (!uploadId) return json(res, 400, { error: "Upload ID haipo." });
      const upRes = await fetch(MUX_API + "/uploads/" + encodeURIComponent(uploadId), { headers });
      const upJson = await upRes.json();
      if (!upRes.ok) return json(res, upRes.status, { error: "Imeshindikana kusoma hali ya upload ya Mux." });
      const upload = upJson.data;
      if (!upload.asset_id) return json(res, 200, { status: upload.status || "waiting", ready: false });
      const assetRes = await fetch(MUX_API + "/assets/" + encodeURIComponent(upload.asset_id), { headers });
      const assetJson = await assetRes.json();
      if (!assetRes.ok) return json(res, assetRes.status, { error: "Imeshindikana kusoma asset ya Mux." });
      const asset = assetJson.data;
      const playbackId = asset.playback_ids?.find((p) => p.policy === "public")?.id;
      return json(res, 200, {
        status: asset.status,
        ready: asset.status === "ready" && !!playbackId,
        playbackUrl: playbackId ? "https://stream.mux.com/" + playbackId + ".m3u8" : null,
        duration: asset.duration || null,
      });
    }

    return json(res, 400, { error: "Action haijatambulika." });
  } catch (error) {
    const message = error?.message || "Hitilafu ya seva.";
    const status = message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : message === "MUX_NOT_CONFIGURED" ? 503 : 500;
    return json(res, status, {
      error: message === "FORBIDDEN" ? "Akaunti hii haina ruhusa ya Admin."
        : message === "UNAUTHORIZED" ? "Tafadhali ingia tena kama Admin."
        : message === "MUX_NOT_CONFIGURED" ? "Mux haijawekwa kikamilifu kwenye Vercel."
        : "Hitilafu wakati wa kuwasiliana na Mux.",
    });
  }
}
