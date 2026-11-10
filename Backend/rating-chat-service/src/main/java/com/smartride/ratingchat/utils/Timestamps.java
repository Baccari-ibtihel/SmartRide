package com.smartride.ratingchat.utils;


import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Horodatage a la seconde : le driver MySQL ne transmet pas les fractions de seconde a MariaDB (XAMPP).
 * On arrondit des la creation pour que l'API renvoie la meme valeur avant et apres lecture en base.
 * L'ordre chronologique fin est donne par les id auto-incrementes.
 */
public final class Timestamps {

    private Timestamps() {
    }

    public static LocalDateTime now() {
        return LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }
}
