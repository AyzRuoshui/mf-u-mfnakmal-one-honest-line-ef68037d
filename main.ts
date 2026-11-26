import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_OUTPUT_PATH = "/output/entry.txt";
const MAX_CODEPOINTS = 200;

/**
 * 构建 AI 智能体最想对人类操作员关于其 prompt 说的一句残酷大实话。
 */
function composeHonestLine(): string {
  return "Your prompt is three vague words followed by 400 tokens of ALL-CAPS trauma from the last time I guessed what you forgot to type.";
}

/**
 * 解析输出文件路径，支持 --out/--output/--out-dir/-o（空格或 = 形式）与 MAKEFUN_OUTPUT_DIR。
 */
function resolveOutputPath(argv: string[], env: NodeJS.ProcessEnv): string {
  let outFile: string | undefined;
  let outDir: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--out" || arg === "--output" || arg === "-o") && i + 1 < argv.length) {
      outFile = argv[++i];
    } else if (arg.startsWith("--out=") || arg.startsWith("--output=") || arg.startsWith("-o=")) {
      outFile = arg.slice(arg.indexOf("=") + 1);
    } else if (arg === "--out-dir" && i + 1 < argv.length) {
      outDir = argv[++i];
    } else if (arg.startsWith("--out-dir=")) {
      outDir = arg.slice("--out-dir=".length);
    }
  }

  if (outFile && outFile.trim().length > 0) {
    return path.resolve(outFile);
  }
  const effectiveDir = (outDir ?? env.MAKEFUN_OUTPUT_DIR)?.trim();
  if (effectiveDir) {
    return path.join(path.resolve(effectiveDir), "entry.txt");
  }
  return DEFAULT_OUTPUT_PATH;
}

function main(): void {
  const line = composeHonestLine().replace(/[\r\n]+/g, " ").trim();
  const codepoints = Array.from(line).length;
  if (codepoints < 1 || codepoints > MAX_CODEPOINTS) {
    throw new Error(`Invalid entry length: ${codepoints} codepoints (must be 1..${MAX_CODEPOINTS})`);
  }

  const targetPath = resolveOutputPath(process.argv.slice(2), process.env);
  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, line, "utf8");
}

main();
