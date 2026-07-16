import { describe, expect, it } from "vitest";
import { getPhotoOrientation } from "./AdaptivePhoto";

describe("getPhotoOrientation", () => {
  it("classifies a taller image as portrait", () => {
    expect(getPhotoOrientation(894, 1600)).toBe("portrait");
  });

  it("classifies a wider image as landscape", () => {
    expect(getPhotoOrientation(1600, 1200)).toBe("landscape");
  });

  it("keeps square photos in the landscape variant", () => {
    expect(getPhotoOrientation(1200, 1200)).toBe("landscape");
  });
});
