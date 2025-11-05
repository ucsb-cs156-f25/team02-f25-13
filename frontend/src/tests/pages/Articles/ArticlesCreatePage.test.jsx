import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 1,
      title: "Department of Recreation promotes safety with Hallowheels Event",
      url: "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event",
      explanation:
        "An article about awareness of Halloween festivities for UCSB students.",
      email: "ngonzalezornelas@ucsb.edu",
      dateAdded: "2025-10-30T11:06",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    expect(titleInput).toBeInTheDocument();

    const urlInput = screen.getByLabelText("Url");
    expect(urlInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(urlInput).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    expect(urlInput).toBeInTheDocument();

    const dateAddedInput = screen.getByLabelText("Date Added (iso format)");
    expect(urlInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(titleInput, {
      target: {
        value:
          "Department of Recreation promotes safety with Hallowheels Event",
      },
    });
    fireEvent.change(urlInput, {
      target: {
        value:
          "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event",
      },
    });
    fireEvent.change(explanationInput, {
      target: {
        value:
          "An article about awareness of Halloween festivities for UCSB students.",
      },
    });
    fireEvent.change(emailInput, {
      target: { value: "ngonzalezornelas@ucsb.edu" },
    });
    fireEvent.change(dateAddedInput, {
      target: { value: "2025-10-30T11:06" },
    });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Department of Recreation promotes safety with Hallowheels Event",
      url: "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event",
      explanation:
        "An article about awareness of Halloween festivities for UCSB students.",
      email: "ngonzalezornelas@ucsb.edu",
      dateAdded: "2025-10-30T11:06",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New article Created - id: 1 title: Department of Recreation promotes safety with Hallowheels Event",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
