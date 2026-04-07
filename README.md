# 🕵️ Desi Imposter
### A Pass-and-View Party Game for South Asian Friends & Family

> *"Ek imposter hai hamare beech mein..."*

---

## 📖 Overview

**Desi Imposter** is a single-device, pass-and-view social party game for **3–10 players**, built with **React Native / Expo**. It requires no internet connection after install, no accounts, and no multiple devices. One phone, one vibe, infinite chaos.

The game is rooted in the cultures of **India 🇮🇳, Nepal 🇳🇵, Bangladesh 🇧🇩, and Pakistan 🇵🇰** — with a smart word-selection engine that adapts to **who is actually in the room**, so nobody gets an unfair advantage from cultural blind spots.

---

## 🌍 The Cultural Knowledge Problem (And How We Solve It)

South Asian cultural knowledge is **asymmetric**. India exports its culture hard — Bollywood, biryani, cricket are known across all four countries. But a Pakistani player might blank on Dashain (Nepal), and a Nepali might not know Hilsa fish (Bangladesh).

**The Rule:** India is the cultural common ground. Every other country's words are only included if someone from that country is in the room.

```
Word Pool = Shared Desi
          + India (ALWAYS — everyone knows it)
          + [Country X] only if someone from Country X is present
          + [Country Y] only if someone from Country Y is present
```

**Examples:**
| Who's in the room | Word pool used |
|---|---|
| 🇳🇵 Nepal only | Shared + India + Nepal |
| 🇵🇰 🇧🇩 mixed | Shared + India + Pakistan + Bangladesh |
| 🇮🇳 🇳🇵 🇧🇩 mixed | Shared + India + Nepal + Bangladesh |
| All 4 countries | Shared + India + Nepal + Bangladesh + Pakistan |

The host selects **which nationalities are present** at setup (one quick step, not per-player). The algorithm does the rest silently.

Each word on the role card shows its origin: **flag + country name** (e.g., 🇳🇵 Nepal) so players always know the cultural context of what they're describing.

---

## 🎮 How The Game Works

### The Core Concept
One player among the group is secretly the **Imposter**. Everyone else is a **Villager**. Villagers know the secret word. The Imposter only gets a **hint** — vague enough to keep them guessing, rich enough to let them bluff.

### Step-by-Step Game Loop

```
1. HOST SETUP
   └── Enter player names (3–10)
   └── Select nationalities present in the room 🇮🇳 🇳🇵 🇧🇩 🇵🇰
       (host picks flags — not per player, just who's in the room)
   └── Choose hint difficulty: Easy / Medium / Spicy 🌶️
   └── App builds word pool automatically based on nationalities
   └── Tap "Start Game"

2. ROLE DISTRIBUTION (Pass & View)
   └── Phone shows: "Eyes Away! Pass to [Player Name]"
   └── Player holds screen to reveal their role card
   └── Villager sees: SECRET WORD + origin flag & country (e.g., "Biryani  🌏 Shared Desi")
   └── Imposter sees: HINT only (e.g., "A beloved rice dish served at South Asian feasts")
   └── Player taps "I've seen it — Cover Screen"
   └── Repeat for every player

3. DISCUSSION ROUND (Real Life — No App Involvement)
   └── App picks a random player to go first
   └── Each player describes their word in ONE sentence without saying it
   └── Imposter bluffs using their hint
   └── Group discusses, debates, accuses (no in-app voting)

4. REVEAL
   └── Host taps "Reveal Imposter" button
   └── Dramatic animated reveal: Imposter's name + photo placeholder
   └── Shows: who the Imposter was
   └── "Play Again" button reshuffles everything for a new round
```

---

## 🗂️ Project Structure

```
desi-imposter/
├── app/
│   ├── index.tsx                  # Entry / Splash Screen
│   ├── setup.tsx                  # Host setup: players, region, difficulty
│   ├── role-distribution.tsx      # Pass & View loop
│   ├── discussion.tsx             # "Who goes first" + timer (optional)
│   └── reveal.tsx                 # Imposter reveal + Play Again
├── components/
│   ├── RoleCard.tsx               # Villager card component
│   ├── ImposterCard.tsx           # Imposter hint card component
│   ├── CoverScreen.tsx            # The "Eyes Away" handoff screen
│   ├── HoldToReveal.tsx           # Press-and-hold gesture component
│   ├── RevealAnimation.tsx        # Dramatic imposter reveal animation
│   └── PlayerAvatar.tsx           # Player name + avatar display
├── data/
│   ├── index.ts                   # Exports all categories
│   ├── shared.json                # Shared Desi words (all 4 regions)
│   ├── india.json                 # India-only words
│   ├── nepal.json                 # Nepal-only words
│   ├── bangladesh.json            # Bangladesh-only words
│   └── pakistan.json              # Pakistan-only words
├── hooks/
│   ├── useGameState.ts            # Core game state management
│   ├── useWordSelector.ts         # Anti-repeat word selection logic
│   └── useHaptics.ts              # Haptic feedback wrapper
├── utils/
│   ├── assignRoles.ts             # Random imposter assignment
│   ├── generateHint.ts            # Hint difficulty filter
│   └── pickFirstPlayer.ts         # Random first speaker selector
├── constants/
│   ├── theme.ts                   # Colors, fonts, spacing
│   └── regions.ts                 # Region metadata
├── assets/
│   ├── fonts/                     # Custom fonts
│   ├── patterns/                  # SVG rangoli/geometric patterns
│   └── sounds/                    # Optional reveal sound effects
└── README.md
```

