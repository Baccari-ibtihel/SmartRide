package com.smartride.ratingchat;


import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


import com.smartride.ratingchat.utils.UserHeaders;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Test de bout en bout de l'API REST (contexte Spring complet + base H2 en memoire).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RatingChatApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void ratingFlow() throws Exception {
        String passengerRatesDriver = """
                {"bookingId": 501, "tripId": 50, "ratedUserId": 20, "raterRole": "PASSENGER", "score": 5,
                 "comment": "Conducteur ponctuel"}""";

        mockMvc.perform(post("/api/ratings").header(UserHeaders.USER_ID, 10)
                        .contentType(MediaType.APPLICATION_JSON).content(passengerRatesDriver))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.raterId").value(10))
                .andExpect(jsonPath("$.score").value(5));

        // Meme reservation, meme auteur -> 409
        mockMvc.perform(post("/api/ratings").header(UserHeaders.USER_ID, 10)
                        .contentType(MediaType.APPLICATION_JSON).content(passengerRatesDriver))
                .andExpect(status().isConflict());

        // Note hors limites -> 400 avec le detail du champ
        mockMvc.perform(post("/api/ratings").header(UserHeaders.USER_ID, 11)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"bookingId": 502, "tripId": 50, "ratedUserId": 20, "raterRole": "PASSENGER", "score": 9}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.score").exists());

        // Sans en-tete X-User-Id -> 400
        mockMvc.perform(post("/api/ratings").contentType(MediaType.APPLICATION_JSON).content(passengerRatesDriver))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/ratings").header(UserHeaders.USER_ID, 12)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"bookingId": 503, "tripId": 50, "ratedUserId": 20, "raterRole": "PASSENGER", "score": 4}"""))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/ratings/users/20/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRatings").value(2))
                .andExpect(jsonPath("$.averageScore").value(4.5))
                .andExpect(jsonPath("$.asDriver.totalRatings").value(2))
                .andExpect(jsonPath("$.distribution.5").value(1));

        mockMvc.perform(get("/api/ratings/users/20/received").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void chatFlow() throws Exception {
        String body = mockMvc.perform(post("/api/chat/conversations").header(UserHeaders.USER_ID, 30)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tripId": 60, "passengerId": 30, "driverId": 40}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.otherParticipantId").value(40))
                .andReturn().getResponse().getContentAsString();
        String conversationId = body.replaceAll("(?s).*\"id\":(\\d+).*", "$1");

        mockMvc.perform(post("/api/chat/conversations/{id}/messages", conversationId).header(UserHeaders.USER_ID, 30)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"content\": \"Bonjour, je suis en avance\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.senderId").value(30));

        // Le conducteur a 1 message non lu
        mockMvc.perform(get("/api/chat/unread-count").header(UserHeaders.USER_ID, 40))
                .andExpect(jsonPath("$.unreadCount").value(1));
        mockMvc.perform(get("/api/chat/conversations").header(UserHeaders.USER_ID, 40))
                .andExpect(jsonPath("$[0].unreadCount").value(1))
                .andExpect(jsonPath("$[0].lastMessagePreview").value("Bonjour, je suis en avance"));

        mockMvc.perform(patch("/api/chat/conversations/{id}/read", conversationId).header(UserHeaders.USER_ID, 40))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updatedCount").value(1));
        mockMvc.perform(get("/api/chat/unread-count").header(UserHeaders.USER_ID, 40))
                .andExpect(jsonPath("$.unreadCount").value(0));

        mockMvc.perform(get("/api/chat/conversations/{id}/messages", conversationId).header(UserHeaders.USER_ID, 40))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].readAt").isNotEmpty());

        // Un utilisateur exterieur ne peut pas lire la conversation
        mockMvc.perform(get("/api/chat/conversations/{id}/messages", conversationId).header(UserHeaders.USER_ID, 99))
                .andExpect(status().isForbidden());
    }
}
