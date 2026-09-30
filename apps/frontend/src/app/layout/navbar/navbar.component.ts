import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm px-4 md:px-12 py-4 flex items-center justify-between"
    >
      <div class="flex items-center space-x-6 md:space-x-10">
        <a
          routerLink="/"
          class="text-netflix-red font-black text-2xl md:text-3xl tracking-tighter uppercase select-none hover:opacity-95 transition-opacity"
        >
          StreamFlix
        </a>
        <nav class="hidden md:flex items-center space-x-5 text-sm font-medium text-gray-300">
          <a
            routerLink="/"
            routerLinkActive="text-white font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="hover:text-gray-400 transition-colors"
            >Home</a
          >
          <a
            routerLink="/series"
            routerLinkActive="text-white font-bold"
            class="hover:text-gray-400 transition-colors"
            >Series</a
          >
          <a
            routerLink="/movies"
            routerLinkActive="text-white font-bold"
            class="hover:text-gray-400 transition-colors"
            >Movies</a
          >
          <a
            routerLink="/new-popular"
            routerLinkActive="text-white font-bold"
            class="hover:text-gray-400 transition-colors"
            >New & Popular</a
          >
          <a
            routerLink="/my-list"
            routerLinkActive="text-white font-bold"
            class="hover:text-gray-400 transition-colors"
            >My List</a
          >
        </nav>
      </div>

      <div class="flex items-center space-x-4 md:space-x-6 text-sm">
        <button
          type="button"
          aria-label="Search"
          class="text-gray-300 hover:text-white transition-colors"
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
        <span
          class="text-xs bg-netflix-red text-white px-2 py-0.5 rounded font-semibold tracking-wider uppercase"
          >Demo</span
        >
        <div
          class="w-8 h-8 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer"
        >
          U
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly isScrolled = signal(false);
}
