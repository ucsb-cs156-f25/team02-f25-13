import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, test } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Code",
    "Organization Translation Short",
    "Organization Translation",
    "Inactive",
  ];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneUCSBOrganization}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
    expect(screen.getByText(`Organization Code`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("inactive field is rendered correctly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-inactive`)).toBeInTheDocument();
    const inactiveSelect = screen.getByTestId(`${testId}-inactive`);
    expect(inactiveSelect).toBeInTheDocument();

    expect(screen.getByText("Select...")).toBeInTheDocument();
    expect(screen.getByText("false")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();

    fireEvent.change(inactiveSelect, { target: { value: "true" } });
    expect(inactiveSelect.value).toBe("true");
    fireEvent.change(inactiveSelect, { target: { value: "false" } });
    expect(inactiveSelect.value).toBe("false");
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Code is required/);
    expect(
      screen.getByText(/Organization Translation Short is required/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Organization Translation is required/),
    ).toBeInTheDocument();

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    fireEvent.change(orgCodeInput, { target: { value: "a".repeat(32) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 31 characters/)).toBeInTheDocument();
    });
    const orgTranslationShortInput = screen.getByTestId(
      `${testId}-orgTranslationShort`,
    );
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "a".repeat(128) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 127 characters/)).toBeInTheDocument();
    });
    const orgTranslationInput = screen.getByTestId(`${testId}-orgTranslation`);
    fireEvent.change(orgTranslationInput, {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Inactive status is required/),
      ).toBeInTheDocument();
    });
  });
});
