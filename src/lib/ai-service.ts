import type { AIAnalysis, Category, Priority } from "@/types";

/**
 * AI analysis service — designed to be swapped with Google Gemini later.
 * Currently returns a deterministic mock based on the input text.
 */

const KEYWORDS: Array<{ terms: string[]; category: Category; priority: Priority }> = [
  { terms: ["light", "power", "electric", "socket", "bulb"], category: "Electrical", priority: "High" },
  { terms: ["water", "tap", "leak", "drain", "toilet"], category: "Plumbing", priority: "High" },
  { terms: ["clean", "dirty", "trash", "dust", "hygiene"], category: "Cleanliness", priority: "Medium" },
  { terms: ["wifi", "internet", "network", "computer", "projector"], category: "Internet & IT", priority: "Medium" },
  { terms: ["chair", "desk", "bench", "furniture", "table"], category: "Furniture", priority: "Low" },
  { terms: ["security", "lock", "camera", "safety", "theft"], category: "Safety & Security", priority: "Critical" },
  { terms: ["food", "canteen", "cafeteria", "meal"], category: "Food Services", priority: "Medium" },
  { terms: ["class", "lecture", "attendance", "exam", "course"], category: "Academics", priority: "Medium" },
  { terms: ["bus", "shuttle", "transport", "vehicle"], category: "Transportation", priority: "Medium" },
];

const DEPT_MAP: Record<Category, string> = {
  Electrical: "Electrical",
  Plumbing: "Plumbing",
  Cleanliness: "Housekeeping",
  "Internet & IT": "IT Services",
  Furniture: "Facilities Maintenance",
  "Safety & Security": "Security",
  "Food Services": "Food & Beverage",
  Academics: "Academic Office",
  Transportation: "Transport",
  Other: "General Admin",
};

const ETA_MAP: Record<Priority, string> = {
  Critical: "4 hours",
  High: "1 day",
  Medium: "2-3 days",
  Low: "1 week",
};

export function analyzeComplaint(title: string, description: string): AIAnalysis {
  const text = `${title} ${description}`.toLowerCase();
  const matched: string[] = [];
  let best: (typeof KEYWORDS)[number] | null = null;
  let score = 0;

  for (const entry of KEYWORDS) {
    const hits = entry.terms.filter((t) => text.includes(t));
    if (hits.length > score) {
      score = hits.length;
      best = entry;
      matched.splice(0, matched.length, ...hits);
    }
  }

  const category: Category = best?.category ?? "Other";
  const priority: Priority = best?.priority ?? "Medium";
  const confidence = Math.min(0.98, 0.6 + score * 0.12);

  return {
    category,
    priority,
    confidence,
    department: DEPT_MAP[category],
    estimatedResolution: ETA_MAP[priority],
    keywords: matched.length ? matched : ["general"],
  };
}
