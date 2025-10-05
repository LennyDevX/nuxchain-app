import React from 'react';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import ProfileSidebar from './ProfileSidebar';
import GlobalBackground from '../../ui/gradientBackground';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <GlobalBackground>
      <div className={`min-h-screen ${isMobile ? 'pt-4 pb-20' : 'py-8'}`}>
        <div className={`${isMobile ? 'px-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
          {isMobile ? (
            <>
              {/* Mobile: Sidebar colapsable */}
              <ProfileSidebar />
              
              {/* Mobile Content */}
              <div className="mt-4">
                {children}
              </div>
            </>
          ) : (
            /* Desktop: Grid layout */
            <div className="grid grid-cols-12 gap-8">
              {/* Sidebar - 3 columnas */}
              <div className="col-span-3">
                <ProfileSidebar />
              </div>
              
              {/* Content - 9 columnas */}
              <div className="col-span-9">
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlobalBackground>
  );
};

export default ProfileLayout;
