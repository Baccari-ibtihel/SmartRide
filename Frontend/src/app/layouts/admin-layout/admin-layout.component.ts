import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sidebar -->
    <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
      <div class="sidebar-header">
        <span class="sidebar-logo">🚗</span>
        <span class="sidebar-title" *ngIf="!sidebarCollapsed">Smart<strong>Ride</strong> Admin</span>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Tableau de bord</span>
        </a>
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Utilisateurs</span>
        </a>
        <a routerLink="/admin/trips" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🚗</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Trajets</span>
        </a>
        <a routerLink="/admin/bookings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Réservations</span>
        </a>
        <a routerLink="/admin/payments" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">💳</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Paiements</span>
        </a>
        <a routerLink="/admin/ratings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⭐</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Évaluations</span>
        </a>
        <a routerLink="/admin/matching" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🤖</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Matching IA</span>
        </a>
        <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Paramètres</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/user/home" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label" *ngIf="!sidebarCollapsed">Retour au site</span>
        </a>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="admin-main" [class.expanded]="sidebarCollapsed">
      <!-- Top Bar -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="toggle-btn" (click)="sidebarCollapsed = !sidebarCollapsed">
            {{ sidebarCollapsed ? '☰' : '✕' }}
          </button>
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        <div class="topbar-right">
          <div class="search-bar">
            <input type="text" placeholder="Rechercher..." class="topbar-search">
          </div>
          <div class="notif-bell">
            🔔 <span class="notif-count">5</span>
          </div>
          <div class="admin-profile">
            <div class="avatar-sm">AD</div>
            <span class="admin-name">Admin</span>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; min-height: 100vh; background: var(--bg); }

    /* Sidebar */
    .sidebar {
      width: 260px; background: var(--primary); color: white;
      display: flex; flex-direction: column; position: fixed;
      top: 0; left: 0; bottom: 0; z-index: 100; transition: width 0.3s ease;
      overflow: hidden;
    }
    .sidebar.collapsed { width: 72px; }

    .sidebar-header {
      padding: 20px; display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1); min-height: 64px;
    }
    .sidebar-logo { font-size: 1.5rem; }
    .sidebar-title { font-size: 1.1rem; white-space: nowrap; }
    .sidebar-title strong { color: var(--accent-light); }

    .sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-radius: var(--radius-sm); color: rgba(255,255,255,0.7);
      transition: var(--transition); text-decoration: none; white-space: nowrap;
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active {
      background: rgba(14,133,163,0.25); color: white;
      border-left: 3px solid var(--accent-light);
    }
    .nav-icon { font-size: 1.15rem; width: 24px; text-align: center; flex-shrink: 0; }
    .nav-label { font-size: 0.9rem; font-weight: 500; }

    .sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.1); }

    /* Main */
    .admin-main {
      margin-left: 260px; flex: 1; transition: margin-left 0.3s ease;
      display: flex; flex-direction: column; min-height: 100vh;
    }
    .admin-main.expanded { margin-left: 72px; }

    .admin-topbar {
      background: var(--white); height: 64px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 24px; box-shadow: var(--shadow-sm);
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-left { display: flex; align-items: center; gap: 16px; }
    .toggle-btn {
      background: none; border: none; font-size: 1.3rem; cursor: pointer;
      padding: 6px 10px; border-radius: var(--radius-sm); transition: var(--transition);
      color: var(--gray-600);
    }
    .toggle-btn:hover { background: var(--gray-100); }
    .page-title { font-size: 1.15rem; font-weight: 700; color: var(--primary); }

    .topbar-right { display: flex; align-items: center; gap: 20px; }
    .topbar-search {
      padding: 8px 16px; border: 2px solid var(--gray-200); border-radius: 20px;
      font-size: 0.85rem; width: 240px; transition: var(--transition);
      font-family: var(--font);
    }
    .topbar-search:focus { outline: none; border-color: var(--accent); width: 300px; }

    .notif-bell { position: relative; font-size: 1.2rem; cursor: pointer; }
    .notif-count {
      position: absolute; top: -6px; right: -8px; background: var(--danger);
      color: white; font-size: 0.6rem; padding: 2px 5px; border-radius: 10px; font-weight: 700;
    }

    .admin-profile { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .avatar-sm {
      width: 34px; height: 34px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem;
    }
    .admin-name { font-size: 0.85rem; font-weight: 600; color: var(--gray-700); }

    .admin-content { padding: 24px; flex: 1; }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); width: 260px; }
      .sidebar.collapsed { transform: translateX(-100%); }
      .admin-main { margin-left: 0; }
      .admin-main.expanded { margin-left: 0; }
      .topbar-search { display: none; }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;
  pageTitle = 'Tableau de bord';
}
