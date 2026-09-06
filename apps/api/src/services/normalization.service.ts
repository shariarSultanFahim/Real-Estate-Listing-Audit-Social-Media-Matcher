/**
 * Normalization Service
 * Converts raw address/price/description strings into canonical forms
 * for reliable cross-platform comparison.
 */

// Common address abbreviations used by Zillow/Realtor/etc
const STREET_ABBREVIATIONS: Record<string, string> = {
  "street": "ST",
  "st": "ST",
  "avenue": "AVE",
  "ave": "AVE",
  "boulevard": "BLVD",
  "blvd": "BLVD",
  "drive": "DR",
  "dr": "DR",
  "road": "RD",
  "rd": "RD",
  "lane": "LN",
  "ln": "LN",
  "court": "CT",
  "ct": "CT",
  "circle": "CIR",
  "cir": "CIR",
  "place": "PL",
  "pl": "PL",
  "terrace": "TER",
  "ter": "TER",
  "way": "WAY",
  "highway": "HWY",
  "hwy": "HWY",
  "parkway": "PKWY",
  "pkwy": "PKWY",
  "north": "N",
  "south": "S",
  "east": "E",
  "west": "W",
};

/**
 * Normalize a street address string to a canonical uppercase pipe-delimited key.
 * Example: "11 Tolawa Lane, Covington, LA 70433"
 *       → "11 TOLAWA LN|COVINGTON|LA|70433"
 */
export function normalizeAddress(
  street: string,
  city: string,
  state: string,
  zip: string
): string {
  const normalizedStreet = normalizeStreet(street);
  const normalizedCity = city.toUpperCase().trim();
  const normalizedState = state.toUpperCase().trim();
  const normalizedZip = zip.trim().substring(0, 5); // Use only 5-digit ZIP

  return `${normalizedStreet}|${normalizedCity}|${normalizedState}|${normalizedZip}`;
}

export function normalizeStreet(street: string): string {
  const words = street
    .toUpperCase()
    .trim()
    .replace(/[.,#]/g, "")
    .split(/\s+/);

  return words
    .map((word) => {
      const lower = word.toLowerCase();
      return STREET_ABBREVIATIONS[lower] ?? word;
    })
    .join(" ");
}

/**
 * Normalize price to a simple integer (cents avoided — round to dollar)
 */
export function normalizePrice(price: string | number): number {
  if (typeof price === "number") return Math.round(price);
  const cleaned = price.replace(/[$,\s]/g, "");
  return Math.round(parseFloat(cleaned) || 0);
}

/**
 * Normalize description for comparison:
 * - Lowercase
 * - Collapse whitespace
 * - Remove punctuation differences
 */
export function normalizeDescription(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:'"]/g, "");
}

/**
 * Normalize agent name for comparison (handles "John Smith" vs "Smith, John")
 */
export function normalizeAgentName(name: string): string {
  const parts = name
    .toUpperCase()
    .trim()
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort();
  return parts.join(" ");
}

/**
 * Calculate address similarity ratio (0–1)
 * Simple token-overlap approach for fuzzy matching
 */
export function addressSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.split("|").flatMap((p) => p.split(" ")));
  const tokensB = new Set(b.split("|").flatMap((p) => p.split(" ")));

  let intersection = 0;
  tokensA.forEach((t) => { if (tokensB.has(t)) intersection++; });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}
