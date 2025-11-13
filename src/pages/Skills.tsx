import React, { useState, useMemo, useCallback } from 'react';
import GlobalBackground from '../ui/gradientBackground';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  SkillDetailModal,
  SkillsGridByRarity,
  SkillsHero,
  SkillsStakingImpact,
  SkillsFAQ,
  SkillsCTA,
  SKILLS_DATA,
} from '../components/skills';
import { Rarity } from '../types/contracts';
import type { SkillData } from '../components/skills/config';

interface ModalState {
  isOpen: boolean;
  skill: SkillData | null;
}

const SkillsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, skill: null });

  // Simular carga inicial
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSkillClick = useCallback((skill: SkillData) => {
    setModalState({ isOpen: true, skill });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, skill: null });
  }, []);

  const skillsByRarity = useMemo(() => {
    const grouped = {
      [Rarity.COMMON]: [] as SkillData[],
      [Rarity.UNCOMMON]: [] as SkillData[],
      [Rarity.RARE]: [] as SkillData[],
      [Rarity.EPIC]: [] as SkillData[],
      [Rarity.LEGENDARY]: [] as SkillData[],
    };

    SKILLS_DATA.forEach((skill) => {
      grouped[skill.rarity].push(skill);
    });

    return grouped;
  }, []);

  const totalStakingBoost = useMemo(() => {
    // Calculate REALISTIC max staking boost with constraint: max 3 active skills per user
    // Only consider STAKING skills (7 types) with LEGENDARY rarity (highest effect)
    // Best case: STAKE_BOOST_III (20% APY) + 2 other staking skills (LEGENDARY)
    
    // Get staking skills with LEGENDARY rarity
    const STAKING_SKILL_TYPES = [1, 2, 3, 4, 5, 6, 7]; // STAKE_BOOST_I through FEE_REDUCER_II
    const LEGENDARY_RARITY = 4;
    
    const bestStakingSkills = SKILLS_DATA.filter(
      skill => STAKING_SKILL_TYPES.includes(skill.skillType) && skill.rarity === LEGENDARY_RARITY
    ).sort((a, b) => b.effectValue - a.effectValue); // Sort by effect value descending
    
    // Sum top 3 staking skills (or all if less than 3 available)
    const maxBoost = bestStakingSkills.slice(0, 3).reduce((sum, skill) => sum + skill.effectValue, 0);
    
    return maxBoost;
  }, []);

  if (isLoading) {
    return (
      <GlobalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="xl" text="Loading Skills..." />
        </div>
      </GlobalBackground>
    );
  }

  return (
    <GlobalBackground>
      <div className="min-h-screen text-white relative">
        {/* Hero Section */}
        <SkillsHero
          totalSkillsCount={SKILLS_DATA.length}
          totalBoostPercentage={totalStakingBoost}
        />

        {/* Skills Showcase Section - Organized by Category & Rarity */}
        <SkillsGridByRarity skills={SKILLS_DATA} onSkillClick={handleSkillClick} />

        {/* Staking Impact Section */}
        <SkillsStakingImpact skillsByRarity={skillsByRarity} totalStakingBoost={totalStakingBoost} />

        {/* FAQ Section */}
        <SkillsFAQ />

        {/* Call-to-Action Section */}
        <SkillsCTA />

        {/* Footer Spacer */}
        <div className="h-20" />
      </div>

      {/* Modal */}
      <SkillDetailModal
        skill={modalState.skill}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
      />
    </GlobalBackground>
  );
};

export default SkillsDashboard;
