import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TripStoreService, StoredTrip, StoredBooking } from '../../../core/services/trip-store.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bookings-page animate-fade">
      <h1>📋 Mes Réservations</h1>
      <p class="subtitle">Suivez vos trajets, payez vos places en ligne et échangez en direct avec votre conducteur</p>

      <!-- Notice for Drivers -->
      <div class="driver-hint-banner" *ngIf="currentUser && currentUser.role === 'CONDUCTEUR'">
        <span class="dh-icon">💡</span>
        <div>
          <strong>Conseil Conducteur :</strong>
          <span>Vous consultez vos réservations en tant que passager. Pour gérer les passagers qui ont réservé vos propres trajets publiés, rendez-vous dans <a routerLink="/user/my-trips">Mes Trajets</a>.</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <button *ngFor="let f of filterOptions" [class.active]="filter===f.key" (click)="filter=f.key">{{ f.label }}</button>
      </div>

      <!-- Bookings List -->
      <div class="bookings-list">
        <div class="booking-card card" *ngFor="let b of getFiltered()" [class.active-booking]="b.status === 'EN_COURS'">
          <div class="booking-top-row">
            <div class="booking-left">
              <span class="badge" [ngClass]="getStatusClass(b.status)">{{ getStatusLabel(b.status) }}</span>
              <span class="badge badge-success paid-badge" *ngIf="b.isPaid">
                💳 Payé ({{ b.paymentMethod }})
              </span>
              <span class="badge badge-warning unpaid-badge" *ngIf="!b.isPaid">
                ⏳ Non Payé
              </span>
            </div>
            <div class="booking-price-header">
              <span class="price-val">{{ getTrip(b.tripId)?.price || 0 }} TND</span>
            </div>
          </div>

          <div class="booking-route-row">
            <div class="route-display">
              <span class="dot-start"></span>
              <strong>{{ getTrip(b.tripId)?.origin || '—' }}</strong>
              <span class="arrow">➔</span>
              <span class="dot-end"></span>
              <strong>{{ getTrip(b.tripId)?.destination || '—' }}</strong>
            </div>

            <div class="booking-meta">
              <span>📅 {{ getTrip(b.tripId)?.date || '—' }}</span>
              <span>🕐 {{ getTrip(b.tripId)?.time || '—' }}</span>
              <span>💺 {{ b.seats }} place(s)</span>
              <span>🚗 Conducteur : <strong>{{ getTrip(b.tripId)?.driverName || 'Sami Mansouri' }}</strong></span>
            </div>
          </div>

          <!-- Action Buttons Bar: PAY + CHAT + TRACK -->
          <div class="booking-actions-row">
            <!-- 1. CHAT WITH DRIVER (KEY REQUIREMENT) -->
            <button class="btn btn-outline btn-sm chat-btn" (click)="openChatModal(b)">
              💬 Discuter avec le conducteur
            </button>

            <!-- 2. PAY FOR TRIP (KEY REQUIREMENT) -->
            <button
              class="btn btn-primary btn-sm pay-btn"
              *ngIf="!b.isPaid"
              (click)="openPaymentModal(b)"
            >
              💳 Payer ({{ getTrip(b.tripId)?.price || 0 }} TND)
            </button>

            <!-- If Already Paid: View Receipt -->
            <button
              class="btn btn-outline btn-sm receipt-btn"
              *ngIf="b.isPaid"
              (click)="viewReceipt(b)"
            >
              🧾 Reçu #{{ b.receiptNumber }}
            </button>

            <!-- 3. RATING CONDUCTEUR (Hamza - rating-chat-service) -->
            <button
              class="btn btn-outline btn-sm rate-btn"
              (click)="openRateModal(b)"
            >
              ⭐ {{ userRatings[b.id] ? (userRatings[b.id] + '★ Avis donné') : 'Donner mon avis' }}
            </button>

            <!-- 4. TRACK DRIVER -->
            <a
              [routerLink]="['/user/tracking', b.id]"
              class="btn btn-success btn-sm track-btn"
              *ngIf="b.status === 'EN_COURS'"
            >
              📍 Suivre en direct
            </a>
            <a
              [routerLink]="['/user/tracking', b.id]"
              class="btn btn-outline btn-sm"
              *ngIf="b.status === 'CONFIRMEE'"
            >
              📍 Suivi GPS
            </a>

            <button class="btn btn-outline btn-sm btn-cancel" *ngIf="b.status === 'EN_ATTENTE'" (click)="cancelBooking(b.id)">
              Annuler
            </button>
            <a [routerLink]="['/user/trip', b.tripId]" class="btn btn-outline btn-sm">Détails</a>
          </div>

          <!-- Live tracking hint -->
          <div class="live-hint" *ngIf="b.status === 'EN_COURS'">
            <span class="pulse-dot"></span>
            <span>Le conducteur est en route ! Cliquez sur <strong>"Suivre en direct"</strong> pour voir sa position GPS et discutez via <strong>"Discuter"</strong>.</span>
          </div>
        </div>

        <div class="empty-state" *ngIf="getFiltered().length===0">
          <span class="empty-icon">📋</span>
          <h3>Aucune réservation trouvée</h3>
          <p>Vous n'avez pas encore de réservation dans cette catégorie.</p>
          <a routerLink="/user/search" class="btn btn-primary">🔍 Rechercher un trajet</a>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- MODAL 1: PAIEMENT EN LIGNE (PASSEGER YNAJEM Y5ALES)   -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showPaymentModal" (click)="closePaymentModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>💳 Paiement Sécurisé du Trajet</h3>
            <button type="button" class="close-btn" (click)="closePaymentModal()">✕</button>
          </div>

          <div class="modal-body" *ngIf="activePaymentBooking">
            <div class="payment-trip-recap">
              <div class="recap-route">
                <strong>{{ getTrip(activePaymentBooking.tripId)?.origin }}</strong>
                <span>➔</span>
                <strong>{{ getTrip(activePaymentBooking.tripId)?.destination }}</strong>
              </div>
              <div class="recap-details">
                <span>🚗 Conducteur : {{ getTrip(activePaymentBooking.tripId)?.driverName }}</span>
                <span>📅 Date : {{ getTrip(activePaymentBooking.tripId)?.date }} à {{ getTrip(activePaymentBooking.tripId)?.time }}</span>
                <span>💺 Places réservées : {{ activePaymentBooking.seats }}</span>
              </div>
              <div class="recap-price">
                <span>Total à régler :</span>
                <strong>{{ getTrip(activePaymentBooking.tripId)?.price || 0 }} TND</strong>
              </div>
            </div>

            <!-- Payment Methods Selector -->
            <label class="section-label">Sélectionnez votre moyen de paiement :</label>
            <div class="payment-methods-grid">
              <div
                class="method-card"
                [class.selected]="selectedPaymentMethod === 'Carte Bancaire CIB'"
                (click)="selectedPaymentMethod = 'Carte Bancaire CIB'"
              >
                <span class="method-icon">💳</span>
                <strong>Carte Bancaire</strong>
                <small>CIB / Visa / Mastercard</small>
              </div>

              <div
                class="method-card"
                [class.selected]="selectedPaymentMethod === 'Flouci / Konnect'"
                (click)="selectedPaymentMethod = 'Flouci / Konnect'"
              >
                <span class="method-icon">📱</span>
                <strong>Flouci / Konnect</strong>
                <small>Paiement digital mobile</small>
              </div>

              <div
                class="method-card"
                [class.selected]="selectedPaymentMethod === 'D17 Poste Tunisienne'"
                (click)="selectedPaymentMethod = 'D17 Poste Tunisienne'"
              >
                <span class="method-icon">📮</span>
                <strong>D17 Mobile</strong>
                <small>Poste Tunisienne</small>
              </div>

              <div
                class="method-card"
                [class.selected]="selectedPaymentMethod === 'Espèces à bord'"
                (click)="selectedPaymentMethod = 'Espèces à bord'"
              >
                <span class="method-icon">💵</span>
                <strong>Espèces à bord</strong>
                <small>Règlement direct au départ</small>
              </div>
            </div>

            <!-- Card inputs simulation if Carte chosen -->
            <div class="payment-inputs-box" *ngIf="selectedPaymentMethod === 'Carte Bancaire CIB'">
              <div class="form-group">
                <label>Numéro de carte bancaire (GIE Monétique)</label>
                <input class="form-control" placeholder="•••• •••• •••• ••••" [(ngModel)]="paymentCardNumber">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date expiration</label>
                  <input class="form-control" placeholder="MM/AA" [(ngModel)]="paymentCardExpiry">
                </div>
                <div class="form-group">
                  <label>Code CVC</label>
                  <input class="form-control" placeholder="•••" [(ngModel)]="paymentCardCvc">
                </div>
              </div>
            </div>

            <!-- Phone input if Flouci/D17 -->
            <div class="payment-inputs-box" *ngIf="selectedPaymentMethod === 'Flouci / Konnect' || selectedPaymentMethod === 'D17 Poste Tunisienne'">
              <div class="form-group">
                <label>Numéro de téléphone mobile relié au portefeuille</label>
                <input class="form-control" placeholder="+216 98 000 000" [(ngModel)]="paymentPhone">
              </div>
            </div>

            <div class="security-badge">
              <span>🔒 Transaction 100% sécurisée · Cryptage SSL 256-bit certifié</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closePaymentModal()">Annuler</button>
            <button
              class="btn btn-success btn-lg pay-confirm-btn"
              (click)="confirmPayment()"
              [disabled]="processingPayment"
            >
              {{ processingPayment ? 'Validation du paiement...' : 'Payer ' + (getTrip(activePaymentBooking?.tripId)?.price || 0) + ' TND' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- MODAL 2: CHAT AVEC LE CONDUCTEUR (YAHKI M3A CONDUCTEUR) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showChatModal" (click)="closeChatModal()">
        <div class="modal-card chat-modal-card" (click)="$event.stopPropagation()">
          <!-- Chat Header -->
          <div class="chat-modal-header">
            <div class="driver-chat-meta">
              <div class="avatar avatar-sm">{{ getTrip(activeChatBooking?.tripId)?.driverInitials || 'SM' }}</div>
              <div>
                <strong>{{ getTrip(activeChatBooking?.tripId)?.driverName || 'Sami Mansouri' }}</strong>
                <span class="online-indicator"><span class="green-dot"></span> En ligne (Clio 4 Blanche)</span>
              </div>
            </div>

            <div class="chat-header-actions">
              <button class="call-action-btn" (click)="callDriverFromChat()" title="Appeler le conducteur">
                📞 Appeler
              </button>
              <button type="button" class="close-btn" (click)="closeChatModal()">✕</button>
            </div>
          </div>

          <!-- Chat Message Thread -->
          <div class="chat-thread" #scrollThread>
            <div
              class="chat-bubble-row"
              *ngFor="let m of chatMessages"
              [class.sent]="m.senderRole === 'PASSAGER'"
              [class.received]="m.senderRole === 'CONDUCTEUR'"
            >
              <div class="chat-bubble">
                <span class="sender-name">{{ m.senderName }}</span>
                <p class="bubble-text">{{ m.text }}</p>
                <span class="bubble-time">{{ m.time }}</span>
              </div>
            </div>

            <div class="chat-typing-indicator" *ngIf="isDriverTyping">
              <span>🚗 Le conducteur est en train d'écrire...</span>
            </div>
          </div>

          <!-- Quick Response Chips (1 Clic) -->
          <div class="quick-replies-bar">
            <button type="button" class="q-chip" (click)="sendQuickReply('Salem, je suis au point de rendez-vous !')">
              📍 Je suis là !
            </button>
            <button type="button" class="q-chip" (click)="sendQuickReply('3aslema, win wsolt b-dhabet ?')">
              🚗 Win wsolt ?
            </button>
            <button type="button" class="q-chip" (click)="sendQuickReply('Je serai la dans 2 minutes chrono !')">
              ⏱️ J'arrive dans 2 min
            </button>
            <button type="button" class="q-chip" (click)="sendQuickReply('Pouvez-vous klaxonner en arrivant svp ?')">
              📢 Klaxonner à l'arrivée
            </button>
          </div>

          <!-- Message Input Bar -->
          <div class="chat-input-bar">
            <input
              type="text"
              class="form-control chat-input"
              placeholder="Écrivez un message en français ou derja..."
              [(ngModel)]="newChatMessage"
              (keyup.enter)="sendMessage()"
            >
            <button type="button" class="btn btn-primary send-btn" (click)="sendMessage()" [disabled]="!newChatMessage.trim()">
              Envoyer 🚀
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- MODAL 3: EVALUATION & AVIS DU CONDUCTEUR (Hamza - rating) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showRateModal" (click)="closeRateModal()">
        <div class="modal-card rate-modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>⭐ Évaluer le conducteur (CRUD Rating)</h3>
              <p class="modal-sub">Votre note et feedback pour {{ getTrip(activeRateBooking?.tripId)?.driverName || 'le conducteur' }}</p>
            </div>
            <button class="close-btn" (click)="closeRateModal()">✕</button>
          </div>

          <div class="modal-body text-center">
            <div class="star-picker">
              <span *ngFor="let s of [1,2,3,4,5]" class="star-choice" [class.active]="selectedStars >= s" (click)="selectedStars = s">
                ★
              </span>
            </div>
            <div class="score-banner">
              <span *ngIf="selectedStars === 5">⭐⭐⭐⭐⭐ Excellent voyage !</span>
              <span *ngIf="selectedStars === 4">⭐⭐⭐⭐ Très bien !</span>
              <span *ngIf="selectedStars === 3">⭐⭐⭐ Voyage correct</span>
              <span *ngIf="selectedStars === 2">⭐⭐ Moyen</span>
              <span *ngIf="selectedStars === 1">⭐ Décevant</span>
            </div>

            <div class="tags-container">
              <span class="chip-tag" [class.selected]="hasTag('Ponctuel')" (click)="toggleTag('Ponctuel')">⏱️ Ponctuel</span>
              <span class="chip-tag" [class.selected]="hasTag('Conduite souple')" (click)="toggleTag('Conduite souple')">🚗 Conduite souple</span>
              <span class="chip-tag" [class.selected]="hasTag('Véhicule propre')" (click)="toggleTag('Véhicule propre')">✨ Véhicule propre</span>
              <span class="chip-tag" [class.selected]="hasTag('Sympathique')" (click)="toggleTag('Sympathique')">💬 Sympathique</span>
              <span class="chip-tag" [class.selected]="hasTag('Bonne musique')" (click)="toggleTag('Bonne musique')">🎵 Bonne musique</span>
            </div>

            <div class="form-group text-left" style="margin-top: 14px;">
              <label>Votre commentaire d'évaluation</label>
              <textarea class="form-control" rows="3" placeholder="Écrivez un avis détaillé sur le trajet..." [(ngModel)]="ratingComment"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeRateModal()">Annuler</button>
            <button class="btn btn-success" (click)="submitRating()">
              ✓ Enregistrer l'évaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bookings-page { max-width: 960px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 1.6rem; color: var(--primary); margin-bottom: 4px; }
    .subtitle { color: var(--gray-500); font-size: 0.9rem; margin-bottom: 20px; }

    .driver-hint-banner {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: rgba(2,132,199,0.08); border-radius: var(--radius-sm); border-left: 3px solid #0284c7;
      margin-bottom: 16px; font-size: 0.85rem; color: #0369a1;
    }
    .driver-hint-banner a { font-weight: 700; color: #0284c7; text-decoration: underline; margin-left: 4px; }
    .dh-icon { font-size: 1.4rem; }

    .filter-bar { display: flex; gap: 4px; margin-bottom: 24px; background: var(--white); padding: 4px; border-radius: var(--radius); box-shadow: var(--shadow-sm); flex-wrap: wrap; }
    .filter-bar button { flex: 1; padding: 10px; border: none; background: none; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font); font-weight: 500; color: var(--gray-500); transition: var(--transition); font-size: 0.85rem; white-space: nowrap; }
    .filter-bar button.active { background: var(--accent); color: white; }

    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card {
      padding: 20px; display: flex; flex-direction: column; gap: 14px;
      border: 2px solid transparent; transition: var(--transition);
    }
    .booking-card.active-booking {
      border-color: #28a745; background: rgba(40,167,69,0.02);
      box-shadow: 0 4px 16px rgba(40,167,69,0.1);
    }

    .booking-top-row { display: flex; justify-content: space-between; align-items: center; }
    .booking-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .paid-badge { font-weight: 700; font-size: 0.72rem; }
    .unpaid-badge { font-weight: 700; font-size: 0.72rem; }
    .price-val { font-size: 1.3rem; font-weight: 800; color: var(--accent); }

    .booking-route-row { display: flex; flex-direction: column; gap: 8px; }
    .route-display { display: flex; align-items: center; gap: 8px; font-size: 1rem; color: var(--gray-800); }
    .dot-start { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
    .dot-end { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
    .arrow { color: var(--accent); }

    .booking-meta { display: flex; gap: 16px; font-size: 0.82rem; color: var(--gray-600); flex-wrap: wrap; }

    .booking-actions-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid var(--gray-100); }
    .chat-btn { font-weight: 700 !important; border-color: var(--secondary) !important; color: var(--secondary) !important; }
    .chat-btn:hover { background: rgba(14,133,163,0.1) !important; }
    .pay-btn { background: #16a34a !important; border-color: #16a34a !important; font-weight: 800 !important; }
    .pay-btn:hover { background: #15803d !important; }
    .receipt-btn { font-size: 0.78rem; font-family: monospace; }
    .rate-btn { font-weight: 700 !important; color: #d97706 !important; border-color: #d97706 !important; }
    .rate-btn:hover { background: rgba(217,119,6,0.1) !important; }
    .star-picker { font-size: 2.4rem; color: #cbd5e1; cursor: pointer; user-select: none; margin-bottom: 8px; }
    .star-choice { transition: transform 0.15s; display: inline-block; padding: 0 4px; }
    .star-choice:hover { transform: scale(1.2); }
    .star-choice.active { color: #f59e0b; }
    .score-banner { font-size: 0.95rem; font-weight: 700; color: #b45309; margin-bottom: 12px; }
    .tags-container { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 12px; }
    .chip-tag { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; background: var(--gray-100); border: 1px solid var(--gray-200); cursor: pointer; transition: var(--transition); }
    .chip-tag.selected { background: #fef3c7; border-color: #f59e0b; color: #92400e; font-weight: 700; }
    .track-btn { font-weight: 700 !important; animation: pulse-track 1.5s infinite; }
    @keyframes pulse-track {
      0%, 100% { box-shadow: 0 0 0 0 rgba(40,167,69,0.5); }
      50% { box-shadow: 0 0 0 6px rgba(40,167,69,0); }
    }

    .live-hint {
      display: flex; align-items: center; gap: 8px; padding: 10px 14px;
      background: rgba(40,167,69,0.08); border-radius: var(--radius-sm); font-size: 0.82rem; color: #155724;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #28a745;
      animation: pulse-ring 1.5s infinite; flex-shrink: 0;
    }
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(40,167,69,0.7); }
      70% { box-shadow: 0 0 0 8px rgba(40,167,69,0); }
      100% { box-shadow: 0 0 0 0 rgba(40,167,69,0); }
    }

    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }

    /* Modal Backdrop & Cards */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px; animation: fadeIn 0.2s ease;
    }
    .modal-card {
      background: var(--white); border-radius: var(--radius-lg); width: 100%;
      max-width: 540px; box-shadow: var(--shadow-lg); overflow: hidden;
      display: flex; flex-direction: column; max-height: 90vh;
    }
    .modal-header {
      padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--gray-200); background: var(--gray-50);
    }
    .modal-header h3 { margin: 0; font-size: 1.15rem; color: var(--primary); }
    .close-btn { background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--gray-500); }

    .modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
    .modal-footer {
      padding: 14px 20px; display: flex; justify-content: flex-end; gap: 10px;
      border-top: 1px solid var(--gray-200); background: var(--gray-50);
    }

    /* Payment Modal Styles */
    .payment-trip-recap {
      background: var(--gray-50); padding: 14px; border-radius: var(--radius-sm);
      border: 1px solid var(--gray-200); display: flex; flex-direction: column; gap: 6px;
    }
    .recap-route { font-size: 1rem; color: var(--primary); display: flex; gap: 8px; align-items: center; }
    .recap-details { display: flex; flex-direction: column; font-size: 0.8rem; color: var(--gray-600); gap: 2px; }
    .recap-price { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; padding-top: 8px; border-top: 1px solid var(--gray-200); }
    .recap-price strong { color: var(--accent); font-size: 1.3rem; }

    .section-label { font-size: 0.85rem; font-weight: 700; color: var(--gray-700); }
    .payment-methods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .method-card {
      padding: 12px; border: 2px solid var(--gray-200); border-radius: var(--radius-sm);
      cursor: pointer; transition: var(--transition); display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 4px;
    }
    .method-card:hover { border-color: var(--accent); }
    .method-card.selected { border-color: #16a34a; background: rgba(22,163,74,0.06); }
    .method-icon { font-size: 1.6rem; }
    .method-card strong { font-size: 0.85rem; color: var(--gray-800); }
    .method-card small { font-size: 0.7rem; color: var(--gray-500); }

    .payment-inputs-box { background: var(--gray-50); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--gray-200); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .security-badge { font-size: 0.75rem; color: #16a34a; text-align: center; }

    /* Chat Modal Styles */
    .chat-modal-card { max-width: 580px; height: 560px; display: flex; flex-direction: column; }
    .chat-modal-header {
      padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--gray-200); background: var(--white);
    }
    .driver-chat-meta { display: flex; align-items: center; gap: 10px; }
    .driver-chat-meta strong { display: block; font-size: 0.95rem; }
    .online-indicator { font-size: 0.72rem; color: #16a34a; display: flex; align-items: center; gap: 4px; }
    .green-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }
    .chat-header-actions { display: flex; align-items: center; gap: 8px; }
    .call-action-btn {
      background: #16a34a; color: white; border: none; padding: 5px 10px; border-radius: 14px;
      font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: var(--transition);
    }
    .call-action-btn:hover { background: #15803d; }

    .chat-thread {
      flex: 1; padding: 16px; overflow-y: auto; background: #f8fafc;
      display: flex; flex-direction: column; gap: 12px;
    }
    .chat-bubble-row { display: flex; width: 100%; }
    .chat-bubble-row.sent { justify-content: flex-end; }
    .chat-bubble-row.received { justify-content: flex-start; }

    .chat-bubble {
      max-width: 75%; padding: 10px 14px; border-radius: 14px; display: flex;
      flex-direction: column; gap: 2px; box-shadow: var(--shadow-sm);
    }
    .chat-bubble-row.sent .chat-bubble {
      background: var(--accent); color: white; border-bottom-right-radius: 2px;
    }
    .chat-bubble-row.received .chat-bubble {
      background: var(--white); color: var(--gray-800); border-bottom-left-radius: 2px;
      border: 1px solid var(--gray-200);
    }
    .sender-name { font-size: 0.68rem; font-weight: 700; opacity: 0.8; }
    .bubble-text { font-size: 0.88rem; margin: 0; line-height: 1.4; }
    .bubble-time { font-size: 0.65rem; opacity: 0.75; text-align: right; }

    .chat-typing-indicator { font-size: 0.75rem; color: var(--gray-500); font-style: italic; }

    .quick-replies-bar {
      display: flex; gap: 6px; padding: 8px 12px; background: var(--white);
      overflow-x: auto; border-top: 1px solid var(--gray-100);
    }
    .q-chip {
      background: var(--gray-100); border: 1px solid var(--gray-200); padding: 4px 10px;
      border-radius: 14px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;
      transition: var(--transition);
    }
    .q-chip:hover { background: var(--accent); color: white; border-color: var(--accent); }

    .chat-input-bar {
      display: flex; gap: 8px; padding: 12px; background: var(--white);
      border-top: 1px solid var(--gray-200);
    }
    .chat-input { flex: 1; font-size: 0.88rem; }
    .send-btn { font-weight: 700; white-space: nowrap; }

    @media (max-width: 768px) {
      .payment-methods-grid { grid-template-columns: 1fr; }
      .booking-actions-row { flex-direction: column; align-items: stretch; }
      .booking-actions-row .btn { text-align: center; }
    }
  `]
})
export class BookingsComponent implements OnInit, OnDestroy {
  filter = 'all';
  currentUser: any = null;
  filterOptions = [
    { key: 'all', label: 'Toutes' },
    { key: 'EN_ATTENTE', label: '⏳ En attente' },
    { key: 'CONFIRMEE', label: '✅ Confirmées' },
    { key: 'EN_COURS', label: '🚗 En cours' },
    { key: 'TERMINEE', label: '✔️ Terminées' }
  ];

  myBookings: StoredBooking[] = [];
  private tripsCache: Map<number, StoredTrip> = new Map();

  // Payment Modal State
  showPaymentModal = false;
  activePaymentBooking: StoredBooking | null = null;
  selectedPaymentMethod = 'Carte Bancaire CIB';
  paymentCardNumber = '4214 5600 1289 4521';
  paymentCardExpiry = '12/28';
  paymentCardCvc = '389';
  paymentPhone = '+216 98 450 120';
  processingPayment = false;

  // Rating Modal State (Hamza - rating-chat-service)
  showRateModal = false;
  activeRateBooking: StoredBooking | null = null;
  selectedStars = 5;
  selectedTags: string[] = ['Ponctuel', 'Conduite souple'];
  ratingComment = 'Trajet très agréable, conducteur courtois et ponctuel !';
  userRatings: Record<number, number> = {};

  // Chat Modal State
  showChatModal = false;
  activeChatBooking: StoredBooking | null = null;
  chatMessages: ChatMessage[] = [];
  newChatMessage = '';
  isDriverTyping = false;

  private chatSub!: Subscription;

  constructor(
    private tripStore: TripStoreService,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.loadBookings();
    });
    this.tripStore.bookings$.subscribe(() => this.loadBookings());

    this.chatSub = this.chatService.messages$.subscribe(all => {
      if (this.activeChatBooking) {
        this.chatMessages = all[this.activeChatBooking.id] || [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chatSub) this.chatSub.unsubscribe();
  }

  private loadBookings(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.myBookings = this.tripStore.getPassengerBookings(user.id);
    } else {
      this.myBookings = [];
    }

    this.myBookings.forEach(b => {
      if (!this.tripsCache.has(b.tripId)) {
        const trip = this.tripStore.getTripById(b.tripId);
        if (trip) this.tripsCache.set(b.tripId, trip);
      }
    });
  }

  getTrip(tripId: number | undefined): StoredTrip | undefined {
    if (!tripId) return undefined;
    return this.tripsCache.get(tripId) || this.tripStore.getTripById(tripId);
  }

  getFiltered(): StoredBooking[] {
    if (this.filter === 'all') return this.myBookings;
    return this.myBookings.filter(b => b.status === this.filter);
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Annuler cette réservation ?')) {
      this.tripStore.cancelBooking(bookingId);
    }
  }

  // ─── PAYMENT ACTIONS (PASSEGER YNAJEM Y5ALES) ────────────

  openPaymentModal(booking: StoredBooking): void {
    this.activePaymentBooking = booking;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.activePaymentBooking = null;
    this.processingPayment = false;
  }

  confirmPayment(): void {
    if (!this.activePaymentBooking) return;

    this.processingPayment = true;
    const trip = this.getTrip(this.activePaymentBooking.tripId);
    const amount = trip?.price || 10.0;

    setTimeout(() => {
      const updated = this.tripStore.payBooking(
        this.activePaymentBooking!.id,
        this.selectedPaymentMethod,
        amount
      );

      this.processingPayment = false;
      this.closePaymentModal();

      if (updated) {
        alert(
          `🎉 PAIEMENT RÉUSSI DE ${amount} TND !\n\n` +
          `Moyen de paiement : ${this.selectedPaymentMethod}\n` +
          `Numéro de reçu : ${updated.receiptNumber}\n` +
          `Date : ${updated.paymentDate}\n\n` +
          `✅ Votre place est garantie ! Retrouvez votre reçu dans la page 'Mes Paiements'.`
        );
      }
    }, 1000);
  }

  viewReceipt(b: StoredBooking): void {
    const trip = this.getTrip(b.tripId);
    alert(
      `🧾 REÇU DE PAIEMENT SMARTRIDE\n` +
      `----------------------------------------\n` +
      `Reçu # : ${b.receiptNumber || 'SR-2026-CONF'}\n` +
      `Date : ${b.paymentDate || '10 Nov 2026'}\n` +
      `Trajet : ${trip?.origin} ➔ ${trip?.destination}\n` +
      `Conducteur : ${trip?.driverName}\n` +
      `Montant réglé : ${b.paidAmount || trip?.price || 0} TND\n` +
      `Méthode : ${b.paymentMethod || 'Carte Bancaire'}\n` +
      `Statut : Validé et Encaissé\n` +
      `----------------------------------------`
    );
  }

  // ─── CHAT ACTIONS (YAHKI M3A CONDUCTEUR) ────────────────

  openChatModal(booking: StoredBooking): void {
    this.activeChatBooking = booking;
    this.chatMessages = this.chatService.getMessages(booking.id);
    this.showChatModal = true;
  }

  closeChatModal(): void {
    this.showChatModal = false;
    this.activeChatBooking = null;
  }

  sendMessage(): void {
    if (!this.activeChatBooking || !this.newChatMessage.trim()) return;

    const user = this.currentUser || { firstName: 'Ibtihel', lastName: 'Baccari' };
    const senderName = `${user.firstName} ${user.lastName}`;

    this.chatService.sendMessage(
      this.activeChatBooking.id,
      this.newChatMessage,
      senderName,
      'PASSAGER'
    );

    this.newChatMessage = '';

    // Show simulated typing indicator for driver
    this.isDriverTyping = true;
    setTimeout(() => {
      this.isDriverTyping = false;
    }, 1200);
  }

  sendQuickReply(text: string): void {
    this.newChatMessage = text;
    this.sendMessage();
  }

  callDriverFromChat(): void {
    const trip = this.getTrip(this.activeChatBooking?.tripId);
    alert(`📞 Appel vocal en direct vers ${trip?.driverName || 'le conducteur'} (+216 98 450 120)...`);
  }

  // ─── RATING ACTIONS (HAMZA - RATING-CHAT-SERVICE) ──────

  openRateModal(b: StoredBooking): void {
    this.activeRateBooking = b;
    this.selectedStars = this.userRatings[b.id] || 5;
    this.showRateModal = true;
  }

  closeRateModal(): void {
    this.showRateModal = false;
    this.activeRateBooking = null;
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx > -1) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  submitRating(): void {
    if (!this.activeRateBooking) return;
    this.userRatings[this.activeRateBooking.id] = this.selectedStars;
    const trip = this.getTrip(this.activeRateBooking.tripId);
    alert(
      `⭐ ÉVALUATION ENREGISTRÉE AVEC SUCCÈS !\n\n` +
      `Conducteur : ${trip?.driverName || 'Sami Mansouri'}\n` +
      `Note : ${this.selectedStars} / 5 étoiles ⭐\n` +
      `Compliments : ${this.selectedTags.join(', ') || 'Aucun'}\n` +
      `Commentaire : "${this.ratingComment}"\n\n` +
      `✅ Donnée transmise au microservice rating-chat-service (Hamza) !`
    );
    this.closeRateModal();
  }

  // ─── Helpers ────────────────────────────────────────────

  getStatusClass(s: string) {
    return {
      'badge-success': s === 'CONFIRMEE',
      'badge-warning': s === 'EN_ATTENTE',
      'badge-primary': s === 'EN_COURS',
      'badge-info': s === 'TERMINEE',
      'badge-danger': s === 'ANNULEE'
    };
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': '⏳ En attente',
      'CONFIRMEE': '✅ Confirmée',
      'EN_COURS': '🚗 En cours',
      'TERMINEE': '✔️ Terminée',
      'ANNULEE': '❌ Annulée'
    };
    return labels[s] || s;
  }
}
