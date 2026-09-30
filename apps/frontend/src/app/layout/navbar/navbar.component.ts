import {
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileDto } from '@netflix/shared-types';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-12 py-3 md:py-4 flex items-center justify-between"
      [ngClass]="(isScrolled() || isMobileMenuOpen())
        ? 'bg-[#141414] shadow-xl border-b border-zinc-800'
        : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'"
    >
      <!-- Left: Logo & Primary Desktop Navigation -->
      <div class="flex items-center space-x-6 lg:space-x-10">
        <!-- Brand Logo -->
        <a
          routerLink="/"
          class="text-netflix-red font-black text-2xl md:text-3xl tracking-tighter uppercase select-none hover:opacity-95 transition-opacity inline-flex items-center space-x-1"
        >
          <span>StreamFlix</span>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-5 text-sm font-medium text-zinc-300">
          <a
            routerLink="/"
            routerLinkActive="text-white font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="hover:text-zinc-400 transition-colors"
          >
            Home
          </a>
          <a
            routerLink="/series"
            routerLinkActive="text-white font-bold"
            class="hover:text-zinc-400 transition-colors"
          >
            TV Shows
          </a>
          <a
            routerLink="/movies"
            routerLinkActive="text-white font-bold"
            class="hover:text-zinc-400 transition-colors"
          >
            Movies
          </a>
          <a
            routerLink="/new-popular"
            routerLinkActive="text-white font-bold"
            class="hover:text-zinc-400 transition-colors"
          >
            New & Popular
          </a>
          <a
            routerLink="/my-list"
            routerLinkActive="text-white font-bold"
            class="hover:text-zinc-400 transition-colors"
          >
            My List
          </a>
        </nav>
      </div>

      <!-- Right: Search, Notifications, Profile Dropdown & Mobile Hamburger -->
      <div class="flex items-center space-x-3 md:space-x-5 text-sm">
        <!-- Interactive Search Bar -->
        <div class="relative flex items-center">
          <div
            class="flex items-center transition-all duration-300 rounded border"
            [ngClass]="isSearchOpen()
              ? 'w-48 md:w-64 bg-black/80 border-white/40 px-2 py-1'
              : 'w-8 border-transparent'"
          >
            <button
              type="button"
              (click)="toggleSearch()"
              aria-label="Search toggle"
              class="text-zinc-300 hover:text-white transition-colors focus:outline-none"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            @if (isSearchOpen()) {
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="executeSearch()"
                placeholder="Titles, people, genres"
                class="bg-transparent text-white text-xs px-2 w-full focus:outline-none placeholder-zinc-500"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="searchQuery = ''"
                  class="text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              }
            }
          </div>
        </div>

        <!-- Kids Badge if active profile is kids -->
        @if (profileService.isKidsMode()) {
          <span
            class="hidden sm:inline-block text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-black tracking-wider uppercase"
          >
            Kids
          </span>
        }

        <!-- Notifications Bell -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleNotifications()"
            aria-label="Notifications"
            class="relative text-zinc-300 hover:text-white transition-colors pt-1 focus:outline-none"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            @if (unreadCount() > 0) {
              <span
                class="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-netflix-red text-white text-[10px] font-bold flex items-center justify-center"
              >
                {{ unreadCount() }}
              </span>
            }
          </button>

          <!-- Notifications Flyout -->
          @if (isNotificationsOpen()) {
            <div
              class="absolute right-0 mt-3 w-80 bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-2xl backdrop-blur-md p-3 z-50 text-xs divide-y divide-zinc-800"
            >
              <div class="py-2 flex items-start space-x-3 hover:bg-zinc-800/50 p-2 rounded cursor-pointer">
                <div class="w-2 h-2 rounded-full bg-netflix-red mt-1.5 shrink-0"></div>
                <div>
                  <p class="font-bold text-white">New Release: The Neural Grid</p>
                  <p class="text-zinc-400 text-[11px]">Season 2 is now streaming globally.</p>
                </div>
              </div>
              <div class="py-2 flex items-start space-x-3 hover:bg-zinc-800/50 p-2 rounded cursor-pointer">
                <div class="w-2 h-2 rounded-full bg-netflix-red mt-1.5 shrink-0"></div>
                <div>
                  <p class="font-bold text-white">Continue Watching</p>
                  <p class="text-zinc-400 text-[11px]">Shadow Protocol: 45 minutes remaining.</p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleProfileMenu()"
            class="flex items-center space-x-2 group focus:outline-none"
            aria-label="Profile menu"
          >
            <!-- Avatar with fallback -->
            <div
              class="w-8 h-8 rounded overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md border border-zinc-700 group-hover:border-white transition-colors"
            >
              @if (currentProfile()?.avatarUrl) {
                <img
                  [src]="currentProfile()?.avatarUrl"
                  [alt]="currentProfile()?.name"
                  class="w-full h-full object-cover"
                />
              } @else {
                <span>{{ profileInitials() }}</span>
              }
            </div>

            <!-- Caret -->
            <svg
              class="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200"
              [class.rotate-180]="isProfileMenuOpen()"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Profile Dropdown Menu -->
          @if (isProfileMenuOpen()) {
            <div
              class="absolute right-0 mt-3 w-56 bg-black/95 border border-zinc-800 rounded-md shadow-2xl py-3 z-50 text-xs backdrop-blur-md"
            >
              <!-- Profile List -->
              <div class="px-2 pb-2 space-y-1 border-b border-zinc-800">
                @for (prof of profileService.profiles(); track prof.id) {
                  <button
                    type="button"
                    (click)="selectProfile(prof)"
                    class="w-full flex items-center space-x-3 px-2 py-1.5 rounded hover:bg-zinc-800/80 transition-colors text-left"
                    [class.bg-zinc-800]="prof.id === currentProfile()?.id"
                  >
                    <div
                      class="w-7 h-7 rounded overflow-hidden bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    >
                      @if (prof.avatarUrl) {
                        <img
                          [src]="prof.avatarUrl"
                          [alt]="prof.name"
                          class="w-full h-full object-cover"
                        />
                      } @else {
                        <span>{{ prof.name.slice(0, 1).toUpperCase() }}</span>
                      }
                    </div>
                    <span class="truncate font-medium text-zinc-200">{{ prof.name }}</span>
                    @if (prof.id === currentProfile()?.id) {
                      <span class="text-netflix-red ml-auto text-[10px]">●</span>
                    }
                  </button>
                }
              </div>

              <!-- Profile Management & Navigation -->
              <div class="pt-2 px-2 space-y-1">
                <a
                  routerLink="/profiles"
                  (click)="isProfileMenuOpen.set(false)"
                  class="block px-2 py-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  Manage Profiles
                </a>
                <a
                  routerLink="/profiles"
                  (click)="isProfileMenuOpen.set(false)"
                  class="block px-2 py-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  Account
                </a>
                <a
                  routerLink="/"
                  (click)="isProfileMenuOpen.set(false)"
                  class="block px-2 py-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  Help Center
                </a>
              </div>

              <div class="mt-2 pt-2 border-t border-zinc-800 px-2">
                <button
                  type="button"
                  (click)="logout()"
                  class="w-full text-left px-2 py-1.5 rounded text-zinc-400 hover:text-white hover:bg-red-950/40 transition-colors"
                >
                  Sign out of StreamFlix
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          (click)="toggleMobileMenu()"
          aria-label="Toggle mobile menu"
          class="md:hidden text-zinc-300 hover:text-white focus:outline-none p-1"
        >
          @if (isMobileMenuOpen()) {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        </button>
      </div>

      <!-- Mobile Navigation Drawer / Overlay -->
      @if (isMobileMenuOpen()) {
        <div
          class="md:hidden fixed top-[56px] inset-x-0 bottom-0 bg-[#141414] border-t border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto z-40 backdrop-blur-lg"
        >
          <div class="space-y-6">
            <!-- Active Profile Indicator -->
            <div class="flex items-center space-x-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <div
                class="w-10 h-10 rounded overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white"
              >
                @if (currentProfile()?.avatarUrl) {
                  <img [src]="currentProfile()?.avatarUrl" [alt]="currentProfile()?.name" class="w-full h-full object-cover" />
                } @else {
                  <span>{{ profileInitials() }}</span>
                }
              </div>
              <div>
                <p class="font-bold text-white text-sm">{{ currentProfile()?.name || 'User Profile' }}</p>
                <a routerLink="/profiles" (click)="closeMobileMenu()" class="text-xs text-netflix-red hover:underline">
                  Switch Profiles
                </a>
              </div>
            </div>

            <!-- Primary Mobile Links -->
            <nav class="flex flex-col space-y-4 text-base font-semibold text-zinc-300">
              <a
                routerLink="/"
                (click)="closeMobileMenu()"
                routerLinkActive="text-netflix-red font-bold"
                [routerLinkActiveOptions]="{ exact: true }"
                class="hover:text-white py-1"
              >
                Home
              </a>
              <a
                routerLink="/series"
                (click)="closeMobileMenu()"
                routerLinkActive="text-netflix-red font-bold"
                class="hover:text-white py-1"
              >
                TV Shows
              </a>
              <a
                routerLink="/movies"
                (click)="closeMobileMenu()"
                routerLinkActive="text-netflix-red font-bold"
                class="hover:text-white py-1"
              >
                Movies
              </a>
              <a
                routerLink="/new-popular"
                (click)="closeMobileMenu()"
                routerLinkActive="text-netflix-red font-bold"
                class="hover:text-white py-1"
              >
                New & Popular
              </a>
              <a
                routerLink="/my-list"
                (click)="closeMobileMenu()"
                routerLinkActive="text-netflix-red font-bold"
                class="hover:text-white py-1"
              >
                My List
              </a>
            </nav>
          </div>

          <!-- Bottom Actions on Mobile -->
          <div class="pt-6 border-t border-zinc-800 space-y-3 text-sm text-zinc-400">
            <a routerLink="/profiles" (click)="closeMobileMenu()" class="block hover:text-white">
              Manage Profiles
            </a>
            <button
              type="button"
              (click)="logout(); closeMobileMenu()"
              class="w-full text-left text-netflix-red font-semibold pt-2"
            >
              Sign out of StreamFlix
            </button>
          </div>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  readonly profileService = inject(ProfileService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isScrolled = signal(false);
  readonly isSearchOpen = signal(false);
  readonly isNotificationsOpen = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly unreadCount = signal(2);

  searchQuery = '';

  readonly currentProfile = this.profileService.currentProfile;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 20);
    }
  }

  profileInitials(): string {
    const name = this.currentProfile()?.name || 'U';
    return name.slice(0, 1).toUpperCase();
  }

  toggleSearch(): void {
    this.isSearchOpen.update((v) => !v);
  }

  executeSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/movies'], { queryParams: { search: this.searchQuery.trim() } });
      this.isSearchOpen.set(false);
    }
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update((v) => !v);
    this.isProfileMenuOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((v) => !v);
    this.isNotificationsOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  selectProfile(profile: UserProfileDto): void {
    this.profileService.setCurrentProfile(profile);
    this.isProfileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.isProfileMenuOpen.set(false);
  }
}
