# Tech Stack Document for Legia Pro Services MVP

This document explains the technologies chosen for the Legia professional-services marketplace MVP. It’s written in everyday language so anyone can understand why each piece was picked and how it fits into the bigger picture.

## 1. Frontend Technologies

These tools power everything you see and interact with on the website or dashboard.

- **Next.js (App Router)**
  - A React-based framework that handles page navigation, server rendering, and static pages out of the box.
  - Makes the site fast, SEO-friendly, and easy to organize into sections like the landing page, user dashboards, and admin panel.

- **TypeScript**
  - A superset of JavaScript that adds type checking.
  - Catches mistakes early in development, making the code more reliable without changing how the site looks or feels.

- **Tailwind CSS**
  - A utility-first CSS framework for styling your site.
  - Lets developers build designs quickly by combining pre-built utility classes, ensuring a consistent look and feel.

- **shadcn/ui**
  - A collection of pre-built, customizable React components (buttons, forms, tables, modals, etc.).
  - Speeds up UI development and keeps styling consistent across pages and features.

- **Vercel AI SDK**
  - Connects the AI Assistant chatbox on the landing page to Google’s Gemini model.
  - Powers natural language interactions so users can generate project outlines and images through chat.

## 2. Backend Technologies

These components run on the server, handle data, and make sure everything works behind the scenes.

- **Next.js API Routes**
  - Built-in feature of Next.js that lets you write server code alongside your frontend.
  - Hosts REST endpoints for core functions like creating projects, managing orders, processing payments, and sending notifications.

- **PostgreSQL**
  - A powerful, open-source relational database for storing structured data (users, projects, orders, payments, chat messages).
  - Well-suited for complex relationships, like linking clients, professionals, and multi-term payments.

- **Drizzle ORM**
  - A lightweight, type-safe tool for talking to PostgreSQL from TypeScript.
  - Ensures your database queries match your code’s types, preventing errors before they happen.

- **Better Auth (Custom Authentication)**
  - A bespoke sign-up, sign-in, and session system built into the app.
  - Extended to support role-based access control (RBAC) for clients, professionals, and admins, plus KYC (Know Your Customer) checks.

- **WebSockets (e.g., Socket.IO)**
  - Enables real-time communication between the server and clients.
  - Powers live order alerts and private chatrooms between clients and professionals.

## 3. Infrastructure and Deployment

These choices keep the development and production environments stable, scalable, and easy to manage.

- **Docker**
  - Containerizes the Next.js app, PostgreSQL database, and any additional services.
  - Ensures everyone on the team and in production runs the same environment.

- **Version Control with Git/GitHub**
  - Tracks changes to the codebase, enables collaboration, and keeps a history of all updates.

- **CI/CD (e.g., GitHub Actions)**
  - Automatically builds, tests, and deploys the app when new code is pushed.
  - Catches errors early and speeds up the release process.

- **Hosting Platform (e.g., Vercel)**
  - Optimized for Next.js apps, offering easy deployments, global edge caching, and automatic HTTPS.

## 4. Third-Party Integrations

These services extend the app’s capabilities without reinventing the wheel.

- **Vercel AI SDK**
  - Handles communication with the Gemini model for the AI Assistant chatbox.

- **Payment Gateways (Xendit, Midtrans, Tripay)**
  - Supports multiple regional payment providers for greater flexibility.
  - Abstracted behind a common interface so the admin can switch providers without code changes.

- **Analytics Tools (optional)**
  - Can be added later (e.g., Google Analytics, Mixpanel) to track user behavior, sign-ups, and order completions.

## 5. Security and Performance Considerations

Measures taken to protect data and keep the app fast.

- **Role-Based Access Control (RBAC)**
  - Ensures only authorized users can access certain pages or perform specific actions (clients vs. professionals vs. admins).

- **KYC Verification**
  - Collects and verifies user documents before granting full marketplace access to professionals.

- **Input Validation with Zod**
  - Validates all incoming data on API routes to prevent malformed requests and security vulnerabilities.

- **Centralized Logging and Error Handling**
  - Captures errors in API routes and payment callbacks for easier debugging and auditing.

- **Database Indexing and Caching**
  - Adds indexes on frequently queried columns (e.g., location, service type) for faster lookups.
  - Introduces caching (e.g., Next.js built-in cache or Redis) for static or rarely changing data to reduce database load.

## 6. Conclusion and Overall Tech Stack Summary

We chose each technology to balance speed of development, reliability, and ease of maintenance:

- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK for a fast, consistent, and interactive user interface.
- **Backend:** Next.js API Routes, PostgreSQL, Drizzle ORM, Better Auth, WebSockets for a unified codebase that handles data, authentication, and real-time features seamlessly.
- **Infrastructure:** Docker, Git/GitHub, CI/CD pipelines, and a hosting platform like Vercel for smooth deployments and consistent environments.
- **Integrations:** AI chat (Vercel AI SDK) and multiple payment providers (Xendit, Midtrans, Tripay) to power the core marketplace features.
- **Security & Performance:** RBAC, KYC, input validation, logging, indexing, and caching to protect user data and ensure a smooth experience.

Altogether, this tech stack provides a robust, production-ready foundation that’s easy to extend. It aligns perfectly with the Legia marketplace’s goals: fast setup, rich user experiences, secure transactions, and the flexibility to grow and adapt over time.