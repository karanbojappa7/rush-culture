export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  roleCode: string;
  permissions?: string[];
};

export function sessionLabel(user: SessionUser | null) {
  if (!user) return undefined;
  return user.name ? `${user.name} · ${user.roleCode}` : user.email;
}

export function hasPermission(
  user: Pick<SessionUser, "roleCode" | "permissions"> | null | undefined,
  permission: string,
) {
  if (!user) return false;
  if (user.roleCode === "SUPER_ADMIN") return true;
  return (user.permissions ?? []).includes(permission);
}
