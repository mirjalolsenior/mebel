/**
 * Ombor (Warehouse) Action Type Helper
 * Normalizes and categorizes amal_turi (action types) for intake/outflow tracking
 */

/**
 * Normalize text for case-insensitive comparison
 * Converts to lowercase, trims, and replaces multiple spaces with single space
 */
export function normalizeText(str: string | null | undefined): string {
  return (str || "").trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * Check if action type represents intake (kirim)
 * Covers: keltirildi, olib kelindi, olib keldi, kirim, in, import, qabul qilindi, keldi, etc.
 */
export function isIn(amalTuri: string | null | undefined, izoh?: string | null): boolean {
  const normalized = normalizeText(amalTuri)
  
  // Direct intake keywords
  const intakeKeywords = [
    "keltirildi",
    "olib kelindi",
    "olib keldi",
    "kirim",
    "in",
    "import",
    "qabul qilindi",
    "keldi",
    "incoming",
    "brought",
    "received",
    "stock in",
  ]
  
  if (intakeKeywords.some(keyword => normalized.includes(keyword))) {
    return true
  }
  
  // If amal_turi is unclear, check izoh (comment) for intake keywords
  if (izoh) {
    const normalizedIzoh = normalizeText(izoh)
    if (intakeKeywords.some(keyword => normalizedIzoh.includes(keyword))) {
      return true
    }
  }
  
  return false
}

/**
 * Check if action type represents outflow (chiqim)
 * Covers: ishlatildi, chiqim, out, sarflandi, berildi, etc.
 */
export function isOut(amalTuri: string | null | undefined, izoh?: string | null): boolean {
  const normalized = normalizeText(amalTuri)
  
  // Direct outflow keywords
  const outflowKeywords = [
    "ishlatildi",
    "chiqim",
    "out",
    "sarflandi",
    "berildi",
    "outflow",
    "used",
    "spent",
    "given",
    "sold",
    "sotildi",
    "stock out",
  ]
  
  if (outflowKeywords.some(keyword => normalized.includes(keyword))) {
    return true
  }
  
  // If amal_turi is unclear, check izoh (comment) for outflow keywords
  if (izoh) {
    const normalizedIzoh = normalizeText(izoh)
    if (outflowKeywords.some(keyword => normalizedIzoh.includes(keyword))) {
      return true
    }
  }
  
  return false
}

/**
 * Safely convert value to number
 * Handles: null, undefined, empty string, NaN, comma/space separators
 */
export function toNumber(value: unknown): number {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return 0
  }
  
  // Handle empty string
  if (typeof value === "string" && value.trim() === "") {
    return 0
  }
  
  // Convert to string if not already
  let str = String(value)
  
  // Remove spaces and commas (thousands separators)
  str = str.replace(/[\s,]/g, "")
  
  // Parse to number
  const num = parseFloat(str)
  
  // Return 0 if NaN
  return isNaN(num) ? 0 : num
}

/**
 * Determine action category
 */
export type ActionCategory = "in" | "out" | "unknown"

export function getActionCategory(
  amalTuri: string | null | undefined,
  izoh?: string | null,
): ActionCategory {
  if (isIn(amalTuri, izoh)) {
    return "in"
  }
  if (isOut(amalTuri, izoh)) {
    return "out"
  }
  return "unknown"
}
