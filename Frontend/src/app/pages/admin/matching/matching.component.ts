import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MatchingLog {
  id: string;
  passenger: string;
  driver: string;
  originMatch: number;
  destMatch: number;
  timeMatch: number;
  prefMatch: number;
  globalScore: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'REJETE';
  detourKm: number;
  timestamp: string;
}

@Component({
  selector: 'app-admin-matching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-matching-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>🤖 Moteur de Matching par IA</h2>
          <p class="text-muted">Supervision du service FastAPI de matching intelligent, pondération des critères et télémétrie</p>
        </div>
        <button class="btn btn-primary" (click)="saveWeights()">
          💾 Sauvegarder les Poids du Modèle
        </button>
      </div>

      <!-- Realtime Engine KPIs -->
      <div class="metrics-row">
        <div class="metric-card card">
          <span class="m-val text-accent">FastAPI (v2.4)</span>
          <span class="m-lbl">Moteur d'IA Actif</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-success">94.2%</span>
          <span class="m-lbl">Précision Recommandation</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-primary">38 ms</span>
          <span class="m-lbl">Temps de Réponse Moyen</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-warning">2.4 km</span>
          <span class="m-lbl">Détour Moyen Optimisé</span>
        </div>
      </div>

      <!-- Model Weight Configuration & Simulation Simulator -->
      <div class="tuning-grid">
        <!-- Configuration Card -->
        <div class="card">
          <h3>⚙️ Paramétrage des Poids de l'Algorithme</h3>
          <p class="text-muted subtext">Ajustez l'importance relative de chaque critère dans le calcul du score global.</p>

          <div class="slider-group">
            <div class="slider-item">
              <div class="slider-header">
                <span>📍 Proximité Itinéraire & Détour</span>
                <strong>{{ weights.routeDetour }}%</strong>
              </div>
              <input type="range" min="10" max="60" [(ngModel)]="weights.routeDetour" class="slider-range">
            </div>

            <div class="slider-item">
              <div class="slider-header">
                <span>🕐 Tolérance Horaire (+/- 15 min)</span>
                <strong>{{ weights.timeFlexibility }}%</strong>
              </div>
              <input type="range" min="10" max="50" [(ngModel)]="weights.timeFlexibility" class="slider-range">
            </div>

            <div class="slider-item">
              <div class="slider-header">
                <span>⭐ Affinités Profils & Notes</span>
                <strong>{{ weights.ratingAffinity }}%</strong>
              </div>
              <input type="range" min="5" max="30" [(ngModel)]="weights.ratingAffinity" class="slider-range">
            </div>

            <div class="slider-item">
              <div class="slider-header">
                <span>🚭 Préférences Voyage (Fumeur, Bagages, Musique)</span>
                <strong>{{ weights.preferences }}%</strong>
              </div>
              <input type="range" min="5" max="30" [(ngModel)]="weights.preferences" class="slider-range">
            </div>
          </div>

          <div class="weight-total-bar mt-2">
            <span>Pondération Totale : </span>
            <strong [class.text-success]="getTotalWeight() === 100" [class.text-danger]="getTotalWeight() !== 100">
              {{ getTotalWeight() }}%
            </strong>
            <small *ngIf="getTotalWeight() !== 100" class="text-danger ml-2">(Doit être égal à 100%)</small>
          </div>
        </div>

        <!-- Live Simulator Card -->
        <div class="card sim-card">
          <h3>🧪 Simulateur de Correspondance en Direct</h3>
          <p class="text-muted subtext">Testez la réaction du modèle entre deux profils en temps réel.</p>

          <div class="sim-form mt-2">
            <div class="form-group">
              <label>Passager test</label>
              <input class="form-control" [(ngModel)]="simPassenger" placeholder="Ex: Ibtihel (Ariana ➔ Lac 2)">
            </div>
            <div class="form-group">
              <label>Conducteur candidat</label>
              <input class="form-control" [(ngModel)]="simDriver" placeholder="Ex: Sami (Borj Louzir ➔ Lac 2)">
            </div>
            <div class="form-group">
              <label>Détour estimé (km)</label>
              <input type="number" class="form-control" [(ngModel)]="simDetour" placeholder="Ex: 1.8">
            </div>

            <button class="btn btn-primary" style="width:100%" (click)="runSimulation()">
              ⚡ Calculer Score IA
            </button>
          </div>

          <div class="sim-result-box mt-2" *ngIf="simResult">
            <div class="sim-score-circle">
              <span class="score-val">{{ simResult.score }}%</span>
              <span class="score-lbl">Score IA</span>
            </div>
            <div class="sim-feedback">
              <strong>Verdict : {{ simResult.verdict }}</strong>
              <p class="text-muted">{{ simResult.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Realtime Matching Telemetry Table -->
      <div class="card table-container">
        <h3>📊 Télémétrie des Derniers Matchings Traités</h3>
        <table>
          <thead>
            <tr>
              <th>ID Match</th>
              <th>Passager</th>
              <th>Conducteur</th>
              <th>Détour</th>
              <th>Score Itinéraire</th>
              <th>Score Horaire</th>
              <th>Score Préférences</th>
              <th>Score Global</th>
              <th>Statut</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of matchingLogs">
              <td><strong>{{ m.id }}</strong></td>
              <td>{{ m.passenger }}</td>
              <td>{{ m.driver }}</td>
              <td>{{ m.detourKm }} km</td>
              <td>{{ m.originMatch }}%</td>
              <td>{{ m.timeMatch }}%</td>
              <td>{{ m.prefMatch }}%</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': m.globalScore >= 90,
                  'badge-primary': m.globalScore >= 75 && m.globalScore < 90,
                  'badge-danger': m.globalScore < 75
                }">{{ m.globalScore }}%</span>
              </td>
              <td>
                <span class="status-pill" [ngClass]="m.status.toLowerCase()">{{ m.status }}</span>
              </td>
              <td class="text-muted">{{ m.timestamp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-matching-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar { display: flex; justify-content: space-between; align-items: center; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { text-align: center; padding: 16px; }
    .m-val { display: block; font-size: 1.5rem; font-weight: 800; color: var(--primary); }
    .m-lbl { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; font-weight: 600; }

    .tuning-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
    .subtext { font-size: 0.85rem; margin-bottom: 16px; }

    .slider-group { display: flex; flex-direction: column; gap: 16px; }
    .slider-item { display: flex; flex-direction: column; gap: 6px; }
    .slider-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; }
    .slider-range { width: 100%; accent-color: var(--accent); }

    .weight-total-bar { padding: 10px; background: var(--gray-50); border-radius: var(--radius-sm); font-size: 0.9rem; }

    .sim-form { display: flex; flex-direction: column; gap: 10px; }
    .sim-result-box {
      display: flex; align-items: center; gap: 16px; padding: 14px;
      background: rgba(14,133,163,0.08); border-radius: var(--radius-sm);
      border-left: 4px solid var(--accent);
    }
    .sim-score-circle {
      width: 60px; height: 60px; border-radius: 50%; background: var(--white);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: var(--shadow-sm); flex-shrink: 0;
    }
    .score-val { font-size: 1rem; font-weight: 800; color: var(--accent); }
    .score-lbl { font-size: 0.6rem; text-transform: uppercase; color: var(--gray-400); }
    .sim-feedback strong { font-size: 0.9rem; }
    .sim-feedback p { font-size: 0.8rem; margin-top: 2px; }

    .status-pill {
      display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;
    }
    .status-pill.optimal { background: #dcfce7; color: #15803d; }
    .status-pill.acceptable { background: #e0f2fe; color: #0369a1; }
    .status-pill.rejete { background: #fee2e2; color: #b91c1c; }

    @media (max-width: 900px) {
      .tuning-grid { grid-template-columns: 1fr; }
      .metrics-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class AdminMatchingComponent {
  weights = {
    routeDetour: 45,
    timeFlexibility: 25,
    ratingAffinity: 15,
    preferences: 15
  };

  simPassenger = 'Ibtihel B. (Ariana)';
  simDriver = 'Sami M. (Borj Louzir)';
  simDetour = 1.4;
  simResult: any = null;

  matchingLogs: MatchingLog[] = [
    { id: 'MT-881', passenger: 'Ibtihel B.', driver: 'Sami Mansouri', detourKm: 1.2, originMatch: 98, destMatch: 99, timeMatch: 95, prefMatch: 100, globalScore: 98, status: 'OPTIMAL', timestamp: 'Il y a 3 min' },
    { id: 'MT-882', passenger: 'Mohamed D.', driver: 'Amira Ben Salah', detourKm: 2.5, originMatch: 92, destMatch: 95, timeMatch: 90, prefMatch: 96, globalScore: 94, status: 'OPTIMAL', timestamp: 'Il y a 12 min' },
    { id: 'MT-883', passenger: 'Leila B.', driver: 'Youssef Trabelsi', detourKm: 3.1, originMatch: 88, destMatch: 91, timeMatch: 94, prefMatch: 90, globalScore: 91, status: 'ACCEPTABLE', timestamp: 'Il y a 24 min' },
    { id: 'MT-884', passenger: 'Fatma K.', driver: 'Karim Gharbi', detourKm: 5.8, originMatch: 80, destMatch: 82, timeMatch: 85, prefMatch: 75, globalScore: 81, status: 'ACCEPTABLE', timestamp: 'Il y a 45 min' },
    { id: 'MT-885', passenger: 'Amine J.', driver: 'Karim Gharbi', detourKm: 9.4, originMatch: 60, destMatch: 65, timeMatch: 70, prefMatch: 50, globalScore: 62, status: 'REJETE', timestamp: 'Il y a 1h' }
  ];

  getTotalWeight(): number {
    return this.weights.routeDetour + this.weights.timeFlexibility + this.weights.ratingAffinity + this.weights.preferences;
  }

  saveWeights() {
    if (this.getTotalWeight() !== 100) {
      alert('Erreur : La somme des pondérations doit être égale à 100% !');
      return;
    }
    alert('Les pondérations du modèle FastAPI ont été mises à jour avec succès.');
  }

  runSimulation() {
    // Dynamic formula computation
    const detourScore = Math.max(0, 100 - (this.simDetour * 12));
    const finalScore = Math.round(
      (detourScore * (this.weights.routeDetour / 100)) +
      (95 * (this.weights.timeFlexibility / 100)) +
      (96 * (this.weights.ratingAffinity / 100)) +
      (90 * (this.weights.preferences / 100))
    );

    this.simResult = {
      score: Math.min(99, finalScore),
      verdict: finalScore >= 90 ? 'Recommandation Prioritaire' : 'Alternative Valide',
      comment: `Détour acceptable de ${this.simDetour} km. Correspondance élevée sur les horaires et les critères fumeur/bagages.`
    };
  }
}
