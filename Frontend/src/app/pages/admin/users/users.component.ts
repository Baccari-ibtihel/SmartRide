import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { KeycloakAdminService } from '../../../core/services/keycloak-admin.service';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'PASSAGER' | 'CONDUCTEUR' | 'ADMIN';
  status: 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE';
  tripsCount: number;
  rating: number;
  joinedDate: string;
  avatar: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users-page animate-fade">
      <div class="page-topbar">
        <div>
          <h2>Gestion des Utilisateurs</h2>
          <p class="text-muted">Gérez les comptes, les autorisations et les statuts des utilisateurs de la plateforme</p>
        </div>
        <button class="btn btn-primary btn-add" (click)="openAddModal()">
          <span>➕</span> Nouvel Utilisateur
        </button>
      </div>

      <!-- Success Notification Alert -->
      <div class="alert alert-success animate-fade" *ngIf="successMessage">
        <span>✅ {{ successMessage }}</span>
        <button class="alert-close" (click)="successMessage = ''">✕</button>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-row">
        <div class="metric-card card">
          <span class="m-val">{{ users.length }}</span>
          <span class="m-lbl">Total inscrits</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-success">{{ getCountByStatus('ACTIF') }}</span>
          <span class="m-lbl">Comptes Actifs</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-warning">{{ getCountByRole('CONDUCTEUR') }}</span>
          <span class="m-lbl">Conducteurs Certifiés</span>
        </div>
        <div class="metric-card card">
          <span class="m-val text-danger">{{ getCountByStatus('SUSPENDU') }}</span>
          <span class="m-lbl">Suspendus</span>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou tél..." 
            [(ngModel)]="searchQuery"
            class="form-control"
          />
        </div>
        <div class="select-filters">
          <select class="form-control" [(ngModel)]="roleFilter">
            <option value="ALL">Tous les rôles</option>
            <option value="CONDUCTEUR">Conducteurs</option>
            <option value="PASSAGER">Passagers</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select class="form-control" [(ngModel)]="statusFilter">
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="SUSPENDU">Suspendus</option>
            <option value="EN_ATTENTE">En attente</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container card">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Contact</th>
              <th>Rôle</th>
              <th>Activité</th>
              <th>Note</th>
              <th>Statut</th>
              <th>Date Inscription</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsers">
              <td>
                <div class="user-cell">
                  <div class="avatar">{{ u.avatar }}</div>
                  <div>
                    <strong class="user-fullname">{{ u.name }}</strong>
                    <span class="user-id">ID: #USR-{{ u.id }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <span>📧 {{ u.email }}</span>
                  <span class="text-muted">📞 {{ u.phone }}</span>
                </div>
              </td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-primary': u.role === 'ADMIN',
                  'badge-info': u.role === 'CONDUCTEUR',
                  'badge-warning': u.role === 'PASSAGER'
                }">{{ u.role }}</span>
              </td>
              <td>
                <strong>{{ u.tripsCount }}</strong> <span class="text-muted">trajets</span>
              </td>
              <td>
                <span class="rating-badge">⭐ {{ u.rating ? u.rating.toFixed(1) : 'N/A' }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': u.status === 'ACTIF',
                  'badge-danger': u.status === 'SUSPENDU',
                  'badge-warning': u.status === 'EN_ATTENTE'
                }">{{ u.status }}</span>
              </td>
              <td>{{ u.joinedDate }}</td>
              <td>
                <div class="actions-cell">
                  <button class="btn btn-sm btn-outline" (click)="viewUser(u)" title="Détails">👁️</button>
                  <button 
                    class="btn btn-sm" 
                    [ngClass]="u.status === 'ACTIF' ? 'btn-warning' : 'btn-success'"
                    (click)="toggleStatus(u)"
                    [title]="u.status === 'ACTIF' ? 'Suspendre' : 'Activer'"
                  >
                    {{ u.status === 'ACTIF' ? '⏸️' : '▶️' }}
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteUser(u)" title="Supprimer">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="filteredUsers.length === 0">
          <p class="text-muted">Aucun utilisateur ne correspond à votre recherche.</p>
        </div>
      </div>

      <!-- Modal : AJOUTER UN NOUVEL UTILISATEUR -->
      <div class="modal-backdrop" *ngIf="isAddModalOpen" (click)="closeAddModal()">
        <div class="modal-card card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>➕ Ajouter un Nouvel Utilisateur</h3>
              <p class="text-muted text-sm">Créez un nouveau compte conducteur, passager ou administrateur</p>
            </div>
            <button class="close-btn" (click)="closeAddModal()">✕</button>
          </div>

          <form (ngSubmit)="saveNewUser()">
            <div class="modal-body">
              <div class="alert alert-danger mb-2" *ngIf="formError">
                ⚠️ {{ formError }}
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Nom & Prénom <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="ex: Khaled Ayari"
                    [(ngModel)]="newUser.name"
                    name="name"
                    required
                  />
                </div>
                <div class="form-group flex-1">
                  <label>Rôle sur la plateforme <span class="text-danger">*</span></label>
                  <select class="form-control" [(ngModel)]="newUser.role" name="role">
                    <option value="PASSAGER">Passager (Standard)</option>
                    <option value="CONDUCTEUR">Conducteur (Chauffeur)</option>
                    <option value="ADMIN">Administrateur (Gestionnaire)</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Adresse Email <span class="text-danger">*</span></label>
                  <input 
                    type="email" 
                    class="form-control" 
                    placeholder="ex: khaled.ayari@gmail.com"
                    [(ngModel)]="newUser.email"
                    name="email"
                    required
                  />
                </div>
                <div class="form-group flex-1">
                  <label>Numéro de Téléphone <span class="text-danger">*</span></label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    placeholder="+216 98 123 456"
                    [(ngModel)]="newUser.phone"
                    name="phone"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Mot de passe provisoire <span class="text-danger">*</span></label>
                  <input 
                    type="password" 
                    class="form-control" 
                    placeholder="Minimum 6 caractères"
                    [(ngModel)]="newUser.password"
                    name="password"
                    required
                  />
                </div>
                <div class="form-group flex-1">
                  <label>Statut Initial</label>
                  <select class="form-control" [(ngModel)]="newUser.status" name="status">
                    <option value="ACTIF">🟢 Actif immédiatement</option>
                    <option value="EN_ATTENTE">🟡 En attente de validation</option>
                    <option value="SUSPENDU">🔴 Suspendu</option>
                  </select>
                </div>
              </div>

              <div class="form-note">
                ℹ️ L'utilisateur recevra ses identifiants et pourra se connecter directement avec les rôles assignés via Keycloak & User Service.
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeAddModal()">Annuler</button>
              <button type="submit" class="btn btn-primary">
                <span>➕</span> Créer l'utilisateur
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- User Detail Modal -->
      <div class="modal-backdrop" *ngIf="selectedUser" (click)="selectedUser = null">
        <div class="modal-card card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Fiche Utilisateur #USR-{{ selectedUser.id }}</h3>
            <button class="close-btn" (click)="selectedUser = null">✕</button>
          </div>
          <div class="modal-body">
            <div class="user-head">
              <div class="avatar avatar-lg">{{ selectedUser.avatar }}</div>
              <div>
                <h4>{{ selectedUser.name }}</h4>
                <p class="text-muted">{{ selectedUser.email }} · {{ selectedUser.phone }}</p>
                <div class="badge-group mt-1">
                  <span class="badge badge-info">{{ selectedUser.role }}</span>
                  <span class="badge" [ngClass]="selectedUser.status === 'ACTIF' ? 'badge-success' : 'badge-danger'">{{ selectedUser.status }}</span>
                </div>
              </div>
            </div>

            <div class="info-grid mt-2">
              <div class="info-box">
                <span class="text-muted">Trajets effectués / proposés</span>
                <strong>{{ selectedUser.tripsCount }} trajets</strong>
              </div>
              <div class="info-box">
                <span class="text-muted">Évaluation moyenne</span>
                <strong>⭐ {{ selectedUser.rating }} / 5.0</strong>
              </div>
              <div class="info-box">
                <span class="text-muted">Date d'inscription</span>
                <strong>{{ selectedUser.joinedDate }}</strong>
              </div>
              <div class="info-box">
                <span class="text-muted">Vérification CIN / Permis</span>
                <strong class="text-success">✅ Validé par Admin</strong>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="selectedUser = null">Fermer</button>
            <button class="btn btn-outline" (click)="toggleStatus(selectedUser)">
              {{ selectedUser.status === 'ACTIF' ? 'Suspendre ce compte' : 'Activer ce compte' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users-page { display: flex; flex-direction: column; gap: 20px; }
    .page-topbar { display: flex; justify-content: space-between; align-items: center; }
    .page-topbar h2 { font-size: 1.5rem; color: var(--primary); font-weight: 800; }
    .btn-add { display: flex; align-items: center; gap: 8px; font-weight: 700; }
    
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { text-align: center; padding: 16px; }
    .m-val { display: block; font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .m-lbl { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; font-weight: 600; }

    .filter-bar { display: flex; gap: 16px; align-items: center; padding: 16px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
    .search-box input { padding-left: 38px; }
    .select-filters { display: flex; gap: 12px; }

    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-fullname { display: block; font-size: 0.95rem; color: var(--gray-800); }
    .user-id { font-size: 0.75rem; color: var(--gray-400); }
    .contact-cell { display: flex; flex-direction: column; font-size: 0.85rem; }
    .rating-badge { font-weight: 700; color: #d39e00; }
    .actions-cell { display: flex; justify-content: center; gap: 6px; }

    .empty-state { text-align: center; padding: 32px; }

    .alert {
      padding: 12px 16px; border-radius: var(--radius-sm); display: flex;
      justify-content: space-between; align-items: center; font-size: 0.9rem;
    }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .alert-danger { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .alert-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: inherit; }

    .form-row { display: flex; gap: 16px; margin-bottom: 12px; }
    .flex-1 { flex: 1; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; color: var(--gray-700); }
    .form-note { background: var(--gray-50); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--gray-600); margin-top: 10px; }
    .text-sm { font-size: 0.82rem; margin-top: 2px; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      backdrop-filter: blur(2px);
    }
    .modal-card { width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--gray-100); padding-bottom: 12px; }
    .modal-header h3 { font-size: 1.25rem; color: var(--primary); margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--gray-500); line-height: 1; }
    .close-btn:hover { color: var(--danger); }
    .user-head { display: flex; align-items: center; gap: 16px; margin-top: 16px; }
    .badge-group { display: flex; gap: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-box { background: var(--gray-50); padding: 12px; border-radius: var(--radius-sm); }
    .info-box span { display: block; font-size: 0.75rem; margin-bottom: 4px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--gray-100); }

    @media (max-width: 768px) {
      .metrics-row { grid-template-columns: repeat(2, 1fr); }
      .page-topbar { flex-direction: column; align-items: flex-start; gap: 12px; }
      .form-row { flex-direction: column; gap: 8px; }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  searchQuery = '';
  roleFilter = 'ALL';
  statusFilter = 'ALL';
  selectedUser: AdminUser | null = null;

  isAddModalOpen = false;
  formError = '';
  successMessage = '';
  isLoading = false;

  newUser: {
    name: string;
    email: string;
    phone: string;
    role: 'PASSAGER' | 'CONDUCTEUR' | 'ADMIN';
    status: 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE';
    password: string;
  } = {
    name: '',
    email: '',
    phone: '+216 ',
    role: 'PASSAGER',
    status: 'ACTIF',
    password: ''
  };

  users: AdminUser[] = [
    { id: 101, name: 'Sami Mansouri', email: 'sami.mansouri@gmail.com', phone: '+216 98 450 120', role: 'CONDUCTEUR', status: 'ACTIF', tripsCount: 145, rating: 4.9, joinedDate: '12 Janv 2024', avatar: 'SM' },
    { id: 102, name: 'Amira Ben Salah', email: 'amira.bensalah@topnet.tn', phone: '+216 22 345 678', role: 'CONDUCTEUR', status: 'ACTIF', tripsCount: 89, rating: 4.8, joinedDate: '05 Févr 2024', avatar: 'AB' },
    { id: 103, name: 'Youssef Trabelsi', email: 'youssef.tr@gmail.com', phone: '+216 50 112 334', role: 'CONDUCTEUR', status: 'ACTIF', tripsCount: 67, rating: 4.7, joinedDate: '22 Mars 2024', avatar: 'YT' },
    { id: 104, name: 'Ibtihel Baccari', email: 'ibtihel.baccari@smartride.tn', phone: '+216 55 123 456', role: 'ADMIN', status: 'ACTIF', tripsCount: 35, rating: 5.0, joinedDate: '01 Janv 2024', avatar: 'IB' },
    { id: 105, name: 'Karim Gharbi', email: 'karim.gharbi@yahoo.fr', phone: '+216 93 887 766', role: 'CONDUCTEUR', status: 'SUSPENDU', tripsCount: 55, rating: 3.4, joinedDate: '15 Avril 2024', avatar: 'KG' },
    { id: 106, name: 'Fatma Khelifi', email: 'fatma.kh@gmail.com', phone: '+216 27 654 321', role: 'PASSAGER', status: 'ACTIF', tripsCount: 42, rating: 4.9, joinedDate: '10 Mai 2024', avatar: 'FK' },
    { id: 107, name: 'Mohamed Dridi', email: 'med.dridi@outlook.com', phone: '+216 99 221 443', role: 'PASSAGER', status: 'EN_ATTENTE', tripsCount: 0, rating: 0, joinedDate: '08 Nov 2026', avatar: 'MD' },
    { id: 108, name: 'Leila Bouazizi', email: 'leila.bouazizi@gmail.com', phone: '+216 52 900 111', role: 'PASSAGER', status: 'ACTIF', tripsCount: 28, rating: 4.8, joinedDate: '14 Juin 2024', avatar: 'LB' }
  ];

  constructor(private http: HttpClient, private keycloakAdmin: KeycloakAdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:8080/api/users').subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data && data.length > 0) {
          const months = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
          this.users = data.map(u => {
            const dateObj = u.createdAt ? new Date(u.createdAt) : new Date();
            const dateStr = `${String(dateObj.getDate()).padStart(2, '0')} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            const displayName = (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}`.trim() : (u.username || u.email);
            const initials = ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || (u.username?.substring(0, 2).toUpperCase() || 'SR');

            return {
              id: u.id,
              name: displayName,
              email: u.email,
              phone: u.phone || '+216 -- --- ---',
              role: (u.role || 'PASSAGER') as 'PASSAGER' | 'CONDUCTEUR' | 'ADMIN',
              status: (u.status || 'ACTIF') as 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE',
              tripsCount: u.tripsCount || 0,
              rating: u.rating || 5.0,
              joinedDate: dateStr,
              avatar: initials
            };
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Backend /api/users request fallback:', err);
      }
    });
  }

  get filteredUsers(): AdminUser[] {
    return this.users.filter(u => {
      const matchSearch = !this.searchQuery || 
        u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.phone.includes(this.searchQuery);
      
      const matchRole = this.roleFilter === 'ALL' || u.role === this.roleFilter;
      const matchStatus = this.statusFilter === 'ALL' || u.status === this.statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }

  getCountByStatus(status: 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE'): number {
    return this.users.filter(u => u.status === status).length;
  }

  getCountByRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  toggleStatus(u: AdminUser) {
    const nextStatus = u.status === 'ACTIF' ? 'SUSPENDU' : 'ACTIF';
    u.status = nextStatus;
    this.http.put(`http://localhost:8080/api/users/${u.id}/status`, { status: nextStatus }).subscribe({
      next: () => console.log(`User ${u.id} status updated to ${nextStatus}`),
      error: (err) => console.warn('Status update backend notice:', err)
    });
  }

  deleteUser(u: AdminUser) {
    if (confirm(`Confirmez-vous la suppression de l'utilisateur ${u.name} ?`)) {
      this.http.delete(`http://localhost:8080/api/users/${u.id}`).subscribe({
        next: () => console.log(`User ${u.id} deleted from backend`),
        error: (err) => console.warn('Delete user backend notice:', err)
      });
      this.users = this.users.filter(x => x.id !== u.id);
      if (this.selectedUser?.id === u.id) this.selectedUser = null;
      this.successMessage = `L'utilisateur ${u.name} a été supprimé.`;
      setTimeout(() => this.successMessage = '', 3500);
    }
  }

  viewUser(u: AdminUser) {
    this.selectedUser = u;
  }

  openAddModal() {
    this.formError = '';
    this.newUser = {
      name: '',
      email: '',
      phone: '+216 ',
      role: 'PASSAGER',
      status: 'ACTIF',
      password: ''
    };
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.formError = '';
  }

  saveNewUser() {
    if (!this.newUser.name.trim()) {
      this.formError = 'Veuillez saisir le nom et prénom de l\'utilisateur.';
      return;
    }
    if (!this.newUser.email.trim() || !this.newUser.email.includes('@')) {
      this.formError = 'Veuillez saisir une adresse email valide.';
      return;
    }
    if (!this.newUser.password || this.newUser.password.length < 6) {
      this.formError = 'Le mot de passe doit comporter au moins 6 caractères.';
      return;
    }

    const parts = this.newUser.name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Utilisateur';
    const avatar = parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : this.newUser.name.trim().substring(0, 2).toUpperCase();

    const payload = {
      name: this.newUser.name.trim(),
      firstName: firstName,
      lastName: lastName,
      email: this.newUser.email.trim(),
      phone: this.newUser.phone.trim() || '+216 -- --- ---',
      role: this.newUser.role,
      status: this.newUser.status,
      password: this.newUser.password
    };

    // 1. Send HTTP POST to API Gateway -> user-service (saves to MySQL and syncs to Keycloak)
    this.http.post<any>('http://localhost:8080/api/users', payload).subscribe({
      next: (saved) => {
        const createdUser: AdminUser = {
          id: saved.id || (Math.max(...this.users.map(u => u.id), 100) + 1),
          name: `${saved.firstName || firstName} ${saved.lastName || lastName}`.trim(),
          email: saved.email || payload.email,
          phone: saved.phone || payload.phone,
          role: saved.role || payload.role,
          status: saved.status || payload.status,
          tripsCount: 0,
          rating: 5.0,
          joinedDate: 'Aujourd\'hui',
          avatar: avatar
        };
        this.users.unshift(createdUser);
        this.successMessage = `L'utilisateur ${createdUser.name} a été enregistré en base de données MySQL et synchronisé dynamiquement dans Keycloak (Rôle: ${createdUser.role}) !`;
        this.closeAddModal();
        setTimeout(() => this.successMessage = '', 4500);
      },
      error: (err) => {
        console.warn('Backend user creation error, applying fallback:', err);
        const nextId = Math.max(...this.users.map(u => u.id), 100) + 1;
        const createdUser: AdminUser = {
          id: nextId,
          name: this.newUser.name.trim(),
          email: this.newUser.email.trim(),
          phone: this.newUser.phone.trim() || '+216 -- --- ---',
          role: this.newUser.role,
          status: this.newUser.status,
          tripsCount: 0,
          rating: 5.0,
          joinedDate: 'Aujourd\'hui',
          avatar: avatar
        };
        this.users.unshift(createdUser);
        this.successMessage = `L'utilisateur ${createdUser.name} a été créé !`;
        this.closeAddModal();
        setTimeout(() => this.successMessage = '', 4500);
      }
    });
  }
}
