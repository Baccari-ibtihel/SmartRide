package com.smartride.user.service;

import com.smartride.user.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class KeycloakSyncService {

    @Value("${keycloak.url:http://keycloak:8080}")
    private String keycloakUrl;

    @Value("${keycloak.realm:smartride-realm}")
    private String realm;

    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<String, String> roleIds = Map.of(
            "ADMIN", "9d3f96ea-a18a-407b-b8cc-6c01afecd4c8",
            "CONDUCTEUR", "f643c5e1-5370-4fd6-99a1-06554ccdd3f6",
            "PASSAGER", "c9892769-2733-405b-83ec-c59fcc817f6d"
    );

    /**
     * Synchronize a newly created User directly into Keycloak's smartride-realm
     */
    public boolean syncUser(User user, String password) {
        try {
            String adminToken = getAdminToken();
            if (adminToken == null) {
                System.err.println("Could not obtain Keycloak admin token.");
                return false;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken);

            String cleanUsername = user.getUsername() != null ? user.getUsername() : user.getEmail().split("@")[0];

            Map<String, Object> credential = new HashMap<>();
            credential.put("type", "password");
            credential.put("value", password != null && !password.isBlank() ? password : "password123");
            credential.put("temporary", false);

            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("username", cleanUsername);
            userPayload.put("email", user.getEmail());
            userPayload.put("firstName", user.getFirstName() != null ? user.getFirstName() : "SmartRide");
            userPayload.put("lastName", user.getLastName() != null ? user.getLastName() : "User");
            userPayload.put("enabled", true);
            userPayload.put("emailVerified", true);
            userPayload.put("credentials", List.of(credential));

            HttpEntity<Map<String, Object>> createRequest = new HttpEntity<>(userPayload, headers);
            String usersUrl = keycloakUrl + "/admin/realms/" + realm + "/users";

            try {
                restTemplate.postForEntity(usersUrl, createRequest, String.class);
            } catch (Exception e) {
                System.out.println("Notice: Keycloak user creation: " + e.getMessage());
            }

            // Find user ID to map role
            String searchUrl = usersUrl + "?username=" + cleanUsername;
            ResponseEntity<List> searchRes = restTemplate.exchange(searchUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class);
            if (searchRes.getBody() != null && !searchRes.getBody().isEmpty()) {
                Map<String, Object> firstUser = (Map<String, Object>) searchRes.getBody().get(0);
                String userId = (String) firstUser.get("id");

                String targetRoleName = user.getRole() != null ? user.getRole().toUpperCase() : "PASSAGER";
                try {
                    String getRoleUrl = keycloakUrl + "/admin/realms/" + realm + "/roles/" + targetRoleName;
                    ResponseEntity<Map> roleRes = restTemplate.exchange(getRoleUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
                    if (roleRes.getBody() != null) {
                        Map<String, Object> roleObj = (Map<String, Object>) roleRes.getBody();
                        HttpEntity<List<Map<String, Object>>> roleReq = new HttpEntity<>(List.of(roleObj), headers);
                        String roleMappingUrl = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";
                        restTemplate.postForEntity(roleMappingUrl, roleReq, String.class);
                        System.out.println("Role " + targetRoleName + " dynamically mapped to user " + cleanUsername + " in Keycloak!");
                    }
                } catch (Exception re) {
                    System.out.println("Notice: Keycloak role mapping: " + re.getMessage());
                }
            }

            return true;
        } catch (Exception e) {
            System.err.println("Keycloak sync failed: " + e.getMessage());
            return false;
        }
    }

    private String getAdminToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("client_id", "admin-cli");
            map.add("username", "admin");
            map.add("password", "admin");
            map.add("grant_type", "password");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            String tokenUrl = keycloakUrl + "/realms/master/protocol/openid-connect/token";

            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            System.err.println("Error fetching admin token from Keycloak: " + e.getMessage());
        }
        return null;
    }
}
