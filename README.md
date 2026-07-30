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

## Conduit workbench

Conduit can resolve this checkout directly during sustained component work,
then run an extracted `npm pack` artifact for approval without changing its
locked dependency:

```bash
cd ../Conduit
bash .devcontainer/solid-components.sh dev
bash .devcontainer/solid-components.sh preview
```

After the preview is approved, one command creates the chosen stable release,
waits for npm, installs that exact version in Conduit, and restarts port 4310:

```bash
bash .devcontainer/solid-components.sh promote patch
```

Several component changes may be combined into one clean committed candidate.

## Releasing

Publishing is performed by GitHub Actions through npm trusted publishing. Only
stable `vX.Y.Z` tags publish; the tag must match `package.json` and point to a
commit reachable from `main`. Use the Conduit promotion command above so the
tag is created from the approved payload. For repository recovery where no
Conduit adoption is required, the equivalent lower-level sequence is:

```bash
npm run verify
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "Release vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --follow-tags
```

The release workflow validates, builds, and publishes the tag's package version to npm without a stored npm token.

Configure npm’s trusted publisher for repository
`jask-aran/solid-components` and workflow filename `publish.yml`. The GitHub
“Publish package” page describes the separate GitHub Packages registry; this
package is published to npmjs and is not expected to appear there. After the
first successful trusted publication, disable traditional npm publish tokens.
