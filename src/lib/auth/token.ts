import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "khatri_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

type SessionPayload = {
  authenticated: true;
  expiresAt: number;
  nonce: string;
};

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters long.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSessionToken() {
  const payload: SessionPayload = {
    authenticated: true,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    nonce: randomUUID(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return false;

  try {
    const [encodedPayload, signature, extra] = token.split(".");
    if (!encodedPayload || !signature || extra || !signaturesMatch(signature, sign(encodedPayload))) {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    return payload.authenticated === true &&
      typeof payload.expiresAt === "number" &&
      payload.expiresAt > Date.now() &&
      typeof payload.nonce === "string";
  } catch {
    return false;
  }
}

export function verifyAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const candidateDigest = createHmac("sha256", sessionSecret()).update(candidate).digest();
  const expectedDigest = createHmac("sha256", sessionSecret()).update(expected).digest();

  return timingSafeEqual(candidateDigest, expectedDigest);
}
