import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function req(name, method, pathStr, body, query) {
  const segments = pathStr.replace(/^\//, "").split("/").filter(Boolean);
  const qs =
    query?.length && query.some((q) => !q.disabled)
      ? "?" +
        query
          .filter((q) => !q.disabled)
          .map((q) => `${q.key}=${q.value ?? ""}`)
          .join("&")
      : "";
  const url = {
    raw: `{{url}}${pathStr}${qs}`,
    host: ["{{url}}"],
    path: segments,
  };
  if (query?.length) url.query = query;

  const r = {
    name,
    request: {
      method,
      header: body
        ? [{ key: "Content-Type", value: "application/json" }]
        : [],
      url,
    },
  };

  if (body !== undefined) {
    r.request.body = {
      mode: "raw",
      raw: typeof body === "string" ? body : JSON.stringify(body, null, 2),
      options: { raw: { language: "json" } },
    };
  }

  return r;
}

function folder(name, items) {
  return { name, item: items };
}

const collection = {
  info: {
    name: "RushCulture",
    description:
      "Rush Culture API — folders by Postgres schema (Core / Master / Meta / Security) plus Common health. Use {{url}} as API base. Staff write/list routes need cookie rc_admin_token from Security/auth/Login. List endpoints support ?page=&limit=.",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "url", value: "http://localhost:3001" },
    { key: "id", value: "" },
    { key: "slug", value: "" },
    { key: "code", value: "" },
    { key: "key", value: "" },
    { key: "itemId", value: "" },
    { key: "variantId", value: "" },
    { key: "service", value: "product" },
  ],
  item: [
    folder("Common", [
      folder("health", [
        req("HealthCheck", "GET", "/api/health"),
        req("HealthLive", "GET", "/api/health/live"),
      ]),
      folder("cache", [
        req("CacheStatus", "GET", "/api/cache"),
        req("CacheServices", "GET", "/api/cache/services"),
        req("FlushAllCache", "POST", "/api/cache/flush"),
        req("FlushServiceCache", "POST", "/api/cache/flush/{{service}}"),
        req("FlushAllCacheDelete", "DELETE", "/api/cache"),
        req(
          "FlushServiceCacheDelete",
          "DELETE",
          "/api/cache/services/{{service}}",
        ),
      ]),
    ]),
    folder("Core", [
      folder("user", [
        req("CreateUser", "POST", "/api/users", {
          email: "staff@rushculture.example",
          name: "Staff User",
          phoneNumber: "9000000001",
          password: "admin123",
          roleCode: "STAFF",
          userTypeCode: "INTERNAL",
        }),
        req("GetUsers", "GET", "/api/users", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetUserById", "GET", "/api/users/{{id}}"),
        req("UpdateUser", "PATCH", "/api/users/{{id}}", {
          name: "Updated Staff",
          phoneNumber: "9000000002",
        }),
        req("DeleteUser", "DELETE", "/api/users/{{id}}"),
      ]),
      folder("role", [
        req("CreateRole", "POST", "/api/roles", {
          code: "STAFF",
          name: "Staff",
          description: "Staff role",
        }),
        req("GetRoles", "GET", "/api/roles", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetRoleByCode", "GET", "/api/roles/code/{{code}}"),
        req("GetRoleById", "GET", "/api/roles/{{id}}"),
        req("UpdateRole", "PATCH", "/api/roles/{{id}}", {
          name: "Staff Updated",
          description: "Updated",
        }),
        req("DeleteRole", "DELETE", "/api/roles/{{id}}"),
      ]),
      folder("user-type", [
        req("CreateUserType", "POST", "/api/user-types", {
          code: "INTERNAL",
          name: "Internal",
          description: "Internal staff type",
        }),
        req("GetUserTypes", "GET", "/api/user-types", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetUserTypeByCode", "GET", "/api/user-types/code/{{code}}"),
        req("GetUserTypeById", "GET", "/api/user-types/{{id}}"),
        req("UpdateUserType", "PATCH", "/api/user-types/{{id}}", {
          name: "Internal Updated",
        }),
        req("DeleteUserType", "DELETE", "/api/user-types/{{id}}"),
      ]),
      folder("app-config", [
        req("CreateAppConfig", "POST", "/api/app-configs", {
          key: "site.tagline",
          value: "Rush Culture",
          description: "Storefront tagline",
          isActive: true,
        }),
        req("GetAppConfigs", "GET", "/api/app-configs", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetAppConfigByKey", "GET", "/api/app-configs/key/{{key}}"),
        req("GetAppConfigById", "GET", "/api/app-configs/{{id}}"),
        req("UpdateAppConfig", "PATCH", "/api/app-configs/{{id}}", {
          value: "Updated value",
          isActive: true,
        }),
        req("DeleteAppConfig", "DELETE", "/api/app-configs/{{id}}"),
      ]),
      folder("discount", [
        req("CreateDiscount", "POST", "/api/discounts", {
          code: "WELCOME10",
          description: "10 percent off",
          percentOff: 10,
          minOrderInPaise: 50000,
          maxUses: 100,
          isActive: true,
        }),
        req("GetDiscounts", "GET", "/api/discounts", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetDiscountByCode", "GET", "/api/discounts/code/{{code}}"),
        req("GetDiscountById", "GET", "/api/discounts/{{id}}"),
        req("UpdateDiscount", "PATCH", "/api/discounts/{{id}}", {
          percentOff: 15,
          isActive: true,
        }),
        req("DeleteDiscount", "DELETE", "/api/discounts/{{id}}"),
      ]),
    ]),
    folder("Master", [
      folder("category", [
        req("CreateCategory", "POST", "/api/categories", {
          name: "Tops",
          slug: "tops",
          description: "Tops collection",
          imageUrl: "https://example.com/tops.jpg",
        }),
        req("GetCategories", "GET", "/api/categories", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetCategoryBySlug", "GET", "/api/categories/slug/{{slug}}"),
        req("GetCategoryById", "GET", "/api/categories/{{id}}"),
        req("UpdateCategory", "PATCH", "/api/categories/{{id}}", {
          name: "Tops Updated",
          description: "Updated",
        }),
        req("DeleteCategory", "DELETE", "/api/categories/{{id}}"),
      ]),
      folder("product", [
        req("CreateProduct", "POST", "/api/products", {
          name: "Graphic Tee",
          slug: "graphic-tee",
          description: "Soft cotton tee",
          brand: "Rush Culture",
          isActive: true,
          categoryId: "{{id}}",
          variants: [
            {
              sku: "RC-TEE-M-BLK",
              size: "M",
              color: "Black",
              colorHex: "#111111",
              priceInPaise: 99900,
              compareAtPriceInPaise: 129900,
              stock: 20,
              isActive: true,
            },
          ],
          images: [
            {
              url: "https://example.com/tee.jpg",
              alt: "Graphic Tee",
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        }),
        req("GetProducts", "GET", "/api/products", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
          { key: "q", value: "", disabled: true },
          { key: "categoryId", value: "", disabled: true },
          { key: "size", value: "", disabled: true },
          { key: "color", value: "", disabled: true },
          { key: "minPrice", value: "", disabled: true },
          { key: "maxPrice", value: "", disabled: true },
          { key: "isActive", value: "true", disabled: true },
        ]),
        req("GetProductById", "GET", "/api/products/id/{{id}}"),
        req("GetProductBySlug", "GET", "/api/products/{{slug}}"),
        req("CheckStock", "POST", "/api/products/stock-check", {
          items: [{ variantId: "{{variantId}}", quantity: 1 }],
        }),
        req("UpdateProduct", "PATCH", "/api/products/{{id}}", {
          name: "Graphic Tee Updated",
          isActive: true,
        }),
        req("UpdateProductVariants", "PATCH", "/api/products/{{id}}/variants", {
          variants: [
            {
              sku: "RC-TEE-L-BLK",
              size: "L",
              color: "Black",
              colorHex: "#111111",
              priceInPaise: 99900,
              stock: 10,
              isActive: true,
            },
          ],
        }),
        req("UpdateProductImages", "PATCH", "/api/products/{{id}}/images", {
          images: [
            {
              url: "https://example.com/tee-2.jpg",
              alt: "Graphic Tee alt",
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        }),
        req("DeleteProduct", "DELETE", "/api/products/{{id}}"),
      ]),
    ]),
    folder("Meta", [
      folder("customer", [
        req("CreateCustomer", "POST", "/api/customers", {
          email: "buyer@example.com",
          phoneNumber: "9876543210",
          name: "Buyer One",
        }),
        req("GetCustomers", "GET", "/api/customers", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetCustomerById", "GET", "/api/customers/{{id}}"),
        req("UpdateCustomer", "PATCH", "/api/customers/{{id}}", {
          name: "Buyer Updated",
          phoneNumber: "9876543211",
        }),
        req("DeleteCustomer", "DELETE", "/api/customers/{{id}}"),
      ]),
      folder("address", [
        req("CreateAddress", "POST", "/api/addresses", {
          customerId: "{{id}}",
          fullName: "Buyer One",
          phone: "9876543210",
          line1: "12 MG Road",
          line2: "Near Metro",
          city: "Bengaluru",
          state: "KA",
          postalCode: "560001",
          country: "IN",
          isDefault: true,
        }),
        req("GetAddresses", "GET", "/api/addresses", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetAddressById", "GET", "/api/addresses/{{id}}"),
        req("UpdateAddress", "PATCH", "/api/addresses/{{id}}", {
          line1: "14 MG Road",
          city: "Bengaluru",
        }),
        req("DeleteAddress", "DELETE", "/api/addresses/{{id}}"),
      ]),
      folder("cart", [
        req("CreateCart", "POST", "/api/carts", {
          customerId: "{{id}}",
          sessionId: "guest-session-1",
        }),
        req("GetCarts", "GET", "/api/carts", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetCartById", "GET", "/api/carts/{{id}}"),
        req("UpdateCart", "PATCH", "/api/carts/{{id}}", {
          customerId: "{{id}}",
        }),
        req("DeleteCart", "DELETE", "/api/carts/{{id}}"),
        req("AddCartItem", "POST", "/api/carts/{{id}}/items", {
          variantId: "{{variantId}}",
          quantity: 1,
        }),
        req("UpdateCartItem", "PATCH", "/api/carts/{{id}}/items/{{itemId}}", {
          variantId: "{{variantId}}",
          quantity: 2,
        }),
        req("DeleteCartItem", "DELETE", "/api/carts/{{id}}/items/{{itemId}}"),
      ]),
      folder("order", [
        req("CreateOrder", "POST", "/api/orders", {
          customerEmail: "buyer@example.com",
          shippingFullName: "Buyer One",
          shippingPhone: "9876543210",
          shippingLine1: "12 MG Road",
          shippingLine2: "",
          shippingCity: "Bengaluru",
          shippingState: "KA",
          shippingPostalCode: "560001",
          shippingCountry: "IN",
          paymentMethod: "COD",
          paymentDetails: "",
          idempotencyKey: "demo-order-1",
          items: [
            {
              variantId: "{{variantId}}",
              productSlug: "graphic-tee",
              productName: "Graphic Tee",
              variantSku: "RC-TEE-M-BLK",
              size: "M",
              color: "Black",
              unitPriceInPaise: 99900,
              quantity: 1,
            },
          ],
        }),
        req("GetOrders", "GET", "/api/orders", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetOrderSummary", "GET", "/api/orders/summary"),
        req("GetOrderById", "GET", "/api/orders/{{id}}"),
        req("UpdateOrder", "PATCH", "/api/orders/{{id}}", {
          status: "PACKED",
          paymentStatus: "PAID",
        }),
        req("DeleteOrder", "DELETE", "/api/orders/{{id}}"),
      ]),
      folder("review", [
        req("CreateReview", "POST", "/api/reviews", {
          productId: "{{id}}",
          customerId: "{{id}}",
          rating: 5,
          title: "Great fit",
          body: "Loved the fabric",
          isApproved: false,
        }),
        req("GetReviews", "GET", "/api/reviews", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
        ]),
        req("GetReviewById", "GET", "/api/reviews/{{id}}"),
        req("ApproveReview", "PATCH", "/api/reviews/{{id}}/approve", {}),
        req("UpdateReview", "PATCH", "/api/reviews/{{id}}", {
          rating: 4,
          title: "Good",
          body: "Updated review",
        }),
        req("DeleteReview", "DELETE", "/api/reviews/{{id}}"),
      ]),
      folder("customer-query", [
        req("CreateCustomerQuery", "POST", "/api/customer-queries", {
          name: "Buyer One",
          email: "buyer@example.com",
          phone: "9876543210",
          topic: "SHIPPING",
          subject: "Where is my order",
          message: "I placed an order last week and have not received updates.",
          orderNumber: "RC-1001",
        }),
        req("GetCustomerQuerySummary", "GET", "/api/customer-queries/summary"),
        req("GetCustomerQueries", "GET", "/api/customer-queries", undefined, [
          { key: "page", value: "1" },
          { key: "limit", value: "20" },
          { key: "status", value: "OPEN", disabled: true },
          { key: "topic", value: "SHIPPING", disabled: true },
        ]),
        req("GetCustomerQueryById", "GET", "/api/customer-queries/{{id}}"),
        req("UpdateCustomerQuery", "PATCH", "/api/customer-queries/{{id}}", {
          status: "CLOSED",
          adminNote: "Resolved over email",
        }),
        req("DeleteCustomerQuery", "DELETE", "/api/customer-queries/{{id}}"),
      ]),
    ]),
    folder("Security", [
      folder("auth", [
        req("Login", "POST", "/api/auth/login", {
          email: "admin@rushculture.example",
          password: "admin123",
        }),
        req("Logout", "POST", "/api/auth/logout"),
        req("GetMe", "GET", "/api/auth/me"),
      ]),
      folder("crypto", [
        req("GetPublicKey", "GET", "/api/crypto/public-key"),
      ]),
    ]),
  ],
};

const env = {
  id: "rushculture-local",
  name: "RushCulture Local",
  values: [
    {
      key: "url",
      value: "http://localhost:3001",
      type: "default",
      enabled: true,
    },
    { key: "id", value: "", type: "default", enabled: true },
    { key: "slug", value: "", type: "default", enabled: true },
    { key: "code", value: "", type: "default", enabled: true },
    { key: "key", value: "", type: "default", enabled: true },
    { key: "itemId", value: "", type: "default", enabled: true },
    { key: "variantId", value: "", type: "default", enabled: true },
    { key: "service", value: "product", type: "default", enabled: true },
  ],
  _postman_variable_scope: "environment",
};

fs.writeFileSync(
  path.join(__dirname, "RushCulture.postman_collection.json"),
  JSON.stringify(collection, null, 2),
);
fs.writeFileSync(
  path.join(__dirname, "RushCulture.postman_environment.json"),
  JSON.stringify(env, null, 2),
);

console.log("Wrote RushCulture.postman_collection.json + environment");
