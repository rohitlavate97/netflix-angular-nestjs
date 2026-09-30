import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer
      class="bg-black/90 border-t border-zinc-800/80 text-zinc-500 py-12 px-6 md:px-16 mt-20 text-xs select-none"
    >
      <div class="max-w-6xl mx-auto space-y-6">
        <p class="text-zinc-400 hover:underline cursor-pointer">
          Questions? Call <span class="text-white">1-800-STREAMFLIX</span>
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-3 gap-x-6 text-[13px]">
          <a href="#faq" class="hover:underline hover:text-zinc-300 transition-colors">FAQ</a>
          <a href="#help" class="hover:underline hover:text-zinc-300 transition-colors">Help Center</a>
          <a href="#account" class="hover:underline hover:text-zinc-300 transition-colors">Account</a>
          <a href="#media" class="hover:underline hover:text-zinc-300 transition-colors">Media Centre</a>
          <a href="#investor" class="hover:underline hover:text-zinc-300 transition-colors">Investor Relations</a>
          <a href="#jobs" class="hover:underline hover:text-zinc-300 transition-colors">Jobs</a>
          <a href="#ways" class="hover:underline hover:text-zinc-300 transition-colors">Ways to Watch</a>
          <a href="#terms" class="hover:underline hover:text-zinc-300 transition-colors">Terms of Use</a>
          <a href="#privacy" class="hover:underline hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="#cookies" class="hover:underline hover:text-zinc-300 transition-colors">Cookie Preferences</a>
          <a href="#corporate" class="hover:underline hover:text-zinc-300 transition-colors">Corporate Information</a>
          <a href="#contact" class="hover:underline hover:text-zinc-300 transition-colors">Contact Us</a>
          <a href="#speedtest" class="hover:underline hover:text-zinc-300 transition-colors">Speed Test</a>
          <a href="#legal" class="hover:underline hover:text-zinc-300 transition-colors">Legal Notices</a>
          <a href="#originals" class="hover:underline hover:text-zinc-300 transition-colors">Only on StreamFlix</a>
        </div>

        <!-- Netflix Service Code Easter Egg -->
        <div class="pt-4">
          @if (!serviceCode()) {
            <button
              type="button"
              (click)="generateServiceCode()"
              class="border border-zinc-700 px-3 py-1.5 text-zinc-400 hover:text-white hover:border-zinc-500 rounded text-xs transition-colors"
            >
              Service Code
            </button>
          } @else {
            <span class="inline-block border border-zinc-700 px-3 py-1.5 text-zinc-300 rounded font-mono text-xs">
              {{ serviceCode() }}
            </span>
          }
        </div>

        <div class="pt-2 text-zinc-600 space-y-1">
          <p>© 2026 StreamFlix Inc. Built with Angular 19 Standalone + NestJS Architecture.</p>
          <p class="text-[11px] text-zinc-600">
            Engineered with modern reactive Signals, modular monorepo boundaries, HLS multi-bitrate streaming pipeline, and PostgreSQL + Redis infrastructure.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly serviceCode = signal<string | null>(null);

  generateServiceCode(): void {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(100 + Math.random() * 900);
    this.serviceCode.set(`${part1}-${part2}`);
  }
}
