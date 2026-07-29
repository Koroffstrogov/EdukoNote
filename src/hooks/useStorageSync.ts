import { useEffect, type Dispatch, type SetStateAction } from "react";

export function useStorageSync<T>(
  storageKey: string,
  normalize: (value: unknown) => T,
  setState: Dispatch<SetStateAction<T>>,
) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleStorage(event: StorageEvent) {
      if (
        event.key !== storageKey ||
        (event.storageArea && event.storageArea !== window.localStorage)
      ) {
        return;
      }

      const parsedValue = parseStoredJson(event.newValue);

      if (!parsedValue.ok) {
        return;
      }

      setState(normalize(parsedValue.value));
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [normalize, setState, storageKey]);
}

export function parseStoredJson(
  rawValue: string | null,
): { ok: true; value: unknown } | { ok: false } {
  if (rawValue === null) {
    return { ok: true, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(rawValue) };
  } catch {
    return { ok: false };
  }
}
