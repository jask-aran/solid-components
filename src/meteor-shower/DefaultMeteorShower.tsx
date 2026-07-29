import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { MeteorShower } from "./MeteorShower";
import { simulateMeteors } from "./simulate";
import { DEFAULT_SEED, DEFAULT_SETTINGS, type MeteorSettings } from "./types";
import "./meteor-shower.css";

export const DEFAULT_METEOR_TIMELINE_SECONDS = 600;
export const DEFAULT_METEOR_INITIAL_ELAPSED_SECONDS = 12;

export interface DefaultMeteorShowerProps {
  durationSeconds?: number;
  entryOffset?: number;
  initialElapsedSeconds?: number;
  seed?: number;
  settings?: MeteorSettings;
}

/**
 * A self-contained, deterministic meteor background. It computes the canonical
 * timeline for its own bounds and recreates it when that timeline completes.
 * Place it inside a positioned, overflow-hidden surface.
 */
export function DefaultMeteorShower(props: DefaultMeteorShowerProps) {
  let element!: HTMLDivElement;
  let restartTimer: number | undefined;
  const [viewport, setViewport] = createSignal({ width: 1, height: 1 });
  const [cycle, setCycle] = createSignal(1);
  const duration = () => props.durationSeconds ?? DEFAULT_METEOR_TIMELINE_SECONDS;
  const elapsed = () => props.initialElapsedSeconds ?? DEFAULT_METEOR_INITIAL_ELAPSED_SECONDS;
  const events = createMemo(() => {
    cycle();
    return simulateMeteors({
      durationSeconds: duration(),
      seed: props.seed ?? DEFAULT_SEED,
      settings: props.settings ?? DEFAULT_SETTINGS,
      viewport: viewport(),
    });
  });

  const scheduleRestart = () => {
    window.clearTimeout(restartTimer);
    restartTimer = window.setTimeout(() => {
      setCycle((value) => value + 1);
      scheduleRestart();
    }, Math.max(0, duration() - elapsed()) * 1000);
  };

  onMount(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width: Math.max(1, width), height: Math.max(1, height) });
    });
    resizeObserver.observe(element);
    scheduleRestart();
    onCleanup(() => {
      resizeObserver.disconnect();
      window.clearTimeout(restartTimer);
    });
  });

  createEffect(() => {
    duration();
    elapsed();
    if (typeof window !== "undefined") scheduleRestart();
  });

  return (
    <div ref={element} class="solid-meteor-shower" aria-hidden="true">
      <MeteorShower
        events={events()}
        entryOffset={props.entryOffset ?? DEFAULT_SETTINGS.entryOffset}
        elapsedSeconds={elapsed()}
      />
    </div>
  );
}
