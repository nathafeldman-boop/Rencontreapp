/** Strips the "Problème n°N : " prefix the analysis engine's prompt asks for, leaving just the label (e.g. "Bio (22/100)"). */
export function stripProblemPrefix(title: string): string {
  const match = title.match(/^Problème n°\d+\s*:\s*(.+)$/);
  return match ? match[1] : title;
}
