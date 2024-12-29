# ChatBro

A modern AI chat application built with Next.js that leverages OpenAI's GPT-4 API to provide intelligent conversations with file analysis capabilities. The application features a clean, responsive interface with real-time markdown rendering and code syntax highlighting.

## Features

- 💬 Real-time chat interface with streaming responses
- 📁 File upload and analysis support (including PDF parsing)
- ✨ Markdown rendering with GitHub Flavored Markdown
- 🎨 Code syntax highlighting for multiple languages
- 🌓 Dark/light theme support with system preference detection
- 📱 Fully responsive design
- 🎯 TypeScript for type safety
- 🏗️ Clean architecture with feature-based organization
- 🎨 Styled with Tailwind CSS and shadcn/ui components

## Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm
- OpenAI API key

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chatbro.git
cd chatbro
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env.local` in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── features/          # Feature modules
│       ├── chatbot/       # Chat feature implementation
│       └── file-upload/   # File upload feature implementation
├── components/            # Shared components
│   ├── ui/               # UI components (shadcn)
│   └── global-nav.tsx    # Navigation component
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions and shared code
```

## Feature Module Structure

Each feature follows a clean architecture pattern:

```
features/[feature-name]/
├── components/           # Feature-specific components
├── hooks/               # Feature-specific hooks
├── repository/          # Data access layer
├── service/            # Business logic layer
├── types/              # TypeScript types/interfaces
└── utils/              # Feature-specific utilities
```

## Technologies Used

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Integration**: OpenAI API
- **PDF Processing**: pdf-parse
- **Markdown**: react-markdown with remark-gfm
- **Icons**: Lucide React
- **Type Validation**: Zod

## Development

- The project uses the Next.js App Router
- Components are organized by features in the `src/app/features` directory
- Shared components are in `src/components`
- The project follows a repository pattern for data access
- Type safety is enforced throughout the codebase

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
