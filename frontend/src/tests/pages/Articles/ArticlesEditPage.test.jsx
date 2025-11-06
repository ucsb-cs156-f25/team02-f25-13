import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
describe("ArticlesEditPage tests", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("Article-title")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title:
          "Department of Recreation promotes safety with Hallowheels Event",
        url: "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event",
        explanation:
          "An article about awareness of Halloween festivities for UCSB students.",
        email: "ngonzalezornelas@ucsb.edu",
        dateAdded: "2025-10-30T11:06",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 17,
        title:
          "Department of Recreation promotes safety with Hallowheels Event New Stuff",
        url: "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event/where/to-find",
        explanation:
          "An article about awareness of Halloween festivities for UCSB students and some more stuff talked about",
        email: "ngonzalezornelas@csil.cs.ucsb.edu",
        dateAdded: "2025-10-31T12:25",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue(
        "Department of Recreation promotes safety with Hallowheels Event",
      );
      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue(
        "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event",
      );
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue(
        "An article about awareness of Halloween festivities for UCSB students.",
      );
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("ngonzalezornelas@ucsb.edu");
      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2025-10-30T11:06");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: {
          value:
            "Department of Recreation promotes safety with Hallowheels Event New Stuff",
        },
      });
      fireEvent.change(urlField, {
        target: {
          value:
            "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event/where/to-find",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value:
            "An article about awareness of Halloween festivities for UCSB students and some more stuff talked about",
        },
      });
      fireEvent.change(emailField, {
        target: { value: "ngonzalezornelas@csil.cs.ucsb.edu" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2025-10-31T12:25" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Department of Recreation promotes safety with Hallowheels Event New Stuff",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title:
            "Department of Recreation promotes safety with Hallowheels Event New Stuff",
          url: "https://dailynexus.com/2025-10-30/department-of-recreation-promotes-safety-with-hallowheels-event/where/to-find",
          explanation:
            "An article about awareness of Halloween festivities for UCSB students and some more stuff talked about",
          email: "ngonzalezornelas@csil.cs.ucsb.edu",
          dateAdded: "2025-10-31T12:25",
        }),
      ); // posted object
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });
  });
});
