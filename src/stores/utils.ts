export const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const pause = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};
