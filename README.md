# 🎭 Poetik – AI-Powered Poetry Learning & Creation Platform

**Poetik** is a full-stack creative studio where users learn, write, and share poetry through AI-guided education, interactive writing tools, and a vibrant community. Built for aspiring poets, writers, and educators to explore the art of verse in a modern, engaging digital environment.


https://github.com/user-attachments/assets/b4a0d856-4e15-4d6f-98ef-6585cdecc29c


[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991.svg)](https://openai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📱 App Preview

### 🏠 Home & Learning Hub
<img src="screenshots/home-dashboard.png" width="800" alt="Poetik Home Dashboard">
*Personalized dashboard with daily challenges, progress tracking, and AI course recommendations*

### ✍️ AI-Powered Writing Studio
<div align="center">
  <img src="screenshots/write-screen-1.png" width="250">
  <img src="screenshots/write-screen-2.png" width="250">
  <img src="screenshots/write-screen-3.png" width="250">
</div>
*Interactive writing interface with AI suggestions, rhyme assistance, and style guidance*

### 📚 Learn with AI Courses
<img src="screenshots/learn-screen.png" width="800" alt="AI Learning Courses">
*Structured poetry courses with interactive lessons, quizzes, and progress tracking*

### 👥 Community & Sharing
<div align="center">
  <img src="screenshots/community-feed.png" width="400">
  <img src="screenshots/poem-detail.png" width="400">
</div>
*Share creations, give feedback, and connect with fellow poets*

### 📊 Progress Tracking
<img src="screenshots/progress-dashboard.png" width="800" alt="Progress Analytics">
*Visual analytics showing skill development, XP growth, and achievement milestones*

### 🎮 Gamified Learning
<div align="center">
  <img src="screenshots/daily-challenge.png" width="300">
  <img src="screenshots/achievements.png" width="300">
  <img src="screenshots/leaderboard.png" width="300">
</div>
*Daily challenges, unlockable badges, and community leaderboards*

---

## ✨ Features

### 🧠 **AI-Powered Education**
- **Personalized Learning Paths** – AI recommends courses based on your writing style and skill level
- **Interactive Lessons** – Step-by-step poetry courses with theory, examples, and practice exercises
- **AI Writing Assistant** – Real-time suggestions for rhyme, meter, imagery, and structure
- **Smart Feedback** – AI critiques your poems with constructive improvement suggestions

### ✍️ **Creative Writing Studio**
- **Rich Text Editor** – Format poems with custom line breaks, stanzas, and typography
- **Rhyme & Meter Tools** – Built-in dictionary, thesaurus, and syllable counter
- **Style Templates** – Pre-built forms (Sonnet, Haiku, Limerick, Free Verse)
- **Inspiration Prompts** – AI-generated creative prompts based on mood, theme, or style

### 📚 **Comprehensive Learning System**
- **Structured Courses** – 30+ courses from beginner to advanced levels
- **Daily Challenges** – New creative prompts every day with bonus XP rewards
- **Skill Tracking** – Progress visualization across form, technique, and analysis
- **Achievement System** – Unlock badges and rewards as you master poetry skills

### 👥 **Community Features**
- **Shared Workspace** – Publish poems and receive community feedback
- **Collaborative Writing** – Real-time co-writing sessions with other poets
- **Discussion Forums** – Topic-based discussions on poetry techniques and themes
- **Mentorship Program** – Connect with experienced poets for guidance

### 🎮 **Gamification & Engagement**
- **XP & Leveling** – Earn experience points for all learning activities
- **7-Day Streaks** – Daily login rewards and consistency tracking
- **Skill Badges** – Visual representation of mastered poetry techniques
- **Weekly Leaderboards** – Compete with friends and the community

---

## 🛠️ Tech Stack

### **Frontend**
- **React Native** – Cross-platform mobile development
- **TypeScript** – Type-safe development experience
- **Tailwind CSS** – Utility-first styling with NativeWind
- **React Navigation** – Seamless screen transitions and routing
- **Reanimated & Moti** – Smooth animations and gestures

### **Backend & APIs**
- **Supabase** – PostgreSQL database, authentication, and real-time subscriptions
- **Node.js/Express** – Custom API endpoints and business logic
- **OpenAI API** – GPT-4 for AI writing assistance and content generation
- **Google Cloud** – Translation, text-to-speech, and additional NLP services

### **State & Data**
- **Zustand** – Lightweight state management
- **React Query** – Server state synchronization and caching
- **AsyncStorage** – Local persistence for offline functionality
- **FastImage** – Optimized image loading and caching

### **Development & Deployment**
- **Expo** – Development workflow and build pipeline
- **GitHub Actions** – CI/CD automation
- **Firebase** – Analytics, crash reporting, and remote config
- **Vercel** – Web dashboard deployment

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account
- OpenAI API key

### Quick Start

```bash
# Clone repository
git clone https://github.com/satyy2301/Poetik.git
cd Poetik

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start development server
npx expo start

# For web development
npx expo start --web
```

### Database Setup

```sql
-- Run in Supabase SQL Editor
\i supabase/schema/lessons.sql
\i supabase/schema/seed_lessons.sql
```

---

## 🚀 Key Features in Detail

### **AI Course Engine**
```typescript
// Example: AI-generated poetry course
const course = await generateCourse({
  skillLevel: 'intermediate',
  focusArea: 'metaphor',
  preferredForms: ['sonnet', 'free-verse'],
  duration: '30min'
});
```

### **Real-time Writing Assistant**
```typescript
// AI-powered writing suggestions
const suggestions = await getWritingSuggestions({
  text: currentPoem,
  style: 'romantic',
  difficulty: 'medium',
  focus: ['imagery', 'rhyme']
});
```

### **Progress Tracking System**
```typescript
// Track user progress across multiple dimensions
const progress = calculateProgress({
  completedLessons,
  poemsWritten,
  communityFeedback,
  dailyStreak
});
```

---

## 📁 Project Structure

```
poetik/
├── src/
│   ├── screens/                 # App screens
│   │   ├── LearnScreen/        # AI courses & progress
│   │   ├── WriteScreen/        # Poetry editor
│   │   ├── ReadScreen/         # Community feed
│   │   └── ProfileScreen/      # User profile & stats
│   ├── components/             # Reusable UI components
│   ├── context/               # React contexts
│   │   ├── AuthContext.tsx    # Authentication
│   │   ├── ProgressContext.tsx # Learning progress
│   │   └── OpenAIContext.tsx  # AI integration
│   ├── lib/                   # Utilities & helpers
│   ├── services/              # API services
│   └── types/                 # TypeScript definitions
├── supabase/
│   ├── schema/                # Database schema
│   └── migrations/            # Database migrations
├── assets/                    # Images, fonts, icons
└── scripts/                   # Build & deployment scripts
```

---

## 🔧 Development

### Running the App

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web Browser
npx expo start --web

# Production build
eas build --platform ios --profile production
```

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting
npx eslint .

# Formatting
npx prettier --write .
```

---

## 📊 Database Schema

### Core Tables
```sql
-- Users & Progress
users (id, email, username, avatar_url)
user_progress (user_id, xp, level, streak, completed_lessons[])

-- Learning Content
lessons (id, title, description, difficulty, steps[], xp_reward)
user_lessons (user_id, lesson_id, completed, completed_at)
quizzes (lesson_id, questions[], correct_answers)

-- Poetry & Community
poems (id, user_id, title, content, form, tags[], visibility)
poem_feedback (poem_id, user_id, feedback, rating)
community_posts (user_id, content, type, likes, comments)
```

---

## 🎯 Roadmap & Future Features

### **Phase 1 (Completed)**
- [x] Core learning platform with AI courses
- [x] Basic writing studio with AI assistance
- [x] User authentication and profiles
- [x] Community feed and interactions

### **Phase 2 (In Progress)**
- [ ] Voice-based poetry creation (speech-to-text)
- [ ] Multi-language poetry translation
- [ ] Advanced AI critique with style analysis
- [ ] Collaborative writing rooms

### **Phase 3 (Planned)**
- [ ] AR poetry visualization
- [ ] Poetry performance recording studio
- [ ] Published poetry collections marketplace
- [ ] Poetry competition and events platform

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API and AI capabilities
- **Supabase** for backend infrastructure
- **Expo** for cross-platform development framework
- **React Native Community** for amazing libraries and tools
- **All our beta testers and early adopters** for valuable feedback

---

## 📬 Connect & Support

**Developed by Satyam Gupta**
- 🌐 Portfolio: [satyamgupta.dev](https://satyamgupta.dev)
- 📧 Email: satyamg065@gmail.com
- 💼 LinkedIn: [linkedin/satyamgupta-dev](https://linkedin.com/in/satyamgupta-dev)
- 🐦 Twitter: [@satyamg065](https://twitter.com/satyamg065)

**Support the Project**
- ⭐ Star the repository
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔄 Share with fellow poets and writers

---

<div align="center">
  <h3>🎭 Start your poetic journey today</h3>
  <p>Download Poetik from the App Store or Google Play</p>
  <img src="screenshots/app-store-badge.png" width="150">
  <img src="screenshots/play-store-badge.png" width="150">
</div>

---

**⭐ If you love poetry and technology, give this project a star on GitHub!**
