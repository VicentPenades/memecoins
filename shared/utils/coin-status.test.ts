import { describe, it, expect } from "vitest";
import {
  getNextStatuses,
  canTransition,
  getTransitionRequirement,
  isLocked,
  isValidMintAddress,
} from "./coin-status";

describe("getNextStatuses", () => {
  it("draft puede ir a prelaunch y launched", () => {
    expect(getNextStatuses("draft")).toEqual(["prelaunch", "launched"]);
  });
  it("prelaunch solo puede ir a launched", () => {
    expect(getNextStatuses("prelaunch")).toEqual(["launched"]);
  });
  it("launched es terminal", () => {
    expect(getNextStatuses("launched")).toEqual([]);
  });
});

describe("canTransition", () => {
  it("acepta transiciones hacia delante", () => {
    expect(canTransition("draft", "prelaunch")).toBe(true);
    expect(canTransition("draft", "launched")).toBe(true);
    expect(canTransition("prelaunch", "launched")).toBe(true);
  });
  it("rechaza retrocesos y transiciones desde launched", () => {
    expect(canTransition("prelaunch", "draft")).toBe(false);
    expect(canTransition("launched", "draft")).toBe(false);
    expect(canTransition("launched", "prelaunch")).toBe(false);
  });
});

describe("getTransitionRequirement", () => {
  it("prelaunch exige fecha; launched exige mint; draft nada", () => {
    expect(getTransitionRequirement("prelaunch")).toBe("scheduledLaunchAt");
    expect(getTransitionRequirement("launched")).toBe("mintAddress");
    expect(getTransitionRequirement("draft")).toBeNull();
  });
});

describe("isLocked", () => {
  it("solo launched está bloqueada", () => {
    expect(isLocked("launched")).toBe(true);
    expect(isLocked("draft")).toBe(false);
    expect(isLocked("prelaunch")).toBe(false);
  });
});

describe("isValidMintAddress", () => {
  it("acepta un mint base58 plausible", () => {
    expect(isValidMintAddress("So11111111111111111111111111111111111111112")).toBe(true);
  });
  it("rechaza vacíos, cortos o con chars inválidos", () => {
    expect(isValidMintAddress("")).toBe(false);
    expect(isValidMintAddress("abc")).toBe(false);
    expect(isValidMintAddress("0OIl00000000000000000000000000000000")).toBe(false);
    expect(isValidMintAddress(123)).toBe(false);
  });
});
