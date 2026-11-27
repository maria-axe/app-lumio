import { useEffect } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { usePlacement } from '../contexts/PlacementContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import BoardPage from './BoardPage.jsx';
import Footer from './Footer.jsx';
import HomePage from './HomePage.jsx';
import InstallPrompt from './InstallPrompt.jsx';
import MobileMenu from './MobileMenu.jsx';
import OnboardingOverlay from './OnboardingOverlay.jsx';
import PlacementGate from './PlacementGate.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell() {
  const ui = useUi();
  const onboarding = useOnboarding();
  const placement = usePlacement();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (onboarding.visible) return;
      if (placement.visible) return;
      if (ui.mobileMenuOpen) {
        ui.closeMobileMenu();
        return;
      }
      if (ui.route === 'board') ui.closeBoard();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onboarding.visible, placement.visible, ui.mobileMenuOpen, ui.route, ui.closeMobileMenu, ui.closeBoard]);

  return (
    <div className="min-h-screen flex bg-duo-bg dark:bg-duo-bg-dark transition-colors">
      <Sidebar />
      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar />
        <main className="flex-1 min-w-0">
          {ui.route === 'board' ? <BoardPage /> : <HomePage />}
        </main>
        <Footer />
      </div>
      <MobileMenu />
      <PlacementGate />
      <OnboardingOverlay />
      <InstallPrompt enabled={!onboarding.visible && !placement.visible && !ui.mobileMenuOpen} />
    </div>
  );
}
