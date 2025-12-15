import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Badge from "./badge.svelte";

describe("Badge", () => {
  it("renders with default class", () => {
    const { container } = render(Badge);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-primary/90");
  });

  it("renders with variant class", () => {
    const { container } = render(Badge, { props: { variant: "danger" } });
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-[var(--status-open-bg)]");
  });

  it("merges custom classes", () => {
    const { container } = render(Badge, { props: { class: "custom-class" } });
    const span = container.querySelector("span");
    expect(span).toHaveClass("custom-class");
  });
});
