import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-settings-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>Paramètres Généraux de la Plateforme</h2>
          <p class="text-muted">Configuration du système, passerelles de paiement, commissions et microservices</p>
        </div>
        <button class="btn btn-primary" (click)="saveSettings()">
          💾 Enregistrer les Modifications
        </button>
      </div>

      <!-- Settings Navigation Tabs -->
      <div class="settings-tabs card">
        <button [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">
          🌐 Plateforme
        </button>
        <button [class.active]="activeTab === 'financial'" (click)="activeTab = 'financial'">
          💰 Tarification & Commissions
        </button>
        <button [class.active]="activeTab === 'microservices'" (click)="activeTab = 'microservices'">
          🔌 Architecture Microservices
        </button>
        <button [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">
          🔒 Sécurité & Accès
        </button>
      </div>

      <!-- Tab Content: General -->
      <div class="tab-pane card" *ngIf="activeTab === 'general'">
        <h3>Informations de la Plateforme</h3>
        <div class="form-grid mt-2">
          <div class="form-group">
            <label>Nom du Service</label>
            <input class="form-control" [(ngModel)]="general.appName">
          </div>
          <div class="form-group">
            <label>Email de Support Officiel</label>
            <input class="form-control" [(ngModel)]="general.supportEmail">
          </div>
          <div class="form-group">
            <label>Hotline Support (Tunisie)</label>
            <input class="form-control" [(ngModel)]="general.supportPhone">
          </div>
          <div class="form-group">
            <label>Devise Principale</label>
            <input class="form-control" [(ngModel)]="general.currency" disabled>
          </div>
        </div>

        <div class="form-group mt-2">
          <label>Message d'accueil / Slogan</label>
          <input class="form-control" [(ngModel)]="general.slogan">
        </div>

        <div class="checkbox-row mt-2">
          <label><input type="checkbox" [(ngModel)]="general.maintenanceMode"> <strong>Activer le mode maintenance temporaire</strong></label>
        </div>
      </div>

      <!-- Tab Content: Financial -->
      <div class="tab-pane card" *ngIf="activeTab === 'financial'">
        <h3>Barèmes Financiers & Commissions</h3>
        <div class="form-grid mt-2">
          <div class="form-group">
            <label>Taux de Commission Plateforme (%)</label>
            <input type="number" class="form-control" [(ngModel)]="financial.commissionRate">
          </div>
          <div class="form-group">
            <label>Tarif Minimum par Trajet (TND)</label>
            <input type="number" class="form-control" [(ngModel)]="financial.minTripPrice">
          </div>
          <div class="form-group">
            <label>Frais d'annulation tardive (%)</label>
            <input type="number" class="form-control" [(ngModel)]="financial.lateCancelFee">
          </div>
          <div class="form-group">
            <label>Délai de versement conducteurs (Jours)</label>
            <input type="number" class="form-control" [(ngModel)]="financial.payoutDelayDays">
          </div>
        </div>

        <h4 class="mt-3">Passerelles de Paiement Autorisées</h4>
        <div class="gateway-toggles mt-1">
          <label class="toggle-card">
            <input type="checkbox" [(ngModel)]="financial.enableFlouci">
            <div>
              <strong>Flouci API</strong>
              <p class="text-muted">Paiement par QR Code et Portefeuille Flouci</p>
            </div>
          </label>
          <label class="toggle-card">
            <input type="checkbox" [(ngModel)]="financial.enableD17">
            <div>
              <strong>D17 (Poste Tunisienne)</strong>
              <p class="text-muted">Cartes e-Dinar et paiements mobiles</p>
            </div>
          </label>
          <label class="toggle-card">
            <input type="checkbox" [(ngModel)]="financial.enableGimTel">
            <div>
              <strong>Cartes Bancaires (GIM-TEL / ClicToPay)</strong>
              <p class="text-muted">Cartes Visa & Mastercard tunisiennes</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Tab Content: Microservices -->
      <div class="tab-pane card" *ngIf="activeTab === 'microservices'">
        <h3>État des Microservices Connectés (Discovery & Gateway)</h3>
        <p class="text-muted subtext">Endpoints gérés via Spring Cloud Gateway (Port 8080) et Netflix Eureka (Port 8761)</p>

        <div class="services-list mt-2">
          <div class="service-row" *ngFor="let s of microservices">
            <div class="service-meta">
              <span class="status-indicator" [class.up]="s.status === 'UP'"></span>
              <strong>{{ s.name }}</strong>
              <span class="tech-badge">{{ s.tech }}</span>
            </div>
            <div class="service-endpoint">
              <code>{{ s.url }}</code>
            </div>
            <div class="service-port">
              Port: <strong>{{ s.port }}</strong>
            </div>
            <div class="service-actions">
              <span class="badge" [ngClass]="s.status === 'UP' ? 'badge-success' : 'badge-danger'">{{ s.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Security -->
      <div class="tab-pane card" *ngIf="activeTab === 'security'">
        <h3>Sécurité & Stratégie d'Authentification</h3>
        <div class="form-grid mt-2">
          <div class="form-group">
            <label>Durée de validité du Token JWT (Minutes)</label>
            <input type="number" class="form-control" [(ngModel)]="security.jwtExpiry">
          </div>
          <div class="form-group">
            <label>Délai d'expiration de session inactive (Minutes)</label>
            <input type="number" class="form-control" [(ngModel)]="security.sessionTimeout">
          </div>
        </div>

        <div class="security-checks mt-2">
          <label class="checkbox-row"><input type="checkbox" [(ngModel)]="security.requireCIN"> <strong>Exiger la validation de CIN avant publication de trajet</strong></label>
          <label class="checkbox-row"><input type="checkbox" [(ngModel)]="security.requirePermis"> <strong>Exiger le téléversement du permis de conduire</strong></label>
          <label class="checkbox-row"><input type="checkbox" [(ngModel)]="security.enable2FA"> <strong>Activer la double authentification (2FA) pour l'espace Admin</strong></label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-settings-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar { display: flex; justify-content: space-between; align-items: center; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }

    .settings-tabs { display: flex; gap: 8px; padding: 8px; flex-wrap: wrap; }
    .settings-tabs button {
      padding: 10px 18px; border: none; background: none; border-radius: var(--radius-sm);
      cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--gray-600);
      transition: var(--transition);
    }
    .settings-tabs button.active {
      background: var(--accent); color: white;
    }

    .tab-pane h3 { font-size: 1.2rem; color: var(--primary); }
    .subtext { font-size: 0.85rem; margin-top: 4px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .checkbox-row { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; margin-bottom: 8px; cursor: pointer; }

    .gateway-toggles { display: flex; flex-direction: column; gap: 12px; }
    .toggle-card {
      display: flex; align-items: center; gap: 16px; padding: 14px;
      background: var(--gray-50); border-radius: var(--radius-sm); cursor: pointer;
    }
    .toggle-card input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--accent); }
    .toggle-card strong { display: block; font-size: 0.95rem; }
    .toggle-card p { font-size: 0.8rem; margin: 0; }

    .services-list { display: flex; flex-direction: column; gap: 10px; }
    .service-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: var(--gray-50); border-radius: var(--radius-sm);
    }
    .service-meta { display: flex; align-items: center; gap: 10px; min-width: 220px; }
    .status-indicator { width: 10px; height: 10px; border-radius: 50%; background: var(--danger); }
    .status-indicator.up { background: var(--success); box-shadow: 0 0 6px rgba(40,167,69,0.5); }
    .tech-badge { background: var(--gray-200); font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; }
    .service-endpoint code { font-family: monospace; font-size: 0.85rem; color: var(--accent); }
    .service-port { font-size: 0.85rem; }

    .security-checks { display: flex; flex-direction: column; gap: 8px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .service-row { flex-direction: column; align-items: flex-start; gap: 8px; }
    }
  `]
})
export class AdminSettingsComponent {
  activeTab = 'general';

  general = {
    appName: 'SmartRide Tunisie',
    supportEmail: 'contact@smartride.tn',
    supportPhone: '+216 70 000 000',
    currency: 'TND (Dinar Tunisien)',
    slogan: 'Plateforme Intelligente de Covoiturage avec Matching IA',
    maintenanceMode: false
  };

  financial = {
    commissionRate: 12,
    minTripPrice: 3.5,
    lateCancelFee: 25,
    payoutDelayDays: 2,
    enableFlouci: true,
    enableD17: true,
    enableGimTel: true
  };

  microservices = [
    { name: 'API Gateway', tech: 'Spring Cloud Gateway', url: 'http://localhost:8080', port: 8080, status: 'UP' },
    { name: 'User Service', tech: 'Spring Boot + MySQL', url: '/api/users', port: 8081, status: 'UP' },
    { name: 'Trip Service', tech: 'Go (Golang) + Postgres', url: '/api/trips', port: 8082, status: 'UP' },
    { name: 'Booking Service', tech: 'Node.js Express + Postgres', url: '/api/bookings', port: 8083, status: 'UP' },
    { name: 'Payment Service', tech: 'FastAPI (Python) + Mongo', url: '/api/payments', port: 8084, status: 'UP' },
    { name: 'Rating & Chat', tech: 'NestJS + MongoDB', url: '/api/ratings', port: 8085, status: 'UP' },
    { name: 'Notification Service', tech: 'Symfony PHP + Redis', url: '/api/notifications', port: 8086, status: 'UP' },
    { name: 'Matching IA Service', tech: 'FastAPI Python + ML', url: '/api/matching', port: 8087, status: 'UP' }
  ];

  security = {
    jwtExpiry: 120,
    sessionTimeout: 30,
    requireCIN: true,
    requirePermis: true,
    enable2FA: true
  };

  saveSettings() {
    alert('Les paramètres ont été mis à jour avec succès et synchronisés.');
  }
}
