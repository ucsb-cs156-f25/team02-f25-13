import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function MenuItemReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "MenuItemReviewForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      {/* FIELD: itemId */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemId">Item ID</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-itemId"}
          id="itemId"
          type="number"
          isInvalid={Boolean(errors.itemId)}
          {...register("itemId", {
            required: "Item ID is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.itemId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* FIELD: reviewerEmail */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerEmail">Reviewer Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-reviewerEmail"}
          id="reviewerEmail"
          type="text"
          isInvalid={Boolean(errors.reviewerEmail)}
          {...register("reviewerEmail", {
            required: "Reviewer email is required.",
            pattern: { // Added email validation for robustness
              value: /^\S+@\S+$/i,
              message: "Must be a valid email address."
            }
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.reviewerEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>
      
      {/* FIELD: stars */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="stars">Stars (0-5)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-stars"}
          id="stars"
          type="number" // Use type number for cleaner input
          isInvalid={Boolean(errors.stars)}
          {...register("stars", {
            required: "Stars is required.",
            min: { value: 0, message: "Minimum is 0" },
            max: { value: 5, message: "Maximum is 5" }
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.stars?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* FIELD: dateReviewed */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateReviewed">Date Reviewed (iso format)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateReviewed"}
          id="dateReviewed"
          type="datetime-local" // Use datetime-local for better date input
          isInvalid={Boolean(errors.dateReviewed)}
          {...register("dateReviewed", {
            required: "Date reviewed is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateReviewed?.message}
        </Form.Control.Feedback>
      </Form.Group>
      
      {/* FIELD: comments */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="comments">Comments</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-comments"}
          id="comments"
          as="textarea" // Use textarea for longer text input
          isInvalid={Boolean(errors.comments)}
          {...register("comments", {
            required: "Comments are required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.comments?.message}
        </Form.Control.Feedback>
      </Form.Group>


      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default MenuItemReviewForm;