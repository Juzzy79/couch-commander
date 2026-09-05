export type TabType = 'upnext' | 'search' | 'activity' | 'profile';

export type ShowStatus = 'watching' | 'completed' | 'plan_to_watch';

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  dailyStreak: number;
  lastCheckInDate: string; // YYYY-MM-DD
  badges: string[]; // Badge IDs
  friends: string[]; // User IDs
  tmdbApiKey?: string;
  createdAt: number;
}

export interface TrackedShow {
  tmdbShowId: number;
  showTitle: string;
  posterPath: string;
  backdropPath?: string;
  status: ShowStatus;
  currentSeason: number;
  currentEpisode: number;
  totalEpisodesWatched: number;
  totalEpisodesInShow?: number;
  lastWatchedAt: number;
  nextEpisodeToWatch?: {
    seasonNumber: number;
    episodeNumber: number;
    title: string;
    overview?: string;
    stillPath?: string;
    airDate?: string;
  };
}

export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  tmdbShowId: number;
  showTitle: string;
  posterPath?: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  comment: string;
  isSpoiler: boolean;
  timestamp: number; // ms
  likesCount?: number;
  likedBy?: string[];
}

export interface CouchCommanderLeader {
  userId: string;
  userName: string;
  avatarUrl?: string;
  count: number;
}

export interface ShowStats {
  tmdbShowId: number;
  couchCommander: CouchCommanderLeader | null;
  remoteContender?: CouchCommanderLeader | null;
  snackRunner?: CouchCommanderLeader | null;
  userCheckInCounts: Record<string, number>; // key: userId, value: 30-day count
  totalCheckIns: number;
  updatedAt: number;
}

export type BadgeCategory = 'milestone' | 'time' | 'broadcast' | 'genre' | 'special';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  category: BadgeCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  gradient: string;
  unlockedAt?: number;
}
