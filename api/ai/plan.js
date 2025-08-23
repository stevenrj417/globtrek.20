// api/ai/plan.js
// Vercel serverless function for GlobTrek
// Env vars: OPENAI_API_KEY (required), GLOB_MODEL (optional)

const MODEL = process.env.GLOB_MODEL || "gpt-5-mini";

function clampDays(n) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.max(1, Math.min(30, Math.floor(x))) : 1;
}
function safeParseJSON(s) {
  try { return JSON.parse(s); } catch { return null; }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: "Missing OPENAI_API_KEY" });
      return;
    }

    // Body may be string or object
    const body = typeof req.body === "string" ? safeParseJSON(req.body) || {} : (req.body || {});
    const destination = String(body.destination || "").trim();
    const days = clampDays(body.days || 0);
    const budget = String(body.budget || "").trim();
    const pace = String(body.pace || "").trim();
    const interests = Array.isArray(body.interests) ? body.interests.slice(0, 8) : [];
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

    // Ask for missing inputs first
    const needs = [];
    if (!merged.destination) needs.push("destination");
    if (!merged.days) needs.push("days");
    if (!merged.budget) needs.push("budget");
    if (!merged.pace) needs.push("pace");
    if (!merged.interests?.length) needs.push("interests");

    if (needs.length) {
      const q = [];
      if (needs.includes("destination")) q.push("Where do you want to go?");
      if (needs.includes("days"))        q.push("How many days?");
      if (needs.includes("budget"))      q.push("Budget? (low / mid / high)");
      if (needs.includes("pace"))        q.push("Preferred pace? (relaxed / balanced / packed)");
      if (needs.includes("interests"))   q.push("Top interests? (food, history, nature, nightlife, art, shopping)");
      res.json({ status: "need_info", needs, questions: q });
      return;
    }

    const system = `You are GlobTrek, a meticulous trip designer. OUTPUT STRICT JSON ONLY:
{
  "summary": "...",
  "best_time": "...",
  "daily": [
    {
      "day": 1,
      "theme": "...",
      "morning": "...",
      "afternoon": "...",
      "evening": "...",
      "neighborhoods": ["..."],
      "food": ["...","..."],
      "notes": "..."
    }
  ],
  "estimated_costs": { "currency": "USD", "per_day": { "low": 0, "mid": 0, "high": 0 }, "notes": "..." },
  "tips": ["...","..."],
  "next_questions": ["..."]
}
Keep routes geographically sensible and prices realistic.`;

    const traveler = profile ? `
Traveler:
- name: ${profile.name || "guest"}
- homeAirport: ${profile.homeAirport || "unspecified"}
- dietary: ${profile.dietary || "none"}
- mobility: ${profile.mobility || "none"}
- lodging: ${profile.lodging || "standard"}
- style: ${profile.style || "balanced"}` : "Traveler: not provided";

    const user = `Destination: ${merged.destination}
Days: ${merged.days}
Budget: ${merged.budget}
Pace: ${merged.pace}
Interests: ${(merged.interests || []).join(", ") || "general"}

${traveler}

Constraints:
- daily must have exactly ${merged.days} items (1..${merged.days})
- include neighborhoods each day
- include at least 2 specific food ideas per day when possible
- Respond with JSON only`;

    // Call OpenAI — NO temperature (some models only accept the default)
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!r.ok) {
      res.status(500).json({ error: `OpenAI ${r.status}: ${await r.text()}` });
      return;
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";

    // Try to parse JSON, even if wrapped
    let json = safeParseJSON(content);
    if (!json) {
      const m = content.match(/\{[\s\S]*\}$/);
      json = m ? safeParseJSON(m[0]) : null;
    }

    let text = "No plan returned.";
    if (json?.daily?.length) {
      const lines = [
        `GlobTrek — ${merged.destination} • ${merged.days} days`,
        json.summary ? `\nSummary: ${json.summary}` : "",
        json.best_time ? `When to go: ${json.best_time}` : "",
        "",
        ...json.daily.map(d => ([
          `Day ${d.day}: ${d.theme || "Explore"}`,
          d.morning      ? `  Morning: ${d.morning}`     : "",
          d.afternoon    ? `  Afternoon: ${d.afternoon}` : "",
          d.evening      ? `  Evening: ${d.evening}`     : "",
          d.neighborhoods?.length ? `  Areas: ${d.neighborhoods.join(", ")}` : "",
          d.food?.length ? `  Food: ${d.food.join(" • ")}` : "",
          d.notes        ? `  Notes: ${d.notes}` : "",
          ""
        ].filter(Boolean).join("\n")))
      ].filter(Boolean);
      text = lines.join("\n");
    } else if (content) {
      text = content;
    }

    res.json({
      status: "ok",
      plan: text,
      planJson: json || null,
      next_questions: json?.next_questions || [],
      model_used: MODEL
    });
  } catch (e) {
    res.status(500).json({ error: `Planner failed: ${e.message || "unknown"}` });
  }
}
