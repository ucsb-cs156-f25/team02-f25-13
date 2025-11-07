import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
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

describe("RecommendationRequestCreatePage tests", () => {
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
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /recommendationrequest", async () => {
    const queryClient = new QueryClient();
    const recommendationrequest = {
      id: 1,
      requesteremail: "cgaucho@ucsb.edu",
      professoremail: "phtcon@ucsb.edu",
      explanation: "BS/MS program",
      daterequested: "2022-04-20T01:00:00",
      dateneeded: "2022-05-01T23:59:00",
      done: false,
    };

    axiosMock
      .onPost("/api/recommendationrequest/post")
      .reply(202, recommendationrequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesteremailInput = screen.getByLabelText("Requester Email");
    expect(requesteremailInput).toBeInTheDocument();

    const professoremailInput = screen.getByLabelText("Professor Email");
    expect(professoremailInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const daterequestedInput = screen.getByLabelText(
      "Date Requested (iso format)",
    );
    expect(daterequestedInput).toBeInTheDocument();

    const dateneededInput = screen.getByLabelText("Date Needed (iso format)");
    expect(dateneededInput).toBeInTheDocument();

    const doneInput = screen.getByLabelText("Done");
    expect(doneInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesteremailInput, {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(professoremailInput, {
      target: { value: "phtcon@ucsb.edu" },
    });
    fireEvent.change(explanationInput, { target: { value: "BS/MS program" } });
    fireEvent.change(daterequestedInput, {
      target: { value: "2022-04-20T01:00:00" },
    });
    fireEvent.change(dateneededInput, {
      target: { value: "2022-05-01T23:59:00" },
    });
    fireEvent.change(doneInput, { target: { checked: false } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesteremail: "cgaucho@ucsb.edu",
      professoremail: "phtcon@ucsb.edu",
      explanation: "BS/MS program",
      daterequested: "2022-04-20T01:00",
      dateneeded: "2022-05-01T23:59",
      done: false,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New recommendation request Created - id: 1 requester email: cgaucho@ucsb.edu",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/recommendationrequest" });
  });
});
