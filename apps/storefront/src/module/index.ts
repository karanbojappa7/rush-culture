import { browserHttp, browserCache } from "@/base/runtime";
import { CategoryController } from "@/module/master/category/category.controller";
import { ProductController } from "@/module/meta/product/product.controller";
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
