import path from "path";

const DEFAULT_DATA_DIR = "./data";

export function getDataDir(): string {
  const dataDir = process.env.DATA_DIR ?? DEFAULT_DATA_DIR;
  return path.isAbsolute(dataDir)
    ? dataDir
    : path.resolve(process.cwd(), dataDir);
}
