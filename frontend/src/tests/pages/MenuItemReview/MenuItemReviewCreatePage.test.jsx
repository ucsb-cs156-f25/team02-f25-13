import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /MenuItemReview", async () => {
    const queryClient = new QueryClient();
    const MenuItemReview = {
      id: 1,
      itemId: 1,
      reviewerEmail: "string@gmail.com",
      stars: 4,
      dateReviewed: "2025-12-31T12:34",
      comments: "string",
    };

    axiosMock.onPost("/api/menuitemreviews/post").reply(202, MenuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    });

    const itemIDInput = screen.getByLabelText("Item ID");
    expect(itemIDInput).toBeInTheDocument();

    const reviewerEmailInput = screen.getByLabelText("Reviewer Email");
    expect(reviewerEmailInput).toBeInTheDocument();

    const starsInput = screen.getByLabelText("Stars (0-5)");
    expect(starsInput).toBeInTheDocument();

    const dateInput = screen.getByLabelText("Date Reviewed (iso format)");
    expect(dateInput).toBeInTheDocument();

    const commentsInput = screen.getByLabelText("Comments");
    expect(commentsInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(itemIDInput, { target: { value: "1" } });
    fireEvent.change(reviewerEmailInput, {
      target: { value: "string@gmail.com" },
    });
    fireEvent.change(starsInput, { target: { value: "4" } });
    fireEvent.change(dateInput, { target: { value: "2025-12-31T12:34" } });
    fireEvent.change(commentsInput, { target: { value: "string" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "1",
      reviewerEmail: "string@gmail.com",
      stars: "4",
      dateReviewed: "2025-12-31T12:34",
      comments: "string",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New review Created - itemId: 1 reviewerEmail: string@gmail.com stars: 4 comments: string dateReviewed: 2025-12-31T12:34",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/MenuItemReview" });
  });
});