---

## 🗃️ Content / Data Architecture

### Word Entry Schema

Each word in the JSON database follows this structure:

```json
{
  "id": "shared_001",
  "word": "Biryani",
  "hints": {
    "easy": "A type of food",
    "medium": "A famous South Asian rice dish",
    "spicy": "A layered rice dish slow-cooked with meat or vegetables, served at celebrations"
  },
  "category": "food",
  "scope": "shared",
  "regions": ["IN", "NP", "BD", "PK"],
  "difficulty": "easy",
  "tags": ["food", "celebration", "classic"]
}
```

### Category Files

**`shared.json`** — Words universally known across all 4 regions:
- Food: Biryani, Samosa, Chai, Lassi, Halwa
- Festivals: Eid, Diwali (diaspora-known), New Year
- Cricket: Six, Wicket, Test Match
- Bollywood: Item Song, Hero, Villain
- Daily Life: Rickshaw, Chowk, Bazaar

**`india.json`** — India-specific:
- Bollywood: Srideivi, Dhoom, Munni Badnaam
- Festivals: Holi, Navratri, Dandiya, Pongal
- Food: Vada Pav, Pani Puri, Dosa, Idli
- People/Icons: Sachin, Amitabh
- Places: Gateway of India, Lal Qila

**`nepal.json`** — Nepal-specific:
- Festivals: Dashain, Tihar, Teej, Indra Jatra
- Food: Dal Bhat, Momo, Sel Roti, Tongba
- Concepts: Dhaka fabric, Kumari, Topi
- Places: Pashupatinath, Boudhanath, Pokhara

**`bangladesh.json`** — Bangladesh-specific:
- Festivals: Pahela Baishakh, Eid-ul-Fitr
- Food: Hilsa fish, Pitha, Mishti doi
- Culture: Rickshaw art, Muslin, Jamdani
- Icons: Ekushey, Padma bridge

**`pakistan.json`** — Pakistan-specific:
- Food: Nihari, Chapli Kebab, Karahi
- Culture: Truck Art, Basant, Qawwali
- Festivals: Jashn-e-Baharaan, Eid
- Icons: Badshahi Mosque, Lahore Fort

### Content Volume Target (MVP)
| Source | Count |
|---|---|
| Shared Desi | 60 words |
| India-only | 40 words |
| Nepal-only | 35 words |
| Bangladesh-only | 30 words |
| Pakistan-only | 30 words |
| **Total** | **~195 words** |

---

## 🎨 Design System

### Color Palette — "Neo-Desi Minimal"

```ts
// constants/theme.ts
export const colors = {
  primary:     '#F5A623', // Saffron Gold — marigold garlands, haldi
  secondary:   '#006D77', // Deep Teal — Pakistani truck art
  danger:      '#C0392B', // Crimson — imposter reveal, sindoor
  background:  '#1A1A2E', // Off-Black — night sky, premium feel
  surface:     '#FFF8EE', // Warm White — dhoti white, card bg
  accent:      '#A8E063', // Electric Lime — mehndi green, modern pop
  textDark:    '#1A1A2E',
  textLight:   '#FFF8EE',
  textMuted:   '#8C8C9E',
  overlay:     'rgba(26, 26, 46, 0.92)',
};
```

### Typography
- **Display / Headings:** `Bricolage Grotesque` (bold, geometric, modern)
- **Body:** `Noto Sans` (clean, multilingual-ready for future Hindi support)
- **Accent / Labels:** `Space Mono` (for game meta info, timers)

### Motion & Animation
- **Role card reveal:** 3D Y-axis flip (card back → card front), 600ms ease-in-out
- **Cover screen:** Slow breathing pulse animation on the lock icon
- **Imposter reveal:** Cards scatter, then one flips red with a dramatic scale-up
- **First player picker:** Slot-machine style name scroll, slows and bounces to stop
- **Play Again:** Confetti burst in saffron + teal

