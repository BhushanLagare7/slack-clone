# Slack Clone

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-1.34-ff4d4d?logo=convex)](https://convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-stack, comprehensive Slack-like real-time communication platform. Built using Next.js, Convex, and Tailwind CSS, this project aims to provide a robust and scalable architecture while demonstrating the capabilities of real-time subscriptions and database interactions.

## 🌟 Why this project is useful

This application serves as an excellent demonstration of building highly interactive, real-time web applications. Whether you are looking for an open-source team communication tool or wanting to study complex architectural patterns for full-stack applications, this project delivers. 

### Key Features
- **Real-time Messaging**: Instant message delivery using Convex real-time subscriptions.
- **Workspaces & Channels**: Group communications efficiently just like Slack. Secure, invitation-based workspace joining.
- **Direct Messaging**: 1-on-1 private conversations between members.
- **Rich Text Editing**: Express yourself clearly with Quill.js integration for text formatting.
- **File Uploads & Attachments**: Share code snippets, images, and documents directly in chat.
- **Reactions & Threads**: Enhance communication with emoji reactions and dedicated message threads.
- **Role-based Access Control**: Manage member roles and permissions dynamically.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, bun, or pnpm
- A Convex account (free tier is sufficient)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BhushanLagare7/slack-clone.git
   cd slack-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory. You'll need to add your Convex deployment details and authentication keys here. (Refer to Convex and NextAuth documentation for required keys).

4. **Initialize Convex Backend**
   Launch the Convex development server. This will provision your cloud database and push the database schema.
   ```bash
   npx convex dev
   ```

5. **Run the Next.js Development Server**
   Open a new terminal window and start the frontend application.
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action!

## 🆘 Where to get help

We want to make your experience with this project as smooth as possible! Here are the best ways to get support:

- **Issues**: If you encounter a bug or have a feature request, please [open an issue](https://github.com/BhushanLagare7/slack-clone/issues).
- **Core Technologies Documentation**:
  - [Next.js Documentation](https://nextjs.org/docs)
  - [Convex Documentation](https://docs.convex.dev/home)
  - [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- **Community**: Feel free to join the discussions in the repository or reach out to the maintainers.

## 🤝 Maintainers and Contributing

### Maintainers
This project is actively maintained. 
- [BhushanLagare7](https://github.com/BhushanLagare7) - Lead Developer

### Contributing
We welcome contributions from the community! From bug fixes to full features, every contribution helps make this project better.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code passes the linting checks (`npm run lint`) and adheres to the project's coding standards.

---
*Built with ❤️ for the open-source community.*
