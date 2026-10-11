import React, { useState } from 'react';

const ARCHIVE_FOLK_TALES = [
  {
    chapter: 'VOL. I • MALABAR COAST',
    title: 'The Whispering Banyan',
    lines: [
      'Beneath sacred aerial roots on the Periyar riverbank,',
      'village elders listened to monsoon night murmurs.',
      'The trees guarded seven generations of fisherfolk,',
      'foretelling rising tides before storm winds arrived.'
    ],
    custodian: 'Devaki Amma (7th Gen Custodian)',
    pageNo: '14',
    nextPageNo: '15'
  },
  {
    chapter: 'VOL. II • BUNDELKHAND',
    title: "Rani's Sacred Flame",
    lines: [
      'Under moonlit ramparts of the red stone fort,',
      'women wove ballads of courage and sovereign pride.',
      'A child carried through fire and midnight shadows,',
      'sung in every harvest songline across the plains.'
    ],
    custodian: 'Bundelkhand Women Collective',
    pageNo: '28',
    nextPageNo: '29'
  },
  {
    chapter: 'VOL. III • THAR DESERT',
    title: 'Desert Manganiyar Lore',
    lines: [
      'Across shimmering dunes and ancient trade paths,',
      'the kamaycha bow stirs the memory of travelers.',
      'Genealogical songs passed from father to daughter,',
      'mapping secret water cisterns under starlit skies.'
    ],
    custodian: 'Manganiyar Heritage Guild',
    pageNo: '42',
    nextPageNo: '43'
  }
];