### UI Motifs
- Subtle **rangoli-inspired geometric** patterns as background texture (SVG, low opacity ~8%)
- Cards with **24px rounded corners**, warm white surface, soft shadow
- All interactive buttons use **haptic feedback** (light for navigation, heavy for reveal)
- The Cover Screen is **pure #000000** — maximum contrast safety

---

## 🔐 The "Safe Pass" Mechanic — Detailed Spec

The critical UX challenge: preventing accidental reveals during handoff.

### The 3-Phase Airlock

**Phase 1 — Role Reveal**
- Screen brightness forced to maximum
- Player name shown at top: *"This is for [Name] only 👁️"*
- Role card is shown (Villager word OR Imposter hint)
- Auto-dims and blurs after **10 seconds**
- Manual button: **"I've seen it — Hand Over Phone"**

**Phase 2 — Cover Screen (Handoff)**
- Full `#000000` screen
- Large text: *"🫣 Eyes Away! Pass phone to [Next Player Name]"*
- Screenshot prevention via `expo-screen-capture`
- **Hold-to-Reveal:** Next player must press and hold a circular button for **1.5 seconds** — prevents accidental taps during handoff
- Progress ring fills during hold

**Phase 3 — Confirmation Gate**
- *"Are you [Next Player Name]?"*
- ✅ YES → Proceed to their role reveal
- ❌ NO → Return to Cover Screen with message *"Hand it to the right person!"*

### The "Peek" Rule
If a player forgot their word:
- A **"Peek 👀"** button is available on the discussion screen
- Tapping it publicly flashes **"⚠️ [Name] is peeking!"** on screen for 3 seconds (visible to all)
- After the warning, shows their word for 5 seconds, then re-covers
- Imposter peeking just re-shows their hint — no word revealed

---

## ⚙️ Game Configuration Options

| Setting | Options | Default |
|---|---|---|
| Players | 3–10 | — |
| Nationalities in Room | India / Nepal / Bangladesh / Pakistan (multi-select flags) | India only |
| Hint Difficulty | Easy / Medium / Spicy 🌶️ | Medium |
| Number of Imposters | 1 (MVP) | 1 |
| Sound Effects | On / Off | On |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 51+ |
| Navigation | Expo Router (file-based) |
| State Management | Zustand |
| Animations | React Native Reanimated 3 |
| Gestures | React Native Gesture Handler |
| Haptics | expo-haptics |
| Screen Capture Block | expo-screen-capture |
| Storage (anti-repeat) | AsyncStorage |
| Fonts | expo-google-fonts |
| Icons | @expo/vector-icons (Ionicons) |

---

## 🚫 Edge Cases & Handling

| Scenario | Handling |
|---|---|
| Player forgets word | Peek button with public warning flash |
| Only 3 players | Works — minimum viable tension |
| Same word repeated | Last 25 words tracked in AsyncStorage, excluded from pool |
| Host changes player count | Only editable on Setup screen, locked after game starts |
| App backgrounded during reveal | Re-shows Cover Screen on foreground return |
| No words left in category | Fallback to Shared Desi pool + toast notification |

---

## 🗺️ MVP Scope (v1.0)

**In Scope:**
- [x] Setup screen (players, region, difficulty)
- [x] Pass & View role distribution with hold-to-reveal
- [x] Villager word card + Imposter hint card
- [x] Cover/handoff screen with safety mechanic
- [x] Random first-player picker
- [x] Discussion placeholder screen
- [x] Imposter reveal screen (who it was)
- [x] Play Again (full reshuffle)
- [x] ~195 curated words across 5 categories
- [x] Offline-first (no backend needed)

**Setup UX (v2.0.1):**
- Use the hamburger on the Setup screen to open the Settings sheet (countries, categories, content packs).
- Manage/download packs from that sheet via **Manage Packs**; changes update word counts instantly.
- Hint Difficulty stays on the main Setup screen for quick round-to-round tweaks.

**Out of Scope (v2.0+):**
- [ ] Scoreboard / win tracking
- [ ] Hindi / Nepali script support
- [ ] Custom word packs (user-created)
- [ ] Multiple imposters
- [ ] Online multiplayer
- [ ] In-app timer for discussion

---

## 📦 Getting Started

```bash
# Clone the repo
git clone https://github.com/theAugust1st/desi_imposter.git
cd desi-imposter

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android
npx expo run:android
```

---

## 🤝 Contributing Content

To add new words, edit the appropriate JSON file in `/data/`. Every word **must** have:
- All 3 hint difficulty levels written
- A `scope` of either `"shared"` or `"local"`
- Correct `regions` array
- A `category` tag

Please avoid: politically sensitive content, religious figures, any content that could be offensive across regions.

---

## 📄 License

MIT License — Free to use, remix, and redistribute. Credit appreciated!

---

*Built with chai ☕, chaos 🎉, and a deep love for South Asian party culture.*
