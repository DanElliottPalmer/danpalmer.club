#!/usr/bin/env node

// Compiles src/_includes/styles/index.scss to src/static/css/index.css with
// dart-sass. The Sass CLI can't load custom importers, and the styles
// `@import "./theme.json"`, so this uses the JS API with a JSON importer.
//
// Usage: build_sass.js [--watch]

const fs = require("fs");
const path = require("path");
const { pathToFileURL, fileURLToPath } = require("url");
const sass = require("sass");
const { transformJSONtoSass } = require("node-sass-json-importer");

const ROOT = path.resolve(__dirname, "..");
const STYLES_DIR = path.join(ROOT, "src/_includes/styles");
const ENTRY = path.join(STYLES_DIR, "index.scss");
const OUT_FILE = path.join(ROOT, "src/static/css/index.css");
const WATCH = process.argv.includes("--watch");

// Turns `@import "./theme.json"` into Sass variables, one per top-level key.
const jsonImporter = {
  canonicalize(url, { containingUrl }) {
    if (!url.endsWith(".json")) return null;
    return new URL(url, containingUrl ?? pathToFileURL(ENTRY));
  },
  load(canonicalUrl) {
    const json = JSON.parse(fs.readFileSync(fileURLToPath(canonicalUrl), "utf8"));
    return { contents: transformJSONtoSass(json), syntax: "scss" };
  },
};

function build() {
  const result = sass.compile(ENTRY, {
    importers: [jsonImporter],
    sourceMap: true,
    style: WATCH ? "expanded" : "compressed",
    // The styles still use @import and global functions like map-get.
    silenceDeprecations: ["import", "global-builtin"],
  });

  const mapName = `${path.basename(OUT_FILE)}.map`;
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${result.css}\n\n/*# sourceMappingURL=${mapName} */\n`);
  // Make sources relative so the published map doesn't leak build paths.
  const sourceMap = {
    ...result.sourceMap,
    sources: result.sourceMap.sources.map((source) =>
      source.startsWith("file:")
        ? path.relative(path.dirname(OUT_FILE), fileURLToPath(source))
        : source,
    ),
  };
  fs.writeFileSync(`${OUT_FILE}.map`, JSON.stringify(sourceMap));
  console.log(`sass: wrote ${path.relative(ROOT, OUT_FILE)}`);
}

if (!WATCH) {
  build();
} else {
  const tryBuild = () => {
    try {
      build();
    } catch (err) {
      console.error(`\x07${err.message}`);
    }
  };
  tryBuild();

  // Watch every directory under src/_includes, since components keep their own .scss.
  let timer;
  fs.watch(path.join(ROOT, "src/_includes"), { recursive: true }, (_, file) => {
    if (!file || !/\.(scss|json)$/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(tryBuild, 50);
  });
  console.log("sass: watching for changes");
}
