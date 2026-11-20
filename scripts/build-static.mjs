import fs from "node:fs";
import { cp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectRoot, "dist");

const directories = [
  "about",
  "assets",
  "committee-rulebook",
  "contact",
  "contribute",
  "contributions",
  "countries",
  "data",
  "events",
  "global-members",
  "initiatives",
  "leadership",
  "member-countries",
  "members",
  "membership",
  "news",
  "news-events",
  "policy-research",
  "privacy",
  "public",
  "publications",
  "reader-charter",
  ".well-known",
  "src",
];

await rm(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const directory of directories) {
  const dirPath = path.join(projectRoot, directory);
  const destPath = path.join(outputDir, directory);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.mkdirSync(destPath, { recursive: true });
  await cp(dirPath, destPath, {
    recursive: true,
    force: true,
  });
}

for (const file of ["index.html", "404.html", "manus-routes.json", "favicon.ico", "favicon.svg", "favicon-16x16.png", "favicon-32x32.png", "favicon-48x48.png", "favicon-192x192.png", "favicon-512x512.png", "apple-touch-icon.png", "site.webmanifest", "google343e8e6554f1798d.html", "indexnow-key.txt", "llms.txt", "llms-full.txt"]) {
  const srcFile = path.join(projectRoot, file);
  if (!fs.existsSync(srcFile)) {
    continue;
  }
  await cp(srcFile, path.join(outputDir, file));
}

// These browser-side keys are generated at build time so static Vercel deploys work out of the box.
const contactWeb3FormsKey =
  process.env.WEB3FORMS_ACCESS_KEY ||
  "a5b899a5-fb34-4833-8d0f-b5c0383fc4fb";
const membershipWeb3FormsKey =
  process.env.WEB3FORMS_MEMBERSHIP_ACCESS_KEY ||
  "fedcf2cc-8d00-4d6e-9fe3-3dece7d18c82";
const publicationWeb3FormsKey =
  process.env.WEB3FORMS_PUBLICATION_ACCESS_KEY ||
  "fbc01e17-ce30-4dd0-9b5c-0ba4b84b754a";
const runtimeConfig = [
  `window.WEB3FORMS_ACCESS_KEY = ${JSON.stringify(contactWeb3FormsKey)};`,
  `window.WEB3FORMS_MEMBERSHIP_ACCESS_KEY = ${JSON.stringify(membershipWeb3FormsKey)};`,
  `window.WEB3FORMS_PUBLICATION_ACCESS_KEY = ${JSON.stringify(publicationWeb3FormsKey)};`,
  "",
].join("\n");
await writeFile(path.join(outputDir, "web3forms-config.js"), runtimeConfig, "utf8");

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
// Prerender committee pages and committee-member profiles for search crawlers if script exists.
if (fs.existsSync(path.join(scriptsDir, "generate-seo-pages.mjs"))) {
  await import("./generate-seo-pages.mjs");
}
// Run SEO acceptance checks if script exists.
if (fs.existsSync(path.join(scriptsDir, "seo-audit.mjs"))) {
  await import("./seo-audit.mjs");
}

console.log(`Static site built in ${path.relative(projectRoot, outputDir)}/`);
console.log(
  `Web3Forms keys configured: contact=${Boolean(contactWeb3FormsKey)}, membership=${Boolean(membershipWeb3FormsKey)}, publication=${Boolean(publicationWeb3FormsKey)}`,
);
