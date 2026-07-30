import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeMeteorWindow,
  DefaultMeteorShower,
  METEOR_RESIZE_DEBOUNCE_MS,
} from "../src/meteor-shower/DefaultMeteorShower";
import { simulateMeteors } from "../src/meteor-shower/simulate";
import { DEFAULT_SEED, DEFAULT_SETTINGS, type MeteorSettings } from "../src/meteor-shower/types";

class TestResizeObserver {
  static instances: TestResizeObserver[] = [];

  constructor(private readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }

  observe(): void {}

  disconnect(): void {}

  notify(width: number, height: number): void {
    this.callback([{ contentRect: { width, height } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
}

const boundedSettings: MeteorSettings = {
  ...DEFAULT_SETTINGS,
  firstLaunchDelay: 0,
  idleGapMax: 1,
  idleGapMin: 1,
  maxActive: 2,
  maxDuration: 100,
  minDuration: 100,
  refillGapMax: 1,
  refillGapMin: 1,
  targetMax: 2,
  targetMin: 2,
};

describe("DefaultMeteorShower", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    TestResizeObserver.instances = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("keeps deterministic schedules and renders only active meteors plus one launch", () => {
    const options = {
      durationSeconds: 120,
      seed: DEFAULT_SEED,
      settings: boundedSettings,
      viewport: { width: 800, height: 600 },
    };
    const first = simulateMeteors(options);
    expect(simulateMeteors(options)).toEqual(first);
    expect(activeMeteorWindow(first, 0.1, boundedSettings.maxActive)).toHaveLength(2);

    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
      () => <DefaultMeteorShower durationSeconds={120} initialElapsedSeconds={0.1} settings={boundedSettings} />,
      container,
    );
    const shower = container.querySelector(".solid-meteor-shower")!;
    shower.getBoundingClientRect = () => new DOMRect(0, 0, 800, 600);
    TestResizeObserver.instances[0]!.notify(800, 600);
    vi.advanceTimersByTime(METEOR_RESIZE_DEBOUNCE_MS);

    const meteors = container.querySelectorAll(".solid-meteor");
    expect(meteors.length).toBeLessThanOrEqual(boundedSettings.maxActive + 1);
    const firstMeteor = meteors[0]!;
    vi.advanceTimersByTime(1_000);
    expect(container.querySelectorAll(".solid-meteor")[0]).toBe(firstMeteor);
    dispose();
  });

  it("coalesces resize bursts until the surface has settled", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
      () => <DefaultMeteorShower durationSeconds={120} initialElapsedSeconds={0.1} settings={boundedSettings} />,
      container,
    );
    const shower = container.querySelector(".solid-meteor-shower")!;
    let width = 1;
    shower.getBoundingClientRect = () => new DOMRect(0, 0, width, 600);
    const observer = TestResizeObserver.instances[0]!;
    observer.notify(400, 600);
    observer.notify(600, 600);
    width = 800;
    observer.notify(width, 600);

    const before = container.querySelector(".solid-meteor")!.style.left;
    vi.advanceTimersByTime(METEOR_RESIZE_DEBOUNCE_MS - 1);
    expect(container.querySelector(".solid-meteor")!.style.left).toBe(before);
    vi.advanceTimersByTime(1);
    expect(container.querySelector(".solid-meteor")!.style.left).not.toBe(before);
    dispose();
  });

  it("keeps the meteor timeline animated when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
      () => <DefaultMeteorShower durationSeconds={120} initialElapsedSeconds={0.1} settings={boundedSettings} />,
      container,
    );

    expect(container.querySelector(".solid-meteor")!.style.animationDuration).toBe("100s");
    dispose();
  });
});
