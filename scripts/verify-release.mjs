#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredPayload = [
  "dist/meteor-shower/index.js",
  "dist/meteor-shower/index.d.ts",
  "dist/meteor-shower.css",
  "package.json",
];

export function validateStableVersion(version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Package version must be stable semver, found ${version}.`);
  }
}

export function validateTag(version, tag) {
  validateStableVersion(version);
  if (tag && tag !== `v${version}`) {
    throw new Error(`Release tag ${tag} does not match package version ${version}.`);
  }
}

export function validatePackFiles(files) {
  const names = new Set(files.map((file) => file.path));
  for (const required of requiredPayload) {
    if (!names.has(required)) throw new Error(`Packed payload is missing ${required}.`);
  }
  for (const name of names) {
    if (
      name !== "package.json"
      && name !== "README.md"
      && name !== "LICENSE"
      && !name.startsWith("dist/")
    ) {
      throw new Error(`Unexpected file in packed payload: ${name}.`);
    }
  }
}

function run(program, args) {
  const result = spawnSync(program, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${program} ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`,
    );
  }
  return result.stdout.trim();
}

async function validateExports(packageJson) {
  const targets = [];
  for (const value of Object.values(packageJson.exports ?? {})) {
    if (typeof value === "string") {
      targets.push(value);
    } else {
      targets.push(...Object.values(value).filter((target) => typeof target === "string"));
    }
  }
  if (!targets.length) throw new Error("Package exports are empty.");
  for (const target of targets) {
    const relative = target.replace(/^\.\//, "");
    try {
      const stats = await fs.stat(path.join(root, relative));
      if (!stats.isFile()) throw new Error();
    } catch {
      throw new Error(`Package export does not resolve to a built file: ${target}.`);
    }
  }
}

export async function verifyRelease({
  tag = process.env.RELEASE_TAG,
  mainRef = process.env.RELEASE_MAIN_REF,
} = {}) {
  const packageJson = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  validateTag(packageJson.version, tag);
  await validateExports(packageJson);

  if (tag && mainRef) {
    run("git", ["merge-base", "--is-ancestor", "HEAD", mainRef]);
  } else if (tag || mainRef) {
    throw new Error("RELEASE_TAG and RELEASE_MAIN_REF must be set together.");
  }

  const packed = JSON.parse(
    run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"]),
  );
  if (!Array.isArray(packed) || packed.length !== 1) {
    throw new Error("npm pack must produce exactly one payload.");
  }
  validatePackFiles(packed[0].files ?? []);
  console.log(
    `Verified ${packageJson.name}@${packageJson.version}: ${packed[0].files.length} packed files.`,
  );
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  verifyRelease().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
