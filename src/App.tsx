import { HomePage } from "./pages/HomePage";
import { ExercisePage } from "./pages/ExercisePage";
import { SettingsPage } from "./pages/SettingsPage";
import { StyleGuidePage } from "./pages/StyleGuidePage";

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

  return <HomePage />;
}
