package com.smartride.ratingchat.dto;


import java.util.Map;

/**
 * Reputation d'un utilisateur, affichee sur son profil.
 *
 * @param distribution nombre de notes par etoile : {"1": 0, "2": 1, "3": 0, "4": 5, "5": 12}
 * @param asDriver     notes recues de ses passagers (quand il conduit)
 * @param asPassenger  notes recues de ses conducteurs (quand il voyage)
 */
public record RatingSummaryResponse(
        Long userId,
        double averageScore,
        long totalRatings,
        Map<Integer, Long> distribution,
        RoleSummary asDriver,
        RoleSummary asPassenger) {

    public record RoleSummary(double averageScore, long totalRatings) {
    }
}
