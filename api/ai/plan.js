// api/ai/plan.js
// Vercel serverless function for GlobTrek planner
// Requires env var: OPENAI_API_KEY  (and optional GLOB_MODEL)

const MODEL = process.env.GLOB_MODEL || "gpt-5-mini"; // e.g. "gpt-5-mini" or "gpt-4.1-nano"

function clampDays(n) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.max(1, Math.min(30, Math.floor(x))) : 1;
}

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing OPENAI_API_KEY on the server" });
      return;
    }

    // Body can be object or string (depending on hosting/proxy)
    const raw = typeof req.body === "string" ? safeJsonParse(req.body) : req.body || {};
    const destination = String(raw.destination || "").trim();
    const days = clampDays(raw.days || 0);
    const budget = String(raw.budget || "").trim();
    const pace = String(raw.pace || "").trim(); // relaxed | balanced | packed
    const interests = Array.isArray(raw.interests) ? raw.interests.slice(0, 8) : [];
    const followUp = raw.followUpAnswers || {};
    const profile = raw.profile || null;

    const merged = {
      destination,
      days,
      budget: followUp.budget || budget,
      pace: followUp.pace || pace,
      interests: followUp.interests || interests,
      profile,
    };

    // Ask for missing bits first
    const needs = [];
    if (!merged.destination) needs.push("destination");
    if (!merged.days) needs.push("days");
    if (!merged.budget) needs.push("budget");
    if (!merged.pace) needs.push("pace");
    if (!merged.interests?.length) needs.push("interests");

    if (needs.length) {
      const questions = [];
      if (needs.includes("destination")) questions.push("Where do you want to go?");
      if (needs.includes("days"))        questions.push("How many days?");
      if (needs.includes("budget"))      questions.push("Budget? (low / mid / high)");
      if (needs.includes("pace"))        questions.push("Preferred pace? (relaxed / balanced / packed)");
      if (needs.includes("interests"))   questions.push("Top interests? (food, history, nature, nightlife, art, shopping, hikes, beaches)");
      res.json({ status: "need_info", needs, questions });
      return;
    }

    const system = `You are GlobTrek, a meticulous trip designer. OUTPUT STRICT JSON ONLY:
{
  "summary": "one-paragraph overview tailored to the traveler",
  "best_time": "best months or seasons with 1-line reason",
  "daily": [
    {
      "day": 1,
      "theme": "short title for the day",
      "morning": "activities & areas",
      "afternoon": "activities & areas",
      "evening": "activities & areas",
      "neighborhoods": ["area1","area2"],
      "food": ["specific place 1","specific place 2"],
      "notes": "local tips/logistics"
    }
  ],
  "estimated_costs": {
    "currency": "USD",
    "per_day": {"low": 0, "mid": 0, "high": 0},
    "notes": "brief note on what drives costs"
  },
  "tips": ["one-line tip","another tip"],
  "next_questions": ["short follow-up to refine"]
}
Keep routes geographically sensible; avoid backtracking.`;

    const traveler = merged.profile ? `
Traveler:
- name: ${merged.profile.name || "guest"}
- homeAirport: ${merged.profile.homeAirport || "unspecified"}
- dietary: ${merged.profile.dietary || "none"}
- mobility: ${merged.profile.mobility || "none"}
- lodging: ${merged.profile.lodging || "standard"}
- style: ${merged.profile.style || merged.pace || "balanced"}` : "Traveler: not provided";

    const user = `Destination: ${merged.destination}
Days: ${merged.days}
Budget: ${merged.budget}
Pace: ${merged.pace}
Interests: ${(merged.interests || []).join(", ") || "general"}
${traveler}
Constraints:
- Produce exactly ${merged.days} items in "daily" (day 1..${merged.days})
- Include 1–2 neighborhoods each day
- Include 2+ specific food ideas per day when possible
- JSON ONLY, no extra text`;

    // Call OpenAI — no temperature included (some models require default=1)
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      const errTxt = await r.text();
      res.status(500).json({ error: `OpenAI ${r.status}: ${errTxt}` });
      return;
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";

    // Safely extract JSON (some models may wrap or add stray chars)
    let json = safeJsonParse(content);
    if (!json) {
      const match = content.match(/\{[\s\S]*\}$/);
      json = match ? safeJsonParse(match[0]) : null;
    }

    let textPlan = "No plan returned.";
    if (json?.daily?.length) {
      const parts = [
        `GlobTrek — ${merged.destination} • ${merged.days} days`,
        json.summary ? `\nSummary: ${json.summary}` : "",
        json.best_time ? `When to go: ${json.best_time}` : "",
        "",
        ...json.daily.map((d) => ([
          `Day ${d.day}: ${d.theme || "Explore"}`,
          d.morning   ? `  Morning: ${d.morning}`   : "",
          d.afternoon ? `  Afternoon: ${d.afternoon}` : "",
          d.evening   ? `  Evening: ${d.evening}`   : "",
          d.neighborhoods?.length ? `  Areas: ${d.neighborhoods.join(", ")}` : "",
          d.food?.length ? `  Food: ${d.food.join(" • ")}` : "",
          d.notes ? `  Notes: ${d.notes}` : "",
          ""
        ].filter(Boolean).join("\n"))),
        json.estimated_costs
          ? `Estimated (per day, ${json.estimated_costs.currency || "USD"}): low ${json.estimated_costs.per_day?.low}, mid ${json.estimated_costs.per_day?.mid}, high ${json.estimated_costs.per_day?.high}`
          : "",
        json.tips?.length ? `\nTips: ${json.tips.join(" · ")}` : ""
      ].filter(Boolean);
      textPlan = parts.join("\n");
    } else if (content) {
      textPlan = content;
    }

    res.json({
      status: "ok",
      plan: textPlan,
      planJson: json || null,
      next_questions: json?.next_questions || [],
      model_used: MODEL,
    });
  } catch (e) {
    res.status(500).json({ error: `Planner failed: ${e.message || "unknown"}` });
  }
}
