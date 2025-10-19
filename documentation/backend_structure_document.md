# Backend Structure Document

## 1. Backend Architecture

Our backend is built on a modern, modular design that emphasizes clarity, scalability, and performance:

- **Framework**: Next.js API Routes serve as our RESTful backend layer. This keeps frontend and backend in the same codebase and allows us to leverage server-side rendering when needed.
- **Design Patterns**:
  - **Layered Architecture**: We separate concerns into API routes, business logic (`/lib/`), and data access (`/db/`).
  - **Service Modules**: Each major feature (auth, payments, AI, websockets) has its own module under `/lib/`. This makes code easy to read and extend.
  - **Middleware & Guards**: We use custom middleware for role-based access control (RBAC), input validation, and error handling. These sit between incoming requests and our service code.
- **Scalability & Performance**:
  - Stateless API Routes can be scaled horizontally behind a load balancer.
  - Database connections are pooled and optimized via Drizzle ORM.
  - Static assets and UI routes benefit from Next.js caching and server components.
- **Maintainability**:
  - Clear folder structure (`/app`, `/db`, `/lib`, `/components`).
  - Type-safe queries and models via Drizzle ORM.
  - Shared utility functions and constants in `/lib` enforce consistency.

## 2. Database Management

- **Technology**:
  - **Type**: Relational (SQL)
  - **System**: PostgreSQL (hosted on a managed service or container)
  - **ORM**: Drizzle ORM for type-safe, compile-time-checked queries
- **Data Organization**:
  - Tables are organized around core entities: Users, Professionals, Projects, Orders, Payments, ChatMessages, Notifications, and KYC Documents.
  - Each table maps closely to a real-world concept in the marketplace, simplifying both development and communication with non-technical stakeholders.
- **Best Practices**:
  - **Migrations**: Managed via Drizzle’s migration tooling to keep schema changes versioned.
  - **Indexing**: Frequently queried columns (e.g., user email, project status, professional location) are indexed.
  - **Backups**: Automated daily backups of the database to ensure data durability.
  - **Connection Pooling**: Limits open connections to maintain database health under load.

## 3. Database Schema

Below is a high-level, human-readable summary of our main tables. Following that, you’ll find the actual SQL definitions for PostgreSQL.

### Human-Readable Overview

- **users**: base user table (email, name, password hash, role, KYC status)
- **professionals**: extended profile for professionals (ratings, specialties, KYC documents)
- **projects**: AI-generated or user-submitted project briefs (title, description, location, budget)
- **orders**: relationship between clients and professionals (status, contract details)
- **order_terms**: payment terms and milestones for each order
- **payments**: records of payments and escrow releases
- **chat_messages**: saved messages for private chatrooms
- **notifications**: real-time event logs and delivery status

### PostgreSQL Schema (SQL)

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,        -- 'client', 'professional', 'admin'
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Professionals
CREATE TABLE professionals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) DEFAULT 0,
  specialties TEXT[],
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  budget NUMERIC,
  ai_images TEXT[],              -- URLs of AI-generated images
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  professional_id INTEGER REFERENCES professionals(id),
  status VARCHAR(50) DEFAULT 'pending',
  contract_details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Terms
CREATE TABLE order_terms (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  term_id INTEGER REFERENCES order_terms(id) ON DELETE CASCADE,
  provider VARCHAR(50),        -- 'xendit', 'midtrans', 'tripay'
  provider_transaction_id VARCHAR(255),
  amount NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  sender_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50),            -- 'order_update', 'message', etc.
  payload JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 4. API Design and Endpoints

We use RESTful API Routes under `/app/api`. Each route corresponds to a logical entity:

- **Authentication (`/api/auth`)**:
  - `POST /signup`  – Register a new user
  - `POST /signin`  – Authenticate and create a session
  - `POST /signout` – Destroy the user session
- **Projects (`/api/projects`)**:
  - `GET /`           – List all projects for a user
  - `POST /`          – Create a new project (with or without AI assistance)
  - `GET /:projectId` – Fetch project details
  - `PUT /:projectId` – Update project
- **Orders (`/api/orders`)**:
  - `POST /`          – Create a new order from a project
  - `GET /`           – List orders by role
  - `PUT /:orderId`   – Update order status (accept, cancel)
