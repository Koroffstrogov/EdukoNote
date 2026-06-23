import { isClef, isReadingZone, type Clef, type ReadingZone } from "./notes";

export const SETTINGS_STORAGE_KEY = "edukonote.settings.v1";

export type SettingsState = {
  version: 1;
  readingZones: Record<Clef, ReadingZone>;
};

export function createDefaultSettings(): SettingsState {
  return {
    version: 1,
    readingZones: {
      treble: "full",
      bass: "full",
    },
  };
}

export function normalizeSettings(value: unknown): SettingsState {
  const defaultSettings = createDefaultSettings();

  if (!value || typeof value !== "object") {
    return defaultSettings;
  }

  const candidate = value as Partial<SettingsState>;
  const readingZones =
    candidate.readingZones && typeof candidate.readingZones === "object"
      ? (candidate.readingZones as Partial<Record<Clef, unknown>>)
      : {};

  return {
    version: 1,
    readingZones: {
      treble: isReadingZone(readingZones.treble) ? readingZones.treble : defaultSettings.readingZones.treble,
      bass: isReadingZone(readingZones.bass) ? readingZones.bass : defaultSettings.readingZones.bass,
    },
  };
}

export function setReadingZone(settings: SettingsState, clef: Clef, readingZone: ReadingZone): SettingsState {
  if (!isClef(clef) || !isReadingZone(readingZone)) {
    return settings;
  }

  return {
    ...settings,
    readingZones: {
      ...settings.readingZones,
      [clef]: readingZone,
    },
  };
}
