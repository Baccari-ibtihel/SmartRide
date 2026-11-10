package com.smartride.ratingchat.clients;

import com.smartride.ratingchat.config.BookingVerificationProperties;
import com.smartride.ratingchat.dto.BookingDto;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.RemoteServiceException;
import org.springframework.cloud.client.loadbalancer.LoadBalancerInterceptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

/**
 * Appel du Booking Service SANS connaitre son adresse : on utilise son nom Eureka.
 * L'URL http://booking-service/... est traduite en http://ip:port/... par le LoadBalancerInterceptor
 * de Spring Cloud, qui choisit une instance dans le registre Eureka.
 */
@Component
public class BookingClient {

    private final RestClient restClient;

    public BookingClient(LoadBalancerInterceptor loadBalancerInterceptor, BookingVerificationProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(2_000);
        requestFactory.setReadTimeout(3_000);

        this.restClient = RestClient.builder()
                .baseUrl("http://" + properties.serviceId())
                .requestFactory(requestFactory)
                .requestInterceptor(loadBalancerInterceptor)
                .build();
    }

    public BookingDto getBooking(Long bookingId) {
        try {
            BookingDto booking = restClient.get()
                    .uri("/api/bookings/{id}", bookingId)
                    .retrieve()
                    .body(BookingDto.class);
            if (booking == null) {
                throw new BusinessException("Reservation " + bookingId + " introuvable");
            }
            return booking;
        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new BusinessException("Reservation " + bookingId + " introuvable");
            }
            throw new RemoteServiceException("Booking Service a repondu " + ex.getStatusCode(), ex);
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            // Aucune instance dans Eureka, service arrete, timeout...
            throw new RemoteServiceException("Booking Service indisponible, reessayez plus tard", ex);
        }
    }
}
