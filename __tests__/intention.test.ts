import {
  formatDate,
  getCategoryColor,
  statusConfig,
  STATUS_LIST,
} from "../src/types/intention";

describe("formatDate", () => {
  it("formats a date string into day month year", () => {
    const result = formatDate("2024-03-15T10:00:00Z");
    expect(result).toMatch(/15 Mar 2024/);
  });
});

describe("getCategoryColor", () => {
  it("returns a known color for built-in categories", () => {
    expect(getCategoryColor("Salud")).toBe("#d946a0");
    expect(getCategoryColor("Familia")).toBe("#ea7e30");
    expect(getCategoryColor("General")).toBe("#5f7282");
  });

  it("returns a deterministic color from EXTRA_COLORS for unknown categories", () => {
    const c1 = getCategoryColor("CustomCat");
    const c2 = getCategoryColor("CustomCat");
    expect(c1).toBe(c2);
    expect(c1).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("statusConfig", () => {
  it("has an entry for each item in STATUS_LIST", () => {
    STATUS_LIST.forEach((s) => {
      expect(statusConfig[s]).toBeDefined();
      expect(statusConfig[s].label).toBeTruthy();
      expect(statusConfig[s].color).toMatch(/^#/);
      expect(statusConfig[s].bgColor).toMatch(/^#/);
    });
  });
});

describe("STATUS_LIST", () => {
  it("contains the three lifecycle stages in order", () => {
    expect(STATUS_LIST).toEqual(["Sown", "In Cultivation", "Harvested"]);
  });
});
