import { For } from "solid-js";
import type { MeteorEvent } from "./types";
import "./meteor.css";

export interface MeteorShowerProps {
  elapsedSeconds?: number;
  events: MeteorEvent[];
  entryOffset?: number;
  removeOnAnimationEnd?: boolean;
}

interface MeteorProps {
  event: MeteorEvent;
  entryOffset: number;
  elapsedSeconds: number;
  removeOnAnimationEnd: boolean;
}

function Meteor(props: MeteorProps) {
  const animationDelay = `${props.event.startTime - props.elapsedSeconds}s`;
  const remove = (event: AnimationEvent & { currentTarget: HTMLSpanElement }) => {
    if (props.removeOnAnimationEnd) event.currentTarget.remove();
  };
  return (
    <span
      class="solid-meteor"
      onAnimationEnd={remove}
      style={{
        "--angle": `${props.event.angle}deg`,
        "--meteor-travel": `-${props.event.travel}px`,
        "--meteor-duration": `${props.event.duration}s`,
        "animation-delay": animationDelay,
        "animation-duration": `${props.event.duration}s`,
        left: `${props.event.left}px`,
        top: `-${props.entryOffset}px`,
      }}
    >
      <span class="solid-meteor__tail" />
    </span>
  );
}

export function MeteorShower(props: MeteorShowerProps) {
  const elapsed = () => props.elapsedSeconds ?? 0;
  return (
    <For each={props.events}>
      {(event) => (
        <Meteor
          event={event}
          entryOffset={props.entryOffset ?? 12}
          elapsedSeconds={elapsed()}
          removeOnAnimationEnd={props.removeOnAnimationEnd ?? true}
        />
      )}
    </For>
  );
}
