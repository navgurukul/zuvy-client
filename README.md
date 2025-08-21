# Zuvy Client

Zuvy is a modern, role-based learning platform designed to provide an engaging and seamless educational experience. It supports multiple user roles including students, instructors, and administrators, each with tailored dashboards and functionalities.

## Project Overview

Zuvy enables users to embark on their learning journey quickly and efficiently. The platform features authentication, course management, curriculum building, live classes, resource libraries, and more. It is built with a focus on rich user interfaces, responsive design, and smooth user experience.

## Features

- Role-based access control (Student, Instructor, Admin)
- User authentication and session management
- Course and curriculum management
- Live class scheduling and recording
- Resource library with various content types (coding, MCQ, open-ended)
- Notifications and alerts
- Responsive UI with modern components and animations

## Tech Stack

- **Framework:** Next.js 14 with React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS, styled-components, tailwindcss-animate
- **State Management:** Zustand
- **UI Libraries:** Radix UI, Headless UI, NextUI, Shadcn UI
- **Forms:** React Hook Form, Zod for validation
- **Rich Text Editing:** TipTap, Draft.js, React Draft WYSIWYG
- **HTTP Client:** Axios
- **Other Libraries:** React Table, React Toastify, Framer Motion, Moment.js, Date-fns

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd zuvy-client
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add necessary environment variables (e.g., API URLs, authentication keys).

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Building for Production

To build the app for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Folder Structure

- `src/app/` - Main application routes and pages, organized by user roles (admin, instructor, student, auth)
- `src/components/` - Reusable UI components and custom hooks
- `src/store/` - Zustand state management store
- `src/utils/` - Utility functions and API configurations
- `public/` - Static assets like images, icons, and animations

## Image Optimization

The project uses Next.js Image component with remote patterns configured for external image sources such as Unsplash, AWS S3, Google, and others.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is private and not publicly licensed.

---

Embark your learning journey with Zuvy in seconds!
