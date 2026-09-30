import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FeaturedContent {
  title: string;
  description: string;
  tagline: string;
  rating: string;
  year: number;
  duration: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen text-white">
      <!-- Hero Banner Section -->
      <section
        class="relative w-full h-[75vh] md:h-[85vh] flex items-center bg-cover bg-center overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40 z-10"
        ></div>

        <!-- Fictional Hero Background Visual -->
        <div class="absolute inset-0 bg-gradient-to-br from-zinc-900 via-indigo-950/40 to-black">
          <div
            class="w-full h-full opacity-30 bg-[radial-gradient(#e50914_1px,transparent_1px)] [background-size:16px_16px]"
          ></div>
        </div>

        <!-- Hero Content Overlay -->
        <div class="relative z-20 max-w-2xl px-6 md:px-16 space-y-4">
          <div
            class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-red-400 border border-white/10"
          >
            <span>Trending #1</span>
          </div>
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
            {{ hero().title }}
          </h1>
          <p class="text-sm md:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow">
            {{ hero().description }}
          </p>
          <div class="flex items-center space-x-4 pt-2">
            <button
              class="flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-gray-200 transition-colors shadow-lg"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span>Play</span>
            </button>
            <button
              class="flex items-center space-x-2 bg-zinc-600/70 text-white px-6 py-2.5 rounded font-bold hover:bg-zinc-600/50 transition-colors backdrop-blur-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>More Info</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Content Rows -->
      <section class="relative z-20 -mt-20 md:-mt-32 px-6 md:px-16 space-y-10 pb-16">
        <div>
          <h2 class="text-lg md:text-xl font-bold mb-4 text-gray-100 flex items-center space-x-2">
            <span>Trending Now</span>
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            @for (item of trendingList(); track item) {
              <div
                class="group relative rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 hover:scale-105 hover:z-30 transition-transform duration-300 cursor-pointer shadow-md aspect-[16/9] flex items-end p-3 bg-gradient-to-t from-black via-zinc-900/60 to-zinc-900"
              >
                <span class="text-xs font-semibold text-white drop-shadow">{{ item }}</span>
              </div>
            }
          </div>
        </div>

        <div>
          <h2 class="text-lg md:text-xl font-bold mb-4 text-gray-100 flex items-center space-x-2">
            <span>Popular Movies</span>
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            @for (item of popularList(); track item) {
              <div
                class="group relative rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 hover:scale-105 hover:z-30 transition-transform duration-300 cursor-pointer shadow-md aspect-[16/9] flex items-end p-3 bg-gradient-to-t from-black via-zinc-900/60 to-zinc-900"
              >
                <span class="text-xs font-semibold text-white drop-shadow">{{ item }}</span>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  `,
})
export class HomeComponent {
  readonly hero = signal<FeaturedContent>({
    title: 'The Last Horizon',
    tagline: 'Beyond the edge of human knowledge lies our final destination.',
    description:
      'When deep space anomaly code 404 fractures the orbital network, a rogue crew embarks across the unknown sector to restore humanity’s collective conscience.',
    rating: '16+',
    year: 2026,
    duration: '2h 18m',
  });

  readonly trendingList = signal<string[]>([
    'Shadow Protocol',
    'Mumbai Nights',
    'Quantum Code',
    'The Silent Planet',
    'Code 404',
    'Beyond Tomorrow',
  ]);

  readonly popularList = signal<string[]>([
    'Neon District',
    'Echoes of Silicon',
    'The Dark Web Odyssey',
    'Solar Flare',
    'Neural Shift',
    'Cosmic Voyager',
  ]);
}
