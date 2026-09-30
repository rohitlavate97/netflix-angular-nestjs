import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfileDto } from '@netflix/shared-types';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main
      class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-[#141414] text-white select-none"
    >
      <div class="text-center space-y-8 max-w-4xl w-full">
        <h1 class="text-3xl md:text-5xl font-medium tracking-tight">
          {{ isManaging() ? 'Manage Profiles:' : "Who's watching?" }}
        </h1>

        <!-- Profile Avatars List -->
        <div class="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-4">
          @for (profile of profileService.profiles(); track profile.id) {
            <div
              (click)="onSelectProfile(profile)"
              class="group flex flex-col items-center space-y-3 cursor-pointer"
            >
              <!-- Avatar Card -->
              <div
                class="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden border-2 transition-all duration-200 group-hover:border-white shadow-xl"
                [class.border-transparent]="profile.id !== currentProfile()?.id"
                [class.border-netflix-red]="profile.id === currentProfile()?.id"
              >
                @if (profile.avatarUrl) {
                  <img
                    [src]="profile.avatarUrl"
                    [alt]="profile.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                } @else {
                  <div
                    class="w-full h-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-3xl font-bold"
                  >
                    {{ profile.name.slice(0, 1).toUpperCase() }}
                  </div>
                }

                <!-- Kids Indicator Badge -->
                @if (profile.isKids) {
                  <span
                    class="absolute bottom-1 right-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow uppercase"
                  >
                    Kids
                  </span>
                }

                <!-- Lock PIN Badge -->
                @if (profile.hasPin) {
                  <div
                    class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-zinc-300 shadow"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                }

                <!-- Manage Overlay Icon -->
                @if (isManaging()) {
                  <div
                    class="absolute inset-0 bg-black/60 flex items-center justify-center text-white"
                  >
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                }
              </div>

              <!-- Profile Name -->
              <span
                class="text-sm md:text-base text-zinc-400 group-hover:text-white transition-colors"
                [class.text-white]="profile.id === currentProfile()?.id"
              >
                {{ profile.name }}
              </span>
            </div>
          }

          <!-- Add Profile Button (if < 5 profiles) -->
          @if (profileService.profiles().length < 5) {
            <div
              (click)="showAddModal.set(true)"
              class="group flex flex-col items-center space-y-3 cursor-pointer"
            >
              <div
                class="w-24 h-24 sm:w-32 sm:h-32 rounded-md border-2 border-zinc-700 border-dashed flex items-center justify-center text-zinc-400 group-hover:border-white group-hover:text-white transition-colors"
              >
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span class="text-sm md:text-base text-zinc-400 group-hover:text-white">Add Profile</span>
            </div>
          }
        </div>

        <!-- Manage Profiles Toggle Button -->
        <div class="pt-8">
          <button
            type="button"
            (click)="toggleManaging()"
            class="px-8 py-2 border border-zinc-600 text-zinc-400 text-sm md:text-base tracking-wider uppercase font-semibold hover:border-white hover:text-white transition-colors"
          >
            {{ isManaging() ? 'Done' : 'Manage Profiles' }}
          </button>
        </div>
      </div>

      <!-- Add Profile Modal -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 class="text-xl font-bold">Add Profile</h3>
            <p class="text-xs text-zinc-400">Add a profile for another person watching StreamFlix.</p>

            <div>
              <input
                type="text"
                [(ngModel)]="newProfileName"
                placeholder="Profile Name"
                class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div class="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isKidsCheckbox"
                [(ngModel)]="newProfileIsKids"
                class="w-4 h-4 accent-netflix-red rounded"
              />
              <label for="isKidsCheckbox" class="text-xs text-zinc-300">Kid? (Only shows content rated 7+ or below)</label>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="showAddModal.set(false)"
                class="px-4 py-2 border border-zinc-700 text-xs rounded text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="createProfile()"
                [disabled]="!newProfileName.trim()"
                class="px-5 py-2 bg-netflix-red disabled:opacity-50 text-white text-xs font-semibold rounded hover:bg-netflix-darkRed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      }
    </main>
  `,
})
export class ProfilesComponent {
  readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly currentProfile = this.profileService.currentProfile;
  readonly isManaging = signal(false);
  readonly showAddModal = signal(false);

  newProfileName = '';
  newProfileIsKids = false;

  toggleManaging(): void {
    this.isManaging.update((v) => !v);
  }

  onSelectProfile(profile: UserProfileDto): void {
    if (this.isManaging()) {
      return;
    }
    this.profileService.setCurrentProfile(profile);
    this.router.navigate(['/']);
  }

  createProfile(): void {
    if (!this.newProfileName.trim()) return;

    this.profileService
      .createProfile({
        name: this.newProfileName.trim(),
        isKids: this.newProfileIsKids,
        maturityRating: this.newProfileIsKids ? '7+' : '18+',
      })
      .subscribe({
        next: (_created) => {
          this.showAddModal.set(false);
          this.newProfileName = '';
          this.newProfileIsKids = false;
        },
        error: () => {
          // If offline demo
          const dummy: UserProfileDto = {
            id: `profile-${Date.now()}`,
            userId: 'demo-user-id',
            name: this.newProfileName.trim(),
            avatarUrl: 'https://assets.streamflix.local/avatars/netflix-avatar-green.png',
            isKids: this.newProfileIsKids,
            maturityRating: this.newProfileIsKids ? '7+' : '18+',
            language: 'en',
            hasPin: false,
            autoplayNext: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.profileService.profiles.update((list) => [...list, dummy]);
          this.showAddModal.set(false);
          this.newProfileName = '';
          this.newProfileIsKids = false;
        },
      });
  }
}
