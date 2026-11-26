import { OnboardingProvider } from './OnboardingContext.jsx';
import { PlacementProvider } from './PlacementContext.jsx';
import { ProgressProvider } from './ProgressContext.jsx';
import { UiProvider } from './UiContext.jsx';

export default function AppProviders({ children }) {
  return (
    <OnboardingProvider>
      <UiProvider>
        <PlacementProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </PlacementProvider>
      </UiProvider>
    </OnboardingProvider>
  );
}
