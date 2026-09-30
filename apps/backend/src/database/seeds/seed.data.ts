import { UserRole, ContentStatus } from '@netflix/shared-types';

export const SEED_GENRES = [
  { name: 'Action', slug: 'action' },
  { name: 'Sci-Fi', slug: 'sci-fi' },
  { name: 'Thriller', slug: 'thriller' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Horror', slug: 'horror' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Documentary', slug: 'documentary' },
  { name: 'Animation', slug: 'animation' },
  { name: 'Crime', slug: 'crime' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Adventure', slug: 'adventure' },
];

export const SEED_CATEGORIES = [
  { name: 'Trending Now', slug: 'trending-now', displayOrder: 1 },
  { name: 'Popular Movies', slug: 'popular-movies', displayOrder: 2 },
  { name: 'Popular Series', slug: 'popular-series', displayOrder: 3 },
  { name: 'New Releases', slug: 'new-releases', displayOrder: 4 },
  { name: 'Top Rated', slug: 'top-rated', displayOrder: 5 },
];

export const SEED_SUBSCRIPTION_PLANS = [
  {
    name: 'FREE',
    tier: 'Free',
    price: 0.0,
    currency: 'USD',
    maxQuality: 'SD',
    maxDevices: 1,
    isActive: true,
  },
  {
    name: 'BASIC',
    tier: 'Basic',
    price: 8.99,
    currency: 'USD',
    maxQuality: 'HD',
    maxDevices: 1,
    isActive: true,
  },
  {
    name: 'STANDARD',
    tier: 'Standard',
    price: 13.99,
    currency: 'USD',
    maxQuality: 'FHD',
    maxDevices: 2,
    isActive: true,
  },
  {
    name: 'PREMIUM',
    tier: 'Premium',
    price: 17.99,
    currency: 'USD',
    maxQuality: '4K',
    maxDevices: 4,
    isActive: true,
  },
];

export const SEED_USERS = [
  {
    email: 'admin@streamflix.local',
    passwordHash: '$2b$10$eprnXv35.8u7l0EaU0dJ1.HqyJkCgZ7M.u2P6K0.e6O9Y7rWzK3Gq', // Admin@StreamFlix2026!
    role: UserRole.ADMIN,
    isEmailVerified: true,
    profiles: [
      {
        name: 'Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isKids: false,
        maturityRating: '18+' as const,
        language: 'en',
      },
    ],
  },
  {
    email: 'user@streamflix.local',
    passwordHash: '$2b$10$eprnXv35.8u7l0EaU0dJ1.HqyJkCgZ7M.u2P6K0.e6O9Y7rWzK3Gq', // User@StreamFlix2026!
    role: UserRole.USER,
    isEmailVerified: true,
    profiles: [
      {
        name: 'Rohit',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        isKids: false,
        maturityRating: '18+' as const,
        language: 'en',
      },
      {
        name: 'Family',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
        isKids: false,
        maturityRating: '16+' as const,
        language: 'en',
      },
      {
        name: 'Kids Club',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
        isKids: true,
        maturityRating: '7+' as const,
        language: 'en',
      },
    ],
  },
];

export const SEED_MOVIES = [
  {
    title: 'The Last Horizon',
    slug: 'the-last-horizon',
    description:
      'When deep space anomaly code 404 fractures the orbital network, a rogue crew embarks across the unknown sector to restore humanity’s collective conscience.',
    releaseDate: new Date('2026-01-15'),
    durationMinutes: 138,
    ageRating: '16+',
    language: 'English',
    country: 'USA',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1280',
    trailerUrl: 'https://storage.streamflix.local/trailers/the-last-horizon.mp4',
    status: ContentStatus.PUBLISHED,
    viewCount: 14200,
    averageRating: 4.8,
    genreSlugs: ['sci-fi', 'adventure', 'drama'],
    masterPlaylistUrl: 'https://storage.streamflix.local/media/the-last-horizon/master.m3u8',
  },
  {
    title: 'Shadow Protocol',
    slug: 'shadow-protocol',
    description:
      'An elite cyber-surveillance agent discovers an untraceable backdoor inside global defense mainframes, triggering a lethal chase across international waters.',
    releaseDate: new Date('2025-11-20'),
    durationMinutes: 114,
    ageRating: '18+',
    language: 'English',
    country: 'UK',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280',
    trailerUrl: 'https://storage.streamflix.local/trailers/shadow-protocol.mp4',
    status: ContentStatus.PUBLISHED,
    viewCount: 22800,
    averageRating: 4.6,
    genreSlugs: ['action', 'thriller', 'crime'],
    masterPlaylistUrl: 'https://storage.streamflix.local/media/shadow-protocol/master.m3u8',
  },
  {
    title: 'Mumbai Nights',
    slug: 'mumbai-nights',
    description:
      'Amidst the neon glow of marine drive and underground finance networks, an intrepid detective unravels a high-stakes conspiracy that reaches city hall.',
    releaseDate: new Date('2025-08-10'),
    durationMinutes: 142,
    ageRating: '16+',
    language: 'Hindi',
    country: 'India',
    posterUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500',
    backdropUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1280',
    trailerUrl: 'https://storage.streamflix.local/trailers/mumbai-nights.mp4',
    status: ContentStatus.PUBLISHED,
    viewCount: 38400,
    averageRating: 4.7,
    genreSlugs: ['action', 'crime', 'drama'],
    masterPlaylistUrl: 'https://storage.streamflix.local/media/mumbai-nights/master.m3u8',
  },
  {
    title: 'Quantum Code',
    slug: 'quantum-code',
    description:
      'A brilliant mathematician creates an algorithm that predicts human decision paths, only to realize the algorithm is actively rewriting historical records.',
    releaseDate: new Date('2026-03-01'),
    durationMinutes: 108,
    ageRating: '13+',
    language: 'English',
    country: 'USA',
    posterUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280',
    trailerUrl: 'https://storage.streamflix.local/trailers/quantum-code.mp4',
    status: ContentStatus.PUBLISHED,
    viewCount: 9500,
    averageRating: 4.5,
    genreSlugs: ['sci-fi', 'thriller'],
    masterPlaylistUrl: 'https://storage.streamflix.local/media/quantum-code/master.m3u8',
  },
];

export const SEED_SERIES = [
  {
    title: 'Neon District',
    slug: 'neon-district',
    description:
      'In a rain-soaked megalopolis ruled by autonomous algorithms, an underground resistance network battles for digital autonomy.',
    releaseDate: new Date('2025-06-01'),
    ageRating: '18+',
    language: 'English',
    posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500',
    backdropUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1280',
    status: ContentStatus.PUBLISHED,
    genreSlugs: ['sci-fi', 'action', 'thriller'],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Signal Genesis',
        description: 'The discovery of the rogue broadcast that changed the district.',
        episodes: [
          {
            episodeNumber: 1,
            title: 'Ghost in the Transmission',
            description:
              'A street courier intercepts an encrypted memory drive intended for high command.',
            durationMinutes: 52,
            thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400',
            masterPlaylistUrl:
              'https://storage.streamflix.local/media/neon-district-s1e1/master.m3u8',
          },
          {
            episodeNumber: 2,
            title: 'The Sublevel Zero',
            description:
              'Pursued through flooded utility tunnels, the crew seeks asylum with the Archivists.',
            durationMinutes: 48,
            thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
            masterPlaylistUrl:
              'https://storage.streamflix.local/media/neon-district-s1e2/master.m3u8',
          },
        ],
      },
    ],
  },
];
