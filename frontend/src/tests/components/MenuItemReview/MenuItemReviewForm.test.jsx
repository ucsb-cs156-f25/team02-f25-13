import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Item ID",
    "Reviewer Email",
    "Stars (0-5)",
    "Date Reviewed (iso format)",
    "Comments",
  ];
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneReview[0]}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Reviewer Email is required/i);
    await screen.findByText(/Item ID is required/i);
    await screen.findByText(/Stars is required/);
    await screen.findByText(/Date Reviewed is required/i);
    expect(screen.getByText(/Comments are required/i)).toBeInTheDocument();

    const starsInput = screen.getByTestId(`${testId}-stars`);
    fireEvent.change(starsInput, { target: { value: "6" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Maximum is 5/i)).toBeInTheDocument();
    });

    fireEvent.change(starsInput, { target: { value: "-1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Minimum is 0/i)).toBeInTheDocument();
    });

    const reviewerEmailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    fireEvent.change(reviewerEmailInput, {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
  });

  test("form contains all expected input fields", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const testId = "MenuItemReviewForm";

    expect(await screen.findByTestId(`${testId}-itemId`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-stars`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-dateReviewed`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-comments`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();
  });

  test("shows an error when email format is invalid", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const testId = "MenuItemReviewForm";
    const emailInput = await screen.findByTestId(`${testId}-reviewerEmail`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.includes("Must be a valid email address"),
        ),
      ).toBeInTheDocument();
    });
  });

  test("displays error when invalid email format is entered", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = await screen.findByText(/Create/);
    const reviewerEmailInput = screen.getByTestId(
      "MenuItemReviewForm-reviewerEmail",
    );

    // ❌ Invalid emails that should fail regex
    fireEvent.change(reviewerEmailInput, { target: { value: "invalidemail" } });
    await waitFor(() => expect(reviewerEmailInput.value).toBe("invalidemail"));
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Must be a valid email address/i),
      ).toBeInTheDocument();
    });

    // ✅ Valid email that should pass regex
    fireEvent.change(reviewerEmailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.click(submitButton);

    // Should remove the invalid email message
    await waitFor(() => {
      expect(
        screen.queryByText(/Must be a valid email address/i),
      ).not.toBeInTheDocument();
    });
  });

  test("shows error when email has extra text before or after", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = await screen.findByText(/Create/);
    const reviewerEmailInput = screen.getByTestId(
      "MenuItemReviewForm-reviewerEmail",
    );

    // ❌ Email with leading text
    fireEvent.change(reviewerEmailInput, {
      target: { value: "hello test@example.com" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Must be a valid email address/i),
      ).toBeInTheDocument();
    });

    // ❌ Email with trailing text
    fireEvent.change(reviewerEmailInput, {
      target: { value: "test@example.com goodbye" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Must be a valid email address/i),
      ).toBeInTheDocument();
    });
  });

  test("shows error when email has trailing characters with no space", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = await screen.findByText(/Create/);
    const reviewerEmailInput = screen.getByTestId(
      "MenuItemReviewForm-reviewerEmail",
    );

    // ❌ Email with extra characters after valid email (no space)
    fireEvent.change(reviewerEmailInput, {
      target: { value: "test@example.comabc" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Must be a valid email address/i),
      ).toBeInTheDocument();
    });
  });
});
