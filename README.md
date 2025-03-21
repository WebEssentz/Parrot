# [parrot](https://parrot-nine.vercel.app) v1.2.0

A next-generation AI voice assistant that combines cutting-edge technologies with a seamless user experience.

## Core Features

- 🎙️ **Advanced Voice Processing** - Fluid voice interaction using VAD technology
- 🧠 **AI-Powered Responses** - Powered by Deepseek AI + Groq for intelligent conversations
- 🌐 **Cross-Browser Support** - Optimized performance across all major browsers
- 🎨 **Modern UI/UX** - Clean, responsive interface with dark/light mode support
- ⌨️ **Smart Input** - Context-aware suggestions and template-based prompts
- 📱 **Responsive Design** - Seamless experience across all device sizes

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **AI Processing**: 
  - Groq for lightning-fast inference
  - Deepseek AI for intelligent responses
  - OpenAI Whisper for accurate transcription
- **Voice Processing**: 
  - VAD (Voice Activity Detection) 
  - Cartesia Sonic for speech synthesis
- **Deployment**: Vercel platform
- **Analytics**: Vercel Analytics
- **Authentication**: Clerk

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/parrot.git
cd parrot
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```
Fill in required credentials:
- `GROQ_API_KEY`
- `CARTESIA_API_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`

3. **Install dependencies**
```bash
bun install
```

4. **Run development server**
```bash
bun dev
```

Visit `http://localhost:3000` to see the app.

## Documentation

- [Technical Documentation](./docs/technical-documentation.md)
- [User Guide](./docs/non-technical-guide.md)

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fai-ng%2Fparrot)

## Updates in v1.2.0

- 🎨 Completely redesigned UI with improved accessibility
- 🔄 New streaming responses for faster interaction
- 💡 Intelligent text suggestions
- 🎯 Template-based prompts for common tasks
- 🌙 Enhanced dark/light mode support
- 🔐 Clerk authentication integration
- 📱 Improved mobile responsiveness
- ⚡ Performance optimizations

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Special thanks to:
- Groq team for their API access
- Cartesia team for Sonic voice model access
- Vercel for hosting and infrastructure
- All contributors and supporters
