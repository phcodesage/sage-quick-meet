// Random name generator for anonymous users

const adjectives = [
  'Happy', 'Clever', 'Bright', 'Swift', 'Calm', 'Bold', 'Wise', 'Kind',
  'Brave', 'Cool', 'Smart', 'Quick', 'Gentle', 'Noble', 'Proud', 'Keen',
  'Witty', 'Sunny', 'Merry', 'Jolly', 'Lively', 'Eager', 'Zesty', 'Peppy',
  'Daring', 'Mighty', 'Trusty', 'Loyal', 'Honest', 'Fair', 'True', 'Pure'
];

const nouns = [
  'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Hawk',
  'Lion', 'Falcon', 'Otter', 'Lynx', 'Raven', 'Phoenix', 'Dragon', 'Owl',
  'Jaguar', 'Cheetah', 'Panther', 'Cobra', 'Shark', 'Whale', 'Penguin', 'Koala',
  'Leopard', 'Gazelle', 'Stallion', 'Mustang', 'Bison', 'Moose', 'Elk', 'Deer'
];

/**
 * Generates a random name in the format "Adjective Noun"
 * Example: "Happy Panda", "Clever Tiger"
 */
export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

/**
 * Generates a random name with a number suffix
 * Example: "Happy Panda 42"
 */
export function generateRandomNameWithNumber(): string {
  const name = generateRandomName();
  const number = Math.floor(Math.random() * 100);
  return `${name} ${number}`;
}
