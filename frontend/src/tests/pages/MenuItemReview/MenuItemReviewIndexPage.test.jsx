import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MenuItemReviewIndexPage from "main/pages/MenuItemReview/MenuItemReviewIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

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

// Mock the navigate hook for the edit button test
const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
    const originalModule = await vi.importActual("react-router");
    return {
        ...originalModule,
        useNavigate: () => mockedNavigate,
    };
});

describe("MenuItemReviewIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  // Use the testIdPrefix defined in the component
  const testId = "MenuItemReviewTable"; 
  
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

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };
  // --- End Setup functions ---

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    // Use the correct, lowercase, plural endpoint
    axiosMock.onGet("/api/menuitemreviews/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create Review/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create Review/);
    expect(button).toHaveAttribute("href", "/MenuItemReview/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  // Test for a regular user viewing the table
  test("renders three reviews correctly for regular user", async () => {
    setupUserOnly();
    // Use the correct endpoint and fixtures
    axiosMock
      .onGet("/api/menuitemreviews/all")
      .reply(200, menuItemReviewFixtures.threeReviews); 

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Assert that the first review ID is loaded
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent(menuItemReviewFixtures.threeReviews[0].id);
    });
    // Assert other IDs are loaded
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      menuItemReviewFixtures.threeReviews[1].id,
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      menuItemReviewFixtures.threeReviews[2].id,
    );
    
    // Assert the presence of review-specific data (e.g., email and comments from the fixture)
    expect(screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`)).toHaveTextContent(
      menuItemReviewFixtures.threeReviews[0].reviewerEmail,
    );
    expect(screen.getByTestId(`${testId}-cell-row-0-col-comments`)).toHaveTextContent(
      menuItemReviewFixtures.threeReviews[0].comments,
    );


    // Create Review Button should not be present for userOnly
    const createReviewButton = screen.queryByText("Create Review");
    expect(createReviewButton).not.toBeInTheDocument();

    // Edit and Delete buttons should not be visible for userOnly
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  // Test for when the backend is unavailable
  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    // Use the correct endpoint
    axiosMock.onGet("/api/menuitemreviews/all").timeout(); 

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {/* Use the correct component */}
          <MenuItemReviewIndexPage /> 
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    // Use the correct error message/endpoint
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/menuitemreviews/all",
    );
    restoreConsole();
  });

  // Test for delete functionality (admin user)
  test("what happens when you click delete, admin", async () => {
    setupAdminUser();
    
    // Use the correct endpoint and fixtures
    const reviews = menuItemReviewFixtures.threeReviews;
    axiosMock
      .onGet("/api/menuitemreviews/all")
      .reply(200, reviews);
    // Use the correct delete endpoint
    axiosMock
      .onDelete("/api/menuitemreviews")
      .reply(200, "MenuItemReview with id 2 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {/* Use the correct component */}
          <MenuItemReviewIndexPage /> 
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the first row to render
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    // Check content of the first row (ID 2)
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      reviews[0].id,
    );

    // Find and click the delete button for the first row
    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    // Assert the toast message is shown
    await waitFor(() => {
      expect(mockToast).toBeCalledWith("MenuItemReview with id 2 was deleted");
    });
    
    // Assert the delete API call was made
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/menuitemreviews");
    // Assert the ID param was passed correctly
    expect(axiosMock.history.delete[0].params).toEqual({ id: reviews[0].id });
  });
  
  // Test for edit functionality (admin user)
  test("what happens when you click edit, admin", async () => {
    setupAdminUser();
    
    const reviews = menuItemReviewFixtures.threeReviews;
    axiosMock
      .onGet("/api/menuitemreviews/all")
      .reply(200, reviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument();
    });

    const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    fireEvent.click(editButton);

    // Assert that the navigation function was called with the correct path
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(`/MenuItemReview/edit/${reviews[0].id}`);
    });
  });
});