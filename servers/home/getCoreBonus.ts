export function getCoreBonus(cores: number = 1): number {
  const coreBonus = 1 + (cores - 1) / 16;
  return coreBonus;
}

export async function main(ns: NS): Promise<void> {
  return
}