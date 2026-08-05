import { browserHttp, browserCache } from "@/base/runtime";
import { CategoryController } from "@/module/master/category/category.controller";
import { ProductController } from "@/module/meta/product/product.controller";
import { BrandController } from "@/module/core/brand/brand.controller";
import { PoliciesController } from "@/module/core/policies/policies.controller";
import { SeoController } from "@/module/core/seo/seo.controller";

export const productController = new ProductController(
  browserHttp,
  browserCache,
);
export const categoryController = new CategoryController(
  browserHttp,
  browserCache,
);
export const seoController = new SeoController(browserHttp, browserCache);
export const brandController = new BrandController(browserHttp, browserCache);
export const policiesController = new PoliciesController(
  browserHttp,
  browserCache,
);
