# Project Requirements Document: Legia Professional Services Marketplace MVP

## 1. Project Overview
This project, called the Legia Professional Services Marketplace MVP, is a web-based platform that connects **clients** with vetted **professionals** offering specialized services. Its signature feature is an on-page **AI Assistant** that helps clients draft project outlines and visual mockups before matching them with relevant professionals. The application must support three user roles—Client, Professional, and Admin—each with their own dashboards and workflows.

We are building this MVP to validate the core marketplace concept: seamless project creation with AI assistance, transparent order management, and secure payment handling. The key success criteria are: 
- Rapid project setup via AI (under 2 minutes)  
- Accurate matching of professionals  
- Reliable end-to-end order workflow (creation ➔ acceptance ➔ delivery)  
- Secure, audit-ready payments and user management

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- **User Authentication & Authorization**  
  • Custom Better Auth solution with signup, sign-in, password recovery  
  • Role-based access control for Client, Professional, Admin
- **Landing Page & AI Assistant**  
  • Gemini-based chatbox using Vercel AI SDK  
  • AI-driven project outline & image generation
- **Project & Professional Matching**  
  • Backend API to create AI projects  
  • Automatic matching logic based on budget, location, expertise
- **Order Workflow**  
  • Cart and checkout UI  
  • Order creation, acceptance, cancellation, status updates
- **Payment Integration**  
  • Single payment provider integration (e.g., Xendit)  
  • Term-based escrow handling
- **Dashboards**  
  • Client Dashboard: view and track active projects and orders  
  • Professional Dashboard: view new requests and submit deliverables  
  • Admin Panel: manage users, orders, payments, and KYC statuses
- **Real-Time Features**  
  • Private chatroom via WebSockets (e.g., Socket.IO)  
  • New-order and message notifications
- **Database & Persistence**  
  • PostgreSQL + Drizzle ORM schema for users, projects, orders, payments, chat
- **Deployment Setup**  
  • Docker for local and production environments

### Out-of-Scope (Later Phases)
- Multiple payment gateway switching in the UI  
- Advanced KYC document uploads and manual review workflows  
- Ratings, reviews, and dispute resolution system  
- Mobile apps or native wrappers  
- Detailed analytics dashboards and A/B testing  
- Multi-currency support and international tax compliance  
- Third-party marketplace integrations (e.g., Zapier)

## 3. User Flow
When a new user lands on the website, they first see a marketing hero and the AI Assistant chatbox. They click “Start Project,” type a prompt, and the chatbox returns a draft outline plus visuals powered by Gemini. The user adjusts details, then proceeds to “Find Professionals,” where a paginated list of matching professionals appears with cards showing portfolio snapshots and rates.

The user adds one or more professionals to their cart, clicks “Checkout,” and is prompted to sign up or sign in. Once authenticated, they confirm project details, select payment terms, and complete the payment. Behind the scenes, an order record is created and a new-order event is sent to the chosen professionals’ dashboards.

On the **Professional Dashboard**, pros see a “New Request” card. They can view project details, accept or reject, and then have access to a chatroom to discuss with the client. They upload deliverables, mark milestones complete, and trigger payment releases. Meanwhile, admins can monitor all activities in the **Admin Panel**, approving payments, managing disputes, and updating KYC statuses.

## 4. Core Features
- **Authentication & RBAC**: Signup, signin, session management, password recovery, and gated routes per user role.  
- **AI Assistant Chatbox**: Gemini-based dialog UI on landing page for drafting projects.  
- **Project Creation API**: Endpoint `/api/projects` for storing AI prompts, images, and metadata.  
- **Professional Matching**: Server logic to rank and return fitting professionals.  
- **Order Management**: Endpoints `/api/orders` to create, list, update, cancel orders.  
- **Payment Gateway**: Integration with Xendit for payments, term scheduling, and webhooks.  
- **Role-Specific Dashboards**: React layouts under `/app/(dashboard)` for each role.  
- **Real-Time Chat & Notifications**: WebSockets for private messaging and alerts.  
- **Admin Panel**: CRUD UIs for users, orders, KYC, payments using shadcn/ui tables.  
- **Database Schema**: Drizzle ORM schemas for all entities.  
- **Deployment Configuration**: Dockerfiles and docker-compose for app and DB.

## 5. Tech Stack & Tools
- **Frontend**:  
  • Next.js (App Router) + TypeScript  
  • Tailwind CSS + shadcn/ui  
  • Vercel AI SDK with Gemini  
- **Backend**:  
  • Next.js API Routes  
  • Node.js + TypeScript  
  • Drizzle ORM + PostgreSQL  
  • Custom Better Auth for RBAC  
  • Socket.IO for WebSockets
- **AI & Libraries**:  
  • Gemini model via Vercel AI SDK  
  • Zod for input validation  
- **Payment**:  
  • Xendit SDK (abstracted in `/lib/payment-gateways.ts`)  
- **Dev & Deployment**:  
  • Docker, docker-compose  
  • Git/GitHub  
  • VSCode (recommended), with Cursor and Windsurf IDE plugins

## 6. Non-Functional Requirements
- **Performance**:  
  • First Contentful Paint < 1s  
  • API response time < 200ms under normal load  
  
- **Scalability**:  
  • WebSocket server must support 500 concurrent users  
  • Database connections pooled and optimized

- **Security & Compliance**:  
  • SSL/TLS enforced for all traffic  
  • OWASP Top 10 mitigations  
  • Role-based access checks on every API route  
  • PCI DSS compliance for payment transactions  
  • GDPR data handling for user records

- **Usability & Accessibility**:  
  • WCAG 2.1 AA standards  
  • Responsive design (desktop, tablet, mobile)

## 7. Constraints & Assumptions
- **AI Model Availability**: Assumes access to Vercel AI SDK and Gemini API keys.  
- **Single Payment Gateway**: Version 1 will use only Xendit; later phases may add more.  
- **Hosting**: App will deploy on Vercel or a Docker-compatible cloud.  
- **User Data**: Users supply accurate KYC docs; manual review out of scope initially.  
- **Budget & Time**: MVP scope must be delivered within a 3-month sprint.

## 8. Known Issues & Potential Pitfalls
- **AI Rate Limits**: Gemini APIs may throttle under heavy use; implement client-side caching and server queueing.  
- **WebSocket Scaling**: Socket.IO may require sticky sessions or Redis Pub/Sub for multi-instance deployments.  
- **Payment Webhook Reliability**: Network failures can cause missed events; add retry logic and manual reconciliation.  
- **Complex Schema Migrations**: Adding new tables may disrupt existing seeds; use Drizzle’s migration tooling carefully.  
- **RBAC Holes**: Missing role checks could expose data; write comprehensive tests for protected routes.

--
This PRD should serve as the single source of truth for any AI-driven documentation, code generation, or technical planning needed to build out the Legia Professional Services Marketplace MVP. All subsequent documents (detailed tech stack, UI component specs, backend service contracts, file structures, etc.) should draw from these requirements without ambiguity.
