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
public class RecommendationRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_recommendation_request() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Request").click();

    page.getByText("Create Recommendation Request").click();
    assertThat(page.getByText("Create New Recommendation Request")).isVisible();
    page.getByLabel("Requester Email").fill("testReq@gmail.com");
    page.getByLabel("Professor Email").fill("testPro@gmail.com");
    page.getByLabel("Explanation").fill("test Program");
    page.getByLabel("Date Requested (iso format)").fill("2025-01-03T00:00");
    page.getByLabel("Date Needed (iso format)").fill("2025-01-03T00:00");
    page.getByLabel("Done").click();

    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("test Program");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Recommendation Request")).isVisible();
    page.getByLabel("Explanation").fill("test Program num2");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("test Program num2");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesteremail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendation_request() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Request").click();

    assertThat(page.getByText("Create Recommendation Request")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesteremail"))
        .not()
        .isVisible();
  }

  @Test
  public void admin_user_can_see_create_recommendation_request_button() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Request").click();

    assertThat(page.getByText("Create Recommendation Request")).isVisible();
  }
}
