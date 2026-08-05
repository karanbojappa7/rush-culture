import { apiGet } from "@/lib/api-server";
import type { SessionUser } from "@/lib/session-shared";

export type { SessionUser } from "@/lib/session-shared";
export { hasPermission, sessionLabel } from "@/lib/session-shared";

export async function getSessionUser() {
  const res = await apiGet<SessionUser>("/api/auth/me");
  if (res.status_code !== 200 || !res.data) return null;
  return res.data;
}
