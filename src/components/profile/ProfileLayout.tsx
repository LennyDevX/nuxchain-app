import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import GlobalBackground from '../../ui/gradientBackground';

const ProfileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GlobalBackground>
      <div className="min-h-[80vh] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <ProfileSidebar />
            <main className="card-unified min-h-[500px]">
              {children}
            </main>
          </div>
        </div>
      </div>
    </GlobalBackground>
  );
};

export default ProfileLayout;
