import { memo } from 'react';
import { motion } from 'framer-motion';
import { StoreSkillCard } from './StoreSkillCard';
import type { SkillData } from '../skills/config';
import { SkillCategory, SKILL_TYPE_CATEGORY } from '../skills/config';
import { Rarity } from '../../types/contracts';

interface SkillsCatalogProps {
  skills: SkillData[];
  onSkillClick: (skill: SkillData) => void;
  ownedSkillIds?: number[];
  selectedCategory?: SkillCategory | 'ALL';
  selectedRarity?: Rarity | 'ALL';
  searchQuery?: string;
}

export const SkillsCatalog = memo<SkillsCatalogProps>(({
  skills,
  onSkillClick,
  ownedSkillIds = [],
  selectedCategory = 'ALL',
  selectedRarity = 'ALL',
  searchQuery = '',
}) => {
  // Filter skills based on category, rarity, and search query
  const filteredSkills = skills.filter(skill => {
    // Category filter
    if (selectedCategory !== 'ALL') {
      const skillCategory = SKILL_TYPE_CATEGORY[skill.skillType];
      if (skillCategory !== selectedCategory) return false;
    }

    // Rarity filter
    if (selectedRarity !== 'ALL' && skill.rarity !== selectedRarity) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = skill.name.toLowerCase().includes(query);
      const matchesDescription = skill.description.toLowerCase().includes(query);
      const matchesEffect = skill.effectLabel.toLowerCase().includes(query);
      
      if (!matchesName && !matchesDescription && !matchesEffect) {
        return false;
      }
    }

    return true;
  });

  // Loading skeleton
  if (skills.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-80 bg-gray-800/50 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  // No results
  if (filteredSkills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="jersey-15-regular text-5xl md:text-6xl text-white mb-4">No skills found</h3>
        <p className="jersey-20-regular text-xl md:text-2xl text-gray-400">
          Try adjusting your filters or search query
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredSkills.map((skill) => (
        <StoreSkillCard
          key={skill.id}
          skill={skill}
          onClick={onSkillClick}
          isOwned={ownedSkillIds.includes(skill.id)}
        />
      ))}
    </div>
  );
});

SkillsCatalog.displayName = 'SkillsCatalog';
