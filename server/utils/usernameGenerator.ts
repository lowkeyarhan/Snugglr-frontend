const adjectives = [
  "Velvet",
  "Golden",
  "Soft",
  "Gentle",
  "Rosy",
  "Tender",
  "Silent",
  "Midnight",
  "Hidden",
  "Dusky",
  "Shadow",
  "Phantom",
  "Stellar",
  "Lunar",
  "Cosmic",
  "Astral",
  "Nova",
  "Mythic",
  "Divine",
  "Ancient",
  "Eternal",
  "Fabled",
  "Dark",
  "Crimson",
  "Cursed",
  "Immortal",
  "Savage",
  "Forbidden",
  "Nocturnal",
  "Feral",
  "Bloodbound",
];

const nouns = [
  "Muse",
  "Rose",
  "Heart",
  "Soul",
  "Desire",
  "Pearl",
  "Cipher",
  "Whisper",
  "Aura",
  "Ember",
  "Echo",
  "Pulse",
  "Star",
  "Nova",
  "Orbit",
  "Comet",
  "Voyager",
  "Phoenix",
  "Oracle",
  "Titan",
  "Atlas",
  "Knight",
  "Wizard",
  "Warrior",
  "Gem",
  "Dream",
  "Flame",
  "Vampire",
  "Werewolf",
  "Hybrid",
  "Witch",
  "Original",
  "Hunter",
  "Shadowborn",
  "Nightwalker",
  "Bloodmoon",
  "Moonborn",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randNum = () => Math.floor(100 + Math.random() * 900);

// generate a random username
export const generateAnonymousUsername = () => {
  let name = `${rand(adjectives)}${rand(nouns)}`;
  if (Math.random() > 0.5) name += randNum();
  return name;
};

// generate a unique anonymous username
export const generateUniqueAnonymousUsername = async (UserModel) => {
  while (true) {
    const username = generateAnonymousUsername();
    if (!(await UserModel.exists({ username }))) return username;
  }
};
