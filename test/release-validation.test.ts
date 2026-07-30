import { describe, expect, it } from "vitest";

import {
  validatePackFiles,
  validateStableVersion,
  validateTag,
} from "../scripts/verify-release.mjs";

describe("release validation", () => {
  it("accepts stable matching versions only", () => {
    expect(() => validateTag("1.2.3", "v1.2.3")).not.toThrow();
    expect(() => validateStableVersion("1.2.3-beta.1")).toThrow(/stable semver/);
    expect(() => validateTag("1.2.3", "v1.2.4")).toThrow(/does not match/);
  });

  it("requires the exported distribution and rejects source leakage", () => {
    const files = [
      { path: "package.json" },
      { path: "README.md" },
      { path: "LICENSE" },
      { path: "dist/meteor-shower/index.js" },
      { path: "dist/meteor-shower/index.d.ts" },
      { path: "dist/meteor-shower.css" },
    ];
    expect(() => validatePackFiles(files)).not.toThrow();
    expect(() => validatePackFiles([...files, { path: "src/index.ts" }])).toThrow(
      /Unexpected file/,
    );
    expect(() => validatePackFiles(files.filter((file) => !file.path.endsWith(".css")))).toThrow(
      /missing dist\/meteor-shower\.css/,
    );
  });
});
