import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Documentation from "./Documentation.svelte";
import * as store from "$lib/store.svelte";
import { PageIndex } from "$lib/pages";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    openRemoteService: {
      navigateTo: vi.fn(),
    },
  };
});

describe("Documentation", () => {
  it("renders documentation sections", () => {
    const { getAllByText, getByText } = render(Documentation);

    expect(getAllByText("Overview").length).toBeGreaterThan(0);
    expect(getByText("Project Overview")).toBeInTheDocument();
  });

  it("navigates back", async () => {
    const { getByText } = render(Documentation);

    const backButton = getByText("Back to app");
    await fireEvent.click(backButton);

    expect(store.openRemoteService.navigateTo).toHaveBeenCalledWith(
      PageIndex.ALARMS
    );
  });
});
