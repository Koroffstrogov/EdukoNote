import { HomePage } from "./pages/HomePage";
import { ExercisePage } from "./pages/ExercisePage";
import { FreePianoPage } from "./pages/FreePianoPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StyleGuidePage } from "./pages/StyleGuidePage";
import { SymbolExercisePage } from "./pages/SymbolExercisePage";
import { SymbolsPage } from "./pages/SymbolsPage";
import { PianoModePage } from "./pages/PianoModePage";
import { RhythmsPage } from "./pages/RhythmsPage";

export function App() {
  const path = window.location.pathname;

  if (path === "/rhythms") {
    return <RhythmsPage />;
  }

  if (path === "/styleguide") {
    return <StyleGuidePage />;
  }

  if (path === "/exercise") {
    return <ExercisePage />;
  }

  if (path === "/piano/play") {
    return <FreePianoPage />;
  }

  if (path === "/piano") {
    return <PianoModePage />;
  }

  if (path === "/settings") {
    return <SettingsPage />;
  }

  if (path === "/symbols/exercise") {
    return <SymbolExercisePage />;
  }

  if (path === "/symbols") {
    return <SymbolsPage />;
  }

  return <HomePage />;
}
