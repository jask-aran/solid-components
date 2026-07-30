# Repository Guidelines

`solid-components` owns portable SolidJS component source and public APIs.
[Conduit](https://github.com/jask-aran/Conduit) is the standard integration and
visual-development workbench, but it consumes releases from npm in normal
operation.

## Development and consumer approval

- Preserve exported APIs, CSS class names, deterministic behavior, and peer
  dependency compatibility unless a release explicitly changes that contract.
- Add focused deterministic package coverage for every behavior change.
- Exercise shared-component work in Conduit through
  `.devcontainer/solid-components.sh dev`; never copy an implementation into
  Conduit or edit its `node_modules`.
- Before release, commit the complete candidate, leave this worktree clean, and
  run Conduit's `solid-components.sh preview`. The user approves that packed
  artifact at port 4310.
- Batch related component changes into one candidate and version. Ordinary
  commits do not publish.
- After approval, do not reimplement or amend the candidate. Conduit's
  `solid-components.sh promote <patch|minor|major>` verifies the approved
  commit and payload before creating release metadata.

## Verification and releases

Run `npm run verify` before committing. It is the single local and CI package
gate: typecheck, tests, build, and packed-payload validation.

Stable `vX.Y.Z` tags publish through `.github/workflows/publish.yml`. The tag
must equal `package.json`, its commit must be reachable from `main`, and pushed
release tags are immutable. Never move or delete a failed release tag; correct
the fault and issue a new version.

npmjs is the registry. GitHub's “Publish package” page documents GitHub
Packages and is unrelated. Trusted publishing is configured on npm for
repository `jask-aran/solid-components` and workflow filename `publish.yml`;
do not add an npm token or expect the package to appear under GitHub Packages.

## Style

Use ES modules, strict TypeScript, two-space indentation, semicolons, double
quotes, and SolidJS rather than React runtime dependencies. Keep package
exports explicit and ship only `dist`.
