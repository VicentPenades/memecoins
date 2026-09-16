import { createHmac, randomUUID } from "node:crypto";
import type { H3Event } from "h3";
import { getCookie, getRequestIP, setCookie } from "h3";

export const CAT_COIN_POLL_KEY = "cat-coins";
export const VOTE_COOKIE_NAME = "cat_coin_voter";
export const MAX_DAILY_VOTES_PER_IP = 5;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getVisitorId(event: H3Event) {
  return getExistingVisitorId(event) ?? randomUUID();
}

export function getExistingVisitorId(event: H3Event) {
  const visitorId = getCookie(event, VOTE_COOKIE_NAME);
  return visitorId && UUID_PATTERN.test(visitorId) ? visitorId : null;
}

export function persistVisitorId(event: H3Event, visitorId: string) {
  setCookie(event, VOTE_COOKIE_NAME, visitorId, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function hashRequestIp(event: H3Event) {
  const secret = useRuntimeConfig(event).voteIpHashSecret;
  if (typeof secret !== "string" || secret.length < 32) {
    throw createError({
      statusCode: 503,
      message: "Voting IP protection is not configured",
    });
  }

  const ip = getRequestIP(event, { xForwardedFor: true });
  if (!ip) {
    throw createError({
      statusCode: 400,
      message: "Unable to identify the voting request",
    });
  }

  return createHmac("sha256", secret).update(ip).digest("hex");
}
