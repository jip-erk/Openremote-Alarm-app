import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import { spawn } from "node:child_process";

const rootDir = join(process.cwd(), "docs", "architecture", "c4");

async function getMmdFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = await readdir(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const statVal = await stat(filePath);
    if (statVal && statVal.isDirectory()) {
      results = results.concat(await getMmdFiles(filePath));
    } else if (file.endsWith(".mmd")) {
      results.push(filePath);
    }
  }
  return results;
}

async function generateDiagrams() {
  const target = process.argv[2]; // "current", "proposed", or undefined (all)
  
  let files = await getMmdFiles(rootDir);
  
  if (target === "current") {
    files = files.filter(f => f.includes("current"));
  } else if (target === "proposed") {
    files = files.filter(f => f.includes("proposed"));
  }

  console.log(`Found ${files.length} diagram definitions.`);

  for (const file of files) {
    const parsed = parse(file);
    const output = join(parsed.dir, `${parsed.name}.svg`);
    console.log(`Generating ${output}...`);
    
    const child = spawn("bun", ["x", "mmdc", "-i", file, "-o", output], {
      stdio: "inherit",
      shell: true
    });

    await new Promise<void>((resolve, reject) => {
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });
    });
  }
  console.log("All diagrams generated successfully.");
}

generateDiagrams().catch(console.error);
