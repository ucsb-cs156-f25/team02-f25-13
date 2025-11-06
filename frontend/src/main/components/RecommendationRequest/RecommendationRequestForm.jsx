import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequstForm({
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

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  const testIdPrefix = "RecommendationRequestForm";

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

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesteremail">Requester Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-requesteremail"}
          id="requesteremail"
          type="text"
          isInvalid={Boolean(errors.requesteremail)}
          {...register("requesteremail", {
            required: "Requester Email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesteremail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professoremail">Professor Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-professoremail"}
          id="professoremail"
          type="text"
          isInvalid={Boolean(errors.professoremail)}
          {...register("professoremail", {
            required: "Professor Email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professoremail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-explanation"}
          id="explanation"
          type="text"
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="daterequested">
          Date Requested (iso format)
        </Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-daterequested"}
          id="daterequested"
          type="datetime-local"
          isInvalid={Boolean(errors.daterequested)}
          {...register("daterequested", {
            required: true,
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.daterequested && "Date Requested is required. "}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateneeded">Date Needed (iso format)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateneeded"}
          id="dateneeded"
          type="datetime-local"
          isInvalid={Boolean(errors.dateneeded)}
          {...register("dateneeded", {
            required: true,
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateneeded && "Date Needed is required. "}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id="done"
          label="Done"
          data-testid={testIdPrefix + "-done"}
          isInvalid={Boolean(errors.done)}
          {...register("done")}
        />
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

export default RecommendationRequstForm;
