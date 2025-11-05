import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByText(/Dining Commons Code/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Dining Commons Code/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a UCSBDiningCommonsMenuItem", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm
          initialContents={
            ucsbDiningCommonsMenuItemFixtures.oneUCSBDiningCommonsMenuItem
          }
        />
      </Router>,
    );
    await screen.findByTestId(/UCSBDiningCommonsMenuItemForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/UCSBDiningCommonsMenuItemForm-id/)).toHaveValue(
      "1",
    );
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );
    const nameField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-name");
    const submitButton = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-submit",
    );

    fireEvent.change(nameField, {
      target: {
        value:
          "bad-inputtttttttttttttttttttttttttttttttttttttttttttttttttttttttt",
      },
    });
    fireEvent.click(submitButton);

    await screen.findByText(/Max length 30 characters/);
    expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDiningCommonsMenuItemForm-submit");
    const submitButton = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-submit",
    );

    fireEvent.click(submitButton);

    await screen.findByText(/Dining Commons Code is required./);
    expect(screen.getByText(/Name is required./)).toBeInTheDocument();
    expect(screen.getByText(/Station is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );

    const diningCommonsCodeField = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );
    const nameField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-name");
    const stationField = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-station",
    );
    const submitButton = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-submit",
    );

    fireEvent.change(diningCommonsCodeField, { target: { value: "ortega" } });
    fireEvent.change(nameField, {
      target: { value: "Baked Pesto Pasta with Chicken" },
    });
    fireEvent.change(stationField, {
      target: { value: "Entree Specials" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Max length 30 characters/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDiningCommonsMenuItemForm-cancel");
    const cancelButton = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-cancel",
    );

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
