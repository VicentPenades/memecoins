import { describe, it, expect } from "vitest";
import { slugify, generateUniqueSlug } from "./slug";

describe("slugify", () => {
  it("pasa a kebab-case en minúsculas", () => {
    expect(slugify("Doge Coin")).toBe("doge-coin");
    expect(slugify("UPPER")).toBe("upper");
  });
  it("quita acentos y símbolos", () => {
    expect(slugify("  Héllo Wörld!!  ")).toBe("hello-world");
    expect(slugify("Pepe$ #2")).toBe("pepe-2");
  });
  it("colapsa y recorta guiones", () => {
    expect(slugify("a---b-")).toBe("a-b");
  });
  it("cae a 'coin' si queda vacío", () => {
    expect(slugify("$$$")).toBe("coin");
    expect(slugify("")).toBe("coin");
  });
});

describe("generateUniqueSlug", () => {
  it("devuelve la base si está libre", async () => {
    expect(await generateUniqueSlug("Doge", async () => false)).toBe("doge");
  });
  it("añade sufijo incremental si choca", async () => {
    const taken = new Set(["doge", "doge-2"]);
    expect(await generateUniqueSlug("Doge", async (s) => taken.has(s))).toBe(
      "doge-3",
    );
  });
});
