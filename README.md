# ⚡ Lightning - AI-Powered Micro-App Generator

Lightning is a web application that transforms natural language descriptions into fully functional React components in real-time. Using advanced AI technology, it makes app development fast, intuitive, and accessible to everyone through a simple chat interface.

## 🚀 Features

- **AI Chat Interface**: Describe your desired component or app in natural language
- **Live Code Generation**: Get instant React/TypeScript code based on your description
- **Real-Time Preview**: See your components come to life as you chat
- **Inbuilt LLM**: The apps have the ability to generate prompts and call LLM's themselves
- **Component Library**: Built-in support for Shadcn UI and Radix components
- **TypeScript Ready**: All generated code is type-safe with TypeScript
- **Modern Stack**: Built with Next.js 14 and Tailwind CSS
- **Dark Mode**: Full dark mode support for the interface as well as the generated app
## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Shadcn UI / Radix UI
- **Styling**: Tailwind CSS
- **AI Integration**: SambaNova API
- **Development**: ESLint, Prettier

## 🏃‍♂️ Getting Started

1. Clone the repository:
```bash
git clone https://github.com/mithileshchellappan/lightning.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your SambaNova API key to `.env.local`:
```
SAMBANOVA_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to start using Lightning

## 💡 How to Use

1. **Start a Chat**: Open the chat interface and describe the component you want to create
   ```
   "Create a workout tracking app with a daily schedule, exercise timer, and dark mode support"
   ```

2. **Review & Preview**: 
   - See the generated code in real-time
   - Preview the component in the built-in viewer
   - Toggle between light and dark mode

3. **Iterate & Refine**:
   - Ask for modifications or improvements
   - The AI will update the code based on your feedback

4. **Publish & Share**:
   - Save your creation to your collection
   - Share the link with friends and colleagues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- SambaNova Cloud for the blazing inference speeds
- Shadcn UI for the beautiful component library
- Next.js team for the amazing framework

## 📞 Support

For support, please open an issue in the GitHub repository.
