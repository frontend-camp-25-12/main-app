import path from "path";

export function firstToLowerCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function getRelativePathTsImport(from: string, to: string): string {
  return path.relative(path.dirname(from), to)
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');
}