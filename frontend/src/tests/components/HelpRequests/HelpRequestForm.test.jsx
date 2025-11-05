import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "RequesterEmail",
    "TeamId",
    "TableOrBreakoutRoom",
    "RequestTime",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
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
          <HelpRequestForm
            initialContents={helpRequestFixtures.oneHelpRequest}
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
          <HelpRequestForm />
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
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/RequesterEmail is required/);
    expect(screen.getByText(/TeamId is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/TableOrBreakoutRoom is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/RequestTime is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Solved is required/)).toBeInTheDocument();

    const requesterEmailInput = screen.getByTestId(`${testId}-requesterEmail`);
    fireEvent.change(requesterEmailInput, {
      target: { value: "a".repeat(300) },
    });
    const solvedInput = screen.getByTestId(`${testId}-solved`);
    fireEvent.change(solvedInput, {
      target: { value: "nonsense" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Value must be 'true' or 'false'/),
      ).toBeInTheDocument();
    });
  });

  describe("HelpRequestForm solved validation", () => {
    const setup = () => {
      // no jest.fn here; just a no-op callback
      const onSubmit = () => {};
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <HelpRequestForm submitAction={onSubmit} />
          </Router>
        </QueryClientProvider>,
      );

      const solvedInput = screen.getByLabelText(/solved/i);
      const submitButton = screen.getByText(/Create/);

      return { solvedInput, submitButton };
    };

    test("shows error when solved is not 'true' or 'false'", async () => {
      const user = userEvent.setup();
      const { solvedInput, submitButton } = setup();

      await user.clear(solvedInput);
      await user.type(solvedInput, "maybe");
      await user.click(submitButton);

      expect(
        await screen.findByText("Value must be 'true' or 'false'"),
      ).toBeInTheDocument();
    });

    test("accepts 'true' without showing error", async () => {
      const user = userEvent.setup();
      const { solvedInput, submitButton } = setup();

      await user.clear(solvedInput);
      await user.type(solvedInput, "true");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Value must be 'true' or 'false'"),
        ).not.toBeInTheDocument();
      });
    });

    test("accepts 'false' without showing error", async () => {
      const user = userEvent.setup();
      const { solvedInput, submitButton } = setup();

      await user.clear(solvedInput);
      await user.type(solvedInput, "false");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Value must be 'true' or 'false'"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
