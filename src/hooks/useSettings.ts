import { useCallback, useEffect, useState } from "react";
import type { Clef, ReadingZone } from "../domain/notes";
import {
  SETTINGS_STORAGE_KEY,
  normalizeSettings,
  setPalette,
  setReadingZone,
  type SettingsState,
} from "../domain/settings";
import type { PaletteId } from "../theme/tokens";

function readStoredSettings(): SettingsState {
  if (typeof window === "undefined") {
    return normalizeSettings(null);
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;

    return normalizeSettings(parsedValue);
  } catch {
    return normalizeSettings(null);
  }
}

function writeStoredSettings(settings: SettingsState) {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    undefined;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(() => readStoredSettings());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.palette = settings.palette;
    }

    writeStoredSettings(settings);
  }, [settings]);

  const updateReadingZone = useCallback((clef: Clef, readingZone: ReadingZone) => {
    setSettings((currentSettings) => setReadingZone(currentSettings, clef, readingZone));
  }, []);

  const updatePalette = useCallback((palette: PaletteId) => {
    setSettings((currentSettings) => setPalette(currentSettings, palette));
  }, []);

  return {
    settings,
    updatePalette,
    updateReadingZone,
  };
}
