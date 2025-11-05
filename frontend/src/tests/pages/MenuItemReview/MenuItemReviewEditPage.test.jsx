import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures"; // Import review fixtures

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
// Mock useParams and Navigate
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17, // Mocking the ID being edited
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
const testIdPrefix = "MenuItemReviewForm"; // The prefix used by the form component

describe("MenuItemReviewEditPage tests", () => {
  
  // --- Setup functions (unchanged) ---
  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };
  
  /*const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };*/
  // --- End Setup functions ---

  // --- 1. Test when backend fails to return data ---
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      setupUserOnly();
      // Mock GET to timeout
      axiosMock.onGet("/api/menuitemreviews", { params: { id: 17 } }).timeout();
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
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      
      await screen.findByText("Edit Review"); 
      // Check if one of the form fields is NOT present (form only renders if data is available)
      expect(screen.queryByTestId(`${testIdPrefix}-itemId`)).not.toBeInTheDocument(); 
      restoreConsole();
    });
  });

  // --- 2. Tests where backend is working normally (Success Path) ---
  describe("tests where backend is working normally", () => {
    const initialReview = menuItemReviewFixtures.oneReview[0];
    initialReview.id = 17; // Ensure ID matches useParams mock
    
    const updatedReview = {
      id: 17,
      itemId: 5,
      reviewerEmail: "new.email@example.com",
      stars: 1,
      dateReviewed: "2025-01-01T00:00:00", // Full ISO string for response mock
      comments: "It was awful.",
    };

    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      setupUserOnly();
        
      // Mock the GET request to fetch initial data
      axiosMock.onGet("/api/menuitemreviews", { params: { id: 17 } }).reply(200, initialReview);
      
      // Mock the PUT request for the update operation
      axiosMock.onPut("/api/menuitemreviews").reply(200, updatedReview);
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the initial data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage /> 
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testIdPrefix}-id`);

      const idField = screen.getByTestId(`${testIdPrefix}-id`);
      const itemIdField = screen.getByTestId(`${testIdPrefix}-itemId`);
      const emailField = screen.getByTestId(`${testIdPrefix}-reviewerEmail`);
      const starsField = screen.getByTestId(`${testIdPrefix}-stars`);
      const dateField = screen.getByTestId(`${testIdPrefix}-dateReviewed`);
      const commentsField = screen.getByTestId(`${testIdPrefix}-comments`);
      const submitButton = screen.getByTestId(`${testIdPrefix}-submit`);

      // Assert initial values
      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue(initialReview.id.toString());
      expect(itemIdField).toHaveValue(initialReview.itemId);
      expect(emailField).toHaveValue(initialReview.reviewerEmail);
      expect(starsField).toHaveValue(initialReview.stars);
      expect(dateField).toHaveValue(initialReview.dateReviewed.substring(0, 16)); // datetime-local format is YYYY-MM-DDTHH:MM
      expect(commentsField).toHaveValue(initialReview.comments);
      expect(submitButton).toHaveTextContent("Update");
    });

    test("Submits updated data and redirects on success", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testIdPrefix}-id`);

      const itemIdField = screen.getByTestId(`${testIdPrefix}-itemId`);
      const emailField = screen.getByTestId(`${testIdPrefix}-reviewerEmail`);
      const starsField = screen.getByTestId(`${testIdPrefix}-stars`);
      const dateField = screen.getByTestId(`${testIdPrefix}-dateReviewed`);
      const commentsField = screen.getByTestId(`${testIdPrefix}-comments`);
      const submitButton = screen.getByTestId(`${testIdPrefix}-submit`);

      // Change values to the new mock values (must be strings from form)
      fireEvent.change(itemIdField, { target: { value: "5" } });
      fireEvent.change(emailField, { target: { value: "new.email@example.com" } });
      fireEvent.change(starsField, { target: { value: "1" } });
      fireEvent.change(dateField, { target: { value: "2026-06-15T14:30" } }); // New Date value
      fireEvent.change(commentsField, { target: { value: "It was awful." } });
      
      fireEvent.click(submitButton);

      // Assert toast and navigation
      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Review Updated - id: ${updatedReview.id}`,
      );
      expect(mockNavigate).toBeCalledWith({ to: "/MenuItemReview" });

      // Assert PUT request details
      await waitFor(() => {
        expect(axiosMock.history.put.length).toBe(1); // times called
      });
      expect(axiosMock.history.put[0].url).toBe("/api/menuitemreviews");
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      
      // Assert the request body data
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        itemId: "5", 
        reviewerEmail: "new.email@example.com",
        stars: "1",
        dateReviewed: "2026-06-15T14:30", // Assert the submitted date (no seconds)
        comments: "It was awful.",
      }); 
    });
    
    // Test for API failure
    test("submitting an update request that fails shows a toast", async () => {
      // Mock the PUT request to fail with a 500 error
      axiosMock.onPut("/api/menuitemreviews").reply(500, {
        message: "Error: Request failed with status code 500",
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testIdPrefix}-id`);

      const itemIdField = screen.getByTestId(`${testIdPrefix}-itemId`);
      const submitButton = screen.getByTestId(`${testIdPrefix}-submit`);

      // Change a value to trigger the PUT request
      fireEvent.change(itemIdField, { target: { value: "5" } }); 
      fireEvent.click(submitButton);

      // Assert that the error toast is shown
      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith("Error: Request failed with status code 500");

      // Assert that navigation did NOT happen
      expect(mockNavigate).not.toBeCalled();
    });
  });
});