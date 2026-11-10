package com.smartride.ratingchat.controllers;


import java.net.URI;
import java.util.List;


import com.smartride.ratingchat.dto.CreateRatingRequest;
import com.smartride.ratingchat.dto.PageResponse;
import com.smartride.ratingchat.dto.RatingResponse;
import com.smartride.ratingchat.dto.RatingSummaryResponse;
import com.smartride.ratingchat.dto.UpdateRatingRequest;
import com.smartride.ratingchat.services.RatingService;
import com.smartride.ratingchat.utils.UserHeaders;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ratings")
@Tag(name = "Ratings", description = "Evaluations passager <-> conducteur")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    @Operation(summary = "Evaluer l'autre participant d'une reservation")
    public ResponseEntity<RatingResponse> create(@RequestHeader(UserHeaders.USER_ID) Long userId,
            @Valid @RequestBody CreateRatingRequest request) {
        RatingResponse created = ratingService.create(userId, request);
        return ResponseEntity.created(URI.create("/api/ratings/" + created.id())).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail d'une evaluation")
    public RatingResponse getById(@PathVariable Long id) {
        return ratingService.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier sa propre evaluation")
    public RatingResponse update(@PathVariable Long id, @RequestHeader(UserHeaders.USER_ID) Long userId,
            @Valid @RequestBody UpdateRatingRequest request) {
        return ratingService.update(id, userId, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer sa propre evaluation")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestHeader(UserHeaders.USER_ID) Long userId) {
        ratingService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}/received")
    @Operation(summary = "Evaluations recues par un utilisateur (paginees, ?page=0&size=10)")
    public PageResponse<RatingResponse> received(@PathVariable Long userId,
            @PageableDefault(size = 10, sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return ratingService.getReceivedBy(userId, pageable);
    }

    @GetMapping("/users/{userId}/given")
    @Operation(summary = "Evaluations donnees par un utilisateur (paginees)")
    public PageResponse<RatingResponse> given(@PathVariable Long userId,
            @PageableDefault(size = 10, sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return ratingService.getGivenBy(userId, pageable);
    }

    @GetMapping("/users/{userId}/summary")
    @Operation(summary = "Note moyenne, nombre d'avis et repartition par etoile")
    public RatingSummaryResponse summary(@PathVariable Long userId) {
        return ratingService.getSummary(userId);
    }

    @GetMapping("/trips/{tripId}")
    @Operation(summary = "Toutes les evaluations d'un trajet")
    public List<RatingResponse> byTrip(@PathVariable Long tripId) {
        return ratingService.getByTrip(tripId);
    }

    @GetMapping("/bookings/{bookingId}")
    @Operation(summary = "Evaluations d'une reservation (0, 1 ou 2) - utile pour savoir si on a deja note")
    public List<RatingResponse> byBooking(@PathVariable Long bookingId) {
        return ratingService.getByBooking(bookingId);
    }
}
