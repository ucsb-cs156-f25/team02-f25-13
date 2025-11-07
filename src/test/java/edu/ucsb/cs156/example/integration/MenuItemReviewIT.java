package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange
    LocalDateTime date = LocalDateTime.parse("2025-12-31T12:34:00");
    MenuItemReview review =
        MenuItemReview.builder()
            .itemId(1L)
            .reviewerEmail("string@gmail.com")
            .stars(4)
            .dateReviewed(date)
            .comments("string")
            .build();

    menuItemReviewRepository.save(review);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/menuitemreviews?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(review);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_review() throws Exception {
    // arrange
    LocalDateTime date = LocalDateTime.parse("2025-12-31T12:34:00");
    MenuItemReview expectedReview =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1L)
            .reviewerEmail("admin@example.com")
            .stars(4)
            .dateReviewed(date)
            .comments("The new review is great!")
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/menuitemreviews/post?itemId=1&reviewerEmail=admin@example.com&stars=4&dateReviewed=2025-12-31T12:34:00&comments=The new review is great!")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson =
        mapper.writeValueAsString(expectedReview); // Assert against the object *with* ID 1L
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    // Assert the entity was actually saved to the repository
    MenuItemReview actualReview =
        menuItemReviewRepository
            .findById(1L)
            .orElseThrow(() -> new AssertionError("Review was not saved to the repository."));
    assertEquals(expectedReview, actualReview);
  }
}
