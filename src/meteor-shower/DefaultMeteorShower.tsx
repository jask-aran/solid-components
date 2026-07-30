import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { MeteorShower } from "./MeteorShower";
import { simulateMeteors } from "./simulate";
import {
  DEFAULT_SEED,
  DEFAULT_SETTINGS,
  type MeteorEvent,
  type MeteorSettings,
} from "./types";
import "./meteor-shower.css";

export const DEFAULT_METEOR_TIMELINE_SECONDS = 600;
export const DEFAULT_METEOR_INITIAL_ELAPSED_SECONDS = 12;
export const METEOR_RESIZE_DEBOUNCE_MS = 200;

const CLOCK_EPSILON_SECONDS = 0.001;

export interface DefaultMeteorShowerProps {
  durationSeconds?: number;
  entryOffset?: number;
  initialElapsedSeconds?: number;
  seed?: number;
  settings?: MeteorSettings;
}

/** Returns the currently visible meteors and one scheduled launch. */
export function activeMeteorWindow(
  events: readonly MeteorEvent[],
  elapsedSeconds: number,
  maxActive: number,
): MeteorEvent[] {
  const active = events
    .filter((event) => event.startTime <= elapsedSeconds && event.startTime + event.duration > elapsedSeconds)
    .slice(0, Math.max(0, maxActive));
  const next = events.find((event) => event.startTime > elapsedSeconds);
  return next ? [...active, next] : active;
}

function nextTimelineBoundary(
  events: readonly MeteorEvent[],
  elapsedSeconds: number,
  durationSeconds: number,
): number {
  let next = durationSeconds;
  for (const event of events) {
    if (event.startTime > elapsedSeconds + CLOCK_EPSILON_SECONDS) {
      next = Math.min(next, event.startTime);
    }
    const end = event.startTime + event.duration;
    if (end > elapsedSeconds + CLOCK_EPSILON_SECONDS) next = Math.min(next, end);
  }
  return next;
}

/**
 * A self-contained, deterministic meteor background. It computes the canonical
 * timeline for its own bounds and recreates it when that timeline completes.
 * Place it inside a positioned, overflow-hidden surface.
 */
export function DefaultMeteorShower(props: DefaultMeteorShowerProps) {
  let element!: HTMLDivElement;
  let boundaryTimer: number | undefined;
  let resizeTimer: number | undefined;
  let cycleStartedAt = 0;
  let mounted = false;
  const [viewport, setViewport] = createSignal({ width: 1, height: 1 });
  const [cycle, setCycle] = createSignal(1);
  const [elapsedSeconds, setElapsedSeconds] = createSignal(0);
  const duration = () => props.durationSeconds ?? DEFAULT_METEOR_TIMELINE_SECONDS;
  const initialElapsed = () => props.initialElapsedSeconds ?? DEFAULT_METEOR_INITIAL_ELAPSED_SECONDS;
  const settings = () => props.settings ?? DEFAULT_SETTINGS;
  const events = createMemo(() => {
    cycle();
    return simulateMeteors({
      durationSeconds: duration(),
      seed: props.seed ?? DEFAULT_SEED,
      settings: settings(),
      viewport: viewport(),
    });
  });
  const activeEvents = createMemo(() => activeMeteorWindow(
    events(),
    elapsedSeconds(),
    settings().maxActive,
  ));

  const cycleElapsed = () => Math.max(0, (performance.now() - cycleStartedAt) / 1000);

  const scheduleBoundary = () => {
    window.clearTimeout(boundaryTimer);
    const currentElapsed = cycleElapsed();
    const boundary = nextTimelineBoundary(events(), currentElapsed, duration());
    boundaryTimer = window.setTimeout(() => {
      if (cycleElapsed() >= duration() - CLOCK_EPSILON_SECONDS) {
        cycleStartedAt = performance.now();
        setElapsedSeconds(0);
        setCycle((value) => value + 1);
      } else {
        setElapsedSeconds(cycleElapsed());
      }
      scheduleBoundary();
    }, Math.max(1, (boundary - currentElapsed) * 1000));
  };

  const measure = () => {
    const { width, height } = element.getBoundingClientRect();
    setViewport({ width: Math.max(1, width), height: Math.max(1, height) });
  };

  onMount(() => {
    cycleStartedAt = performance.now() - initialElapsed() * 1000;
    setElapsedSeconds(initialElapsed());
    mounted = true;
    measure();
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, METEOR_RESIZE_DEBOUNCE_MS);
    });
    resizeObserver.observe(element);
    scheduleBoundary();
    onCleanup(() => {
      resizeObserver.disconnect();
      window.clearTimeout(boundaryTimer);
      window.clearTimeout(resizeTimer);
    });
  });

  createEffect(() => {
    events();
    duration();
    if (mounted) scheduleBoundary();
  });

  return (
    <div ref={element} class="solid-meteor-shower" aria-hidden="true">
      <MeteorShower
        events={activeEvents()}
        entryOffset={props.entryOffset ?? DEFAULT_SETTINGS.entryOffset}
        elapsedSeconds={elapsedSeconds()}
        removeOnAnimationEnd={false}
      />
    </div>
  );
}
