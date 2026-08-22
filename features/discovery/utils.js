export function formatCount(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  const count = Math.max(0, Math.floor(value));

  if (count >= 1_000_000_000) {
    const formatted = count / 1_000_000_000;
    return `${formatted >= 10 ? Math.round(formatted) : formatted.toFixed(1).replace(/\.0$/, "")}B`;
  }

  if (count >= 1_000_000) {
    const formatted = count / 1_000_000;
    return `${formatted >= 10 ? Math.round(formatted) : formatted.toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (count >= 1_000) {
    const formatted = count / 1_000;
    return `${formatted >= 10 ? Math.round(formatted) : formatted.toFixed(1).replace(/\.0$/, "")}K`;
  }

  return String(count);
}

export function excerptDescription(text, maxLength = 120) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}
