import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadphones,
  faBookOpen,
  faVolumeUp,
  faSparkles,
  faPlay,
  faPause,
  faStar,
  faHeart,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import clayDuoImage from '../assets/clay_storytelling_duo.png';
import { useSpeech } from '../hooks/useSpeech';

const FALLBACK_ORAL_STORIES = [
  {
    _id: 'chola-monsoon',
    title: "The Chola Emperor's Last Monsoon",
    region: 'Kaveri Delta, Tamil Nadu',
    mode: 'Listening (Audio Oral History)',
    activeCharacter: 'boy',
    quote: '"The river boatmen hummed the celestial ballad as temple torches lit the night waters."',
    badge: 'Ancient Naval Ballad',
    listenTime: '6 min audio',
    tags: ['Maritime Lore', 'Chola Dynasty', 'Oral Ballad'],
    language: 'English',
    content: "Deep in the annals of the Chola dynasty, when Rajendra Chola marched his armies to the Ganges, the monsoon arrived like a message from the gods. The ancient temple bells rang across the Kaveri delta, each peal echoing stories of valor and devotion."
  },
  {
    _id: 'rani-flame',
    title: "Rani Lakshmibai's Sacred Flame",
    region: 'Bundelkhand, Madhya Pradesh',
    mode: 'Reading (Living Manuscript)',
    activeCharacter: 'girl',
    quote: '"With her child bound safely under moonlight, the harvest songs carried her bravery."',
    badge: 'Women Folk Ballad',
    listenTime: '8 min audio',
    tags: ['Freedom Lore', 'Folklore', 'Oral History'],
    language: 'English',
    content: "In the year 1857, when the British East India Company tightened its grip on Jhansi, a queen rose like the flame of a thousand lamps. Rani Lakshmibai, clad in armor, her son tied to her back, rode into the battle that would etch her name in eternity."
  },
  {
    _id: 'kaveri-secrets',
    title: "Kaveri's Whispering Waters",
    region: 'Srirangapatna, Karnataka',
    mode: 'Listening (Oral Tradition)',
    activeCharacter: 'boy',
    quote: '"Old Muniswamy could decipher water currents like ancient Sanskrit verses."',
    badge: 'River Boatmen Tale',
    listenTime: '5 min audio',
    tags: ['Folk Wisdom', 'Water Lore', 'Karnataka'],
    language: 'Kannada',
    content: "The river Kaveri holds secrets older than memory. In the village of Srirangapatna, an old boatman named Muniswamy knew where the river whispered ancient Sanskrit verses at midnight."
  },
  {
    _id: 'warli-vision',
    title: "The Warli Painter's Vision",
    region: 'Dahanu, Maharashtra',
    mode: 'Reading (Illustrated Folktale)',
    activeCharacter: 'girl',
    quote: '"Each white brushstroke on red mud connected us to primeval forests of our ancestors."',
    badge: 'Tribal Art Folklore',
    listenTime: '7 min audio',
    tags: ['Tribal Art', 'Warli Lore', 'Maharashtra'],
    language: 'Marathi',
    content: "Among the Warli tribe of Maharashtra, painting is prayer. Old Sundari had painted the walls of her village for sixty years, each brushstroke a connection to ancestors who hunted deer in primeval forests."
  }
];

