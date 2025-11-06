package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
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
public class ArticleIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticlesRepository articlesRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    LocalDateTime date1 = LocalDateTime.parse("2022-01-03T00:00:00");

    Articles article =
        Articles.builder()
            .title("UCSB Housing Project for Fall 2027")
            .url(
                "https://dailynexus.com/2025-10-24/construction-begins-on-the-san-benito-student-housing-project-expected-completion-by-fall-2027")
            .explanation("Article about the new housing project and its foreseen date completion.")
            .email("exampleStudent@ucsb.edu")
            .dateAdded(date1)
            .build();

    articlesRepository.save(article);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/articles?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    article.setId(1L);
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange

    LocalDateTime date2 = LocalDateTime.parse("2022-03-11T12:12:12");

    Articles article2 =
        Articles.builder()
            .id(1L)
            .title("UCSB Shines in MLB Draft with Tyler Bremner Overall No. 2")
            .url(
                "https://dailynexus.com/2025-08-06/tyler-bremner-goes-no-2-overall-as-ucsb-shines-in-2025-mlb-draft")
            .explanation(
                "Article about the selected UCSB baseball player, making it into the big league.")
            .email("exampleStudent2@ucsb.edu")
            .dateAdded(date2)
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/articles/post?title=UCSB Shines in MLB Draft with Tyler Bremner Overall No. 2&url=https://dailynexus.com/2025-08-06/tyler-bremner-goes-no-2-overall-as-ucsb-shines-in-2025-mlb-draft&explanation=Article about the selected UCSB baseball player, making it into the big league.&email=exampleStudent2@ucsb.edu&dateAdded=2022-03-11T12:12:12")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article2);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