- **Payments (`/api/payments`)**:
  - `POST /create`    – Initiate payment via chosen gateway
  - `POST /webhook`   – Handle callbacks from Xendit/Midtrans/Tripay
  - `GET /status/:id` – Check payment status
- **Chat (`/api/chat`)**:
  - `GET /rooms`      – List active chat rooms
  - `GET /rooms/:id`  – Fetch chat history
  - `POST /rooms/:id` – Send a new message
- **Notifications (`/api/notifications`)**:
  - `GET /`           – List recent notifications
  - `POST /mark-read` – Mark notifications as read

All routes are protected by our **RBAC middleware** which checks the user’s role and KYC status before granting access.

## 5. Hosting Solutions

We recommend a container-based deployment for maximum consistency and portability:

- **Containers**: Docker images for the Next.js app and PostgreSQL database.
- **Cloud Provider**: AWS is a common choice:
  - **ECS / Fargate** to run containers without managing servers.
  - **RDS (PostgreSQL)** for a managed, highly available database.
- **Alternative**: Deploy the Next.js app on Vercel (built-in CI/CD) and point it at a managed PostgreSQL instance (Supabase or AWS RDS).

Benefits:
- Elastic scaling of API containers under load.
- Managed database with automated backups and failover.
- Predictable pricing and pay-as-you-go.

## 6. Infrastructure Components

- **Load Balancer**: Distributes incoming HTTP/WebSocket traffic across multiple container instances (AWS ALB or NGINX).
- **Caching**:
  - In-memory caching for frequently accessed static data (e.g., Redis or in-process LRU cache).
  - Next.js ISR (Incremental Static Regeneration) for public pages.
- **Content Delivery Network (CDN)**:
  - CloudFront or Vercel’s built-in CDN for static assets (CSS, JS, images).
- **WebSocket Server**:
  - Socket.IO or similar library running alongside API containers to power real-time chat and notifications.
- **Logging and Error Tracking**:
  - Centralized log storage (CloudWatch, ELK stack) and Sentry for error monitoring.

## 7. Security Measures

- **Authentication & Authorization**:
  - Custom “Better Auth” solution with secure session cookies (HTTP-only, SameSite) or JWT.
  - Role-based access control (RBAC) middleware enforcing per-route permissions.
- **Data Encryption**:
  - HTTPS/TLS for all network traffic.
  - Encryption at rest for database volumes.
- **Input Validation**:
  - Zod schemas on every API route to prevent malformed or malicious data.
- **Vulnerability Protection**:
  - Helmet.js or similar middleware to set secure HTTP headers.
  - Rate limiting on auth and payment endpoints.
- **Compliance**:
  - GDPR-friendly user data handling (data deletion, export).
  - PCI DSS considerations for payment data (outsourced to gateways).

## 8. Monitoring and Maintenance

- **Monitoring**:
  - **Metrics**: CPU, memory, request latency, error rates (CloudWatch, Prometheus).
  - **Logs**: Centralized log aggregation with structured logs (JSON) and log levels (info, warn, error).
  - **Alerts**: Trigger notifications on high error rates or resource exhaustion.
- **Maintenance**:
  - **Automated Migrations**: Run Drizzle migrations on deployment to keep schema in sync.
  - **Dependency Updates**: Regularly update Node.js, Next.js, and library dependencies.
  - **Health Checks**: Periodic smoke tests against critical endpoints (auth, payment webhook).

## 9. Conclusion and Overall Backend Summary

This backend structure provides a clear, scalable foundation for the Legia professional-services marketplace:

- A unified Next.js codebase handling both API and UI layers.
- A robust PostgreSQL database managed by Drizzle ORM with full type safety.
- Clean, RESTful API design with role-based middleware.
- Containerized hosting strategy for consistent development and production environments.
- Infrastructure components (load balancer, caching, CDN, WebSockets) that ensure high performance and real-time interactivity.
- Strong security posture covering authentication, encryption, and data validation.
- Proactive monitoring and maintenance processes to keep the system reliable.

Together, these elements align perfectly with the project’s goal of delivering a secure, high-performance marketplace MVP that can grow and evolve with user needs.