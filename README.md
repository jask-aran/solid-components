# @jask-aran/solid-components

Portable SolidJS components. The first export is a deterministic meteor-shower background.

## Install

```bash
npm install @jask-aran/solid-components
```

## Meteor shower

```tsx
import { DefaultMeteorShower } from "@jask-aran/solid-components/meteor-shower";
import "@jask-aran/solid-components/meteor-shower.css";

function Surface() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <DefaultMeteorShower />
    </div>
  );
}
```

`MeteorShower` is the lower-level renderer for applications that precompute their own events with `simulateMeteors`. `DefaultMeteorShower` owns the canonical seed, simulation, element-size tracking, and ten-minute loop.
