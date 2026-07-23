import { describe, expect, it } from "vitest";
import { nextPhotoIndex, previousPhotoIndex } from "./ExperienceGallery";

describe("experience gallery navigation", () => {
  it("wraps forward after the final photo", () => {
    expect(nextPhotoIndex(2, 3)).toBe(0);
  });

  it("wraps backward before the first photo", () => {
    expect(previousPhotoIndex(0, 3)).toBe(2);
  });

  it("keeps an empty gallery at index zero", () => {
    expect(nextPhotoIndex(0, 0)).toBe(0);
    expect(previousPhotoIndex(0, 0)).toBe(0);
  });
});
