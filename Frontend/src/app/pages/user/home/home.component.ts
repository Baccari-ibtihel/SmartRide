import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripStoreService } from '../../../core/services/trip-store.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section Dynamic per Role -->
    <section class="hero">
      <div class="hero-content">
        <!-- Role greeting banner if logged in -->
        <div class="user-role-hero-badge" *ngIf="currentUser">
          <span>{{ currentUser.role === 'CONDUCTEUR' ? '🚗 Espace Conducteur' : currentUser.role === 'ADMIN' ? '⚙️ Espace Administrateur' : '🧑‍💼 Espace Passager' }}</span>
          · Bonjour {{ currentUser.firstName }} !
        </div>

        <h1>Voyagez Intelligent avec <span class="highlight">SmartRide</span></h1>
        
        <p class="hero-sub" *ngIf="!currentUser || currentUser.role === 'PASSAGER'">
          Trouvez le trajet idéal grâce au matching par Intelligence Artificielle en temps réel. Économisez, partagez, suivez votre conducteur en direct.
        </p>
        <p class="hero-sub" *ngIf="currentUser && currentUser.role === 'CONDUCTEUR'">
          Partagez vos trajets réguliers, définissez vos étapes sur la carte GPS interactive et rentabilisez vos frais de carburant en toute simplicité.
        </p>

        <!-- Role-Specific Action CTAs -->
        <div class="hero-actions">
          <!-- CONDUCTEUR Actions -->
          <ng-container *ngIf="currentUser && currentUser.role === 'CONDUCTEUR'">
            <a routerLink="/user/publish-trip" class="btn btn-primary btn-lg">➕ Publier un nouveau trajet</a>
            <a routerLink="/user/my-trips" class="btn btn-outline btn-lg">📋 Gérer mes trajets publiés</a>
          </ng-container>

          <!-- PASSAGER Actions -->
          <ng-container *ngIf="currentUser && currentUser.role === 'PASSAGER'">
            <a routerLink="/user/search" class="btn btn-primary btn-lg">🔍 Rechercher un trajet</a>
            <a routerLink="/user/bookings" class="btn btn-outline btn-lg">📋 Mes Réservations</a>
            <a routerLink="/user/tracking/0" class="btn btn-outline btn-lg">📍 Suivi GPS Conducteur</a>
          </ng-container>

          <!-- ADMIN Actions -->
          <ng-container *ngIf="currentUser && currentUser.role === 'ADMIN'">
            <a routerLink="/admin/dashboard" class="btn btn-danger btn-lg">⚡ Accéder au Back-Office Admin</a>
            <a routerLink="/user/search" class="btn btn-outline btn-lg">🔍 Explorer les trajets</a>
          </ng-container>

          <!-- Not Logged In Actions -->
          <ng-container *ngIf="!currentUser">
            <a routerLink="/user/search" class="btn btn-primary btn-lg">🔍 Rechercher un trajet</a>
            <a routerLink="/auth/register" class="btn btn-outline btn-lg">🚗 Devenir Conducteur</a>
          </ng-container>
        </div>

        <div class="hero-stats">
          <div class="stat"><strong>12,450+</strong><span>Trajets publiés</span></div>
          <div class="stat"><strong>8,200+</strong><span>Utilisateurs actifs</span></div>
          <div class="stat"><strong>95%</strong><span>Taux de satisfaction</span></div>
        </div>
      </div>
    </section>

    <!-- Comment ça marche -->
    <section class="how-it-works">
      <div class="section-container">
        <h2 class="section-title">Comment ça marche ?</h2>
        <p class="section-sub">3 étapes simples pour voyager intelligemment</p>
        <div class="steps-grid">
          <div class="step-card" *ngFor="let step of steps">
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-number">{{ step.num }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trajets Populaires -->
    <section class="popular-trips">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Trajets Populaires</h2>
            <p class="section-sub">Découvrez les itinéraires les plus demandés</p>
          </div>
          <a routerLink="/user/search" class="btn btn-outline">Voir tous les trajets →</a>
        </div>
        <div class="trips-grid">
          <div class="trip-card" *ngFor="let trip of popularTrips">
            <div class="trip-header">
              <div class="driver-info">
                <div class="avatar">{{ trip.driverInitials }}</div>
                <div>
                  <strong>{{ trip.driver }}</strong>
                  <span class="rating">⭐ {{ trip.rating }}</span>
                </div>
              </div>
              <span class="match-score">{{ trip.score }}%</span>
            </div>
            <div class="trip-route">
              <div class="route-point">
                <span class="dot origin"></span>
                <span>{{ trip.origin }}</span>
              </div>
              <div class="route-line"></div>
              <div class="route-point">
                <span class="dot dest"></span>
                <span>{{ trip.destination }}</span>
              </div>
            </div>
            <div class="trip-meta">
              <span>🕐 {{ trip.time }}</span>
              <span>💺 {{ trip.seats }} places</span>
              <span class="trip-price">{{ trip.price }} TND</span>
            </div>
            <a routerLink="/user/trip/{{ trip.id }}" class="btn btn-primary" style="width:100%; margin-top:12px;">Réserver</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Pourquoi SmartRide -->
    <section class="features">
      <div class="section-container">
        <h2 class="section-title">Pourquoi SmartRide ?</h2>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let f of features">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Prêt à voyager intelligemment ?</h2>
        <p>Rejoignez des milliers de covoitureurs et commencez à économiser dès maintenant.</p>
        <a routerLink="/auth/register" class="btn btn-primary btn-lg">Créer un compte gratuit</a>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%);
      color: white; padding: 80px 24px 60px; text-align: center;
    }
    .hero-content { max-width: 800px; margin: 0 auto; }
    .user-role-hero-badge {
      display: inline-block; padding: 6px 16px; border-radius: 20px;
      background: rgba(255,255,255,0.2); font-size: 0.85rem; font-weight: 700;
      margin-bottom: 16px; backdrop-filter: blur(4px);
    }
    .hero h1 { font-size: 2.8rem; font-weight: 800; line-height: 1.2; margin-bottom: 20px; }
    .highlight { color: #5de5ff; }
    .hero-sub { font-size: 1.15rem; opacity: 0.9; max-width: 600px; margin: 0 auto 32px; line-height: 1.7; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
    .hero-actions .btn-outline { border-color: white; color: white; }
    .hero-actions .btn-outline:hover { background: white; color: var(--primary); }
    .hero-stats { display: flex; gap: 48px; justify-content: center; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat strong { display: block; font-size: 1.8rem; font-weight: 800; }
    .stat span { font-size: 0.85rem; opacity: 0.8; }

    .section-container { max-width: 1200px; margin: 0 auto; padding: 60px 24px; }
    .section-title { font-size: 1.8rem; font-weight: 800; color: var(--primary); text-align: center; margin-bottom: 8px; }
    .section-sub { text-align: center; color: var(--gray-500); margin-bottom: 40px; }
    .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    .section-header .section-title, .section-header .section-sub { text-align: left; }

    .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .step-card {
      background: var(--white); border-radius: var(--radius-lg); padding: 32px; text-align: center;
      box-shadow: var(--shadow-sm); transition: var(--transition); position: relative;
    }
    .step-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .step-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .step-number {
      position: absolute; top: 16px; left: 16px; width: 28px; height: 28px;
      border-radius: 50%; background: var(--accent); color: white; display: flex;
      align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
    }
    .step-card h3 { margin-bottom: 8px; color: var(--primary); }
    .step-card p { font-size: 0.9rem; color: var(--gray-500); }

    .trips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .trip-card {
      background: var(--white); border-radius: var(--radius); padding: 20px;
      box-shadow: var(--shadow-sm); transition: var(--transition);
    }
    .trip-card:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
    .trip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .driver-info { display: flex; align-items: center; gap: 10px; }
    .driver-info strong { display: block; font-size: 0.9rem; }
    .rating { font-size: 0.8rem; color: var(--gray-500); }
    .match-score {
      background: linear-gradient(135deg, var(--accent), var(--secondary));
      color: white; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;
    }
    .trip-route { margin: 16px 0; padding-left: 8px; }
    .route-point { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot.origin { background: var(--accent); }
    .dot.dest { background: var(--danger); }
    .route-line { width: 2px; height: 20px; background: var(--gray-200); margin-left: 4px; }
    .trip-meta { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--gray-500); padding-top: 12px; border-top: 1px solid var(--gray-100); }
    .trip-price { font-weight: 700; color: var(--accent); font-size: 0.95rem; }

    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .feature-card {
      background: var(--white); border-radius: var(--radius); padding: 28px; text-align: center;
      box-shadow: var(--shadow-sm); transition: var(--transition);
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
    .feature-icon { font-size: 2.2rem; margin-bottom: 12px; }
    .feature-card h3 { font-size: 1rem; color: var(--primary); margin-bottom: 8px; }
    .feature-card p { font-size: 0.85rem; color: var(--gray-500); }

    .cta-section {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white; text-align: center; padding: 60px 24px; margin-top: 20px;
    }
    .cta-content { max-width: 600px; margin: 0 auto; }
    .cta-content h2 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
    .cta-content p { opacity: 0.9; margin-bottom: 28px; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.8rem; }
      .steps-grid, .features-grid { grid-template-columns: 1fr; }
      .hero-stats { gap: 24px; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  steps = [
    { num: '1', icon: '📍', title: 'Publiez ou Recherchez', desc: 'Créez votre trajet ou cherchez parmi les offres disponibles avec nos filtres intelligents.' },
    { num: '2', icon: '🤖', title: 'Matching par IA', desc: 'Notre algorithme analyse détours, horaires et préférences pour trouver le meilleur match.' },
    { num: '3', icon: '🚗', title: 'Voyagez Ensemble', desc: 'Réservez en un clic, payez en ligne et partagez un trajet agréable et économique.' }
  ];

  popularTrips: any[] = [];
  currentUser: User | null = null;

  features = [
    { icon: '🤖', title: 'Intelligence Artificielle', desc: 'Matching avancé par IA pour des correspondances optimales.' },
    { icon: '🔒', title: 'Sécurité Garantie', desc: 'Profils vérifiés, évaluations et suivi en temps réel.' },
    { icon: '💰', title: 'Économique', desc: 'Partagez les frais et réduisez vos coûts de transport.' },
    { icon: '🌿', title: 'Écologique', desc: 'Réduisez votre empreinte carbone en partageant vos trajets.' }
  ];

  constructor(
    private tripStore: TripStoreService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
    });
    this.loadTrips();
    this.tripStore.trips$.subscribe(() => this.loadTrips());
  }

  private loadTrips(): void {
    const active = this.tripStore.getActiveTrips();
    if (active.length > 0) {
      this.popularTrips = active.slice(0, 4).map(t => ({
        id: t.id,
        driver: t.driverName,
        driverInitials: t.driverInitials,
        rating: t.driverRating,
        score: t.score,
        origin: t.origin,
        destination: t.destination,
        time: t.time,
        seats: t.seats - t.seatsBooked,
        price: t.price
      }));
    }
  }
}
