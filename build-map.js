import fs from "fs";

const INPUT = "wioski.txt";
const OUTPUT = "public/villageMap.json";

const raw = fs.readFileSync(INPUT, "utf8");

// Szukamy linii typu:  (390|446) ... -> 1291
// Koordy: (\d{3}\|\d{3})
// ID: po strzałce -> (\d+)
const lines = raw.split(/\r?\n/);
const map = {};

for (const line of lines) {
  const coordMatch = line.match(/(\d{3}\|\d{3})/);
  const idMatch = line.match(/->\s*(\d+)/);
  if (coordMatch && idMatch) {
    const coord = coordMatch[1].trim();
    const id = parseInt(idMatch[1], 10);
    map[coord] = id;
  }
}

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(map, null, 2), "utf8");

console.log(`Zapisano ${Object.keys(map).length} wpisów do ${OUTPUT}`);
