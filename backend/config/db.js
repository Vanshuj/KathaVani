const mongoose = require('mongoose');

// ─── In-memory store (fallback / demo) ───────────────────────────────────────
const inMemoryStore = { users: [], stories: [] };

// ─── Mode flag ────────────────────────────────────────────────────────────────
let usingMongo = false;
const isMongoMode = () => usingMongo;

// ─── Connect ──────────────────────────────────────────────────────────────────
const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || '').trim();

  if (!uri || uri === 'inmemory') {
    console.log('📦  Mode: in-memory (demo). Set MONGODB_URI to use real MongoDB.');
    seedInMemory();
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    usingMongo = true;
    console.log(`✅  MongoDB connected → ${uri}`);
    await seedMongo();
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    console.log('📦  Falling back to in-memory store.');
    seedInMemory();
  }
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_STORIES = [
  {
    title: "The Chola Emperor's Last Monsoon",
    content: "Deep in the annals of the Chola dynasty, when Rajendra Chola marched his armies to the Ganges, the monsoon arrived like a message from the gods. The ancient temple bells rang across the Kaveri delta, each peal echoing stories of valor and devotion...",
    language: 'English', region: 'Tamil Nadu',
    tags: ['mythology', 'Chola', 'history'],
    authenticity: 87, votes: 23, karma: 45,
    lat: 10.7905, lng: 79.8428, isModerated: true,
  },
  {
    title: "Rani Lakshmibai's Flame",
    content: "In the year 1857, when the British East India Company tightened its grip on Jhansi, a queen rose like the flame of a thousand lamps. Rani Lakshmibai, clad in armor, her son tied to her back, rode into the battle that would etch her name in eternity...",
    language: 'English', region: 'Central India',
    tags: ['resistance', 'freedom', 'Mughal', 'British Raj'],
    authenticity: 92, votes: 41, karma: 82,
    lat: 25.4484, lng: 78.5685, isModerated: true,
  },
  {
    title: 'The Silk Road Grandmother',
    content: "My grandmother walked three hundred miles from Punjab to Delhi during the great migration of 1947. She carried nothing but a brass pot, her grandmother's recipes carved into memory, and the songs that would never be forgotten. This is her story...",
    language: 'Hindi', region: 'North India',
    tags: ['migration', 'partition', 'family'],
    authenticity: 78, votes: 18, karma: 36,
    lat: 28.6139, lng: 77.2090, isModerated: true,
  },
  {
    title: "Kaveri's Secret Waters",
    content: "The river Kaveri holds secrets older than memory. In the village of Srirangapatna, an old boatman named Muniswamy knew where the river whispered ancient Sanskrit verses at midnight. His granddaughter dismisses the legends—until the night the river speaks to her...",
    language: 'Kannada', region: 'Karnataka',
    tags: ['folklore', 'mythology', 'nature'],
    authenticity: 81, votes: 29, karma: 58,
    lat: 12.4176, lng: 76.6784, isModerated: true,
  },
  {
    title: "The Warli Painter's Vision",
    content: "Among the Warli tribe of Maharashtra, painting is prayer. Old Sundari had painted the walls of her village for sixty years, each brushstroke a connection to ancestors who hunted deer in primeval forests. When the developers came, Sundari painted one final mural—a map of everything that would be lost...",
    language: 'Marathi', region: 'Maharashtra',
    tags: ['tribal', 'art', 'environment'],
    authenticity: 85, votes: 34, karma: 68,
    lat: 19.7515, lng: 75.7139, isModerated: true,
  },
  {
    title: "The Monkey and the Crocodile",
    content: "On the banks of the mighty Ganges, a wise monkey named Raktamukha lived on a jambu tree that bore sweet, ruby-like fruits. One day, a crocodile named Karalamukha crawled out of the river. The monkey offered him some jambu fruits, and they soon became fast friends. When Karalamukha took some fruits home to his wife, she tasted them and declared: 'If these fruits are so sweet, how delicious must be the heart of the monkey who eats them every day! Bring me his heart, or I shall starve to death.' Caught between love for his wife and loyalty to his friend, the crocodile devised a plan. He invited the monkey to his home for dinner, offering him a ride on his back across the river. Mid-way, as the water grew deep, Karalamukha confessed his dark purpose. Raktamukha, though terrified, kept his wits. 'Why did you not tell me sooner, my friend?' the monkey replied. 'I always keep my heart safe in a hollow of the jambu tree. Let us return so I can fetch it.' Believing him, the crocodile turned back. The moment they reached the shore, the monkey leaped off his back, climbed high into the safety of the tree, and shouted: 'O foolish crocodile! Can a heart ever be kept outside the body? Go, our friendship is over!'",
    language: 'English', region: 'Ancient India',
    tags: ['panchatantra', 'folklore', 'wisdom', 'ancient-india'],
    authenticity: 95, votes: 12, karma: 24,
    lat: 25.3176, lng: 82.9739, isModerated: true,
  },
  {
    title: "The Blue Jackal",
    content: "A hungry jackal named Chandaraka was prowling through a town looking for food when a pack of wild dogs chased him. Panicked, he ran into the house of a local dyer and accidentally fell into a large vat of blue dye. When he climbed out, he was colored a deep, striking blue. Returning to the forest, the other animals failed to recognize him and fled in terror. Realizing his advantage, Chandaraka stood tall and proclaimed: 'Do not fear! Lord Brahma himself has crowned me king of the jungle and dyed me with the color of the sky. I am here to protect you.' All the animals, including the mighty lion and the fierce tiger, bowed to him. The blue jackal enjoyed his new royal life, banishing his fellow jackals to keep his secret safe. But one evening, as the moon rose full, a pack of jackals in the distance began to howl. Unable to resist his natural instinct, Chandaraka lifted his head and joined the chorus. The lion and the tiger immediately recognized the howl. Realizing they had been fooled by a common jackal, they turned on him, ending his fraudulent reign. True nature can never be hidden for long.",
    language: 'English', region: 'Ancient India',
    tags: ['panchatantra', 'folklore', 'wisdom', 'ancient-india'],
    authenticity: 94, votes: 8, karma: 16,
    lat: 23.2599, lng: 77.4126, isModerated: true,
  },
  {
    title: "The Archery Test of Arjuna",
    content: "In the royal courtyards of Hastinapur, Dronacharya, the legendary master of military arts, gathered his young pupils, the Pandavas and Kauravas, for a special test. He hung a small wooden bird from the branch of a tree, its tiny eye painted as the target. Drona called upon Yudhisthira first, asking him to aim his bow. 'What do you see, Prince?' Drona asked. Yudhisthira replied: 'I see the tree, the branch, the bird, my brothers, and the sky.' Drona shook his head and told him to step aside. One by one, Duryodhana, Bhima, and the others were asked the same question, and all described the lush forest, the bird, and the surrounding scenery. None were allowed to shoot. Finally, Drona called Arjuna. 'What do you see now, Arjuna?' Arjuna took a deep breath, drew his string, and replied: 'Guru-ji, I see only the eye of the bird.' 'Do you not see the tree or the branch?' Drona inquired. 'No,' Arjuna answered, 'I see nothing but the eye.' Drona smiled and ordered: 'Shoot!' The arrow flew true, piercing the wooden bird's eye. True focus sees only the goal, ignoring all distractions.",
    language: 'English', region: 'North India',
    tags: ['mahabharat', 'epic', 'mythology', 'focus'],
    authenticity: 98, votes: 35, karma: 70,
    lat: 29.1700, lng: 78.0200, isModerated: true,
  },
  {
    title: "Yudhishthira and the Yaksha",
    content: "During their twelve-year exile in the forest, the Pandava brothers grew desperately thirsty. One by one, Sahadeva, Nakula, Arjuna, and Bhima went in search of water. They found a beautiful, clear lake, but as they bent to drink, a booming voice warned: 'This lake belongs to me. Answer my questions first, or you shall die.' Ignoring the voice, they drank and fell lifeless to the ground. When Yudhishthira, the eldest brother, came searching for them, he was struck with grief. As he approached the water, the voice spoke again. The Yaksha, a nature spirit, asked him a series of profound questions. 'What is faster than wind?' Yudhishthira replied: 'The mind.' 'What grows faster than grass?' Yudhishthira: 'Worry.' 'What is the greatest wonder in the world?' Yudhishthira answered: 'Every day, countless creatures die, yet those who remain live as if they will stay forever. This is the greatest wonder.' Pleased with his wisdom, the Yaksha offered to revive one of his brothers. Yudhishthira chose Nakula, his step-mother Madri's son, to ensure justice and balance for both mothers. Touched by his virtue, the Yaksha, who was Yamaraj in disguise, revived all the Pandavas.",
    language: 'English', region: 'Central India',
    tags: ['mahabharat', 'epic', 'mythology', 'wisdom'],
    authenticity: 97, votes: 27, karma: 54,
    lat: 24.0000, lng: 79.0000, isModerated: true,
  },
  {
    title: "Emperor Ashoka's Peace",
    content: "In 261 BCE, the forces of the Maurya Empire clashed with the kingdom of Kalinga. Emperor Ashoka, ambitious and relentless, sought to expand his reign over all of India. The battle was fierce and brutal, leaving over a hundred thousand soldiers dead and double that number displaced. Walking across the battlefield of Kalinga the following morning, Ashoka looked upon the silent rivers red with blood, the weeping widows, and the devastated landscape. A sudden, deep sorrow consumed him. 'What have I done?' he lamented. The hollow nature of his victory became clear. In that moment of profound remorse, Ashoka renounced violence and turned to the teachings of Gautama Buddha. He declared a new conquest—Dharmavijaya, the conquest by righteousness. He erected rock edicts and polished stone pillars throughout his empire, preaching peace, religious tolerance, and kindness to all living beings. Ashoka transformed from a ruthless conqueror into a patron of peace, sending emissaries across Asia to share the message of compassion.",
    language: 'English', region: 'Odisha',
    tags: ['history', 'ashoka', 'buddhism', 'ancient-india'],
    authenticity: 96, votes: 42, karma: 84,
    lat: 20.2700, lng: 85.8400, isModerated: true,
  },
  {
    title: "The Iron Pillar of Delhi",
    content: "Standing in the Qutb complex in Delhi, a tall, dark iron column has baffled scientists and metallurgists for centuries. Erected during the golden age of the Gupta Empire in the 4th century CE by Chandragupta II, this seven-meter-high pillar is made of 98% pure wrought iron. Despite being exposed to the harsh sun, monsoon rains, and winds of Delhi for over 1,600 years, it remains completely rust-free. The ancient Indian ironsmiths achieved this marvel by using a high phosphorus content in the iron and forming a protective passive layer of misawite, a crystalline iron oxyhydroxide, on its surface. The pillar stands as a silent testament to the advanced scientific knowledge and metallurgical skills of ancient India, proving that chemistry and engineering flourished in the region long before the modern era.",
    language: 'English', region: 'Delhi',
    tags: ['history', 'gupta', 'science', 'ancient-india'],
    authenticity: 93, votes: 19, karma: 38,
    lat: 28.5204, lng: 77.1850, isModerated: true,
  },
  {
    title: "The Seals of Mohenjo-daro",
    content: "In the fertile floodplains of the Indus Valley, over four thousand years ago, flourished one of the world's first great urban civilizations. At Mohenjo-daro, archaeologists discovered thousands of small, square steatite seals, each carved with incredible precision. These seals depicted exotic animals like elephants, tigers, rhinoceroses, and the famous one-horned unicorn, accompanied by an enigmatic script that remains undeciphered to this day. One famous seal, the Pashupati Seal, shows a seated, three-faced figure wearing a horned headdress, surrounded by wild animals, which many scholars believe is an early depiction of Shiva. Used by ancient merchants to stamp clay tags on trade goods, these seals connected India to the distant markets of Mesopotamia, telling a story of a peaceful, organized, and globalized ancient society.",
    language: 'English', region: 'Indus Valley',
    tags: ['history', 'harappan', 'archaeology', 'ancient-india'],
    authenticity: 91, votes: 25, karma: 50,
    lat: 27.3292, lng: 68.1389, isModerated: true,
  },
  {
    title: "Sujata's Milk Rice & The Middle Path",
    content: "During his six years of searching for truth, Prince Siddhartha practiced extreme ascetism, surviving on a single grain of rice a day until he was a walking skeleton, near the point of death. Seeing his fragile state on the banks of the Niranjana river, a village woman named Sujata offered him a golden bowl of fresh, sweet milk rice. Siddhartha accepted it, realizing that self-mortification only weakened the mind, and that the path to wisdom lay in moderation—the 'Middle Path' between extreme denial and indulgence. Nourished and restored, he sat beneath the Bodhi tree that very night and attained full enlightenment, becoming the Buddha. Sujata's quiet gesture of compassion remains an enduring symbol of how a simple act of kindness can change the course of spiritual history.",
    language: 'English', region: 'Bodh Gaya',
    tags: ['buddhism', 'wisdom', 'compassion', 'ancient-india'],
    authenticity: 95, votes: 15, karma: 30,
    lat: 24.6961, lng: 84.9914, isModerated: true,
  },
  {
    title: "Amrita Devi's Sacred Forest",
    content: "In the year 1730, in the desert village of Khejarli near Jodhpur, the Maharaja's soldiers arrived to fell the green Khejri trees for construction timber. Seeing the axes raised against the trees that her community held sacred, a village woman named Amrita Devi Bishnoi stood in front of a tree and declared: 'A chopped head is cheaper than a felled tree.' She hugged the trunk, refusing to let go, and was struck down by the soldiers. Inspired by her courage, her three daughters and eventually 363 other Bishnoi villagers stepped forward to hug the trees, sacrificing their lives before the Maharaja halted the massacre. This ultimate act of non-violent resistance remains one of history's most inspiring examples of environmental defense, inspiring the modern Chipko movement.",
    language: 'English', region: 'Rajasthan',
    tags: ['conservation', 'resistance', 'history', 'environment'],
    authenticity: 97, votes: 31, karma: 62,
    lat: 26.2167, lng: 73.0167, isModerated: true,
  },
  {
    title: "Avvaiyar and the Hot Fruits",
    content: "The legendary Tamil Sangam poetess Avvaiyar was traveling on foot on a hot afternoon when she stopped under a wild jambu tree. Feeling exhausted and hungry, she sat down. High up on a branch sat a young cowherd boy playing a flute. Seeing her, the boy asked: 'Poetess, would you like some jambu fruits?' Avvaiyar smiled and said yes. The boy then asked: 'Do you want hot fruits or cold fruits?' Highly amused by such a strange question from an illiterate boy, Avvaiyar replied: 'Give me hot fruits.' The boy shook a branch, and several ripe fruits fell to the ground. As they rolled in the dust, Avvaiyar picked one up and blew on it to clear the sand. The boy laughed and teased: 'Why are you blowing on it? Is it too hot to eat?' Avvaiyar stood stunned, realizing that the 'heat' was the dust, and blowing on it was exactly what one does to hot food. In that moment of deep humility, she recognized the boy was actually Lord Murugan, teaching her that knowledge is vast like the ocean, while what we know is but a handful of sand.",
    language: 'English', region: 'Tamil Nadu',
    tags: ['literature', 'wisdom', 'sangam', 'ancient-india'],
    authenticity: 96, votes: 22, karma: 44,
    lat: 9.9252, lng: 78.1198, isModerated: true,
  },
  {
    title: "Gopala's Forest Brother",
    content: "In a tiny village in ancient India, a little boy named Gopala was about to start school. To reach the village teacher, he had to walk alone through a dense, dark forest every morning. Overcome with fear, Gopala cried and told his mother he could not go. His mother, a poor widow, comforted him and said: 'Do not be afraid, my son. Your elder brother, Krishna, is a cowherd who lives in that forest. Whenever you feel scared, just call out: Brother Krishna, please come and walk with me.' The next day, when fear gripped him in the deep woods, Gopala called out. To his joy, a beautiful cowherd boy with a peacock feather in his crown emerged from the trees, took his hand, and walked him to school. This continued daily, showing that the simplest, most innocent faith can summon the divine to walk beside us in our darkest forests.",
    language: 'English', region: 'Vrindavan',
    tags: ['folklore', 'wisdom', 'mythology', 'faith'],
    authenticity: 94, votes: 14, karma: 28,
    lat: 27.5650, lng: 77.7008, isModerated: true,
  }
];

