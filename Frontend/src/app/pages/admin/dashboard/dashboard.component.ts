import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MapViewComponent } from '../../../shared/components/map-view/map-view.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MapViewComponent],
  template: `
    <div class="dashboard animate-fade">
      <!-- Role Switcher & Live Overview Bar -->
      <div class="admin-hero-banner card mb-2">
        <div class="hero-left">
          <h2>📊 Back-Office Administrateur SmartRide</h2>
          <p class="text-muted">Supervision globale de l'écosystème : utilisateurs, microservices, métriques financières et géolocalisation</p>
        </div>
        <div class="hero-badges">
          <span class="badge badge-success">🟢 Microservices Opérationnels</span>
          <span class="badge badge-primary">🤖 Matching IA v2.4</span>
          <span class="badge badge-warning">🐇 RabbitMQ Connecté</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let s of stats" [style.border-left-color]="s.color">
          <div class="stat-info">
            <span class="stat-label">{{ s.label }}</span>
            <span class="stat-value">{{ s.value }}</span>
            <span class="stat-growth" [class.positive]="s.growth>0" [class.negative]="s.growth<0">
              {{ s.growth > 0 ? '↑' : '↓' }} {{ s.growth }}%
            </span>
          </div>
          <span class="stat-icon">{{ s.icon }}</span>
        </div>
      </div>

      <!-- Live GPS Map of Active Trips Across Tunisia -->
      <div class="card mb-3">
        <div class="map-section-header">
          <div>
            <h3>🗺️ Cartographie en Direct des Trajets Actifs (Tunisie)</h3>
            <p class="text-muted">Suivi géographique en temps réel des trajets en circulation et des corridors les plus denses</p>
          </div>
          <div class="map-quick-filters">
            <button class="btn btn-sm btn-outline" (click)="setCorridor(36.8970, 10.1895, 36.8392, 10.2372, 'Ariana', 'Lac 2')">
              Axe Ariana ➔ Lac 2
            </button>
            <button class="btn btn-sm btn-outline" (click)="setCorridor(35.8350, 10.5980, 35.7779, 10.8261, 'Sousse', 'Monastir')">
              Axe Sousse ➔ Monastir
            </button>
            <button class="btn btn-sm btn-outline" (click)="setCorridor(34.7406, 10.7603, 36.8008, 10.1800, 'Sfax', 'Tunis')">
              Axe Sfax ➔ Tunis
            </button>
          </div>
        </div>

        <app-map-view
          [originLat]="activeMapOrigin.lat"
          [originLng]="activeMapOrigin.lng"
          [originLabel]="activeMapOrigin.label"
          [destLat]="activeMapDest.lat"
          [destLng]="activeMapDest.lng"
          [destLabel]="activeMapDest.label"
        ></app-map-view>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="card chart-card">
          <h3>📈 Revenus Mensuels & Commissions (TND)</h3>
          <div class="bar-chart">
            <div class="bar-item" *ngFor="let r of revenueData">
              <div class="bar" [style.height]="r.pct + '%'" [style.background]="'var(--accent)'">
                <span class="bar-val">{{ r.amount }}</span>
              </div>
              <span class="bar-label">{{ r.month }}</span>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <h3>🤖 Performance du Matching IA</h3>
          <div class="match-stats">
            <div class="match-metric">
              <div class="metric-circle" style="--pct: 87">
                <span>87%</span>
              </div>
              <strong>Taux de réussite</strong>
            </div>
            <div class="match-metric">
              <div class="metric-circle" style="--pct: 92">
                <span>92</span>
              </div>
              <strong>Score moyen</strong>
            </div>
            <div class="match-metric">
              <div class="metric-circle" style="--pct: 78">
                <span>1,247</span>
              </div>
              <strong>Matchs ce mois</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-row">
        <!-- Recent Activity -->
        <div class="card">
          <h3>🕐 Activité Récente & Événements RabbitMQ</h3>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let a of activities">
              <div class="activity-dot" [style.background]="a.color"></div>
              <div class="activity-info">
                <strong>{{ a.action }}</strong>
                <p>{{ a.detail }}</p>
              </div>
              <span class="activity-time">{{ a.time }}</span>
            </div>
          </div>
        </div>

        <!-- Top Drivers -->
        <div class="card">
          <h3>🏆 Top Conducteurs les Mieux Notés</h3>
          <div class="top-list">
            <div class="top-item" *ngFor="let d of topDrivers; let i = index">
              <span class="rank">{{ i + 1 }}</span>
              <div class="avatar avatar-sm">{{ d.initials }}</div>
              <div class="top-info">
                <strong>{{ d.name }}</strong>
                <span>{{ d.trips }} trajets · ⭐ {{ d.rating }}</span>
              </div>
              <span class="top-revenue">{{ d.revenue }} TND</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Health -->
      <div class="card health-card">
        <h3>🛡️ État des Conteneurs dans Docker Desktop</h3>
        <div class="health-grid">
          <div class="health-item" *ngFor="let h of healthItems">
            <span class="health-dot" [class.online]="h.online" [class.offline]="!h.online"></span>
            <div>
              <strong>{{ h.name }}</strong>
              <span class="tech-sub">{{ h.port }}</span>
            </div>
            <span class="health-status">{{ h.online ? 'En ligne' : 'Hors ligne' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { animation: fadeIn 0.4s ease; display: flex; flex-direction: column; gap: 20px; }
    .admin-hero-banner { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; flex-wrap: wrap; gap: 16px; }
    .admin-hero-banner h2 { font-size: 1.4rem; color: var(--primary); margin-bottom: 4px; }
    .hero-badges { display: flex; gap: 8px; flex-wrap: wrap; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card {
      background: var(--white); border-radius: var(--radius); padding: 20px;
      box-shadow: var(--shadow-sm); display: flex; justify-content: space-between;
      align-items: center; border-left: 4px solid var(--accent);
      transition: var(--transition);
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
    .stat-label { display: block; font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { display: block; font-size: 1.8rem; font-weight: 800; color: var(--primary); margin: 4px 0; }
    .stat-growth { font-size: 0.8rem; font-weight: 600; }
    .stat-growth.positive { color: var(--success); }
    .stat-growth.negative { color: var(--danger); }
    .stat-icon { font-size: 2rem; opacity: 0.6; }

    .map-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .map-section-header h3 { font-size: 1.15rem; color: var(--primary); margin: 0; }
    .map-quick-filters { display: flex; gap: 6px; }

    .charts-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
    .chart-card { padding: 24px; }
    .chart-card h3 { margin-bottom: 20px; font-size: 1rem; color: var(--primary); }

    .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 180px; padding-top: 20px; }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
    .bar { width: 100%; border-radius: 4px 4px 0 0; position: relative; min-height: 10px; transition: height 0.6s ease; }
    .bar-val { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; font-weight: 700; color: var(--gray-600); white-space: nowrap; }
    .bar-label { font-size: 0.7rem; color: var(--gray-500); }

    .match-stats { display: flex; justify-content: space-around; padding: 20px 0; }
    .match-metric { text-align: center; }
    .metric-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: conic-gradient(var(--accent) calc(var(--pct) * 3.6deg), var(--gray-100) 0);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 10px; position: relative;
    }
    .metric-circle::before {
      content: ''; position: absolute; inset: 6px; background: var(--white); border-radius: 50%;
    }
    .metric-circle span { position: relative; z-index: 1; font-weight: 800; font-size: 0.95rem; color: var(--primary); }
    .match-metric strong { font-size: 0.8rem; color: var(--gray-600); }

    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .bottom-row h3 { margin-bottom: 16px; font-size: 1rem; color: var(--primary); }

    .activity-list { display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--gray-50); }
    .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .activity-info { flex: 1; }
    .activity-info strong { font-size: 0.85rem; display: block; }
    .activity-info p { font-size: 0.8rem; color: var(--gray-500); }
    .activity-time { font-size: 0.75rem; color: var(--gray-400); white-space: nowrap; }

    .top-list { display: flex; flex-direction: column; gap: 10px; }
    .top-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--gray-50); border-radius: var(--radius-sm); }
    .rank { font-weight: 800; color: var(--accent); min-width: 20px; }
    .top-info { flex: 1; }
    .top-info strong { font-size: 0.9rem; display: block; }
    .top-info span { font-size: 0.8rem; color: var(--gray-500); }
    .top-revenue { font-weight: 700; color: var(--primary); }

    .health-card h3 { margin-bottom: 16px; font-size: 1rem; color: var(--primary); }
    .health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
    .health-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--gray-50); border-radius: var(--radius-sm); }
    .health-dot { width: 10px; height: 10px; border-radius: 50%; }
    .health-dot.online { background: var(--success); box-shadow: 0 0 6px rgba(40,167,69,0.4); }
    .health-dot.offline { background: var(--danger); }
    .health-item strong { display: block; font-size: 0.85rem; }
    .tech-sub { font-size: 0.75rem; color: var(--gray-500); }
    .health-status { font-size: 0.75rem; color: var(--success); font-weight: 700; margin-left: auto; }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row, .bottom-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent {
  activeMapOrigin = { lat: 36.8970, lng: 10.1895, label: 'Ariana (Technopôle)' };
  activeMapDest = { lat: 36.8392, lng: 10.2372, label: 'Lac 2 (Zone Franche)' };

  stats = [
    { label: 'Total Utilisateurs', value: '8,247', growth: 12, icon: '👥', color: '#0e85a3' },
    { label: 'Trajets Actifs', value: '1,345', growth: 8, icon: '🚗', color: '#28a745' },
    { label: 'Réservations ce mois', value: '3,891', growth: 15, icon: '📋', color: '#ffc107' },
    { label: 'Volume d\'Affaires (TND)', value: '45,230 TND', growth: 18, icon: '💰', color: '#10b981' }
  ];

  revenueData = [
    { month: 'Jun', amount: 3200, pct: 42 }, { month: 'Jul', amount: 4100, pct: 54 },
    { month: 'Aoû', amount: 5800, pct: 76 }, { month: 'Sep', amount: 4900, pct: 64 },
    { month: 'Oct', amount: 6200, pct: 82 }, { month: 'Nov', amount: 7600, pct: 100 }
  ];

  activities = [
    { action: 'Nouvelle Inscription', detail: 'Ahmed Trabelsi (Conducteur) a rejoint la plateforme', time: 'il y a 2 min', color: '#0e85a3' },
    { action: 'Trajet Publié & Géolocalisé', detail: 'Ariana -> Lac 2 par Sami Mansouri (Score IA: 98%)', time: 'il y a 15 min', color: '#28a745' },
    { action: 'Réservation Confirmée', detail: 'Passager Ibtihel B. pour Lac 2 (Paiement 8.5 TND)', time: 'il y a 30 min', color: '#ffc107' },
    { action: 'Événement RabbitMQ Traité', detail: 'payment.completed dispatché vers dashboard.queue', time: 'il y a 45 min', color: '#8b5cf6' },
    { action: 'Audit Log Enregistré', detail: 'Snapshot MySQL #204 créé automatiquement', time: 'il y a 1h', color: '#0d5c80' }
  ];

  topDrivers = [
    { name: 'Sami Mansouri', initials: 'SM', trips: 145, rating: 4.9, revenue: 2450 },
    { name: 'Fatma Khelifi', initials: 'FK', trips: 201, rating: 4.9, revenue: 3200 },
    { name: 'Youssef Trabelsi', initials: 'YT', trips: 67, rating: 4.7, revenue: 980 },
    { name: 'Amira Ben Salah', initials: 'AB', trips: 89, rating: 4.8, revenue: 1450 },
    { name: 'Karim Gharbi', initials: 'KG', trips: 55, rating: 4.6, revenue: 720 }
  ];

  healthItems = [
    { name: 'API Gateway', port: 'Port 8080', online: true },
    { name: 'Dashboard Service', port: 'Port 8088', online: true },
    { name: 'Discovery Eureka', port: 'Port 8761', online: true },
    { name: 'RabbitMQ Broker', port: 'Port 5672/15672', online: true },
    { name: 'Keycloak IAM', port: 'Port 8180', online: true },
    { name: 'MySQL Dashboard', port: 'Port 3308', online: true },
    { name: 'MySQL Users', port: 'Port 3307', online: true },
    { name: 'Postgres Booking', port: 'Port 5433', online: true }
  ];

  setCorridor(lat1: number, lng1: number, lat2: number, lng2: number, originName: string, destName: string): void {
    this.activeMapOrigin = { lat: lat1, lng: lng1, label: originName };
    this.activeMapDest = { lat: lat2, lng: lng2, label: destName };
  }
}
