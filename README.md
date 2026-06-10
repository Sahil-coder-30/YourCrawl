# 🚀 YourCrawl: The Intelligent Enterprise Web Crawler

**YourCrawl** is a high-performance, enterprise-grade web crawler built with Next.js and TypeScript. It’s designed to intelligently crawl, extract, and structure data from websites while respecting `robots.txt`, managing crawl policies, and providing actionable insights.

## ✨ Key Features

- **🚀 Blazing Fast Performance**: Optimized for high-speed data extraction with intelligent concurrency management
- **🤖 AI-Powered Data Structuring**: Uses Gemini AI to automatically structure messy HTML content into clean JSON
- **🛡️ Enterprise Compliance**: Respects `robots.txt`, implements crawl delays, and handles crawl politeness
- **🎨 Modern Dashboard**: Interactive frontend with real-time stats, charts, and result visualization
- **📊 Real-Time Analytics**: Visualizes crawl metrics including successful crawls, errors, average duration, and data volume
- **🔐 Secure & Efficient**: Type-safe TypeScript, efficient data pipelining, and streamlined architecture

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini](https://ai.google.dev/gemini-api)
- **Data Processing**: Robust crawl policies and structured output processing
- **Architecture**: Server Actions, Server Components, and intelligent data pipelining

---

## 📂 Project Structure

```
YourCrawl/
├── app/                   # Next.js App Router: Pages, Layouts, Routes
├── components/            # Reusable React components and UI elements
├── lib/                   # Core logic, utilities, AI integration, crawl policies
│   ├── crawl-policy.ts    # robots.txt parsing and crawl policy enforcement
│   ├── ai-parser.ts       # Gemini AI integration for data structuring
│   └── utils.ts           # Utility functions and helpers
├── public/                # Static assets
├── styles/                # Global styles and CSS
├── server/                # API endpoints and server-side logic
├── types/                 # TypeScript type definitions
└── server.ts              # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 20.x
- **npm/yarn/pnpm**: Package manager
- **Google Gemini API Key**: For AI-powered data structuring

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd YourCrawl
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Configuration

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Gemini API key to the `.env.local` file:
   ```env
   GOOGLE_API_KEY="[GCP_API_KEY]"
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. Open the application in your browser:
   [http://localhost:3000](http://localhost:3000)

### Build and Run (Production)

1. Build the application for production:
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   # or
   pnpm start
   ```

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server | |
| `npm run build` | Build for production | |
| `npm run start` | Start production server | |
| `npm run lint` | Run ESLint and TypeScript checks | |
| `npm run format` | Format code with Prettier | |

---

## 🏗️ Architecture Overview

### 🔌 Server Components & Actions

```typescript
// app/page.tsx
'use server'

import CrawlDashboard from '@/components/CrawlDashboard'
import { performCrawl } from '@/lib/crawl-engine'

export default async function HomePage() {
  return <CrawlDashboard performCrawl={performCrawl} />
}
```

### ⚙️ AI-Powered Data Structuring

```typescript
// lib/ai-parser.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function structureDataWithAI(htmlContent: string): Promise<any> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const prompt = `
    Extract and structure the following HTML content into clean JSON:
    HTML Content: ${htmlContent}
    
    Return only the JSON object, no explanations.
  `

  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}
```

### 📋 Robots.txt Compliance

```typescript
// lib/crawl-policy.ts
import { RobotsTxtFile } from '@robotstxt/robotstxt'

export async function getCrawlPolicy(url: string): Promise<RobotsTxtFile> {
  const robotsTxtPath = new URL('/robots.txt', url).toString()
  const response = await fetch(robotsTxtPath)
  
  if (response.ok) {
    const text = await response.text()
    return new RobotsTxtFile(text, url)
  }
  
  return new RobotsTxtFile('', url)
}

export function isAllowed(policy: RobotsTxtFile, url: string, userAgent: string): boolean {
  return policy.isAllowed(userAgent, url)
}
```

---

## 🎨 Frontend Dashboard

The dashboard provides:

- **Real-time Stats**: Track successful crawls, errors, and average duration
- **Analytics**: Visualize crawl performance with charts
- **Crawl History**: View past crawl results and performance
- **Live Results**: Monitor and interact with ongoing crawls

![Dashboard Preview](./screenshot.png)

---

## 🔍 Advanced Features

### Intelligent Crawl Strategy

The crawler implements:

1. **Robots.txt Verification**: Automatically fetches and parses `robots.txt`
2. **User-Agent Rotation**: Allows setting custom user-agents for different crawl policies
3. **Crawl Delays**: Respects `Crawl-delay` directives to avoid overwhelming servers
4. **Sitemaps**: (Optional) Supports sitemap discovery and parsing for comprehensive crawling

### Data Pipelining

The system uses an efficient data pipeline:

```
HTML Fetch → Robots.txt Check → Content Extraction → AI Structuring → Result Storage
```

Each step can be independently monitored and optimized, making the system highly maintainable.

---

## 🧪 Testing

Run the development server:

```bash
npm run dev
```

---

## 🔐 Security & Compliance

- **Respect robots.txt**: Built-in compliance with crawl directives
- **Rate Limiting**: Implemented through crawl delay policies
- **User-Agent Handling**: Proper user-agent identification for policy enforcement
- **Error Handling**: Graceful error handling and retry mechanisms

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

- **Project**: [YourCrawl](https://github.com/yourusername/YourCrawl)