export default function ClayStorytellingDuo({ stories = [] }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const { speak, stopSpeaking, isSpeaking } = useSpeech();

  // Map real archive stories if provided, otherwise use fallback
  const activeStories = stories && stories.length > 0
    ? stories.slice(0, 6).map((s, idx) => ({
        _id: s._id,
        title: s.title,
        region: s.region || 'Oral Lore, India',
        mode: idx % 2 === 0 ? 'Listening (Audio Oral History)' : 'Reading (Living Manuscript)',
        activeCharacter: idx % 2 === 0 ? 'boy' : 'girl',
        quote: s.content 
          ? `"${s.content.slice(0, 115).trim()}..."`
          : '"Ancient oral memory passed down through village hearths."',
        badge: `${(s.tags && s.tags[0]) || s.language || 'Folklore'} Tale`,
        listenTime: `${Math.max(1, Math.round(((s.content || '').split(/\s+/).length) / 130))} min audio`,
        tags: s.tags || ['Oral Lore'],
        content: s.content,
        language: s.language || 'English'
      }))
    : FALLBACK_ORAL_STORIES;

  const current = activeStories[storyIndex % activeStories.length] || FALLBACK_ORAL_STORIES[0];

  // Auto-cycle stories smoothly every 8 seconds if not currently speaking
  useEffect(() => {
    if (isSpeaking) return;
    const interval = setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % activeStories.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isSpeaking, activeStories.length]);

  const handleNextStory = (e) => {
    e.stopPropagation();
    if (isSpeaking) stopSpeaking();
    setStoryIndex((prev) => (prev + 1) % activeStories.length);
  };

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textToSpeak = current.content || current.quote;
      speak(textToSpeak, current.language || 'English');
    }
  };

  const handleReadStory = (e) => {
    e.stopPropagation();
    if (isSpeaking) stopSpeaking();
    if (current._id) {
      navigate(`/story/${current._id}`);
    } else {
      navigate('/listener');
    }
  };

  const handleExplore = () => {
    if (current._id) {
      navigate(`/story/${current._id}`);
    } else {
      navigate('/listener');
    }
  };

  return (
    <div
      className="clay-duo-wrapper"
      role="region"
      aria-label="Interactive 3D Clay Storytelling Illustration"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Clay Pedestal Card with Double Clay Bevel */}
      <div className="clay-duo-card">
        {/* Floating Ambient Status Tag (Top Left of Card) */}
        <div className="clay-duo-topbar">
          <div className="clay-duo-pill-mode">
            <span className="clay-pulse-dot" />
            <FontAwesomeIcon
              icon={current.activeCharacter === 'boy' ? faHeadphones : faBookOpen}
              className="clay-mode-icon"
            />
            <span className="clay-mode-text">{current.mode}</span>
          </div>

          <button
            className={`clay-icon-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            aria-label="Save this story to favorites"
            title="Favorite Tale"
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>

        {/* Centerpiece 3D Clay Illustration Stage */}
        <div className="clay-stage-container" onClick={handleExplore}>
          {/* Background Soft Clay Glow Aura */}
          <div className="clay-glow-aura" />

          {/* Floating Animated 3D Clay Accents */}
          <div className="clay-floating-notes" aria-hidden="true">
            <span className="clay-note clay-note-1">♪</span>
            <span className="clay-note clay-note-2">♫</span>
            <span className="clay-note clay-note-3">♪</span>
            <span className="clay-star-badge clay-star-1">★</span>
            <span className="clay-star-badge clay-star-2">★</span>
          </div>

          {/* Audio Wave Pulsing from Boy's Headphones */}
          <div className="clay-headphone-waves" aria-hidden="true">
            <span className="wave-bar bar-1" />
            <span className="wave-bar bar-2" />
            <span className="wave-bar bar-3" />
            <span className="wave-bar bar-4" />
          </div>

          {/* The High-Quality 3D Clay Render of the Boy and Girl */}
          <div className="clay-duo-img-wrapper">
            <img
              src={clayDuoImage}
              alt="3D Clay art of a girl reading a folk tale book and a boy listening to an audio story wearing headphones"
              className="clay-duo-img"
              loading="eager"
            />
          </div>

          {/* Interactive Floating Clay Quote Plaque */}
          <div className="clay-quote-plaque">
            <div className="clay-quote-header">
              <span className="clay-quote-region">{current.region}</span>
              <span className="clay-quote-badge">{current.badge}</span>
            </div>
            <p className="clay-quote-text">{current.quote}</p>
            <div className="clay-quote-footer">
              <span className="clay-story-title">{current.title}</span>
              <span className="clay-listen-chip">
                <FontAwesomeIcon icon={faVolumeUp} /> {current.listenTime}
              </span>
            </div>
          </div>
        </div>

        {/* Clay Interactive Controller Dock */}
        <div className="clay-duo-controls">
          <button
            className="btn btn-primary clay-play-btn"
            onClick={handleTogglePlay}
            aria-label={isSpeaking ? 'Pause audio story narration' : 'Play audio story narration'}
          >
            <FontAwesomeIcon icon={isSpeaking ? faPause : faPlay} style={{ marginRight: 8 }} />
            <span>{isSpeaking ? 'Listening Live' : 'Listen Story'}</span>
          </button>

          <button
            className="btn btn-secondary clay-read-btn"
            onClick={handleReadStory}
            aria-label="Read full story in archive"
          >
            <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: 8 }} />
            <span>Read Story</span>
          </button>

          <button
            className="clay-next-story-btn"
            onClick={handleNextStory}
            aria-label="Switch to next featured tale"
            title="Next Story"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {/* Carousel Progress Dots */}
        <div className="clay-story-dots">
          {activeStories.map((story, idx) => (
            <button
              key={story.title + idx}
              onClick={(e) => {
                e.stopPropagation();
                if (isSpeaking) stopSpeaking();
                setStoryIndex(idx);
              }}
              className={`clay-dot ${idx === (storyIndex % activeStories.length) ? 'active' : ''}`}
              aria-label={`Jump to tale ${idx + 1}: ${story.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
