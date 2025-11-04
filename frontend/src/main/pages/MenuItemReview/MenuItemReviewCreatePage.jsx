import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewCreatePage({ storybook = false }) {
  const objectToAxiosParams = (MenuItemReview) => ({
    url: "/api/menuitemreviews/post",
    method: "POST",
    params: {
      itemId: MenuItemReview.itemId,
      reviewerEmail: MenuItemReview.reviewerEmail,
      stars: MenuItemReview.stars,
      comments: MenuItemReview.comments,
      dateReviewed: MenuItemReview.dateReviewed,
    },
  });

  const onSuccess = (MenuItemReview) => {
    toast(
      `New review Created - itemId: ${MenuItemReview.itemId} reviewerEmail: ${MenuItemReview.reviewerEmail} stars: ${MenuItemReview.stars} comments: ${MenuItemReview.comments} dateReviewed: ${MenuItemReview.dateReviewed}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/MenuItemReview/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/MenuItemReview" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Review</h1>
        <MenuItemReviewForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
