import React from 'react';
import { SafeAreaContainer } from './SafeAreaContainer';
import { PatientBottomNav } from '../patient/PatientBottomNav';

interface PatientLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

/**
 * Patient-facing layout wrapper.
 * - No sidebar, no dense navigation
 * - Includes persistent bottom nav
 * - Safe area padding for tablet/phone notches
 */
export function PatientLayout({ children, activeTab = 'home' }: PatientLayoutProps) {
  return (
    <SafeAreaContainer className="flex flex-col min-h-screen">
      {/* Scrollable content area — pb accounts for bottom nav height */}
      <div className="flex-1 overflow-y-auto pb-24">
        {children}
      </div>

      {/* Persistent Bottom Nav */}
      <PatientBottomNav activeTab={activeTab} />
    </SafeAreaContainer>
  );
}
