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
public class ArticleWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_article() throws Exception {
    setupUser(true);

    page.getByText("Articles").click();

    page.getByText("Create Article").click();
    assertThat(page.getByText("Create New Article")).isVisible();
    page.getByTestId("ArticlesForm-title").fill("UCSB Housing Project for Fall 2027");
    page.getByTestId("ArticlesForm-url")
        .fill(
            "https://dailynexus.com/2025-10-24/construction-begins-on-the-san-benito-student-housing-project-expected-completion-by-fall-2027");
    page.getByTestId("ArticlesForm-explanation")
        .fill("Article about the new housing project and its foreseen date completion.");
    page.getByTestId("ArticlesForm-email").fill("exampleStudent@ucsb.edu");
    page.getByTestId("ArticlesForm-dateAdded").fill("2022-01-03T00:00");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-url"))
        .hasText(
            "https://dailynexus.com/2025-10-24/construction-begins-on-the-san-benito-student-housing-project-expected-completion-by-fall-2027");

    page.getByTestId("ArticlesTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Article")).isVisible();
    page.getByTestId("ArticlesForm-url")
        .fill(
            "https://dailynexus.com/2025-04-21/construction-to-ramp-up-on-san-benito-student-housing-project");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-url"))
        .hasText(
            "https://dailynexus.com/2025-04-21/construction-to-ramp-up-on-san-benito-student-housing-project");

    page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_article() throws Exception {
    setupUser(false);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).not().isVisible();
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_article_button() throws Exception {
    setupUser(true);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).isVisible();
    assertThat(page.getByText("Create Article")).isVisible();
  }
}
