import { describe, expect, it } from "vitest";
import { hexToRgba } from "@/lib/color";

describe("hexToRgba", () => {
  it("converts a hex color to rgba with the given alpha", () => {
    expect(hexToRgba("#30D158", 0.5)).toBe("rgba(48, 209, 88, 0.5)");
  });

  it("handles hex without a leading #", () => {
    expect(hexToRgba("FF453A", 0.4)).toBe("rgba(255, 69, 58, 0.4)");
  });

  it("handles alpha 0 and 1", () => {
    expect(hexToRgba("#000000", 0)).toBe("rgba(0, 0, 0, 0)");
    expect(hexToRgba("#FFFFFF", 1)).toBe("rgba(255, 255, 255, 1)");
  });
});
