import { Role } from "#types/role.js";

export type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
export type Permission = "delete" | "read" | "update" | "write";
export type Resource =
  | "cart"
  | "categories"
  | "types"
  | "contact"
  | "products"
  | "reviews"
  | "promotions"
  | "orders"
  | "payment"
  | "users";
export type Resources = Record<Resource, Permission[]>;

const PERMISSION_MAPPING: Record<Method, Permission> = {
  DELETE: "delete",
  GET: "read",
  PATCH: "update",
  POST: "write",
  PUT: "update",
};

const RESOURCE_MAPPING: Record<string, Resource> = {
  "^/cart.*": "cart",
  "^/categories.*": "categories",
  "^/contact.*": "contact",
  "^/products.*": "products",
  "^/users/.*": "users",
  "^/reviews.*": "reviews",
  "^/promotions.*": "promotions",
  "^/orders.*": "orders",
  "^/payment.*": "payment",
  "^/types.*": "types"
};

const RESOURCES_FOR_ROLES: Record<Role, Resources> = {
  admin: {
    promotions: ["read", "write", "update", "delete"],
    cart: ["read", "write", "update", "delete"],
    orders: ["read", "write", "update", "delete"],
    categories: ["read", "write", "update", "delete"],
    types: ["read", "write", "update", "delete"],
    contact: ["read", "update"],
    products: ["read", "write", "update", "delete"],
    reviews: ["read"],
    users: ["read", "write", "update", "delete"],
    payment: ["write"],
  },
  customer: {
    promotions: ["read"],
    cart: ["read", "write", "update", "delete"],
    orders: ["read", "write", "update"],
    categories: ["read"],
    types: ["read"],
    contact: [],
    products: ["read"],
    reviews: ["read", "write", "update"],
    users: ["read", "update"],
    payment: ["write"],
  },
};

/**
 * Checks if a given role has a specific permission for a resource.
 * If the resource is not found, it returns false.
 *
 * @param role - The role to check (e.g., admin, customer).
 * @param path - The path representing the resource to check.
 * @param method - The HTTP method representing the action to check.
 * @returns True if the role has the permission for the resource, otherwise false.
 */
export function hasPermission(
  role: Role,
  path: string,
  method: Method,
): boolean {
  const resource = pathToResource(path);
  if (!resource) return false; // Forbid if resource is not found

  const permission = methodToPermission(method);
  return RESOURCES_FOR_ROLES[role]?.[resource]?.includes(permission) ?? false;
}

/**
 * Maps an HTTP method to its corresponding permission.
 * @param method - The HTTP method to map.
 * @returns The associated permission.
 */
function methodToPermission(method: Method): Permission {
  return PERMISSION_MAPPING[method];
}

/**
 * Maps a path to its corresponding resource using regex patterns from RESOURCE_MAPPING.
 * @param path - The path string to match against the patterns.
 * @returns The matching resource or undefined if no pattern matches.
 */
function pathToResource(path: string): Resource | undefined {
  // for (const [pattern, resource] of Object.entries(RESOURCE_MAPPING)) {
  //   if (new RegExp(pattern).test(path)) {
  //     return resource;
  //   }
  // }
  // return undefined;

  return Object.entries(RESOURCE_MAPPING).find(([pattern]) =>
    new RegExp(pattern).test(path),
  )?.[1];
}
