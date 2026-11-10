import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
          <p>Connexion à votre espace personnel</p>
        </div>

        <!-- Quick 1-Click Test Buttons -->
        <div class="quick-demo-box">
          <span class="demo-title">⚡ Connexion rapide démo :</span>
          <div class="demo-buttons">
            <button type="button" class="btn btn-sm btn-outline" (click)="quickLogin('admin')">
              ⚙️ Admin
            </button>
            <button type="button" class="btn btn-sm btn-outline" (click)="quickLogin('driver')">
              🚗 Conducteur
            </button>
            <button type="button" class="btn btn-sm btn-outline" (click)="quickLogin('passenger')">
              🧑‍💼 Passager
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div class="alert alert-danger" *ngIf="errorMessage">
          ⚠️ {{ errorMessage }}
        </div>
        <div class="alert alert-success" *ngIf="successMessage">
          ✅ {{ successMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Adresse email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="votre@email.com">
            <span class="form-error" *ngIf="form.controls['email'].touched && form.controls['email'].errors">
              Veuillez saisir un email valide
            </span>
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••">
            <span class="form-error" *ngIf="form.controls['password'].touched && form.controls['password'].errors">
              Mot de passe requis (min. 6 caractères)
            </span>
          </div>

          <div class="form-options">
            <label class="remember">
              <input type="checkbox"> Se souvenir de moi
            </label>
            <a href="#" (click)="$event.preventDefault()" class="forgot">Mot de passe oublié ?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" [disabled]="loading">
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>

        <p class="auth-link">
          Pas encore de compte ? <a routerLink="/auth/register">Créer un compte & choisir mon rôle</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      padding: 24px;
    }
    .auth-card {
      background: var(--white); border-radius: var(--radius-lg); padding: 40px;
      width: 100%; max-width: 440px; box-shadow: var(--shadow-lg);
    }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-logo-link { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: var(--primary); }
    .auth-logo { font-size: 2.5rem; }
    .auth-header h1 { font-size: 1.6rem; color: var(--primary); }
    .auth-header h1 strong { color: var(--accent); }
    .auth-header p { color: var(--gray-500); font-size: 0.9rem; margin-top: 4px; }

    .quick-demo-box {
      background: rgba(14,133,163,0.08); border-radius: var(--radius-sm); padding: 10px 12px;
      margin-bottom: 20px; text-align: center;
    }
    .demo-title { font-size: 0.75rem; font-weight: 700; color: var(--secondary); display: block; margin-bottom: 6px; }
    .demo-buttons { display: flex; gap: 6px; justify-content: center; }

    .form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .remember { font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .forgot { font-size: 0.85rem; color: var(--accent); }

    .alert { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px; }
    .alert-danger { background: #fee2e2; color: #b91c1c; border-left: 4px solid #ef4444; }
    .alert-success { background: #dcfce7; color: #15803d; border-left: 4px solid #22c55e; }

    .auth-link { text-align: center; margin-top: 24px; font-size: 0.9rem; color: var(--gray-500); }
    .auth-link a { color: var(--accent); font-weight: 600; }
  `]
})
export class LoginComponent {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  quickLogin(type: 'admin' | 'driver' | 'passenger'): void {
    if (type === 'admin') {
      this.form.patchValue({ email: 'admin@smartride.tn', password: 'admin123' });
    } else if (type === 'driver') {
      this.form.patchValue({ email: 'driver@smartride.tn', password: 'driver123' });
    } else {
      this.form.patchValue({ email: 'passenger@smartride.tn', password: 'pass123' });
    }
    this.onLogin();
  }

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = `Ravi de vous revoir, ${res.user.firstName} ! Redirection...`;

        setTimeout(() => {
          if (res.user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/home']);
          }
        }, 800);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Identifiants invalides';
      }
    });
  }
}
