import { cookies } from "next/headers";

import { destroyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";
import { apiSuccess } from "@/lib/api/response";

export async function POST() {
  await destroyAdminSession();
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  return apiSuccess({ ok: true });
}
