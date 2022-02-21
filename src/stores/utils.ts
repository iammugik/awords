export const getRandomElement = <T>(dictionary: T[]): T => {
  return dictionary[Math.floor(Math.random() * dictionary.length)];
};
