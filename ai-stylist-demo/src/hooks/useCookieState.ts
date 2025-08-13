"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useCookieState<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {
  const [value, setValue] = useState<T>(() => {
    // This function now runs only on the client, avoiding SSR issues.
    if (typeof window === "undefined") {
      return initialValue;
    }
    const cookie = Cookies.get(key);
    if (cookie) {
      try {
        return JSON.parse(cookie);
      } catch (e) {
        console.warn(`Could not parse cookie "${key}":`, e);
        return initialValue;
      }
    }
    return initialValue;
  });

  // This effect runs whenever the state changes on the client, syncing it back to the cookie.
  useEffect(() => {
    try {
      Cookies.set(key, JSON.stringify(value), {
        expires: 7,
        sameSite: "strict",
      });
    } catch (e) {
      console.warn(`Could not set cookie "${key}":`, e);
    }
  }, [key, value]);

  const setCookieValue: SetValue<T> = useCallback((newValue) => {
    setValue((prevValue) => {
      const resolvedValue =
        newValue instanceof Function ? newValue(prevValue) : newValue;
      return resolvedValue;
    });
  }, []);

  return [value, setCookieValue];
}