// Seed MongoDB
const seedMongo = async () => {
  try {
    const User  = require('../models/User');
    const Story = require('../models/Story');

    let priya = await User.findOne({ email: 'priya@demo.com' });
    let arjun = await User.findOne({ email: 'arjun@demo.com' });

    if (!priya || !arjun) {
      const bcrypt = require('bcryptjs');
      const hash   = await bcrypt.hash('demo123', 10);
      if (!priya) {
        priya = await User.create({ name: 'Priya Sharma', email: 'priya@demo.com', password: hash, language: 'Hindi',  region: 'North India', storyPreferences: ['mythology','folklore'],  narrationMode: 'voice', karma: 450, badges: ['Elder Storyteller','Myth Keeper'] });
      }
      if (!arjun) {
        arjun = await User.create({ name: 'Arjun Mehta',  email: 'arjun@demo.com', password: hash, language: 'Tamil',  region: 'South India', storyPreferences: ['resistance','migration'], narrationMode: 'text',  karma: 320, badges: ['Story Seed'] });
      }
      console.log(`🌱  Ensured demo users exist in MongoDB.`);
    }

    let seededCount = 0;
    for (const s of SEED_STORIES) {
      const exists = await Story.findOne({ title: s.title });
      if (!exists) {
        // Assign to Priya or Arjun based on title
        const authorUser = s.title.includes('Chola') || s.title.includes('Kaveri') || s.title.includes('Sujata') || s.title.includes('Gopala') ? priya : arjun;
        await Story.create({
          ...s,
          author: authorUser._id,
          authorName: authorUser.name,
          voterIds: [],
          nodeGraph: []
        });
        seededCount++;
      }
    }

    if (seededCount > 0) {
      console.log(`🌱  Seeded ${seededCount} new stories into MongoDB.`);
    } else {
      console.log(`ℹ️   All seed stories already exist in MongoDB.`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

// Seed in-memory store
const seedInMemory = () => {
  const bcrypt = require('bcryptjs');
  const hash   = bcrypt.hashSync('demo123', 10);

  inMemoryStore.users = [
    { _id: 'user-1', name: 'Priya Sharma', email: 'priya@demo.com', password: hash, language: 'Hindi', region: 'North India', storyPreferences: ['mythology','folklore'],  narrationMode: 'voice', karma: 450, badges: ['Elder Storyteller','Myth Keeper'], theme: 'light', fontSize: 16, notifications: true,  highContrast: false, subtitles: false, createdAt: new Date() },
    { _id: 'user-2', name: 'Arjun Mehta',  email: 'arjun@demo.com', password: hash, language: 'Tamil', region: 'South India', storyPreferences: ['resistance','migration'], narrationMode: 'text',  karma: 320, badges: ['Story Seed'],                    theme: 'dark',  fontSize: 14, notifications: false, highContrast: false, subtitles: true,  createdAt: new Date() },
  ];

  inMemoryStore.stories = SEED_STORIES.map((s, i) => ({
    ...s,
    _id:        `story-${i + 1}`,
    author:     `user-${(i % 2) + 1}`,
    authorName: i % 2 === 0 ? 'Priya Sharma' : 'Arjun Mehta',
    audioUrl:   null,
    videoUrl:   null,
    voterIds:   [],
    nodeGraph:  [],
    createdAt:  new Date(),
    updatedAt:  new Date(),
  }));
};

const getStore = () => inMemoryStore;

module.exports = { connectDB, getStore, isMongoMode };
