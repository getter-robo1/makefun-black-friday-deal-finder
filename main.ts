// DealHunt hand-in program (Node 22, standard library only).
//
// The site lives in app/ next to this file: plain static files, no build
// step. This program hands it in: it copies app/ and screenshots/ into the
// output directory and writes dossier.json there with the vendored make.fun
// library (vendor/makefun-frontend.ts, unchanged from the kit). The scorer
// rebuilds the dossier from the same files with its own copy of that
// library, so the dossier must be exactly what buildDossier writes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program runs twice and both runs must write the same bytes, so it
// does nothing time-dependent and never writes into the repository itself.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The repository root: the directory this file sits in.
const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The gate's own caps for what an entry may hold (see the kit's RULES.txt):
// at most 4 screenshots of 256 KiB each, app/ at most 993 files and
// directories and 16 MiB in all, and the dossier text at most 160 KiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });
}

writeFileSync(join(outDir, "dossier.json"), buildDossier(outDir, DOSSIER_CAPS));
