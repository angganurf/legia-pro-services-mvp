# Frontend Guideline Document

This document outlines the frontend architecture, design principles, technologies, and workflows for the legia-pro-services-mvp project. It is written in everyday language so that anyone—regardless of technical background—can understand how the frontend is set up and why.

---

## 1. Frontend Architecture

### 1.1 Overview
- **Framework:** Next.js (App Router) with built-in support for server and client components.  
- **Language:** TypeScript for type safety across UI, data fetching, and API layers.  
- **UI Library:** shadcn/ui (a set of un-opinionated React components ready for deep customization).  
- **Styling:** Tailwind CSS utility classes + CSS custom properties.  
- **AI Integration:** Vercel AI SDK powering a Gemini-based chatbox on the landing page.  
- **Authentication:** Custom “Better Auth” solution extended with Role-Based Access Control (RBAC) for Client, Professional, and Admin roles.  
- **Real-time:** Socket.IO (or a similar WebSocket library) for order alerts, private chatrooms, and notifications.  
- **Deployment:** Docker containers for the Next.js app, PostgreSQL database, and any auxiliary services.

### 1.2 Scalability, Maintainability, and Performance
- **Modular Structure:** Clear folder separation—`/app` (pages & API routes), `/components`, `/lib`, `/db`, `/hooks`—makes it easy to add or replace features without breaking existing code.  
- **Server & Client Components:** Next.js server components handle data-heavy UI (e.g., matched-professional lists) for improved SEO and performance. Client components manage interactive parts (e.g., chat, forms).  
- **Type Safety:** TypeScript and Drizzle ORM ensure compile-time checks for data models and queries, reducing runtime errors.  
- **Code Splitting & Lazy Loading:** Automatic route-based splitting and `next/dynamic` for large components (e.g., AI Chatbox) keep the initial bundle small.  
- **Caching & Incremental Adoption:** Next.js built-in caching for data fetching (and optional Redis layer) can be introduced incrementally to improve load times for rarely changing data (e.g., service categories).

---

## 2. Design Principles

### 2.1 Usability
- **Clarity & Predictability:** Simple, self-explanatory navigation and consistent use of UI patterns (buttons, forms, modals).  
- **Progressive Disclosure:** Break complex tasks (multi-step forms, checkout) into small, guided steps.

### 2.2 Accessibility (A11y)
- **Semantic HTML:** Use `<header>`, `<main>`, `<nav>`, `<button>`, etc., rather than generic `<div>`.  
- **ARIA & Keyboard Support:** Ensure all interactive elements (modals, dropdowns) are keyboard-navigable, with proper `aria-*` attributes.  
- **Contrast & Readability:** Follow WCAG AA guidelines for text and background contrast.

