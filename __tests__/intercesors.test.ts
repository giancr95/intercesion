import { DEFAULT_CATEGORIES, DEFAULT_INTERCESORS } from "../src/data/intercesors";

describe("DEFAULT_INTERCESORS", () => {
  it("is a non-empty array of strings", () => {
    expect(Array.isArray(DEFAULT_INTERCESORS)).toBe(true);
    expect(DEFAULT_INTERCESORS.length).toBeGreaterThan(0);
    DEFAULT_INTERCESORS.forEach((s) => expect(typeof s).toBe("string"));
  });

  it("contains the Sagrado Corazón de Jesús", () => {
    expect(DEFAULT_INTERCESORS).toContain("Sagrado Corazón de Jesús");
  });
});

describe("DEFAULT_CATEGORIES", () => {
  it("is a non-empty array of strings", () => {
    expect(Array.isArray(DEFAULT_CATEGORIES)).toBe(true);
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("contains General as a fallback category", () => {
    expect(DEFAULT_CATEGORIES).toContain("General");
  });
});
