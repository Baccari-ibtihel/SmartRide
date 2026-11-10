import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page animate-fade">
      <div class="auth-card">
        <div class="auth-header">
          <a routerLink="/user/home" class="auth-logo-link">
            <span class="auth-logo">🚗</span>
            <h1>Smart<strong>Ride</strong></h1>
          </a>
          <p>Créez votre compte en 1 minute & choisissez votre rôle</p>
        </div>

        <!-- Step Indicator -->
        <div class="reg-progress">
          <div class="reg-step" *ngFor="let s of stepNames; let i = index" [class.active]="step >= i+1" [class.done]="step > i+1">
            <div class="reg-circle">{{ step > i+1 ? '✓' : i+1 }}</div>
            <span>{{ s }}</span>
          </div>
        </div>

        <!-- Error / Success Alert -->
        <div class="alert alert-danger" *ngIf="errorMessage">
          ⚠️ {{ errorMessage }}
        </div>
        <div class="alert alert-success" *ngIf="successMessage">
          ✅ {{ successMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onRegister()">
          <!-- STEP 1: Identité -->
          <div *ngIf="step === 1" class="step-content">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input class="form-control" formControlName="firstName" placeholder="Ex: Ahmed">
                <span class="form-error" *ngIf="isFieldInvalid('firstName')">Prénom requis</span>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input class="form-control" formControlName="lastName" placeholder="Ex: Trabelsi">
                <span class="form-error" *ngIf="isFieldInvalid('lastName')">Nom requis</span>
              </div>
            </div>

            <div class="form-group">
              <label>Adresse email *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="ahmed.trabelsi@gmail.com">
              <span class="form-error" *ngIf="isFieldInvalid('email')">Email valide requis</span>
            </div>

            <div class="form-group">
              <label>Mot de passe *</label>
              <input type="password" class="form-control" formControlName="password" placeholder="Minimum 6 caractères">
              <span class="form-error" *ngIf="isFieldInvalid('password')">Au moins 6 caractères requis</span>
            </div>
          </div>

          <!-- STEP 2: Coordonnées & Ville -->
          <div *ngIf="step === 2" class="step-content">
            <div class="form-group">
              <label>Numéro de téléphone portable *</label>
              <input class="form-control" formControlName="phone" placeholder="+216 98 123 456">
              <span class="form-error" *ngIf="isFieldInvalid('phone')">Téléphone requis</span>
            </div>

            <div class="form-group">
              <label>Ville principale de résidence *</label>
              <select class="form-control" formControlName="city">
                <option value="Tunis">Tunis</option>
                <option value="Ariana">Ariana</option>
                <option value="Ben Arous">Ben Arous</option>
                <option value="Manouba">Manouba</option>
                <option value="Sousse">Sousse</option>
                <option value="Monastir">Monastir</option>
                <option value="Sfax">Sfax</option>
                <option value="Nabeul">Nabeul</option>
                <option value="Bizerte">Bizerte</option>
                <option value="Autre">Autre région</option>
              </select>
            </div>

            <div class="features-note">
              <span>🛡️ Vos coordonnées sont protégées et uniquement partagées lors d'une réservation confirmée.</span>
            </div>
          </div>

          <!-- STEP 3: Choix du Rôle -->
          <div *ngIf="step === 3" class="step-content">
            <h3 class="role-title">Quel sera votre usage principal ?</h3>
            <p class="role-sub">Sélectionnez le rôle qui vous correspond le mieux (modifiable ultérieurement) :</p>

            <div class="role-options">
              <!-- CONDUCTEUR -->
              <div 
                class="role-card" 
                [class.selected]="form.value.role === 'CONDUCTEUR'" 
                (click)="form.patchValue({role: 'CONDUCTEUR'})"
              >
                <span class="role-icon">🚗</span>
                <strong>Conducteur</strong>
                <p>Je propose mes trajets quotidiens ou interurbains et je partage mes frais de route.</p>
                <span class="role-badge">Publier des trajets</span>
              </div>

              <!-- PASSAGER -->
              <div 
                class="role-card" 
                [class.selected]="form.value.role === 'PASSAGER'" 
                (click)="form.patchValue({role: 'PASSAGER'})"
              >
                <span class="role-icon">🧑‍💼</span>
                <strong>Passager</strong>
                <p>Je recherche des covoitureurs compatibles grâce au matching IA et je voyage sereinement.</p>
                <span class="role-badge">Réserver des places</span>
              </div>

              <!-- ADMIN -->
              <div 
                class="role-card admin-role" 
                [class.selected]="form.value.role === 'ADMIN'" 
                (click)="form.patchValue({role: 'ADMIN'})"
              >
                <span class="role-icon">⚙️</span>
                <strong>Administrateur</strong>
                <p>Supervision de la plateforme, gestion des microservices, modération et suivi financier.</p>
                <span class="role-badge">Back-Office Admin</span>
              </div>
            </div>

            <label class="terms">
              <input type="checkbox" formControlName="acceptTerms">
              <span>J'accepte les <a href="#" (click)="$event.preventDefault()">conditions générales d'utilisation</a> de SmartRide</span>
            </label>
            <span class="form-error" *ngIf="isFieldInvalid('acceptTerms')">Veuillez accepter les conditions</span>
          </div>

          <!-- Navigation Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="prevStep()" *ngIf="step > 1">
              ← Précédent
            </button>
            <div class="spacer"></div>
            <button type="button" class="btn btn-primary" (click)="nextStep()" *ngIf="step < 3">
              Suivant →
            </button>
            <button type="submit" class="btn btn-success btn-lg" *ngIf="step === 3" [disabled]="loading">
              {{ loading ? 'Création en cours...' : '🚀 Finaliser mon inscription' }}
            </button>
          </div>
        </form>

        <p class="auth-link">
          Déjà un compte ? <a routerLink="/auth/login">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, var(--accent) 100%);
      padding: 32px 16px;
    }
    .auth-card {
      background: var(--white); border-radius: var(--radius-lg); padding: 36px;
      width: 100%; max-width: 580px; box-shadow: var(--shadow-lg);
    }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-logo-link { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: var(--primary); }
    .auth-logo { font-size: 2.2rem; }
    .auth-header h1 { font-size: 1.6rem; color: var(--primary); }
    .auth-header h1 strong { color: var(--accent); }
    .auth-header p { color: var(--gray-500); font-size: 0.9rem; margin-top: 4px; }

    .reg-progress { display: flex; justify-content: center; gap: 40px; margin-bottom: 28px; }
    .reg-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .reg-circle {
      width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--gray-200);
      display: flex; align-items: center; justify-content: center; font-weight: 700;
      font-size: 0.85rem; color: var(--gray-400); transition: var(--transition); background: var(--white);
    }
    .reg-step.active .reg-circle { border-color: var(--accent); color: var(--accent); }
    .reg-step.done .reg-circle { background: var(--success); border-color: var(--success); color: white; }
    .reg-step span { font-size: 0.75rem; color: var(--gray-500); font-weight: 500; }
    .reg-step.active span { color: var(--accent); font-weight: 700; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .step-content { animation: fadeIn 0.3s ease; }

    .features-note {
      background: rgba(14,133,163,0.08); padding: 12px; border-radius: var(--radius-sm);
      font-size: 0.82rem; color: var(--secondary); margin-top: 8px;
    }

    .role-title { font-size: 1.1rem; color: var(--primary); text-align: center; margin-bottom: 4px; }
    .role-sub { font-size: 0.85rem; color: var(--gray-500); text-align: center; margin-bottom: 20px; }
    
    .role-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .role-card {
      padding: 16px 12px; border: 2px solid var(--gray-200); border-radius: var(--radius);
      text-align: center; cursor: pointer; transition: var(--transition); display: flex;
      flex-direction: column; align-items: center; justify-content: space-between;
    }
    .role-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .role-card.selected { border-color: var(--accent); background: rgba(14,133,163,0.06); }
    .role-icon { font-size: 2rem; margin-bottom: 6px; }
    .role-card strong { font-size: 0.95rem; color: var(--gray-800); margin-bottom: 4px; }
    .role-card p { font-size: 0.75rem; color: var(--gray-500); line-height: 1.4; margin-bottom: 10px; }
    .role-badge {
      font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 10px;
      background: var(--gray-100); color: var(--gray-600);
    }
    .role-card.selected .role-badge { background: var(--accent); color: white; }

    .terms { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-bottom: 8px; cursor: pointer; }
    .terms a { color: var(--accent); font-weight: 600; }

    .alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px; }
    .alert-danger { background: #fee2e2; color: #b91c1c; border-left: 4px solid #ef4444; }
    .alert-success { background: #dcfce7; color: #15803d; border-left: 4px solid #22c55e; }

    .form-actions { display: flex; align-items: center; margin-top: 24px; gap: 12px; }
    .spacer { flex: 1; }
    .auth-link { text-align: center; margin-top: 20px; font-size: 0.9rem; color: var(--gray-500); }
    .auth-link a { color: var(--accent); font-weight: 600; }

    @media (max-width: 600px) {
      .role-options { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
      .reg-progress { gap: 20px; }
    }
  `]
})
export class RegisterComponent {
  step = 1;
  stepNames = ['Identité', 'Coordonnées', 'Rôle'];
  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['+216 98 ', [Validators.required, Validators.minLength(8)]],
      city: ['Tunis', Validators.required],
      role: ['CONDUCTEUR', Validators.required],
      acceptTerms: [true, Validators.requiredTrue]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  nextStep(): void {
    this.errorMessage = '';
    if (this.step === 1) {
      const controls = ['firstName', 'lastName', 'email', 'password'];
      let valid = true;
      controls.forEach(c => {
        const ctrl = this.form.get(c);
        if (ctrl && ctrl.invalid) {
          ctrl.markAsTouched();
          valid = false;
        }
      });
      if (!valid) {
        this.errorMessage = 'Veuillez remplir correctement les informations personnelles.';
        return;
      }
      this.step = 2;
    } else if (this.step === 2) {
      const phoneCtrl = this.form.get('phone');
      if (phoneCtrl && phoneCtrl.invalid) {
        phoneCtrl.markAsTouched();
        this.errorMessage = 'Veuillez renseigner un numéro de téléphone valide.';
        return;
      }
      this.step = 3;
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
      this.errorMessage = '';
    }
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez vérifier tous les champs du formulaire.';
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    this.authService.register(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = `Compte créé avec succès ! Bienvenue ${res.user.firstName}. Redirection...`;

        setTimeout(() => {
          if (res.user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (res.user.role === 'CONDUCTEUR') {
            this.router.navigate(['/user/publish-trip']);
          } else {
            this.router.navigate(['/user/search']);
          }
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Une erreur est survenue lors de l inscription.';
      }
    });
  }
}
