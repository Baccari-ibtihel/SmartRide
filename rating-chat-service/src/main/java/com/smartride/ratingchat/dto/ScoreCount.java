package com.smartride.ratingchat.dto;


import com.smartride.ratingchat.entities.RaterRole;

/** Ligne de statistiques : nombre de notes "score" recues d'un role donne. */
public record ScoreCount(RaterRole raterRole, Integer score, Long total) {
}
