// Deterministic cultural content generators and natural language heuristics

const CULTURAL_KEYWORDS = {
  chola: ['The temple bells of Thanjavur rang across the Kaveri delta', 'Ancient Chola naval ships set sail toward the rising sun', 'A bronze Nataraja statue whispered its secrets to the river'],
  mughal: ['The scent of attar floated through the marble corridors of the Red Fort', 'A poet at Akbar\'s court penned verses that outlasted the empire', 'Miniature paintings captured the emperor\'s dreams in lapis lazuli and gold'],
  maratha: ['The Deccan winds carried the sound of Shivaji\'s war drums', 'From the heights of Raigad Fort, the horizon stretched impossibly wide', 'A guerrilla soldier melted into the Sahyadri forest, leaving no trace'],
  folk: ['The village elder began her tale as the monsoon clouds gathered', 'A young woman disguised herself as a merchant and crossed seven rivers', 'The banyan tree at the center of the village held all the stories ever told'],
  migration: ['The last train to Delhi carried more than passengers: it carried memories', 'A grandmother stitched the map of her old home into her daughter\'s wedding dupatta', 'Border. A word that meant nothing to the birds, everything to the people'],
  nature: ['The river changed course that night, as if the land itself was grieving', 'In the forest where tigers once roamed, a child heard ancient drumbeats', 'The monsoon returned, but the village it remembered was already gone']
};

const DEFAULT_NODES = [
  'A mysterious stranger arrived with a sealed letter from the old capital',
  'The village council gathered under the ancient peepal tree to decide the fate of the sacred grove',
  'A storm revealed the entrance to a forgotten underground chamber filled with manuscript pages',
  'The protagonist discovered their family had been guardians of a centuries-old secret',
  'An elder appeared in a dream and revealed the missing verse of the ancient song'
];

export const generateNodeSuggestions = (storyText) => {
  const text = storyText.toLowerCase();
  let suggestions = [];

  Object.entries(CULTURAL_KEYWORDS).forEach(([key, phrases]) => {
    if (text.includes(key) || text.includes(key.slice(0, 4))) {
      suggestions.push(...phrases);
    }
  });

  if (suggestions.length < 3) suggestions.push(...DEFAULT_NODES);

  // Shuffle and return 3-5
  const shuffled = suggestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
};

export const generateWhatIf = (storyText) => {
  const endings = [
    {
      title: 'Path of Peace',
      text: 'What if the warring factions had chosen dialogue over conflict? A peace treaty was signed under the sacred banyan tree, and the two communities merged their traditions into a festival celebrated every monsoon: the Festival of Confluence, where stories from both sides are told together, creating a tapestry richer than either alone could weave.'
    },
    {
      title: 'The Tragic Sacrifice',
      text: 'What if the hero had chosen to sacrifice themselves to protect the sacred knowledge? In this alternate thread of history, a single act of selfless devotion preserved the ancient manuscripts for seven more generations. The martyr became a legend, their name spoken in hushed reverence by storytellers who never met them but carried their torch into the future.'
    },
    {
      title: 'The Hidden Alliance',
      text: 'What if enemies had secretly been allies all along? Behind the scenes of conflict, two rivals collaborated to protect something greater than both their kingdoms. Their correspondence, discovered centuries later, revealed a conspiracy of kindness: proof that even in the darkest times, some souls chose to build bridges from the rubble of war.'
    },
    {
      title: 'The Long Exile',
      text: 'What if the protagonist had chosen exile over compromise? Living in the mountains for forty years, they became the keeper of stories that would otherwise have been lost, returning only once, in old age, to deposit their collected wisdom in the village library before disappearing into the mist forever.'
    }
  ];
  const idx = Math.floor(Math.random() * 2);
  return [endings[idx], endings[(idx + 2) % 4]];
};

export const generateStorySprout = () => {
  const animals = ['clever mongoose', 'wise elephant', 'curious sparrow', 'brave river dolphin', 'ancient tortoise', 'mischievous monkey'];
  const objects = ['a golden lamp', 'a torn map', 'a singing stone', 'an invisible thread', 'a forgotten seed', 'a broken flute'];
  const morals = ['kindness outlasts cruelty', 'patience is the deepest wisdom', 'small voices carry the farthest truths', 'home lives in the heart, not the land', 'courage is not the absence of fear', 'every story contains a universe'];

  const a = animals[Math.floor(Math.random() * animals.length)];
  const o = objects[Math.floor(Math.random() * objects.length)];
  const m = morals[Math.floor(Math.random() * morals.length)];

  return `Once upon a time in a village where the banyan tree touched the sky, a ${a} discovered ${o}. The entire village was puzzled: what could this mean? Through a journey of seven days and seven nights, past rivers and riddles, the ${a} learned that ${m}. And so the village celebrated, and the story was told again and again, each time growing a little more beautiful, like a lotus blooming in still water.`;
};

