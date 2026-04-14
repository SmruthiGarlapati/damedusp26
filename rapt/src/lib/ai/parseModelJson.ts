function normalizeModelText(raw: string) {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function stripMarkdownFences(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/^json\s*/i, "")
    .trim();
}

function extractFirstJsonValue(text: string) {
  const start = text.search(/[\[{]/);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      depth += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function removeTrailingCommas(text: string) {
  return text.replace(/,\s*([}\]])/g, "$1");
}

export function parseModelJson<T>(raw: string): T {
  const normalized = normalizeModelText(raw);
  const stripped = stripMarkdownFences(normalized);
  const extracted = extractFirstJsonValue(stripped);

  const candidates = [
    stripped,
    extracted,
    extracted ? removeTrailingCommas(extracted) : null,
    removeTrailingCommas(stripped),
  ].filter((candidate): candidate is string => Boolean(candidate && candidate.trim()));

  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch (error) {
      lastError = error;
    }
  }

  const preview = stripped.slice(0, 300);
  throw new Error(
    `Failed to parse model JSON. Preview: ${preview}${stripped.length > 300 ? "..." : ""}. ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
