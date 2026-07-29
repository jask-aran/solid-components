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

## Releasing

Publishing is performed by GitHub Actions through npm trusted publishing. Bump the version, commit it, then push its matching `v*` tag:

```bash
npm version patch
git push origin main --follow-tags
```

The release workflow validates, builds, and publishes the tag's package version to npm without a stored npm token.
