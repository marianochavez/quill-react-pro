# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.1.0] - 2025-05-14

This initial release of `quill-react-pro` (forked from `quill-react-commercial`) focuses on modernizing the build system, updating dependencies, resolving vulnerabilities, and cleaning up the codebase.

### Added

- Explicit control over published files to NPM via `"files"` in `package.json`.
- `@babel/runtime` for efficient Babel helper management.
- `core-js@3` for modern JavaScript polyfills.
- `quill-better-table` as a direct NPM dependency (replacing vendored code).
- Custom TypeScript declaration (`custom.d.ts`) for `quill-better-table`.
- `"types"` field in `package.json` pointing to `lib/index.d.ts`.

### Changed

- **Project Renamed & Reconfigured:** Updated `package.json` with new project details (name, author, repo).
- **Build System:**
  - Standardized on NPM, removing `yarn.lock`.
  - Upgraded TypeScript to v5.x (e.g., `^5.5.3` or your final version) for better compatibility.
  - Overhauled Rollup configuration (`rollup.config.mjs`) for robust ESM and UMD bundling.
  - Consolidated CSS/Less processing under `rollup-plugin-postcss`.
  - Configured Babel (`.babelrc` and Rollup plugin) for modern JavaScript, including `core-js` and runtime helpers.
  - Ensured correct generation of TypeScript declaration files (`.d.ts`) in `lib/` via Rollup.
- **Dependencies:** Updated numerous development dependencies to resolve conflicts and improve stability.

### Fixed

- Resolved multiple `ERESOLVE` dependency conflicts.
- Addressed various TypeScript compilation errors.
- Corrected Babel helper configuration in Rollup.
- Fixed `ETARGET` error by replacing `rollup-plugin-less`.
- Resolved `TS5069` error in UMD TypeScript plugin setup.
- Corrected CSS extraction paths in `rollup-plugin-postcss`.
- Eliminated several `npm install` warnings (e.g., `glob`, `inflight`) by updating packages.

### Removed

- Webpack build configuration (`webpack.config.js`) and related dependencies; Rollup is now the sole bundler.
- Redundant `index-c.tsx` (old class component).
- `tsbuild` script from `package.json`; Rollup now handles all build steps.
- Vendored (copied) version of `quill-better-table`.
- Redundant Rollup CSS plugins.

### Security

- Resolved 2 high-severity vulnerabilities by updating dependencies; `npm audit` now reports 0 vulnerabilities.
```