export const analyzeSentiment = (text) => {
  const joyWords = ['happy', 'joy', 'celebration', 'festival', 'love', 'hope', 'triumph', 'glory', 'dance', 'sing'];
  const sorrowWords = ['grief', 'loss', 'mourn', 'tear', 'exile', 'sacrifice', 'tragedy', 'farewell', 'gone', 'forgotten'];
  const angerWords = ['battle', 'war', 'fight', 'resist', 'rebel', 'rage', 'defiance', 'injustice', 'oppression'];
  const mysteryWords = ['secret', 'hidden', 'ancient', 'whisper', 'shadow', 'unknown', 'mystery', 'sacred', 'ritual'];

  const lower = text.toLowerCase();
  const scores = {
    joy: joyWords.filter(w => lower.includes(w)).length,
    sorrow: sorrowWords.filter(w => lower.includes(w)).length,
    anger: angerWords.filter(w => lower.includes(w)).length,
    mystery: mysteryWords.filter(w => lower.includes(w)).length
  };

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const moods = { joy: 'Celebratory', sorrow: 'Melancholic', anger: 'Passionate', mystery: 'Mystical' };
  const narrations = {
    joy: 'Speaking in warm, bright tones with gentle rhythm',
    sorrow: 'Speaking softly with long pauses and quiet reverence',
    anger: 'Speaking with intensity and measured conviction',
    mystery: 'Speaking in hushed, contemplative tones'
  };

  return {
    mood: moods[dominant[0]] || 'Contemplative',
    narrationStyle: narrations[dominant[0]] || 'Speaking with thoughtful pacing',
    scores
  };
};

export const SOUNDSCAPES = [
  { id: 'temple', name: 'Temple Bells & Rain', description: 'The resonance of temple bells mingling with monsoon rain on stone floors, meditative and ancient.' },
  { id: 'forest', name: 'Sacred Forest', description: 'Rustling sal trees, distant peacock calls, the drone of cicadas in a primeval Indian forest.' },
  { id: 'river', name: 'River Ghats at Dawn', description: 'The gentle lapping of the Ganges, priests\' chants, the first birds of morning over sacred waters.' },
  { id: 'bazaar', name: 'Spice Market', description: 'The vibrant cacophony of an old Indian bazaar, with vendors calling, bangles clinking, stories exchanging.' },
  { id: 'desert', name: 'Rajasthan Dunes', description: 'Wind across the Thar Desert, a lone sarangi playing in the distance, the vast silence between notes.' },
  { id: 'coastal', name: 'Kerala Backwaters', description: 'Oars in still water, a boatman\'s folk song, coconut palms swaying in the coastal breeze.' },
];

export const LANGUAGES = [
  { code: 'en-IN', langCode: 'en', name: 'English', label: 'English' },
  { code: 'hi-IN', langCode: 'hi', name: 'Hindi', label: 'हिंदी' },
  { code: 'ta-IN', langCode: 'ta', name: 'Tamil', label: 'தமிழ்' },
  { code: 'te-IN', langCode: 'te', name: 'Telugu', label: 'తెలుగు' },
  { code: 'bn-IN', langCode: 'bn', name: 'Bengali', label: 'বাংলা' },
  { code: 'mr-IN', langCode: 'mr', name: 'Marathi', label: 'मराठी' },
  { code: 'gu-IN', langCode: 'gu', name: 'Gujarati', label: 'ગુજરાતી' },
  { code: 'kn-IN', langCode: 'kn', name: 'Kannada', label: 'ಕನ್ನಡ' },
  { code: 'ml-IN', langCode: 'ml', name: 'Malayalam', label: 'മലയാളം' },
  { code: 'or-IN', langCode: 'or', name: 'Odia', label: 'ଓଡ଼ିଆ' },
  { code: 'pa-IN', langCode: 'pa', name: 'Punjabi', label: 'ਪੰਜਾਬੀ' },
  { code: 'as-IN', langCode: 'as', name: 'Assamese', label: 'অসমীয়া' },
];
