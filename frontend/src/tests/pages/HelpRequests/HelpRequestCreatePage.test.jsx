import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequests/HelpRequestCreatePage";
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

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 2,
      requesterEmail: "hao_ding@ucsb.edu",
      teamId: "1",
      tableOrBreakoutRoom: "2",
      requestTime: "2013-06-16T23:55",
      explanation: "Mvn clean install is not working!!!",
      solved: true,
    };

    axiosMock.onPost("/api/help_requests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );
    const teamIdField = screen.getByLabelText("TeamId");
    const tableOrBreakoutRoomField = screen.getByLabelText(
      "TableOrBreakoutRoom",
    );
    const requestTimeField = screen.getByLabelText("RequestTime");
    const explanationField = screen.getByLabelText("Explanation");
    const solvedField = screen.getByTestId("HelpRequestForm-solved");

    const submitButton = screen.getByRole("button", { name: /Create/i });

    fireEvent.change(requesterEmailField, {
      target: { value: "zhangchi@ucsb.edu" },
    });
    fireEvent.change(teamIdField, { target: { value: "13" } });
    fireEvent.change(tableOrBreakoutRoomField, {
      target: { value: "13" },
    });
    fireEvent.change(requestTimeField, {
      target: { value: "2013-06-16T23:55" },
    });
    fireEvent.change(explanationField, { target: { value: "Please help!" } });
    fireEvent.change(solvedField, { target: { value: "true" } });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "zhangchi@ucsb.edu",
      teamId: "13",
      tableOrBreakoutRoom: "13",
      requestTime: "2013-06-16T23:55",
      explanation: "Please help!",
      solved: "true",
    });

    expect(mockToast).toBeCalledWith(
      "New helpRequest Created - id: 2 requester email: hao_ding@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/help_requests" });
  });
});