export default function ClaymorphicBook() {
  const [pageIndex, setPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const currentStory = ARCHIVE_FOLK_TALES[pageIndex];

  const handleFlipPage = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setPageIndex((prev) => (prev + 1) % ARCHIVE_FOLK_TALES.length);
      setIsFlipping(false);
    }, 450);
  };

  return (
    <div
      className="clay-book-wrapper"
      onClick={handleFlipPage}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFlipPage();
        }
      }}
      aria-label={`Interactive ancient archival book. Currently open to ${currentStory.title}. Click or press Enter to turn page.`}
      title="Click book to turn page and discover living oral stories"
    >
      <svg
        className={`clay-book-svg ${isFlipping ? 'flipping-active' : ''}`}
        viewBox="0 0 540 370"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ─────────────────────────────────────────────────────────────
              CLAYMORPHIC SHADOWS, GRADIENTS & FILTERS
          ────────────────────────────────────────────────────────────── */}
          {/* Ground Contact Shadow */}
          <radialGradient id="bookGroundGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--clay-book-ground-stop1, rgba(140, 49, 15, 0.28))" />
            <stop offset="60%" stopColor="var(--clay-book-ground-stop2, rgba(45, 22, 10, 0.12))" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Clay Terracotta Cover Gradient */}
          <linearGradient id="clayCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--clay-book-cover-top, #c85324)" />
            <stop offset="50%" stopColor="var(--clay-book-cover-mid, #b34419)" />
            <stop offset="100%" stopColor="var(--clay-book-cover-bot, #8a300d)" />
          </linearGradient>

          {/* Thick Stacked Pages Clay Edge */}
          <linearGradient id="pageStackGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="var(--clay-book-stack-edge, #e8ddc8)" />
            <stop offset="25%" stopColor="var(--clay-book-stack-mid, #d5c6ab)" />
            <stop offset="50%" stopColor="var(--clay-book-stack-core, #c5b496)" />
            <stop offset="75%" stopColor="var(--clay-book-stack-mid, #d5c6ab)" />
            <stop offset="100%" stopColor="var(--clay-book-stack-edge, #e8ddc8)" />
          </linearGradient>

          {/* Left Parchment Leaf (Inward Spine Shadow to Light Outer Edge) */}
          <linearGradient id="leftParchmentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--clay-book-page-outer, #fffdf8)" />
            <stop offset="78%" stopColor="var(--clay-book-page-mid, #f7f0e2)" />
            <stop offset="100%" stopColor="var(--clay-book-gutter-shadow, #dfd2bc)" />
          </linearGradient>

          {/* Right Parchment Leaf (Spine Shadow to Light Outer Edge) */}
          <linearGradient id="rightParchmentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--clay-book-gutter-shadow, #dfd2bc)" />
            <stop offset="22%" stopColor="var(--clay-book-page-mid, #f7f0e2)" />
            <stop offset="100%" stopColor="var(--clay-book-page-outer, #fffdf8)" />
          </linearGradient>

          {/* Golden Silk Bookmark Ribbon */}
          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--clay-book-ribbon-1, #e8a946)" />
            <stop offset="45%" stopColor="var(--clay-book-ribbon-2, #d4952d)" />
            <stop offset="100%" stopColor="var(--clay-book-ribbon-3, #9e6c13)" />
          </linearGradient>

          {/* Turning Page Gradient */}
          <linearGradient id="turningPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--clay-book-turn-light, #ffffff)" />
            <stop offset="70%" stopColor="var(--clay-book-turn-mid, #f4ebe0)" />
            <stop offset="100%" stopColor="var(--clay-book-turn-dark, #decbb2)" />
          </linearGradient>

          {/* Clay Seal Wax Gradient */}
          <linearGradient id="sealWaxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--clay-book-seal-1, #cf5422)" />
            <stop offset="100%" stopColor="var(--clay-book-seal-2, #8c310f)" />
          </linearGradient>

          {/* Drop Cap Golden Embellishment */}
          <linearGradient id="goldDropCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--clay-book-gold-1, #ffd875)" />
            <stop offset="100%" stopColor="var(--clay-book-gold-2, #b88318)" />
          </linearGradient>
        </defs>

        {/* 1. Ground Ambient Clay Shadow Cushion */}
        <ellipse
          cx="270"
          cy="344"
          rx="215"
          ry="18"
          fill="url(#bookGroundGlow)"
          className="clay-book-ground-shadow"
        />

        {/* 2. Main Levitating Book Body */}
        <g className="clay-book-body-group">

          {/* ── Terracotta Book Outer Binding (Hardcover Rim) ── */}
          <path
            d="M 270 54 
               C 215 50, 115 55, 34 68 
               C 24 70, 18 78, 18 89 
               L 18 296 
               C 18 307, 25 315, 36 313 
               C 118 299, 218 295, 270 300 
               C 322 295, 422 299, 504 313 
               C 515 315, 522 307, 522 296 
               L 522 89 
               C 522 78, 516 70, 506 68 
               C 425 55, 325 50, 270 54 Z"
            fill="url(#clayCoverGrad)"
            className="clay-book-outer-cover"
          />

          {/* Cover Spine Relief Crease */}
          <path
            d="M 270 54 L 270 300"
            stroke="var(--clay-book-spine-crease, #6e2407)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* ── Stacked Page Block Edges (Tangible Clay Leaf Thickness) ── */}
          {/* Left Stack Pages Rim */}
          <path
            d="M 29 88 
               C 114 74, 212 70, 266 74 
               L 266 295 
               C 212 291, 114 295, 29 308 
               Z"
            fill="url(#pageStackGrad)"
            opacity="0.95"
          />
          {/* Right Stack Pages Rim */}
          <path
            d="M 511 88 
               C 426 74, 328 70, 274 74 
               L 274 295 
               C 328 291, 426 295, 511 308 
               Z"
            fill="url(#pageStackGrad)"
            opacity="0.95"
          />

          {/* Subtle Page Edge Deckle Stacks (Lines) */}
          <path d="M 26 298 C 110 286, 210 282, 265 287" stroke="var(--clay-book-deckle-line, rgba(90, 45, 15, 0.22))" strokeWidth="1.2" />
          <path d="M 24 303 C 110 290, 210 286, 265 291" stroke="var(--clay-book-deckle-line, rgba(90, 45, 15, 0.18))" strokeWidth="1.2" />
          <path d="M 514 298 C 430 286, 330 282, 275 287" stroke="var(--clay-book-deckle-line, rgba(90, 45, 15, 0.22))" strokeWidth="1.2" />
          <path d="M 516 303 C 430 290, 330 286, 275 291" stroke="var(--clay-book-deckle-line, rgba(90, 45, 15, 0.18))" strokeWidth="1.2" />

          {/* ── LEFT OPEN PARCHMENT PAGE ── */}
          <path
            d="M 268 64 
               C 216 60, 118 64, 40 78 
               C 34 79, 30 84, 30 90 
               L 30 284 
               C 30 290, 35 294, 41 293 
               C 120 280, 216 278, 268 283 Z"
            fill="url(#leftParchmentGrad)"
            className="clay-book-parchment-left"
          />

          {/* Left Page Delicate Filigree Border */}
          <rect
            x="48"
            y="76"
            width="204"
            height="198"
            rx="6"
            fill="none"
            stroke="var(--clay-book-border-tint, rgba(179, 68, 25, 0.18))"
            strokeWidth="1"
            strokeDasharray="4 2"
          />

          {/* Left Page Top Corner Mandalas */}
          <circle cx="56" cy="84" r="3.5" fill="var(--gold)" opacity="0.7" />
          <circle cx="244" cy="84" r="3.5" fill="var(--gold)" opacity="0.7" />

          {/* Left Page Header: Ancient Oral Seal & Volume */}
          <text
            x="150"
            y="94"
            textAnchor="middle"
            fontFamily="var(--font-mono, monospace)"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.12em"
            fill="var(--terracotta)"
          >
            ✦ KATHAVANI ARCHIVE ✦
          </text>
          <text
            x="150"
            y="106"
            textAnchor="middle"
            fontFamily="var(--font-editorial, serif)"
            fontSize="10"
            fontStyle="italic"
            fill="var(--charcoal-faint)"
          >
            {currentStory.chapter}
          </text>

          {/* Left Page Illuminated Drop Cap Medallion */}
          <g transform="translate(56, 120)">
            {/* Clay Drop-Cap Base */}
            <rect
              x="0"
              y="0"
              width="36"
              height="36"
              rx="9"
              fill="url(#goldDropCap)"
              className="clay-dropcap-medallion"
            />
            {/* Sacred Indian Letter "क" (Katha) or Decorative Glyph */}
            <text
              x="18"
              y="26"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontSize="24"
              fontWeight="bold"
              fill="#522405"
            >
              क
            </text>
          </g>

          {/* Left Page Story Title & First Lines */}
          <text
            x="100"
            y="136"
            fontFamily="var(--font-display, serif)"
            fontSize="13"
            fontWeight="700"
            fill="var(--forest-green)"
          >
            {currentStory.title}
          </text>
          <text
            x="100"
            y="150"
            fontFamily="var(--font-body, serif)"
            fontSize="9"
            fontStyle="italic"
            fill="var(--charcoal-faint)"
          >
            Recorded Tradition
          </text>

          {/* Left Page Calligraphic Story Lines */}
          {currentStory.lines.slice(0, 2).map((line, i) => (
            <text
              key={i}
              x="56"
              y={175 + i * 14}
              fontFamily="var(--font-body, serif)"
              fontSize="9.2"
              fill="var(--charcoal)"
              letterSpacing="0.01em"
            >
              {line}
            </text>
          ))}

          {/* Left Page Traditional Sacred Motif (Paisley / Banyan Silhouette) */}
          <g transform="translate(62, 212)" opacity="0.45">
            <path
              d="M 0 25 C 20 0, 45 10, 60 25 C 75 40, 100 20, 120 25"
              fill="none"
              stroke="var(--forest-green)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <circle cx="60" cy="25" r="3" fill="var(--terracotta)" />
          </g>

          {/* Left Page Bottom Number & Custodian Line */}
          <text
            x="60"
            y="262"
            fontFamily="var(--font-mono, monospace)"
            fontSize="7.5"
            fill="var(--charcoal-faint)"
          >
            {currentStory.custodian}
          </text>
          <text
            x="240"
            y="262"
            textAnchor="end"
            fontFamily="var(--font-display, serif)"
            fontSize="9"
            fontWeight="600"
            fill="var(--charcoal-faint)"
          >
            • {currentStory.pageNo} •
          </text>

          {/* ── RIGHT OPEN PARCHMENT PAGE ── */}
          <path
            d="M 272 64 
               C 324 60, 422 64, 500 78 
               C 506 79, 510 84, 510 90 
               L 510 284 
               C 510 290, 505 294, 499 293 
               C 420 280, 324 278, 272 283 Z"
            fill="url(#rightParchmentGrad)"
            className="clay-book-parchment-right"
          />

          {/* Right Page Filigree Border */}
          <rect
            x="288"
            y="76"
            width="204"
            height="198"
            rx="6"
            fill="none"
            stroke="var(--clay-book-border-tint, rgba(179, 68, 25, 0.18))"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <circle cx="296" cy="84" r="3.5" fill="var(--gold)" opacity="0.7" />
          <circle cx="484" cy="84" r="3.5" fill="var(--gold)" opacity="0.7" />

          {/* Right Page Header */}
          <text
            x="390"
            y="94"
            textAnchor="middle"
            fontFamily="var(--font-mono, monospace)"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.1em"
            fill="var(--terracotta)"
          >
            ✦ LIVING VOICE ✦
          </text>

          {/* Right Page Story Verse Continuation */}
          {currentStory.lines.slice(2).map((line, i) => (
            <text
              key={i}
              x="298"
              y={122 + i * 15}
              fontFamily="var(--font-body, serif)"
              fontSize="9.2"
              fill="var(--charcoal)"
              letterSpacing="0.01em"
            >
              {line}
            </text>
          ))}

          {/* Central Ancient Terracotta Wax Seal on Right Page */}
          <g transform="translate(390, 185)" className="clay-wax-seal-pulse">
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="url(#sealWaxGrad)"
              className="clay-wax-seal"
            />
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="none"
              stroke="#ffd875"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            {/* Center Sacred Emblem (Dharma Wheel / Sunburst) */}
            <circle cx="0" cy="0" r="4" fill="#ffd875" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
              <line
                key={ang}
                x1="0"
                y1="0"
                x2={13 * Math.cos((ang * Math.PI) / 180)}
                y2={13 * Math.sin((ang * Math.PI) / 180)}
                stroke="#ffd875"
                strokeWidth="1.2"
                opacity="0.8"
              />
            ))}
            <text
              x="0"
              y="32"
              textAnchor="middle"
              fontFamily="var(--font-mono, monospace)"
              fontSize="7"
              fontWeight="700"
              fill="var(--terracotta)"
              letterSpacing="0.08em"
            >
              VERIFIED ARCHIVE
            </text>
          </g>

          {/* Right Page Bottom Number & Turn Page Prompt */}
          <text
            x="300"
            y="262"
            fontFamily="var(--font-mono, monospace)"
            fontSize="8"
            fontWeight="600"
            fill="var(--terracotta)"
            letterSpacing="0.05em"
          >
            ✦ Click to turn ↷
          </text>
          <text
            x="480"
            y="262"
            textAnchor="end"
            fontFamily="var(--font-display, serif)"
            fontSize="9"
            fontWeight="600"
            fill="var(--charcoal-faint)"
          >
            • {currentStory.nextPageNo} •
          </text>

          {/* ── 3. GENTLE FLUTTERING / TURNING TOP PAGE LEAF ── */}
          <path
            d="M 272 65 
               C 330 62, 420 67, 494 82 
               C 502 84, 506 91, 502 99 
               C 475 160, 470 210, 498 280 
               C 502 288, 496 295, 488 293 
               C 420 281, 326 279, 272 284 Z"
            fill="url(#turningPageGrad)"
            opacity="0.35"
            className="clay-turning-page"
          />

          {/* ── 4. CENTRAL SPINE GUTTER SHADOW & GOLDEN CORDS ── */}
          {/* Deep Gutter Crease Shadow */}
          <path
            d="M 270 56 
               C 268 120, 268 220, 270 292"
            stroke="var(--clay-book-spine-shadow, rgba(30, 15, 8, 0.45))"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 270 56 
               C 269 120, 269 220, 270 292"
            stroke="var(--clay-book-spine-highlight, rgba(255, 255, 255, 0.25))"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Golden Spine Rib Cords (Binding Stitches) */}
          {[90, 140, 190, 240].map((y) => (
            <line
              key={y}
              x1="266"
              y1={y}
              x2="274"
              y2={y}
              stroke="var(--gold-light, #ffd875)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}

          {/* ── 5. GOLDEN SILK BOOKMARK RIBBON (Pendulum Sway Animation) ── */}
          <g className="clay-book-ribbon-group">
            {/* Ribbon Draping over Right Page and dangling off the bottom */}
            <path
              d="M 270 58 
                 C 275 80, 282 120, 286 160 
                 C 290 200, 285 240, 292 285 
                 C 296 312, 298 335, 302 352 
                 L 293 346 
                 L 284 352 
                 C 281 334, 278 310, 276 285 
                 C 272 240, 276 200, 274 160 
                 C 272 120, 269 80, 270 58 Z"
              fill="url(#goldRibbonGrad)"
              className="clay-book-ribbon"
            />
            {/* Golden Thread Accent */}
            <path
              d="M 288 348 L 288 160"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </g>

          {/* ── 6. MYSTICAL LORE SPARKS / FIREFLIES RISING FROM GUTTER ── */}
          <g className="clay-lore-sparks" pointerEvents="none">
            <circle cx="270" cy="110" r="2.8" fill="var(--gold-light)" className="spark-1" />
            <circle cx="276" cy="160" r="3.4" fill="var(--terracotta)" className="spark-2" />
            <circle cx="264" cy="210" r="2.2" fill="var(--forest-green)" className="spark-3" />
            <circle cx="282" cy="130" r="2.5" fill="var(--gold)" className="spark-4" />
          </g>

        </g>
      </svg>

      {/* Floating Interactive Badge below book */}
      <div className="clay-book-page-indicator">
        <span className="pulse-dot"></span>
        <span>Living Manuscript • Story {pageIndex + 1} of {ARCHIVE_FOLK_TALES.length}</span>
        <span className="flip-hint">Tap to flip ↷</span>
      </div>
    </div>
  );
}
