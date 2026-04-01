// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Inquiry = { id: string; created_at: string; name: string; email: string; message: string; listing_slug: string; listing_name: string; listing_price: string; listing_url: string; member_tier: string; status: string; };
type Listing = { id: string; slug: string; name_en: string; prefecture_en: string; price_usd: number; source: string; is_premium: boolean; is_active: boolean; is_featured: boolean; images: string[]; scraped_at: string; };
type Subscriber = { id?: string; email: string; name: string; since: string; tier: string; beehiivId?: string; stripeSubId?: string; openRate?: string; emailsSent?: number | string; emailsOpened?: number | string; signup_source?: string; newsletter_consent?: boolean; };
type EmailMsg = { id: string; direction: string; from_addr: string; to_addr: string; subject: string; body_text: string; body_html?: string; created_at: string; status: string; thread_id: string; message_id?: string; inbox?: string; attachments?: {id:string;filename:string;content_type:string}[] | null; };

const TABS = ["📊 Stats", "📈 Traffic", "🎯 Leads", "📧 Email", "🏯 Listings", "🔄 Scraper", "👥 Subscribers", "📤 Newsletter"] as const;
type Tab = typeof TABS[number];

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("📧 Email");

  // Stats
  const [dash, setDash] = useState<any>(null);
  const [traffic, setTraffic] = useState<any>(null);
  const [trafficDays, setTrafficDays] = useState(30);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [refExportFrom, setRefExportFrom] = useState("");
  const [refExportTo, setRefExportTo] = useState("");
  const [refExporting, setRefExporting] = useState(false);
  const [expandedRefId, setExpandedRefId] = useState<string|null>(null);
  // Inbox
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingQ, setListingQ] = useState("");
  const [listingSource, setListingSource] = useState("");
  const [listingSort, setListingSort] = useState("newest");
  const [listingPref, setListingPref] = useState("");
  const [listingTier, setListingTier] = useState("");
  const [listingActive, setListingActive] = useState("active");
  const [listingFeatured, setListingFeatured] = useState("");
  const [listingNoPhoto, setListingNoPhoto] = useState("");
  const [listingSubsidy, setListingSubsidy] = useState("");
  const [listingRegion, setListingRegion] = useState("");
  const [listingMinBeds, setListingMinBeds] = useState("");
  const [listingMinPrice, setListingMinPrice] = useState("");
  const [listingMaxPrice, setListingMaxPrice] = useState("");
  const [listingPage, setListingPage] = useState(0);
  const [listingTotal, setListingTotal] = useState(0);
  const [listingHasMore, setListingHasMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any>({});
  // Scraper
  const [scraperLog, setScraperLog] = useState("");
  const [scraperStatus, setScraperStatus] = useState<{lastScraped?: string; addedToday?: number}>({});
  const [scraperAction, setScraperAction] = useState<string | null>(null);
  // Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subTier, setSubTier] = useState<"free"|"premium">("free");
  const [subQ, setSubQ] = useState("");
  const [subTotal, setSubTotal] = useState(0);
  const [emails, setEmails] = useState<EmailMsg[]>([]);
  const [emailFolder, setEmailFolder] = useState("inbox");
  const [emailInbox, setEmailInbox] = useState("all");
  const [composeFrom, setComposeFrom] = useState("luna");
  const [emailQ, setEmailQ] = useState("");
  const [emailPage, setEmailPage] = useState(0);
  const [emailTotal, setEmailTotal] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<EmailMsg | null>(null);
  const [composing, setComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeSent, setComposeSent] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState<{filename:string;content:string;contentType:string}[]>([]);

  // Legacy email user (kept for backward compat from inbox reply)
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  // Newsletter
  const [nlTier, setNlTier] = useState("premium");
  const [nlSubject, setNlSubject] = useState("");
  const [nlBody, setNlBody] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle"|"sending"|"done"|"error">("idle");
  const [nlResult, setNlResult] = useState<any>(null);

  const h = { "x-admin-secret": secret };

  const load = useCallback(async (tab: Tab) => {
    if (tab === "📊 Stats") {
      const r = await fetch("/api/admin/dashboard", { headers: h });
      if (r.ok) setDash(await r.json());
    } else if (tab === "📈 Traffic") {
      const r = await fetch(`/api/admin/traffic?days=${trafficDays}`, { headers: h });
      if (r.ok) setTraffic(await r.json());
    } else if (tab === "🎯 Leads") {
      const [refRes, inqRes] = await Promise.all([
        fetch("/api/admin/referrals", { headers: h }),
        fetch("/api/inquiries", { headers: h }),
      ]);
      if (refRes.ok) setReferrals((await refRes.json()).referrals || []);
      if (inqRes.ok) setInquiries((await inqRes.json()).inquiries || []);
    } else if (tab === "📧 Email") {
      await loadEmails(0);
    } else if (tab === "🏯 Listings") {
      await loadListings();
    } else if (tab === "🔄 Scraper") {
      const r = await fetch("/api/admin/scrape", { headers: h });
      if (r.ok) { const d = await r.json(); setScraperLog(d.log || ""); setScraperStatus({lastScraped: d.lastScraped, addedToday: d.addedToday}); }
    } else if (tab === "👥 Subscribers") {
      const r = await fetch(`/api/admin/subscribers?tier=${subTier}&q=${subQ}`, { headers: h });
      if (r.ok) { const d = await r.json(); setSubscribers(d.subscribers || []); setSubTotal(d.total || 0); }
    }
  }, [secret, listingQ, listingSource, subTier, subQ]);

  useEffect(() => { if (authed) load(activeTab); }, [authed, activeTab, trafficDays]);

  const loadEmails = useCallback(async (pg = 0) => {
    const p = new URLSearchParams({ folder: emailFolder, inbox: emailInbox, q: emailQ, page: String(pg) });
    const r = await fetch(`/api/email?${p}`, { headers: h });
    if (r.ok) { const d = await r.json(); setEmails(d.emails || []); setEmailTotal(d.total || 0); }
  }, [emailFolder, emailInbox, emailQ, emailPage, secret]);

  useEffect(() => { if (authed && activeTab === "📧 Email") loadEmails(0); }, [activeTab, emailFolder, emailInbox]);
  // Auto-refresh inbox every 15s when on Email tab
  useEffect(() => {
    if (!authed || activeTab !== "📧 Email") return;
    const t = setInterval(() => loadEmails(emailPage), 15000);
    return () => clearInterval(t);
  }, [authed, activeTab, emailFolder, emailInbox, emailPage]);

  const sendCompose = async () => {
    setComposeSending(true);
    const r = await fetch("/api/email", { method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ to: composeTo, subject: composeSubject, body: composeBody, fromInbox: composeFrom,
        replyToId: selectedEmail?.id, replyToMessageId: selectedEmail?.message_id || selectedEmail?.thread_id,
        attachments: composeAttachments.length > 0 ? composeAttachments : undefined }) });
    setComposeSending(false);
    if (r.ok) { setComposeSent(true); setComposing(false); setComposeAttachments([]); loadEmails(0); setTimeout(()=>setComposeSent(false),3000); }
  };

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setComposeAttachments(prev => [...prev, { filename: file.name, content: base64, contentType: file.type }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const markEmailRead = async (ids: string[]) => {
    await fetch("/api/email", { method: "PATCH", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status: "read" }) });
    setEmails(prev => prev.map(e => ids.includes(e.id) ? { ...e, status: "read" } : e));
  };

  // Auto-reload listings when any filter changes (except free-text search — that needs Enter/button)
  useEffect(() => {
    if (authed && activeTab === "🏯 Listings") {
      loadListings(0);
    }
  }, [listingSort, listingSource, listingRegion, listingPref, listingTier, listingActive, listingFeatured, listingNoPhoto, listingSubsidy, listingMinBeds]);

  const loadListings = useCallback(async (pg?: number) => {
    const actualPage = pg ?? listingPage;
    const p: Record<string,string> = {
      q: listingQ, source: listingSource, sort: listingSort,
      pref: listingPref, region: listingRegion, tier: listingTier,
      active: listingActive, featured: listingFeatured,
      nophoto: listingNoPhoto, subsidy: listingSubsidy,
      minBeds: listingMinBeds, minPrice: listingMinPrice,
      maxPrice: listingMaxPrice, page: String(actualPage),
    };
    const r = await fetch(`/api/admin/listings?${new URLSearchParams(p)}`, { headers: h });
    if (r.ok) {
      const d = await r.json();
      setListings(d.listings || []);
      setListingTotal(d.total || 0);
      setListingHasMore(d.hasMore || false);
    }
  }, [listingQ, listingSource, listingSort, listingPref, listingRegion, listingTier, listingActive, listingFeatured, listingNoPhoto, listingSubsidy, listingMinBeds, listingMinPrice, listingMaxPrice, listingPage, secret]);

  const markRead = async (id: string) => {
    await fetch("/api/inquiries", { method: "PATCH", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "read" }) });
    setInquiries(p => p.map(i => i.id === id ? { ...i, status: "read" } : i));
  };

  const patchListing = async (id: string, patch: any) => {
    await fetch("/api/admin/listings", { method: "PATCH", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    setListings(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  const triggerScrape = async (action: string) => {
    setScraperAction(action);
    const r = await fetch("/api/admin/scrape", { method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const d = await r.json();
    setScraperLog(prev => `[${new Date().toLocaleTimeString()}] ${d.message || d.error}\n\n` + prev);
    setTimeout(async () => { await load("🔄 Scraper"); setScraperAction(null); }, 3000);
  };

  const sendEmail = async () => {
    setEmailStatus("sending");
    const r = await fetch("/api/admin/email-user", { method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ to: emailTo, subject: emailSubject, message: emailBody }) });
    setEmailStatus(r.ok ? "sent" : "error");
  };

  const sendNewsletter = async () => {
    setNlStatus("sending");
    const r = await fetch("/api/send-newsletter", { method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ subject: nlSubject, body: nlBody, tier: nlTier }) });
    const d = await r.json(); setNlResult(d); setNlStatus(r.ok ? "done" : "error");
  };

  if (!authed) return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-4xl mb-6">🔐</div>
        <h1 className="text-2xl font-black mb-6">Admin</h1>
        <input type="password" placeholder="Admin secret" value={secret} onChange={e => setSecret(e.target.value)} onKeyDown={e => e.key === "Enter" && setAuthed(true)} className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] mb-3" />
        <button onClick={() => setAuthed(true)} className="w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-3 rounded-full transition">Enter →</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-white/10">
        <Link href="/" className="font-black text-lg text-[#e85d2f]">CheapAkiya</Link>
        <span className="text-gray-600 text-sm">Admin</span>
      </nav>

      {/* Tab bar */}
      <div className="border-b border-white/10 overflow-x-auto">
        <div className="flex gap-1 px-6 max-w-6xl mx-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); load(tab); }}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab ? "border-[#e85d2f] text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
              {tab}{tab === "🎯 Leads" && (referrals.filter(r=>r.status==="new").length + inquiries.filter(i=>i.status==="new").length) > 0 ? ` (${referrals.filter(r=>r.status==="new").length + inquiries.filter(i=>i.status==="new").length})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

         {/* DASHBOARD */}
         {activeTab === "📊 Stats" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black">Dashboard</h1>
              <button onClick={()=>load("📊 Stats")} className="text-xs text-gray-600 hover:text-white transition">↻ Refresh</button>
            </div>
            {!dash ? <div className="text-center py-20 text-gray-600">Loading...</div> : (<>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">💰 Revenue</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{l:"MRR",v:`$${dash.mrr}`,c:"text-green-400"},{l:"ARR",v:`$${dash.arr?.toLocaleString()}`,c:"text-green-400"},{l:"Paid subs",v:dash.activeSubs,c:"text-[#e85d2f]"},{l:"Free subs",v:dash.freeSubscribers,c:"text-blue-400"},{l:"7d revenue",v:`$${dash.rev7?.toFixed(2)}`,c:"text-white"},{l:"30d revenue",v:`$${dash.rev30?.toFixed(2)}`,c:"text-white"},{l:"90d revenue",v:`$${dash.rev90?.toFixed(2)}`,c:"text-white"},{l:"Churn 30d",v:dash.churn30,c:dash.churn30>0?"text-red-400":"text-gray-600"}].map(s=>(
                  <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className={`text-2xl font-black ${s.c} mb-1`}>{s.v}</div>
                    <div className="text-gray-600 text-xs">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 mb-3">Revenue — 30 days</div>
                <div className="flex items-end gap-0.5 h-16">
                  {dash.revChart?.map((d:any,i:number)=>{const max=Math.max(...dash.revChart.map((x:any)=>x.amount),1);const h=Math.max((d.amount/max)*100,d.amount>0?6:2);return(<div key={i} className="flex-1 rounded-sm" style={{height:`${h}%`,backgroundColor:d.amount>0?"#e85d2f":"rgba(255,255,255,0.05)"}} title={`${d.date}: $${d.amount}`}/>);})}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 mb-1">Views — 30 days <span className="text-gray-700 font-normal">({dash.totalViews30} total · {dash.uniqueSessions} sessions)</span></div>
                <div className="flex items-end gap-0.5 h-16 mt-2">
                  {dash.viewsChart?.map((d:any,i:number)=>{const max=Math.max(...dash.viewsChart.map((x:any)=>x.count),1);const h=Math.max((d.count/max)*100,d.count>0?6:2);return(<div key={i} className="flex-1 rounded-sm" style={{height:`${h}%`,backgroundColor:d.count>0?"#3b82f6":"rgba(255,255,255,0.05)"}} title={`${d.date}: ${d.count}`}/>);})}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-xs font-bold text-gray-500 mb-4">Conversion funnel</div>
              <div className="flex items-center gap-2 flex-wrap">
                {[{l:"Page views",v:dash.totalViews30,c:"bg-blue-500/20 text-blue-400"},{l:"→",v:""},{l:"Inquiries",v:`${dash.totalInquiries} (${dash.convInquiry}%)`,c:"bg-yellow-500/20 text-yellow-400"},{l:"→",v:""},{l:"Referrals",v:`${dash.totalReferrals}`,c:"bg-[#e85d2f]/20 text-[#e85d2f]"},{l:"→",v:""},{l:"Paid",v:`${dash.activeSubs} subs`,c:"bg-green-500/20 text-green-400"}].map((s,i)=>s.l==="→"?<span key={i} className="text-gray-700 text-xl font-light">→</span>:(
                  <div key={i} className={`${s.c} rounded-xl px-4 py-2 text-center min-w-fit`}>
                    <div className="font-bold text-sm">{s.v}</div>
                    <div className="text-xs opacity-70 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 mb-3">📬 Leads</div>
                {[{l:"Open inquiries",v:dash.openInquiries,c:"text-yellow-400"},{l:"Total inquiries",v:dash.totalInquiries,c:"text-white"},{l:"Open referrals",v:dash.openReferrals,c:"text-[#e85d2f]"},{l:"Total referrals",v:dash.totalReferrals,c:"text-white"},{l:"Inbound emails",v:dash.inboundEmails,c:"text-blue-400"}].map(s=>(
                  <div key={s.l} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 text-sm">{s.l}</span>
                    <span className={`font-bold text-sm ${s.c}`}>{s.v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 mb-3">🏯 Listing quality</div>
                {[{l:"Total active",v:dash.totalListings,c:"text-white"},{l:"Free / Premium",v:`${dash.freeListings} / ${dash.premiumListings}`,c:"text-white"},{l:"With photos",v:`${dash.withPhotos} (${dash.photoRate}%)`,c:dash.photoRate>60?"text-green-400":"text-yellow-400"},{l:"Enriched",v:`${dash.enriched} (${dash.enrichRate}%)`,c:dash.enrichRate>50?"text-green-400":"text-yellow-400"}].map(s=>(
                  <div key={s.l} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 text-sm">{s.l}</span>
                    <span className={`font-bold text-sm ${s.c}`}>{s.v}</span>
                  </div>
                ))}
                <div className="mt-3 space-y-1.5">
                  {dash.bySource?.slice(0,4).map(([src,cnt]:any)=>(
                    <div key={src} className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-28 truncate">{src}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-1.5"><div className="bg-[#e85d2f] h-1.5 rounded-full" style={{width:`${Math.round((cnt/dash.totalListings)*100)}%`}}/></div>
                      <span className="text-white text-xs w-8 text-right">{cnt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 mb-3">🔥 Top listings (30d)</div>
                {dash.topListings?.length===0?<p className="text-gray-600 text-sm">No views tracked yet</p>:(
                  <div className="space-y-1.5">
                    {dash.topListings?.slice(0,6).map(([slug,cnt]:any)=>(
                      <div key={slug} className="flex items-center justify-between gap-2">
                        <a href={`/listings/${slug}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#e85d2f] text-xs truncate flex-1">{slug.replace(/^(akiya-athome-|ohj-|ts-)/,'').replace(/-/g,' ')}</a>
                        <span className="text-white font-bold text-xs">{cnt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 mb-3">💳 Recent payments</div>
                {!dash.recentCharges?.length?<p className="text-gray-600 text-sm">No payments yet</p>:(
                  <div className="space-y-1.5">
                    {dash.recentCharges?.map((c:any,i:number)=>(
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs truncate flex-1">{c.email}</span>
                        <span className="text-gray-600 text-xs">{c.date}</span>
                        <span className="text-green-400 font-bold text-xs">${c.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            </>)}
          </div>
        )}
        {/* TRAFFIC */}
        {activeTab === "📈 Traffic" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-black">Traffic Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">Google Analytics-style site performance from your tracked listing views.</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={trafficDays} onChange={e=>setTrafficDays(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300">
                  {[7,14,30,90].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
                <button onClick={()=>load("📈 Traffic")} className="text-xs text-gray-600 hover:text-white transition">↻ Refresh</button>
              </div>
            </div>

            {!traffic ? <div className="text-center py-20 text-gray-600">Loading...</div> : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { l: "Views", v: traffic.totalViews, c: "text-blue-400" },
                    { l: "Sessions", v: traffic.uniqueSessions, c: "text-white" },
                    { l: "Avg time", v: traffic.avgTime ? `${traffic.avgTime}s` : "—", c: "text-yellow-400" },
                    { l: "Bounce", v: `${traffic.bounceRate}%`, c: traffic.bounceRate > 70 ? "text-red-400" : "text-green-400" },
                    { l: "Pages/session", v: traffic.avgPages, c: "text-[#e85d2f]" },
                    { l: "Trend", v: traffic.viewsTrend ? `${traffic.viewsTrend}%` : "—", c: traffic.viewsTrend && Number(traffic.viewsTrend) >= 0 ? "text-green-400" : "text-red-400" },
                  ].map(s => (
                    <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className={`text-2xl font-black ${s.c} mb-1`}>{s.v}</div>
                      <div className="text-gray-600 text-xs">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="text-xs font-bold text-gray-500 mb-3">Daily traffic</div>
                    <div className="flex items-end gap-0.5 h-28">
                      {traffic.dailyChart?.map((d:any,i:number)=>{const max=Math.max(...traffic.dailyChart.map((x:any)=>x.views),1);const h=Math.max((d.views/max)*100,d.views>0?6:2);return(<div key={i} className="flex-1 rounded-sm bg-blue-500/80" style={{height:`${h}%`}} title={`${d.date}: ${d.views} views · ${d.sessions} sessions`}/>);})}
                    </div>
                    <div className="text-gray-700 text-xs mt-2">Views per day · hover for counts</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="text-xs font-bold text-gray-500 mb-3">Hourly activity</div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                      {(traffic.hourly || []).map((count:number,hour:number)=>(
                        <div key={hour} className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                          <div className="text-white text-sm font-bold">{count}</div>
                          <div className="text-gray-600 text-[10px]">{hour}:00</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="text-xs font-bold text-gray-500 mb-3">Top pages</div>
                    <div className="space-y-2">
                      {(traffic.topPages || []).slice(0,10).map((p:any)=> (
                        <div key={p.page} className="flex items-center justify-between gap-2">
                          <span className="text-gray-400 text-xs truncate flex-1">{p.page}</span>
                          <span className="text-white font-bold text-xs">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="text-xs font-bold text-gray-500 mb-3">Referrers</div>
                    <div className="space-y-2">
                      {(traffic.topReferrers || []).slice(0,8).map((r:any)=> (
                        <div key={r.source} className="flex items-center justify-between gap-2">
                          <span className="text-gray-400 text-xs truncate flex-1">{r.source}</span>
                          <span className="text-white font-bold text-xs">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="text-xs font-bold text-gray-500 mb-3">Devices</div>
                    <div className="space-y-2">
                      {(traffic.devices || []).map((d:any)=> (
                        <div key={d.device} className="flex items-center justify-between gap-2">
                          <span className="text-gray-400 text-xs truncate flex-1">{d.device}</span>
                          <span className="text-white font-bold text-xs">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="text-xs font-bold text-gray-500 mb-3">Page types</div>
                    <div className="space-y-2">
                      {(traffic.pageTypes || []).map((t:any)=> (
                        <div key={t.type} className="flex items-center justify-between gap-2">
                          <span className="text-gray-400 text-xs truncate flex-1">{t.type}</span>
                          <span className="text-white font-bold text-xs">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* REFERRALS */}
        {activeTab === "🎯 Leads" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black">Leads</h1>
              <button onClick={()=>load("🎯 Leads")} className="text-xs text-gray-600 hover:text-white">↻</button>
            </div>
            {/* Export bar */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-white/5 border border-white/10 rounded-xl flex-wrap">
              <span className="text-xs text-gray-400 font-semibold mr-1">Export CSV:</span>
              <input type="date" value={refExportFrom} onChange={e=>setRefExportFrom(e.target.value)}
                className="text-xs bg-white/10 border border-white/10 text-white px-2 py-1 rounded-lg focus:outline-none focus:border-[#e85d2f]" />
              <span className="text-gray-600 text-xs">→</span>
              <input type="date" value={refExportTo} onChange={e=>setRefExportTo(e.target.value)}
                className="text-xs bg-white/10 border border-white/10 text-white px-2 py-1 rounded-lg focus:outline-none focus:border-[#e85d2f]" />
              <button
                disabled={refExporting}
                onClick={async()=>{
                  setRefExporting(true);
                  try {
                    const params = new URLSearchParams();
                    if (refExportFrom) params.set("from", refExportFrom);
                    if (refExportTo) params.set("to", refExportTo);
                    const res = await fetch(`/api/admin/referrals/export?${params}`, { headers: h });
                    if (!res.ok) { alert("Export failed"); return; }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `referrals${refExportFrom?`_${refExportFrom}`:""}${refExportTo?`_to_${refExportTo}`:"_all"}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } finally { setRefExporting(false); }
                }}
                className="bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                {refExporting ? "⏳ Exporting..." : "⬇ Export"}
              </button>
              <span className="text-gray-600 text-xs ml-1">Leave dates blank for all time</span>
            </div>
            {referrals.length===0 ? (
              <div className="text-center py-20"><div className="text-4xl mb-3">🤝</div><p className="text-gray-600">No referral requests yet.</p></div>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref:any)=>(
                  <div key={ref.id} className={`border rounded-2xl p-5 cursor-pointer transition ${ref.status==="new"?"border-[#e85d2f]/40 bg-[#e85d2f]/5":"border-white/10 bg-white/3"}`}
                    onClick={()=>setExpandedRefId(expandedRefId===ref.id?null:ref.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {ref.status==="new"&&<span className="w-2 h-2 rounded-full bg-[#e85d2f] flex-shrink-0"/>}
                          <span className="font-semibold text-sm">{ref.name}</span>
                          <a href={`mailto:${ref.email}`} onClick={e=>e.stopPropagation()} className="text-[#e85d2f] text-xs hover:underline">{ref.email}</a>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ref.status==="closed"?"bg-green-500/20 text-green-400":ref.status==="new"?"bg-[#e85d2f]/20 text-[#e85d2f]":"bg-white/10 text-gray-400"}`}>{ref.status}</span>
                        </div>
                        <div className="text-gray-500 text-xs">Re: {ref.listing_name} · {ref.listing_price} · Budget: {ref.budget||"?"} · {ref.timeline||"?"}</div>
                      </div>
                      <div className="text-gray-700 text-xs flex-shrink-0">{new Date(ref.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                    </div>
                    {expandedRefId===ref.id&&(
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {ref.message&&<p className="text-gray-300 text-sm mb-4">{ref.message}</p>}
                        <div className="flex gap-3 flex-wrap">
                          <a href={`mailto:${ref.email}?subject=Re: ${encodeURIComponent(ref.listing_name)}&body=Hi ${ref.name},`} onClick={e=>e.stopPropagation()} className="bg-[#e85d2f] text-white text-xs font-bold px-4 py-2 rounded-full">✉ Reply →</a>
                          <select defaultValue={ref.status} onChange={async e=>{await fetch("/api/admin/referrals",{method:"PATCH",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({id:ref.id,status:e.target.value})});load("🎯 Leads");}} onClick={e=>e.stopPropagation()} className="bg-white/10 text-white text-xs px-3 py-2 rounded-full border border-white/10">
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_progress">In progress</option>
                            <option value="closed">Closed ✓</option>
                          </select>
                          <button onClick={async e=>{e.stopPropagation();if(!confirm("Delete this lead?"))return;await fetch("/api/admin/referrals",{method:"DELETE",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({id:ref.id})});setReferrals(p=>p.filter(r=>r.id!==ref.id));}} className="bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-bold px-4 py-2 rounded-full border border-red-900/30">🗑 Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APP INQUIRIES — shown in Leads tab below referrals */}
        {activeTab === "🎯 Leads" && inquiries.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-black mb-3 text-white">📱 App Inquiries ({inquiries.length})</h2>
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className={`border rounded-2xl p-5 cursor-pointer transition ${inq.status==="new"?"border-[#e85d2f]/40 bg-[#e85d2f]/5":"border-white/10 bg-white/3"}`}
                  onClick={async()=>{
                    setExpandedId(expandedId===inq.id?null:inq.id);
                    if(inq.status==="new"){
                      await fetch("/api/inquiries",{method:"PATCH",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({id:inq.id,status:"read"})});
                      setInquiries(p=>p.map(i=>i.id===inq.id?{...i,status:"read"}:i));
                    }
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {inq.status==="new"&&<span className="w-2 h-2 rounded-full bg-[#e85d2f] flex-shrink-0"/>}
                        <span className="font-semibold text-sm">{inq.name}</span>
                        <a href={`mailto:${inq.email}`} onClick={e=>e.stopPropagation()} className="text-[#e85d2f] text-xs hover:underline">{inq.email}</a>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${inq.member_tier==="premium"?"bg-orange-500/20 text-orange-400":"bg-blue-500/20 text-blue-400"}`}>{inq.member_tier}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${inq.status==="new"?"bg-[#e85d2f]/20 text-[#e85d2f]":"bg-white/10 text-gray-400"}`}>{inq.status}</span>
                      </div>
                      <div className="text-gray-500 text-xs truncate">Re: {inq.listing_name} · {inq.listing_price}</div>
                    </div>
                    <div className="text-gray-700 text-xs flex-shrink-0">{new Date(inq.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                  </div>
                  {expandedId===inq.id&&(
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">{inq.message}</p>
                      <div className="flex gap-3 flex-wrap">
                        <a href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.listing_name)}&body=Hi ${inq.name},`} onClick={e=>e.stopPropagation()} className="bg-[#e85d2f] text-white text-xs font-bold px-4 py-2 rounded-full">✉ Reply →</a>
                        {inq.listing_url&&<a href={inq.listing_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-full">View listing →</a>}
                        <button onClick={async e=>{e.stopPropagation();if(!confirm("Delete this inquiry?"))return;await fetch("/api/inquiries",{method:"DELETE",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({id:inq.id})});setInquiries(p=>p.filter(i=>i.id!==inq.id));}} className="bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-bold px-4 py-2 rounded-full border border-red-900/30">🗑 Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMAIL INBOX */}
        {activeTab === "📧 Email" && (
          <div className="flex gap-6 h-[calc(100vh-180px)]">
            {/* Left: email list */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              {/* Controls */}
              <div className="flex gap-2 mb-2">
                <select value={emailInbox} onChange={e=>{setEmailInbox(e.target.value);setSelectedEmail(null);}} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300">
                  <option value="all">🗂 All inboxes</option>
                  <option value="andrew">👤 andrew@</option>
                  <option value="luna">🤖 luna@</option>
                  <option value="newsletter">📩 newsletter@</option>
                  <option value="info">ℹ️ info@</option>
                </select>
                <button onClick={()=>loadEmails(0)} className="text-gray-600 hover:text-white text-xs px-2 py-2 transition">↻</button>
              </div>
              <div className="flex gap-2 mb-3">
                <select value={emailFolder} onChange={e=>{setEmailFolder(e.target.value);setSelectedEmail(null);}} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300">
                  <option value="inbox">📥 Inbox</option>
                  <option value="sent">📤 Sent</option>
                  <option value="unread">🔵 Unread</option>
                  <option value="trash">🗑 Trash</option>
                  <option value="all">📋 All (incl. sent)</option>
                </select>
                <button onClick={()=>{setComposing(true);setSelectedEmail(null);setComposeTo("");setComposeSubject("");setComposeBody("");setComposeSent(false);}} className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-xs font-bold px-3 py-2 rounded-lg transition flex-shrink-0">✏ Compose</button>
              </div>
              <div className="flex gap-2 mb-3">
                <input value={emailQ} onChange={e=>setEmailQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadEmails(0)} placeholder="Search..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
              </div>
              {composeSent && <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-green-400 text-xs mb-3">✓ Email sent</div>}
              {/* Email list */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {emails.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 text-sm">No emails yet</div>
                ) : emails.map(email => (
                  <div key={email.id}
                    onClick={()=>{setSelectedEmail(email);setComposing(false);if(email.status==="unread")markEmailRead([email.id]);}}
                    className={`p-3 rounded-xl cursor-pointer transition border ${selectedEmail?.id===email.id?"border-[#e85d2f]/50 bg-[#e85d2f]/5":email.status==="unread"?"border-white/20 bg-white/5":"border-white/5 hover:bg-white/3"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {email.status==="unread" && <span className="w-1.5 h-1.5 rounded-full bg-[#e85d2f] flex-shrink-0"/>}
                      <span className="text-xs text-white font-medium truncate flex-1">
                        {email.direction==="inbound" ? email.from_addr.split("<")[0].trim() || email.from_addr : `→ ${email.to_addr}`}
                      </span>
                      {emailInbox === "all" && email.inbox && (
                        <span className="text-gray-700 text-xs flex-shrink-0 ml-1">{email.inbox}@</span>
                      )}
                      <span className="text-gray-700 text-xs flex-shrink-0">{new Date(email.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                    </div>
                    <div className="text-xs font-medium text-gray-300 truncate mb-0.5">{email.subject}</div>
                    <div className="text-xs text-gray-600 truncate">{(email.body_text||"").slice(0,60)}</div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between pt-2 text-xs text-gray-600 mt-2">
                <button disabled={emailPage===0} onClick={()=>{const p=emailPage-1;setEmailPage(p);loadEmails(p);}} className="disabled:opacity-30 hover:text-white">← Prev</button>
                <span>{emailTotal} total</span>
                <button disabled={emails.length<30} onClick={()=>{const p=emailPage+1;setEmailPage(p);loadEmails(p);}} className="disabled:opacity-30 hover:text-white">Next →</button>
              </div>
              {/* Empty Trash */}
              {emailFolder === "trash" && emailTotal > 0 && (
                <button onClick={async()=>{
                  if(!confirm("Permanently delete all trashed emails? This cannot be undone.")) return;
                  await fetch("/api/email",{method:"DELETE",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({emptyTrash:true})});
                  setSelectedEmail(null);
                  loadEmails(0);
                }} className="mt-2 w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900/40 text-red-400 text-xs py-2 rounded-lg transition">
                  🗑 Empty Trash ({emailTotal} emails)
                </button>
              )}
            </div>

            {/* Right: compose / read pane */}
            <div className="flex-1 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              {composing ? (
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">New Email</h3>
                    <button onClick={()=>setComposing(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
                  </div>
                  <select value={composeFrom} onChange={e=>setComposeFrom(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#e85d2f] mb-3">
                    <option value="luna">From: Luna (luna@cheapakiya.com)</option>
                    <option value="andrew">From: Andrew (andrew@cheapakiya.com)</option>
                    <option value="info">From: Info (info@cheapakiya.com)</option>
                    <option value="newsletter">From: Newsletter (newsletter@cheapakiya.com)</option>
                  </select>
                  <input value={composeTo} onChange={e=>setComposeTo(e.target.value)} placeholder="To" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] mb-3"/>
                  <input value={composeSubject} onChange={e=>setComposeSubject(e.target.value)} placeholder="Subject" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] mb-3"/>
                  <textarea value={composeBody} onChange={e=>setComposeBody(e.target.value)} placeholder="Write your email..." rows={12} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] resize-none"/>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="cursor-pointer text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      📎 Attach file
                      <input type="file" multiple className="hidden" onChange={handleAttachFiles} />
                    </label>
                    {composeAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {composeAttachments.map((a,i) => (
                          <span key={i} className="flex items-center gap-1 text-xs bg-white/10 rounded px-2 py-1 text-gray-300">
                            {a.filename}
                            <button onClick={()=>setComposeAttachments(prev=>prev.filter((_,j)=>j!==i))} className="text-gray-500 hover:text-red-400 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={sendCompose} disabled={composeSending||!composeTo||!composeSubject||!composeBody} className="mt-3 bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold py-3 rounded-full transition">
                    {composeSending ? "Sending..." : "Send →"}
                  </button>
                </div>
              ) : selectedEmail ? (
                <div className="flex flex-col h-full">
                  {/* Email header */}
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold mb-3">{selectedEmail.subject}</h2>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-sm text-gray-400">
                        <span className="font-medium text-white">{selectedEmail.direction==="inbound"?selectedEmail.from_addr:"You"}</span>
                        <span className="text-gray-600 mx-2">→</span>
                        <span>{selectedEmail.direction==="inbound"?"you":selectedEmail.to_addr}</span>
                      </div>
                      <span className="text-gray-600 text-xs">{new Date(selectedEmail.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="flex-1 overflow-y-auto">
                    {selectedEmail.body_html
                      ? <iframe
                          srcDoc={selectedEmail.body_html}
                          className="w-full h-full border-0 bg-white"
                          style={{minHeight:"300px"}}
                          sandbox="allow-same-origin"
                          title="Email body"
                        />
                      : <div className="p-6">
                          {selectedEmail.body_text
                            ? <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{(selectedEmail.body_text||"").replace(/\[cid:[^\]]+\]/g,"[inline image]")}</div>
                            : <div className="text-gray-600 text-sm italic">No body content.</div>
                          }
                        </div>
                    }
                  </div>
                  {/* Action bar */}
                  <div className="p-4 border-t border-white/10 flex gap-2">
                    {selectedEmail.direction==="inbound" && (
                      <button onClick={()=>{setComposing(true);setComposeTo(selectedEmail.from_addr);setComposeSubject(`Re: ${selectedEmail.subject.replace(/^Re:\s*/i,'')}`);setComposeBody(`\n\n---\nOn ${new Date(selectedEmail.created_at).toLocaleDateString()}, ${selectedEmail.from_addr} wrote:\n${selectedEmail.body_text?.split('\n').map(l=>'>'+l).join('\n')}`);}} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm py-3 rounded-xl transition">
                        ↩ Reply
                      </button>
                    )}
                    {selectedEmail.status !== "deleted"
                      ? <button onClick={async()=>{
                          await fetch("/api/email",{method:"PATCH",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({ids:[selectedEmail.id],status:"deleted"})});
                          setSelectedEmail(null);
                          loadEmails(0);
                        }} className="bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 text-sm px-4 py-3 rounded-xl transition" title="Move to trash">
                          🗑 Delete
                        </button>
                      : <button onClick={async()=>{
                          await fetch("/api/email",{method:"DELETE",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({ids:[selectedEmail.id]})});
                          setSelectedEmail(null);
                          loadEmails(0);
                        }} className="bg-red-900/50 hover:bg-red-700/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl transition" title="Permanently delete">
                          💀 Delete Forever
                        </button>
                    }
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <div className="text-center">
                    <div className="text-5xl mb-3">📧</div>
                    <p className="text-sm">Select an email to read</p>
                    <p className="text-xs mt-2 text-gray-700">or compose a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DNS Setup notice — only show if no emails yet */}

                {/* LISTINGS MANAGER */}
        {activeTab === "🏯 Listings" && (
          <div>
            <h1 className="text-2xl font-black mb-6">Listings Manager</h1>
            <div className="space-y-3 mb-6">
              {/* Search */}
              <div className="flex gap-3">
                <input value={listingQ} onChange={e=>setListingQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setListingPage(0);loadListings(0);}}} placeholder="Search by name..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
                <button onClick={()=>{setListingPage(0);loadListings(0);}} className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex-shrink-0">Search</button>
              </div>
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: listingSort, set: setListingSort, opts: [["newest","↓ Newest"],["oldest","↑ Oldest"],["price_asc","$ Low→High"],["price_desc","$ High→Low"],["beds_desc","Most beds"]] },
                  { val: listingSource, set: setListingSource, opts: [["","All sources"],["akiya-athome","akiya-athome"],["oldhousesjapan","oldhousesjapan"],["cheapakiya","cheapakiya"],["homes","homes"]] },
                  { val: listingRegion, set: setListingRegion, opts: [["","All regions"],...["Hokkaido","Tohoku","Kanto","Chubu","Kansai","Chugoku","Shikoku","Kyushu"].map(r=>[r,r])] },
                  { val: listingPref, set: setListingPref, opts: [["","All prefectures"],...["Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata","Fukushima","Ibaraki","Tochigi","Gunma","Saitama","Chiba","Tokyo","Kanagawa","Niigata","Toyama","Nagano","Gifu","Shizuoka","Aichi","Mie","Shiga","Kyoto","Osaka","Hyogo","Nara","Wakayama","Tottori","Shimane","Okayama","Hiroshima","Yamaguchi","Tokushima","Kagawa","Ehime","Kochi","Fukuoka","Saga","Nagasaki","Kumamoto","Oita","Miyazaki","Kagoshima","Okinawa"].map(p=>[p,p])] },
                  { val: listingTier, set: setListingTier, opts: [["","Free+Premium"],["free","Free"],["premium","Premium"]] },
                  { val: listingActive, set: setListingActive, opts: [["active","Active"],["hidden","Hidden"],["","All"]] },
                  { val: listingMinBeds, set: setListingMinBeds, opts: [["","Any beds"],...[2,3,4,5,6,7].map(b=>[String(b),`${b}+ beds`])] },
                ].map(({val,set,opts},i) => (
                  <select key={i} value={val} onChange={e=>{set(e.target.value);setListingPage(0);}} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300">
                    {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                ))}
                <input value={listingMaxPrice} onChange={e=>setListingMaxPrice(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadListings(0)} placeholder="Max $" className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
                {[
                  { val: listingSubsidy, set: setListingSubsidy, label: "🏛️ Subsidy", on: "bg-green-700/40 text-green-400" },
                  { val: listingNoPhoto, set: setListingNoPhoto, label: "📷 No photo", on: "bg-yellow-700/40 text-yellow-400" },
                  { val: listingFeatured, set: setListingFeatured, label: "⭐ Featured", on: "bg-yellow-500/40 text-yellow-300" },
                ].map(({val,set,label,on})=>(
                  <button key={label} onClick={()=>{set(v=>v==="1"?"":"1");setListingPage(0);}} className={`text-xs px-3 py-2 rounded-lg transition ${val==="1"?on:"bg-white/5 text-gray-600 hover:text-white"}`}>{label}</button>
                ))}
                <button onClick={()=>{
                  setListingQ("");setListingSource("");setListingSort("newest");setListingPref("");
                  setListingRegion("");setListingTier("");setListingActive("active");setListingFeatured("");
                  setListingNoPhoto("");setListingSubsidy("");setListingMinBeds("");setListingMinPrice("");
                  setListingMaxPrice("");setListingPage(0);
                }} className="text-xs text-gray-600 hover:text-white transition px-2 border border-white/10 rounded-lg py-2">✕ Reset</button>
              </div>
              {/* Pagination */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium text-white">{listingTotal} total</span>
                <span>· Page {listingPage + 1}</span>
                <button disabled={listingPage===0} onClick={()=>{const p=listingPage-1;setListingPage(p);loadListings(p);}} className="disabled:opacity-30 hover:text-white transition">← Prev</button>
                <button disabled={!listingHasMore} onClick={()=>{const p=listingPage+1;setListingPage(p);loadListings(p);}} className="disabled:opacity-30 hover:text-white transition">Next →</button>
              </div>
            </div>
            <div className="space-y-2">
              {listings.map(l => (
                <div key={l.id} className={`border rounded-xl overflow-hidden ${l.is_featured?"border-yellow-500/40 bg-yellow-500/5":l.is_active?"border-white/10 bg-white/3":"border-red-500/20 bg-red-500/5 opacity-50"}`}>
                  {editingId===l.id ? (
                    <div className="p-4 space-y-3">
                      <input value={editFields.name_en||""} onChange={e=>setEditFields({...editFields,name_en:e.target.value})} placeholder="Name" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"/>
                      <textarea value={editFields.notes_en||""} onChange={e=>setEditFields({...editFields,notes_en:e.target.value})} placeholder="Notes" rows={3} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none"/>
                      <input value={editFields.contact_email||""} onChange={e=>setEditFields({...editFields,contact_email:e.target.value})} placeholder="Contact email/URL" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"/>
                      <div className="flex gap-3">
                        <button onClick={async()=>{await patchListing(l.id,editFields);setEditingId(null);}} className="bg-[#e85d2f] text-white text-xs font-bold px-4 py-2 rounded-full">Save</button>
                        <button onClick={()=>setEditingId(null)} className="bg-white/10 text-white text-xs px-4 py-2 rounded-full">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0">
                      {/* Thumbnail */}
                      {l.images?.[0] ? (
                        <div className="flex-shrink-0 w-20 h-16 relative overflow-hidden">
                          <img src={l.images[0]} alt="" className="w-full h-full object-cover"/>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-20 h-16 bg-white/5 flex items-center justify-center text-gray-700 text-xs">No img</div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0 px-3 py-2">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          {l.is_featured && <span className="text-yellow-400 text-xs">⭐</span>}
                          {!l.is_active && <span className="text-red-400 text-xs">Hidden</span>}
                          <span className="font-semibold text-sm truncate">{l.name_en}</span>
                        </div>
                        <div className="text-gray-600 text-xs">{l.prefecture_en} · ${(l.price_usd||0).toLocaleString()} · <span className="text-gray-700">{l.source}</span> · {l.images?.length||0} 📷</div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-1.5 flex-shrink-0 pr-3">
                        <button onClick={()=>{setEditingId(l.id);setEditFields({name_en:l.name_en});}} className="bg-white/10 hover:bg-white/20 text-xs text-white px-2.5 py-1.5 rounded-lg transition">Edit</button>
                        <button onClick={()=>patchListing(l.id,{is_featured:!l.is_featured})} title="Toggle featured" className={`text-xs px-2.5 py-1.5 rounded-lg transition ${l.is_featured?"bg-yellow-500/20 text-yellow-400":"bg-white/5 text-gray-600 hover:text-yellow-400"}`}>⭐</button>
                        <button onClick={()=>patchListing(l.id,{is_active:!l.is_active})} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${l.is_active?"bg-white/5 text-gray-600 hover:text-red-400":"bg-red-500/20 text-red-400"}`}>{l.is_active?"Hide":"Show"}</button>
                        <a href={`/listings/${l.slug}`} target="_blank" rel="noreferrer" className="bg-white/5 text-gray-600 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition">↗</a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCRAPER */}
        {activeTab === "🔄 Scraper" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black">Scraper Control</h1>
              <button onClick={()=>load("🔄 Scraper")} className="text-xs text-gray-600 hover:text-white">↻ Refresh</button>
            </div>
            {/* Status bar */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Last listing added</div>
                <div className="text-sm text-white">{scraperStatus.lastScraped ? new Date(scraperStatus.lastScraped).toLocaleString() : "—"}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Added today (akiya-athome)</div>
                <div className="text-sm text-white font-bold">{scraperStatus.addedToday ?? "—"}</div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { action: "scrape", label: "▶ Scrape Municipalities", color: "bg-[#e85d2f] hover:bg-[#d44f23]" },
                { action: "enrich", label: "⚙ Run Enricher", color: "bg-blue-600 hover:bg-blue-700" },
                { action: "backfill", label: "📷 Backfill Images", color: "bg-purple-600 hover:bg-purple-700" },
                { action: "balance", label: "⚖ Balance Free/Premium", color: "bg-green-700 hover:bg-green-800" },
                { action: "kill", label: "■ Stop All", color: "bg-red-800 hover:bg-red-900" },
              ].map(btn => (
                <button key={btn.action} onClick={()=>triggerScrape(btn.action)} disabled={scraperAction !== null}
                  className={`${btn.color} disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-full transition`}>
                  {scraperAction===btn.action ? "Running..." : btn.label}
                </button>
              ))}
            </div>
            <div className="bg-black border border-white/10 rounded-2xl p-4">
              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{scraperLog || "No log yet — click Refresh."}</pre>
            </div>
          </div>
        )}

        {/* SUBSCRIBERS */}
        {activeTab === "👥 Subscribers" && (
          <div>
            <h1 className="text-2xl font-black mb-4">Subscribers</h1>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="flex rounded-full overflow-hidden border border-white/10">
                {(["free","premium"] as const).map(t=>(
                  <button key={t} onClick={()=>{setSubTier(t); const p=new URLSearchParams({tier:t,q:subQ}); fetch(`/api/admin/subscribers?${p}`,{headers:h}).then(r=>r.json()).then(d=>{setSubscribers(d.subscribers||[]);setSubTotal(d.total||0);});}} className={`px-4 py-2 text-sm font-medium transition capitalize ${subTier===t?"bg-[#e85d2f] text-white":"bg-white/5 text-gray-400 hover:text-white"}`}>{t==="premium"?"⭐ Premium":"Free"}</button>
                ))}
              </div>
              <input value={subQ} onChange={e=>setSubQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load("👥 Subscribers")} placeholder="Search email..." className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
              <button onClick={()=>load("👥 Subscribers")} className="bg-[#e85d2f] text-white text-sm font-bold px-4 py-2 rounded-xl">Search</button>
            </div>
            <p className="text-gray-600 text-sm mb-4">{subTotal} {subTier} subscribers</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-600 text-xs text-left border-b border-white/10">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2 pr-4">Source</th>
                    <th className="pb-2 pr-4">Newsletter</th>
                    <th className="pb-2 pr-4">Sent</th>
                    <th className="pb-2 pr-4">Opened</th>
                    <th className="pb-2 pr-4">Open rate</th>
                    <th className="pb-2 pr-4">Tier</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subscribers.map(s=>(
                    <tr key={s.email} className="hover:bg-white/3 transition">
                      <td className="py-3 pr-4">
                        <div className="text-white">{s.email}</div>
                        {s.name !== "—" && <div className="text-gray-600 text-xs">{s.name}</div>}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{s.since}</td>
                      <td className="py-3 pr-4">
                        {s.signup_source === "app_apple" && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">🍎 Apple</span>}
                        {s.signup_source === "app_google" && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">G App</span>}
                        {(!s.signup_source || s.signup_source === "web") && <span className="text-xs text-gray-600">🌐 Web</span>}
                      </td>
                      <td className="py-3 pr-4">
                        {s.newsletter_consent === true  && <span className="text-xs text-green-400">✓ opted in</span>}
                        {s.newsletter_consent === false && <span className="text-xs text-gray-600">✗ no consent</span>}
                        {s.newsletter_consent == null  && <span className="text-xs text-gray-600">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{s.emailsSent ?? "—"}</td>
                      <td className="py-3 pr-4 text-gray-400">{s.emailsOpened ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs ${(parseInt(s.openRate||"0")>=30)?"text-green-400":(parseInt(s.openRate||"0")>=10)?"text-yellow-400":"text-gray-600"}`}>{s.openRate ?? "—"}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.tier==="premium"?"bg-[#e85d2f]/20 text-[#e85d2f]":"bg-white/10 text-gray-400"}`}>{s.tier}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          <button onClick={()=>{setActiveTab("📧 Email");setComposing(true);setComposeTo(s.email);setComposeSubject("");setComposeBody("");}} title="Email" className="text-xs text-gray-600 hover:text-[#e85d2f] px-2 py-1 rounded transition">✉</button>
                          {s.tier==="free" && (
                            <button onClick={async()=>{
                              if(!confirm(`Upgrade ${s.email} to premium?`)) return;
                              await fetch("/api/admin/subscribers",{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({action:"upgrade",email:s.email,beehiivId:s.beehiivId})});
                              await load("👥 Subscribers");
                            }} className="text-xs bg-[#e85d2f]/20 text-[#e85d2f] hover:bg-[#e85d2f]/40 px-2 py-1 rounded transition">↑ Upgrade</button>
                          )}
                          {s.tier==="premium" && (
                            <button onClick={async()=>{
                              if(!confirm(`Downgrade ${s.email}? ${s.stripeSubId?"This will cancel their Stripe subscription.":""}`)) return;
                              await fetch("/api/admin/subscribers",{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({action:"downgrade",email:s.email,beehiivId:s.beehiivId,stripeSubId:s.stripeSubId})});
                              await load("👥 Subscribers");
                            }} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 px-2 py-1 rounded transition">↓ Downgrade</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMAIL USER */}
        {activeTab === "✉️ Email User" && (
          <div>
            <h1 className="text-2xl font-black mb-6">Email a User</h1>
            {emailStatus==="sent" ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-green-400 font-bold">Email sent to {emailTo}</p>
                <button onClick={()=>{setEmailStatus("idle");setEmailTo("");setEmailSubject("");setEmailBody("");}} className="mt-4 text-gray-500 hover:text-white text-sm">Send another</button>
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                <input value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder="To (email address)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
                <input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} placeholder="Subject" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
                <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} rows={8} placeholder="Message..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] resize-y"/>
                <button onClick={sendEmail} disabled={emailStatus==="sending"||!emailTo||!emailSubject||!emailBody} className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold py-3 rounded-full transition">
                  {emailStatus==="sending"?"Sending...":"Send Email →"}
                </button>
                {emailStatus==="error" && <p className="text-red-400 text-sm text-center">Failed to send. Check the address and try again.</p>}
              </div>
            )}
          </div>
        )}

        {/* NEWSLETTER */}
        {activeTab === "📤 Newsletter" && (
          <div>
            <h1 className="text-2xl font-black mb-6">Send Newsletter</h1>
            <div className="max-w-2xl space-y-4">
              <div className="flex rounded-full overflow-hidden border border-white/10 w-fit">
                {["premium","free"].map(t=>(
                  <button key={t} onClick={()=>setNlTier(t)} className={`px-5 py-2 text-sm font-medium transition capitalize ${nlTier===t?"bg-[#e85d2f] text-white":"bg-white/5 text-gray-400 hover:text-white"}`}>{t==="premium"?"⭐ Premium":"Free subscribers"}</button>
                ))}
              </div>
              <input value={nlSubject} onChange={e=>setNlSubject(e.target.value)} placeholder="Subject line" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]"/>
              <textarea value={nlBody} onChange={e=>setNlBody(e.target.value)} rows={12} placeholder="Email body (HTML or plain text)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] font-mono resize-y"/>
              {nlStatus==="idle" && <button onClick={sendNewsletter} disabled={!nlSubject||!nlBody} className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold py-4 rounded-full transition">Send to {nlTier==="premium"?"Premium Members":"Free Subscribers"} →</button>}
              {nlStatus==="sending" && <div className="text-center py-6 text-gray-400 animate-pulse">📤 Sending...</div>}
              {nlStatus==="done" && nlResult && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                  <p className="text-green-400 font-bold text-lg">Sent to {nlResult.sent} / {nlResult.total}</p>
                  <button onClick={()=>{setNlStatus("idle");setNlSubject("");setNlBody("");}} className="mt-3 text-gray-500 hover:text-white text-sm">Send another</button>
                </div>
              )}
              {nlStatus==="error" && <p className="text-red-400 text-sm text-center">Failed. Try again.</p>}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
