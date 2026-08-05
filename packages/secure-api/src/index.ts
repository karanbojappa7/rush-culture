const ENCRYPTION_HEADER = "x-enc-session";

export type ApiResponse<T> = {
  status_code: number;
  message: string;
  data?: T;
};

export type SecureApiOptions = {
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  getCookieHeader?: () => string | Promise<string | undefined>;
};

type EncryptedResponse = {
  enc: true;
  iv: string;
  tag: string;
  data: string;
};

type PublicKeyPayload = {
  enabled: boolean;
  algorithm?: string;
  publicKey?: string;
};

type CryptoMode =
  | { enabled: false }
  | { enabled: true; publicKey: CryptoKey };

type AesSession = {
  aesKey: CryptoKey;
  ek: string;
};

const publicKeyCache = new Map<string, Promise<CryptoMode>>();

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i += 1) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

async function importPublicKey(spkiB64: string) {
  return crypto.subtle.importKey(
    "spki",
    b64ToBytes(spkiB64),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

async function createAesKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

async function wrapAesKey(publicKey: CryptoKey, aesKey: CryptoKey) {
  const raw = await crypto.subtle.exportKey("raw", aesKey);
  const wrapped = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    raw,
  );
  return bytesToB64(wrapped);
}

async function encryptPayload(aesKey: CryptoKey, payload: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const sealed = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded,
  );
  const sealedBytes = new Uint8Array(sealed);
  const ciphertext = sealedBytes.slice(0, sealedBytes.length - 16);
  const tag = sealedBytes.slice(sealedBytes.length - 16);
  return {
    iv: bytesToB64(iv),
    tag: bytesToB64(tag),
    data: bytesToB64(ciphertext),
  };
}

async function decryptPayload<T>(
  aesKey: CryptoKey,
  envelope: EncryptedResponse,
): Promise<T> {
  const iv = b64ToBytes(envelope.iv);
  const tag = b64ToBytes(envelope.tag);
  const data = b64ToBytes(envelope.data);
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data, 0);
  combined.set(tag, data.length);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    combined,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

function isEncryptedResponse(body: unknown): body is EncryptedResponse {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    b.enc === true &&
    typeof b.iv === "string" &&
    typeof b.tag === "string" &&
    typeof b.data === "string"
  );
}

async function loadCryptoMode(baseUrl: string): Promise<CryptoMode> {
  try {
    const res = await fetch(`${baseUrl}/api/crypto/public-key`, {
      cache: "force-cache",
    });
    if (!res.ok) return { enabled: false };
    const json = (await res.json()) as ApiResponse<PublicKeyPayload>;
    const payload = json.data;
    if (!payload?.enabled || !payload.publicKey) {
      return { enabled: false };
    }
    return {
      enabled: true,
      publicKey: await importPublicKey(payload.publicKey),
    };
  } catch {
    return { enabled: false };
  }
}

function resolveCryptoMode(baseUrl: string): Promise<CryptoMode> {
  let pending = publicKeyCache.get(baseUrl);
  if (!pending) {
    pending = loadCryptoMode(baseUrl).then((mode) => {
      if (!mode.enabled) {
        publicKeyCache.delete(baseUrl);
      }
      return mode;
    });
    publicKeyCache.set(baseUrl, pending);
  }
  return pending;
}

export function clearSecureApiPublicKeyCache(baseUrl?: string) {
  if (baseUrl) {
    publicKeyCache.delete(baseUrl);
    return;
  }
  publicKeyCache.clear();
}

export function resolveApiBaseUrl(fallback = "http://localhost:4000") {
  if (typeof window === "undefined") {
    return (
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      fallback
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? fallback;
}

export function createSecureApi(
  baseUrl: string,
  options: SecureApiOptions = {},
) {
  let session: AesSession | null = null;

  async function resolveSession(
    publicKey: CryptoKey,
  ): Promise<AesSession> {
    if (session) return session;
    const aesKey = await createAesKey();
    const ek = await wrapAesKey(publicKey, aesKey);
    session = { aesKey, ek };
    return session;
  }

  async function request<T>(
    path: string,
    init?: RequestInit & { json?: unknown },
  ): Promise<ApiResponse<T>> {
    try {
      const mode = await resolveCryptoMode(baseUrl);
      const headers = new Headers(init?.headers);
      if (options.headers) {
        new Headers(options.headers).forEach((value, key) => {
          headers.set(key, value);
        });
      }
      const cookieHeader = options.getCookieHeader
        ? await options.getCookieHeader()
        : undefined;
      if (cookieHeader) headers.set("Cookie", cookieHeader);

      let body = init?.body;

      if (!mode.enabled) {
        if (init?.json !== undefined) {
          headers.set("Content-Type", "application/json");
          body = JSON.stringify(init.json);
        }
        const res = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers,
          body,
          cache: "no-store",
          credentials: options.credentials,
        });
        return res.json() as Promise<ApiResponse<T>>;
      }

      const { aesKey, ek } = await resolveSession(mode.publicKey);
      headers.set(ENCRYPTION_HEADER, ek);

      if (init?.json !== undefined) {
        const sealed = await encryptPayload(aesKey, init.json);
        headers.set("Content-Type", "application/json");
        body = JSON.stringify({
          enc: true,
          ek,
          ...sealed,
        });
      }

      const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
        body,
        cache: "no-store",
        credentials: options.credentials,
      });
      const raw = await res.json();
      if (isEncryptedResponse(raw)) {
        return decryptPayload<ApiResponse<T>>(aesKey, raw);
      }
      return raw as ApiResponse<T>;
    } catch {
      return {
        status_code: 1000,
        message: "Unable to reach API. Check that the server is running.",
      };
    }
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, json?: unknown) =>
      request<T>(path, { method: "POST", json }),
    put: <T>(path: string, json?: unknown) =>
      request<T>(path, { method: "PUT", json }),
    patch: <T>(path: string, json?: unknown) =>
      request<T>(path, { method: "PATCH", json }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
    clearCache: () => {
      session = null;
      clearSecureApiPublicKeyCache(baseUrl);
    },
  };
}
