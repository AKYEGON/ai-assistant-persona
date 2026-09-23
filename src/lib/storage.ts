"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Mission } from "./types";

const KEY = "walkthrough-os:missions:v1";
const EVENT = "walkthrough-os:changed";
const EMPTY: Mission[] = [];

let cache: Mission[] | null = null;

function read(): Mission[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Mission[]) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(missions: Mission[]) {
  if (typeof window === "undefined") return;
  cache = missions;
  window.localStorage.setItem(KEY, JSON.stringify(missions));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(onChange: () => void) {
  const handler = () => {
    cache = null;
    onChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function upsert(mission: Mission): Mission[] {
  const all = [...read()];
  const index = all.findIndex((m) => m.id === mission.id);
  const next = { ...mission, updatedAt: Date.now() };
  if (index === -1) all.unshift(next);
  else all[index] = next;
  return all;
}

export function saveMission(mission: Mission) {
  write(upsert(mission));
}

export function getMission(id: string): Mission | null {
  return read().find((m) => m.id === id) ?? null;
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useMissions() {
  const missions = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useHydrated();

  const save = useCallback((mission: Mission) => saveMission(mission), []);
  const remove = useCallback((id: string) => {
    write(read().filter((m) => m.id !== id));
  }, []);

  return { missions, hydrated, save, remove };
}

export function useMission(id: string) {
  const missions = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useHydrated();
  const mission = useMemo(() => missions.find((m) => m.id === id) ?? null, [missions, id]);

  return { mission, hydrated };
}

export function newId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
