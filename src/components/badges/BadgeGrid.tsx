import React, { useState } from 'react';
import { BadgeCategory } from '../../types';
import { ALL_BADGES } from '../../data/badgesData';
import { BadgeCard } from './BadgeCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useBadgeStore } from '../../store/useBadgeStore';

export const BadgeGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | BadgeCategory>('all');
  const user = useAuthStore((state) => state.user);
  const openUnlockModal = useBadgeStore((state) => state.openUnlockModal);

  const userBadges = user?.badges || [];

  const categories: { id: 'all' | BadgeCategory; label: string }[] = [
    { id: 'all', label: 'All Stickers' },
    { id: 'milestone', label: 'Milestones' },
    { id: 'time', label: 'Time-based' },
    { id: 'special', label: 'Couch Honors' },
    { id: 'broadcast', label: 'Broadcast' },
  ];

  const filteredBadges = ALL_BADGES.filter((b) =>
    activeCategory === 'all' ? true : b.category === activeCategory
  );

  return (
    <div className="w-full">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2">
        {filteredBadges.map((badge) => {
          const isUnlocked = userBadges.includes(badge.id);

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  openUnlockModal(badge);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
