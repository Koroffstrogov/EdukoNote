import { HomePage } from "./pages/HomePage";
import { ExercisePage } from "./pages/ExercisePage";
import { SettingsPage } from "./pages/SettingsPage";
import { StyleGuidePage } from "./pages/StyleGuidePage";
import { SymbolExercisePage } from "./pages/SymbolExercisePage";
import { SymbolsPage } from "./pages/SymbolsPage";

export function App() {
  const path = window.location.pathname;

  if (path === "/styleguide") {
    return <StyleGuidePage />;
  }

  if (path === "/exercise") {
    return <ExercisePage />;
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