### 2.3 Responsiveness
- **Mobile-First:** Use Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`) to adapt layouts from small to large screens.  
- **Flexible Layouts:** Leverage CSS Grid and Flexbox patterns for cards, tables, and dashboards.

### 2.4 Consistency & Branding
- **Design Tokens:** Centralized color, spacing, and font tokens (via CSS variables) ensure a unified look across landing pages, dashboards, and modals.  
- **Component Library:** shadcn/ui primitives serve as the single source of truth for UI behavior and styling.

---

## 3. Styling and Theming

### 3.1 Styling Approach
- **Utility-First CSS:** Tailwind CSS classes for rapid styling, with minimal custom CSS file overrides only when necessary.  
- **CSS Variables:** Used for primary/secondary colors, fonts, and dark/light mode toggles.

### 3.2 CSS Methodology
- **Component-Scoped Styles:** When custom CSS is needed, we use CSS Modules or scoped styles per component—no global overrides outside of Tailwind config.  
- **Avoid BEM/SMACSS:** Utility classes and scoped styles replace the need for heavy naming conventions.

### 3.3 Theming
- **Light & Dark Mode:** Controlled via a React Context (`ThemeContext`) and CSS variables in the `<html>` element.  
- **Admin-Configurable Colors:** The Admin panel can update CSS variables at runtime, letting marketplace owners adjust branding without code changes.

### 3.4 Visual Style & Assets
- **Overall Look:** Modern, flat design with subtle glassmorphic touches on dialogs (slightly blurred, translucent backgrounds).  
- **Color Palette:**  
  • Primary: #4F46E5 (Indigo-600)  
  • Secondary: #10B981 (Emerald-500)  
  • Accent: #FBBF24 (Yellow-400)  
  • Background: #F9FAFB (Gray-50)  
  • Surface: #FFFFFF  
  • Text Primary: #111827 (Gray-900)  
  • Text Secondary: #6B7280 (Gray-500)  
  • Success: #22C55E  
  • Error: #EF4444  
- **Font:** “Inter” (Google Fonts) with system-font fallbacks for fast rendering and great readability.

---

## 4. Component Structure

### 4.1 Folder Organization
- **`/components/ui`**: Low-level, unopinionated UI primitives from shadcn/ui (buttons, inputs, modals).  
- **`/components/marketplace`**: Feature components—`AiChatbox.tsx`, `ProjectForm.tsx`, `ProfessionalCard.tsx`, `PaymentTermsEditor.tsx`.  
- **`/components/layouts`**: Shared layouts (`MainLayout`, `AuthLayout`, `DashboardLayout`).

### 4.2 Reusability & Atomic Design
- **Atoms:** Simple elements (Label, Button, Input).  
- **Molecules:** Combinations of atoms (SearchBar, FilterPanel).  
- **Organisms:** Full sections (DashboardSidebar, ProjectList).  
- **Benefits:** Isolated props, easy testing, and consistent look & feel.

---

## 5. State Management

### 5.1 Local State
- **useState & useEffect:** For ephemeral UI state (form inputs, modal visibility, chat messages).  
- **useReducer:** For more complex component state (multi-step forms or wizard logic).

### 5.2 Global State
- **React Context:** For global settings (theme, auth user data, notifications).  
- **TanStack Query (optional):** For data fetching and caching of server state (projects, orders, professionals) with automatic refetching and background updates.

### 5.3 Real-Time State
- **WebSockets:** The `/lib/websockets.ts` module establishes a socket instance. React hook (`useSocket`) listens to events (`new_order`, `chat_message`) and updates corresponding state slices.

---

## 6. Routing and Navigation

### 6.1 File-Based Routing
- **`/app` Directory:** Leverages Next.js App Router with nested route groups:  
  • `(auth)/` for sign-in, sign-up, and password recovery.  
  • `(dashboard)/` with sub-folders `(client)/`, `(professional)/`, `(admin)/`.  
  • `page.tsx` at root for the landing page with AI chat.

### 6.2 Layouts & Dynamic Segments
- **Root Layout:** Includes global navigation (header, footer).  
- **Dashboard Layouts:** Role-specific sidebars and headers.  
- **Dynamic Routes:** `[projectId]`, `[orderId]` for detail views.

### 6.3 Client-Side Navigation
- **`next/link` & `useRouter`:** For page transitions and programmatic navigation.  
- **Active States:** Highlight current page in sidebar via `usePathname`.

---

## 7. Performance Optimization

### 7.1 Code Splitting & Lazy Loading
- **Automatic by Next.js:** Each route is its own chunk.  
- **Dynamic Imports:** `next/dynamic` for heavy components (AI chatbox, data grids).

### 7.2 Image & Asset Optimization
- **`next/image`:** Automatic resizing, format selection, and lazy loading.  
- **SVG Icons:** Inlined or tree-shaken via `@heroicons/react`.

### 7.3 Bundle Size Reduction
- **Tailwind Purge:** Unused CSS removed in production build.  
- **Tree Shaking:** ES modules only import needed code from shadcn/ui and other libraries.

### 7.4 Caching & Data Fetching
- **Incremental Static Regeneration (ISR):** For rarely changing pages (e.g., landing page).  
- **TanStack Query:** In-browser caching for API data with stale-while-revalidate strategy.

---

## 8. Testing and Quality Assurance

### 8.1 Unit & Integration Tests
- **Jest & React Testing Library:** For component logic, helper functions (e.g., fee calculations).  
- **Mock Service Worker (MSW):** Simulate API responses for integration tests of `/api` routes.

### 8.2 End-to-End (E2E) Tests
- **Playwright (or Cypress):** Automate critical user flows:  
  • Client creating an AI-generated project.  
  • Professional accepting & submitting a report.  
  • Admin reviewing KYC documents & approving payments.

### 8.3 Linting & Formatting
- **ESLint:** Enforce code style, catch errors early.  
- **Prettier:** Consistent formatting across the codebase.  
- **TypeScript:** `tsc --noEmit` as part of CI to ensure type safety.

### 8.4 Accessibility Audits
- **axe-core or Lighthouse:** Automated checks for color contrast, missing labels, and keyboard navigation.

---

## 9. Conclusion and Overall Frontend Summary

The legia-pro-services-mvp frontend is built on a modern, scalable, and maintainable foundation:

• **Next.js & TypeScript:** Provide a robust development experience with server/client components, type safety, and performance optimizations.  
• **shadcn/ui & Tailwind CSS:** Enable a consistent, fully customizable design system that supports modern flat + glassmorphic accents.  
• **Custom Auth & Real-Time:** The “Better Auth” solution and WebSockets deliver secure, role-based flows and live notifications.  
• **Testing & Quality:** A comprehensive testing strategy (unit, integration, E2E) and linting/formatting ensure reliability and code quality.

By following these guidelines, any developer or stakeholder will clearly understand how the frontend is structured, why each technology was chosen, and how to extend or maintain the codebase as the Legia professional-services marketplace evolves.