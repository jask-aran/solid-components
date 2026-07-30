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

## Distribution

[`jask-aran/solid-components`](https://github.com/jask-aran/solid-components) is
the source of truth. Matching `v*` Git tags publish immutable npm releases;
[Conduit](https://github.com/jask-aran/Conduit) consumes those releases through
`@jask-aran/solid-components`, never a copied component implementation.

## Releasing

Publishing is performed by GitHub Actions through npm trusted publishing. Only stable `vX.Y.Z` tags publish; the tag must match `package.json` and point to a commit reachable from `main`. Bump the version, commit it, then push its matching tag:

```bash
npm version patch
git push origin main --follow-tags
```

The release workflow validates, builds, and publishes the tag's package version to npm without a stored npm token.

Before the first release, configure npm’s trusted publisher for `jask-aran/solid-components` to use the `jask-aran/solid-components` repository and `.github/workflows/publish.yml`. After its first successful run, disable traditional npm publish tokens.
