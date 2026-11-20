import fs from "node:fs";
import { cp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(__dirname, "..", "dist");

console.log(`Build CWD: ${process.cwd()} | Project Root: ${projectRoot}`);

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
  const srcDir = path.resolve(__dirname, "..", directory);
  const destDir = path.resolve(__dirname, "..", "dist", directory);
  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(destDir, { recursive: true });
  await cp(srcDir, destDir, {
    recursive: true,
    force: true,
  });
}

const rootFiles = [
  "index.html",
  "404.html",
  "manus-routes.json",
  "favicon.ico",
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "favicon-192x192.png",
  "favicon-512x512.png",
  "apple-touch-icon.png",
  "site.webmanifest",
  "google343e8e6554f1798d.html",
  "indexnow-key.txt",
  "llms.txt",
  "llms-full.txt",
];

for (const file of rootFiles) {
  const srcFile = path.resolve(__dirname, "..", file);
  if (!fs.existsSync(srcFile)) {
    continue;
  }
  await cp(srcFile, path.resolve(__dirname, "..", "dist", file));
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

fs.mkdirSync(outputDir, { recursive: true });
await writeFile(path.resolve(__dirname, "..", "dist", "web3forms-config.js"), runtimeConfig, "utf8");

// Prerender committee pages and committee-member profiles for search crawlers if script exists.
const seoPagesScript = path.resolve(__dirname, "generate-seo-pages.mjs");
if (fs.existsSync(seoPagesScript)) {
  await import(pathToFileURL(seoPagesScript).href);
}

// Run SEO acceptance checks if script exists.
const seoAuditScript = path.resolve(__dirname, "seo-audit.mjs");
if (fs.existsSync(seoAuditScript)) {
  await import(pathToFileURL(seoAuditScript).href);
}

console.log(`Static site built in ${path.relative(projectRoot, outputDir)}/`);
console.log(
  `Web3Forms keys configured: contact=${Boolean(contactWeb3FormsKey)}, membership=${Boolean(membershipWeb3FormsKey)}, publication=${Boolean(publicationWeb3FormsKey)}`,
);
