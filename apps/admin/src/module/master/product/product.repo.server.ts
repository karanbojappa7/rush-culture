import { cacheScopeFromToken } from "@linq/app-layer";
import { brand } from "@linq/site-config";
import { cookies } from "next/headers";
import { getSharedCache } from "@/base/runtime";
import { createServerHttp } from "@/base/runtime-server";
import { ProductRepo } from "./product.repo";

export async function createServerProductRepo() {
  const jar = await cookies();
  const token = jar.get(brand.adminAuthCookie)?.value;
  return new ProductRepo(
    createServerHttp(),
    getSharedCache(),
    cacheScopeFromToken(token),
  );
}
