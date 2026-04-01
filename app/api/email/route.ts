import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { resend } from "@/lib/resend";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

const INBOXES: Record<string, { from: string; name: string; signature: string }> = {
  andrew:     { from: "andrew@cheapakiya.com",     name: "Andrew",     signature: "Andrew Ramos\nCheapAkiya.com" },
  luna:       { from: "luna@cheapakiya.com",       name: "Luna",       signature: "Luna\nCheapAkiya.com" },
  newsletter: { from: "newsletter@cheapakiya.com", name: "CheapAkiya", signature: "The CheapAkiya Team\ncheapakiya.com" },
  info:       { from: "info@cheapakiya.com",       name: "CheapAkiya", signature: "The CheapAkiya Team\ncheapakiya.com" },
};

function checkAuth(req: NextRequest) {
  return !ADMIN_SECRET || req.headers.get("x-admin-secret") === ADMIN_SECRET;
}

// GET — list emails, optionally filtered by inbox
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || "inbox";
  const inbox = searchParams.get("inbox") || "all";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "0");
  const limit = 30;

  let query = supabase.from("emails")
    .select("id,direction,from_addr,from_name,to_addr,subject,body_text,body_html,created_at,status,thread_id,in_reply_to,inbox,message_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (folder === "inbox") { query = query.eq("direction", "inbound").neq("status", "deleted"); }
  else if (folder === "sent") { query = query.eq("direction", "outbound").neq("status", "deleted"); }
  else if (folder === "unread") { query = query.eq("direction", "inbound").eq("status", "unread"); }
  else if (folder === "trash") { query = query.eq("status", "deleted"); }
  else { /* all — no status filter */ }

  if (inbox !== "all" && folder !== "trash") query = query.eq("inbox", inbox);
  if (q) query = query.or(`subject.ilike.%${q}%,from_addr.ilike.%${q}%,body_text.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ emails: data, total: count, hasMore: (count ?? 0) > (page + 1) * limit });
}

// POST — send email from a specific inbox
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { to, subject, body, fromInbox = "luna", replyToId, replyToMessageId, attachments } = await req.json();

  if (!to || !subject || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const account = INBOXES[fromInbox] || INBOXES.luna;
  const FROM = `${account.name} <${account.from}>`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6;padding:24px;">
      <div style="white-space:pre-wrap;">${body.replace(/\n/g, "<br/>")}</div>
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:12px;white-space:pre-wrap;">${account.signature}</div>
    </div>`;

  const sendOptions: any = { from: FROM, to, subject, html };
  if (replyToMessageId) sendOptions.headers = { "In-Reply-To": replyToMessageId, References: replyToMessageId };
  if (attachments?.length) sendOptions.attachments = attachments.map((a: any) => ({ filename: a.filename, content: a.content }));

  const result = await resend.emails.send(sendOptions);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

  const threadId = replyToId
    ? (await supabase.from("emails").select("thread_id").eq("id", replyToId).single()).data?.thread_id
    : subject.replace(/^(Re:|Fwd:|RE:|FWD:)\s*/gi, "").trim();

  await supabase.from("emails").insert({
    direction: "outbound",
    inbox: fromInbox,
    from_addr: account.from,
    from_name: account.name,
    to_addr: to,
    subject,
    body_text: body,
    body_html: html,
    message_id: result.data?.id,
    thread_id: threadId,
    status: "sent",
  });

  return NextResponse.json({ success: true, id: result.data?.id });
}

// PATCH — mark read/unread/deleted
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids, status } = await req.json();
  if (!ids?.length) return NextResponse.json({ error: "Missing ids" }, { status: 400 });
  const { error } = await supabase.from("emails").update({ status }).in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — hard delete (empty trash or force-delete specific ids)
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { ids, emptyTrash } = body;
  let query = supabase.from("emails").delete();
  if (emptyTrash) {
    query = query.eq("status", "deleted");
  } else if (ids?.length) {
    query = query.in("id", ids);
  } else {
    return NextResponse.json({ error: "Provide ids or emptyTrash:true" }, { status: 400 });
  }
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
