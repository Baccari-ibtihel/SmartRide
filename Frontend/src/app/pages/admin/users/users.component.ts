import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
        <button class="btn btn-primary" (click)="openAddModal()">
          <span>➕</span> Nouvel Utilisateur
        </button>
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

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-card { width: 100%; max-width: 540px; animation: slideIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-100); padding-bottom: 12px; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--gray-500); }
    .user-head { display: flex; align-items: center; gap: 16px; margin-top: 16px; }
    .badge-group { display: flex; gap: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-box { background: var(--gray-50); padding: 12px; border-radius: var(--radius-sm); }
    .info-box span { display: block; font-size: 0.75rem; margin-bottom: 4px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--gray-100); }

    @media (max-width: 768px) {
      .metrics-row { grid-template-columns: repeat(2, 1fr); }
      .page-topbar { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class AdminUsersComponent {
  searchQuery = '';
  roleFilter = 'ALL';
  statusFilter = 'ALL';
  selectedUser: AdminUser | null = null;

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
    u.status = u.status === 'ACTIF' ? 'SUSPENDU' : 'ACTIF';
  }

  deleteUser(u: AdminUser) {
    if (confirm(`Confirmez-vous la suppression de l'utilisateur ${u.name} ?`)) {
      this.users = this.users.filter(x => x.id !== u.id);
      if (this.selectedUser?.id === u.id) this.selectedUser = null;
    }
  }

  viewUser(u: AdminUser) {
    this.selectedUser = u;
  }

  openAddModal() {
    alert('Formulaire d\'ajout rapide activé : vous pouvez inviter de nouveaux utilisateurs ou modérateurs.');
  }
}
