import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer
      class="bg-black/80 border-t border-zinc-800/80 text-zinc-500 py-10 px-4 md:px-16 mt-20 text-xs"
    >
      <div class="max-w-6xl mx-auto space-y-6">
        <p class="hover:underline cursor-pointer">Questions? Contact Us</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="#" class="hover:underline">FAQ</a>
          <a href="#" class="hover:underline">Help Center</a>
          <a href="#" class="hover:underline">Account</a>
          <a href="#" class="hover:underline">Media Centre</a>
          <a href="#" class="hover:underline">Investor Relations</a>
          <a href="#" class="hover:underline">Jobs</a>
          <a href="#" class="hover:underline">Terms of Use</a>
          <a href="#" class="hover:underline">Privacy</a>
          <a href="#" class="hover:underline">Cookie Preferences</a>
          <a href="#" class="hover:underline">Corporate Information</a>
          <a href="#" class="hover:underline">Contact Us</a>
          <a href="#" class="hover:underline">Speed Test</a>
        </div>
        <p class="pt-4 text-zinc-600">
          Netflix Clone — Angular 19 + NestJS Architecture Demo Platform. Fictional media
          demonstration.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
