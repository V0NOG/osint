/**
 * Title-similarity utilities for multi-source event deduplication.
 *
 * When two articles describe the same event (e.g. three outlets covering the
 * same airstrike), we want ONE GeopoliticalEvent with multiple EventSources
 * rather than three separate events.
 *
 * Strategy: tokenise titles into significant words, compute Jaccard similarity,
 * and consider titles "same event" at ≥ 0.35 similarity.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'its',
  'it', 'this', 'that', 'after', 'over', 'says', 'said', 'say', 'report',
  'reports', 'amid', 'into', 'up', 'out', 'about', 'more', 'than',
])

function tokenise(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  )
}

export function jaccardSimilarity(a: string, b: string): number {
  const sa = tokenise(a)
  const sb = tokenise(b)
  if (sa.size === 0 && sb.size === 0) return 1
  if (sa.size === 0 || sb.size === 0) return 0

  let intersection = 0
  for (const token of Array.from(sa)) {
    if (sb.has(token)) intersection++
  }

  const union = sa.size + sb.size - intersection
  return intersection / union
}

/** Threshold above which two titles are treated as the same event */
export const SIMILARITY_THRESHOLD = 0.35

export interface CandidateEvent {
  id: string
  title: string
  createdAt: Date
}

/**
 * Given a new article title and a list of recent existing events,
 * returns the ID of the best-matching existing event if above threshold,
 * or null if this should become a new event.
 */
export function findMatchingEvent(
  newTitle: string,
  candidates: CandidateEvent[],
  windowHours = 72
): string | null {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000)
  const recent = candidates.filter((c) => c.createdAt >= cutoff)

  let bestId: string | null = null
  let bestScore = SIMILARITY_THRESHOLD - 0.001

  for (const candidate of recent) {
    const score = jaccardSimilarity(newTitle, candidate.title)
    if (score > bestScore) {
      bestScore = score
      bestId = candidate.id
    }
  }

  return bestId
}
