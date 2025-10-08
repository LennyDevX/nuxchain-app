import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfileLayout from '../components/profile/ProfileLayout';
import ProfileOverview from '../components/profile/ProfileOverview';
import ProfileNFTs from '../components/profile/ProfileNFTs';
import ProfileStaking from '../components/profile/ProfileStaking';
import ProfileRewards from '../components/profile/ProfileRewards';
import ProfileAIAnalysis from '../components/profile/ProfileAIAnalysis';

const ProfilePage: React.FC = () => {
	return (
		<ProfileLayout>
			<Routes>
				<Route path="/" element={<ProfileOverview />} />
				<Route path="/nfts" element={<ProfileNFTs />} />
				<Route path="/staking" element={<ProfileStaking />} />
				<Route path="/rewards" element={<ProfileRewards />} />
				<Route path="/ai-analysis" element={<ProfileAIAnalysis />} />
			</Routes>
		</ProfileLayout>
	);
};

export default ProfilePage;
