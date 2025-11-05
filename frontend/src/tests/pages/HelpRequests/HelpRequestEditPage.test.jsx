import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequests/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/help_requests", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit HelpRequest");
      expect(
        screen.queryByTestId("HelpRequest-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/help_requests", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "hao_ding@ucsb.edu",
        teamId: "13",
        tableOrBreakoutRoom: "12",
        requestTime: "2013-06-16T23:55",
        explanation: "Please help!",
        solved: "true",
      });
      axiosMock.onPut("/api/help_requests").reply(200, {
        id: "17",
        requesterEmail: "zhangchi@ucsb.edu",
        teamId: "12",
        tableOrBreakoutRoom: "5",
        requestTime: "2005-06-16T23:55",
        explanation: "Please!",
        solved: "false",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("HelpRequestForm-requesterEmail");
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

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

      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(submitButton).toHaveTextContent(/update/i);

      expect(requesterEmailField).toHaveValue("hao_ding@ucsb.edu");
      expect(teamIdField).toHaveValue("13");
      expect(tableOrBreakoutRoomField).toHaveValue("12");
      expect(requestTimeField).toHaveValue("2013-06-16T23:55");
      expect(explanationField).toHaveValue("Please help!");
      expect(solvedField).toHaveValue("true");

      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

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

      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(requesterEmailField).toHaveValue("hao_ding@ucsb.edu");
      expect(teamIdField).toHaveValue("13");
      expect(tableOrBreakoutRoomField).toHaveValue("12");
      expect(requestTimeField).toHaveValue("2013-06-16T23:55");
      expect(explanationField).toHaveValue("Please help!");
      expect(solvedField).toHaveValue("true");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requesterEmailField, {
        target: { value: "zhangchi@ucsb.edu" },
      });
      fireEvent.change(teamIdField, { target: { value: "12" } });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "5" },
      });
      fireEvent.change(requestTimeField, {
        target: { value: "2005-06-16T23:55" },
      });
      fireEvent.change(explanationField, { target: { value: "Please!" } });
      fireEvent.change(solvedField, { target: { value: "false" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "HelpRequest Updated - id: 17 requesterEmail: zhangchi@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/help_requests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "zhangchi@ucsb.edu",
          teamId: "12",
          tableOrBreakoutRoom: "5",
          requestTime: "2005-06-16T23:55",
          explanation: "Please!",
          solved: "false",
        }),
      ); // posted object
    });
  });
});
