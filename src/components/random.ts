export const getRandomInt = (max: number): number => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    if (max === 0) return 0;
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return randomValues[0] % max;
  }

  console.warn(
    "Warning: Using insecure Math.random() as a fallback for password generation.",
  );
  if (max === 0) return 0;
  return Math.floor(Math.random() * max);
};
