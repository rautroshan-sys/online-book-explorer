

export function cn(...inputs: unknown[]) {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}