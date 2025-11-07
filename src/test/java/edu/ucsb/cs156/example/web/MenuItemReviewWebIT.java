package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_review() throws Exception {
    setupUser(true);

    page.getByText("MenuItemReview").click();

    page.getByText("Create Review").click();
    assertThat(page.getByText("Create New Review")).isVisible();
    page.getByTestId("MenuItemReviewForm-itemId").fill("1");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("string@gmail.com");
    page.getByTestId("MenuItemReviewForm-stars").fill("2");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2025-12-31T12:34");
    page.getByTestId("MenuItemReviewForm-comments").fill("test");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("1");

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-reviewerEmail"))
        .hasText("string@gmail.com");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Review")).isVisible();
    page.getByTestId("MenuItemReviewForm-itemId").fill("5");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("5");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_review() throws Exception {
    setupUser(false);

    page.getByText("MenuItemReview").click();

    assertThat(page.getByText("Create Review")).not().isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).not().isVisible();
  }
}
