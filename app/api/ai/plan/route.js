// app/api/ai/plan/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const MODEL = process.env.GLOB_MODEL || "gpt-5-mini"; // switchable

function clamp(n){ const x=Number(n); return Number.isFinite(x)?Math.max(1,Math.min(30,Math.floor(x))):1; }

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const destination = String(body.destination||"").trim();
    const days = clamp(body.days||0);
    const budget = String(body.budget||"").trim();
    const pace = String(body.pace||"").trim();
    const interests = Array.isArray(body.interests) ? body.interests.slice(0,8) : [];
    const followUpAnswers = body.followUpAnswers || {};
    const profile = body.profile || null;

    const merged = {
      destination,
      days,
      budget: followUpAnswers.budget || budget,
      pace: followUpAnswers.pace || pace,
      interests: followUpAnswers.interests || interests,
      profile,
    };

    const needs=[];
    if(!merged.destination) needs.push("destination");
    if(!merged.days) needs.push("days");
    if(!merged.budget) needs.push("budget");
    if(!merged.pace) needs.push("pace");
    if(!merged.interests?.length) needs.push("interests");
    if(needs.length){
      const q=[];
      if(needs.includes("destination")) q.push("Where do you want to go?");
      if(needs.includes("days")) q.push("How many days?");
      if(needs.includes("budget")) q.push("Budget? (low / mid / high)");
      if(needs.includes("pace")) q.push("Preferred pace? (relaxed / balanced / packed)");
      if(needs.includes("interests")) q.push("Top interests? (food, history, nature, nightlife, art, shopping)");
      return NextResponse.json({ status:"need_info", needs, questions:q });
    }

    const system = `You are GlobTrek, a meticulous trip designer.
Return ONLY valid JSON:
{
  "summary":"...",
  "best_time":"...",
  "daily":[
    {"day":1,"theme":"...","morning":"...","afternoon":"...","evening":"...","neighborhoods":["..."],"food":["..."],"notes":"..."}
  ],
  "estimated_costs":{"currency":"USD","per_day":{"low":0,"mid":0,"high":0},"notes":"..."},
  "tips":["...","..."],
  "next_questions":["...","..."]
}
Reflect traveler profile if provided. Keep routes geographically sensible; use realistic price ranges.`;

    const traveler = merged.profile ? `
Traveler profile:
- name: ${merged.profile.name || "guest"}
- homeAirport: ${merged.profile.homeAirport || "unspecified"}
- dietary: ${merged.profile.dietary || "none"}
- mobility: ${merged.profile.mobility || "none"}
- lodging: ${merged.profile.lodging || "standard"}
- style: ${merged.profile.style || "balanced"}` : "Traveler profile: not provided";

    const user = `Destination: ${merged.destination}
Days: ${merged.days}
Budget: ${merged.budget}
Pace: ${merged.pace}
Interests: ${(merged.interests||[]).join(", ") || "general"}

${traveler}

Constraints:
- daily must have exactly ${merged.days} items (1..${merged.days})
- include neighborhoods/areas each day
- at least 2 food ideas per day when possible`;

    const r = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body: JSON.stringify({ model: MODEL, temperature:0.7, messages:[{role:"system",content:system},{role:"user",content:user}] })
    });
    if(!r.ok){ return NextResponse.json({ error:`OpenAI ${r.status}: ${await r.text()}`},{status:500}); }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    let json=null; try{ json=JSON.parse(content);}catch{}

    let text = "No plan returned.";
    if(json?.daily?.length){
      const lines = [
        `GlobTrek — ${merged.destination} • ${merged.days} days`,
        json.summary?`\nSummary: ${json.summary}`:"",
        json.best_time?`When to go: ${json.best_time}`:"",
        "",
        ...json.daily.map(d=>[
          `Day ${d.day}: ${d.theme||"Explore"}`,
          d.morning?`  Morning: ${d.morning}`:"",
          d.afternoon?`  Afternoon: ${d.afternoon}`:"",
          d.evening?`  Evening: ${d.evening}`:"",
          d.neighborhoods?.length?`  Areas: ${d.neighborhoods.join(", ")}`:"",
          d.food?.length?`  Food: ${d.food.join(" • ")}`:"",
          d.notes?`  Notes: ${d.notes}`:"",
          ""
        ].filter(Boolean).join("\n"))
      ].filter(Boolean);
      text = lines.join("\n");
    } else if (content) {
      text = content;
    }

    return NextResponse.json({ status:"ok", plan:text, planJson:json, next_questions:json?.next_questions||[] });
  } catch(e) {
    return NextResponse.json({ error:`Planner failed: ${e.message||"unknown"}` },{ status:500 });
  }
}
