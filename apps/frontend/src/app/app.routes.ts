import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'browse',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'movies',
    loadComponent: () => import('./features/movies/movies.component').then((m) => m.MoviesComponent),
  },
  {
    path: 'series',
    loadComponent: () => import('./features/series/series.component').then((m) => m.SeriesComponent),
  },
  {
    path: 'new-popular',
    loadComponent: () =>
      import('./features/new-popular/new-popular.component').then((m) => m.NewPopularComponent),
  },
  {
    path: 'my-list',
    loadComponent: () => import('./features/my-list/my-list.component').then((m) => m.MyListComponent),
  },
  {
    path: 'title/:id',
    loadComponent: () =>
      import('./features/details/content-details.component').then((m) => m.ContentDetailsComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'profiles',
    loadComponent: () =>
      import('./features/profiles/profiles.component').then((m) => m.ProfilesComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/watch-history.component').then((m) => m.WatchHistoryComponent),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
