export function cacheScopeFromToken(token: string | undefined | null): string {
  if (!token) return "anon";
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `s${(hash >>> 0).toString(36)}`;
}
