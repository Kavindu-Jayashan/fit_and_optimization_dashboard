# Fit and Optimization Dashboard

A comprehensive web application designed for recruiters to generate optimized job descriptions with ATS-friendly keywords and create screening quizzes for candidates. Built with Next.js, TypeScript, and powered by OpenAI and Azure services.

## Features

- **Job Description Generation**: AI-powered creation of professional job descriptions with categorized ATS keywords
- **ATS Keyword Optimization**: Automatically generated hard skills, soft skills, qualifications, and experience requirements
- **Quiz Generation**: Create screening quizzes with multiple choice, true/false, and short answer questions
- **OTP Authentication**: Secure login system using email-based one-time passwords
- **Azure Integration**: Blob storage for file uploads and Table storage for data persistence
- **Responsive UI**: Modern, accessible interface built with shadcn/ui and Tailwind CSS
- **Real-time Data**: Interactive charts and data visualization for job and quiz analytics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Authentication**: NextAuth.js with OTP via Azure Communication Services
- **AI**: OpenAI GPT models for content generation
- **Database**: Azure Table Storage
- **File Storage**: Azure Blob Storage
- **Email**: Azure Communication Services
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Azure account with:
  - Storage Account (for Blob and Table storage)
  - Communication Services resource (for email)
- OpenAI API account and API key

## Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fit_and_optimization_dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Azure Storage
   AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
   AZURE_BLOB_CONTAINER_NAME=your_blob_container_name
   AZURE_TABLE_NAME=your_table_name

   # Azure Communication Services (for OTP emails)
   AZURE_COMMUNICATION_CONNECTION_STRING=your_communication_connection_string
   AZURE_SENDER_EMAIL=your_verified_sender_email@domain.com

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # NextAuth (optional, for additional security)
   NEXTAUTH_SECRET=your_random_secret_string
   ```

4. **Azure Resources Setup**
   - **Storage Account**: Create a storage account and get the connection string
   - **Blob Container**: Create a container for file uploads
   - **Table**: Create tables for jobs and quizzes data
   - **Communication Services**: Set up email service and verify sender domain

5. **Test Azure Connection** (optional)
   ```bash
   npm run tsx scripts/testAzure.ts
   ```

## Running the Application

1. **Development Mode**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Build for Production**

   ```bash
   npm run build
   npm run start
   ```

3. **Linting**
   ```bash
   npm run lint
   ```

## Seeding Sample Data

To populate the database with sample job data:

```bash
npm run tsx scripts/seed.ts
```

This will add sample job listings from major tech companies (Google, Meta, Microsoft, Amazon, Netflix) with various roles.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── jobs/         # Job management APIs
│   │   └── quiz/         # Quiz generation APIs
│   ├── jobs/             # Job listing and management pages
│   ├── login/            # Authentication page
│   └── quizzes/          # Quiz management pages
├── components/            # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Business logic and utilities
│   ├── interfaces/      # TypeScript interfaces
│   ├── repositories/    # Data access layer
│   ├── services/        # Business services
│   └── types/           # Type definitions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login

### Jobs

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs/generate` - Generate new job description
- `GET /api/jobs/[jobId]` - Get specific job
- `PUT /api/jobs/[jobId]` - Update job
- `GET /api/jobs/[jobId]/edit` - Edit job page
- `GET /api/jobs/[jobId]/quiz` - Job quiz page

### Quizzes

- `GET /api/quizzes` - Get all quizzes
- `POST /api/quiz/generate` - Generate quiz questions
- `GET /api/quiz/[quizId]` - Get specific quiz

## Key Features Explained

### Job Generation

Recruiters can input job title, seniority, industry, and key responsibilities. The AI generates:

- Complete job description (300+ words)
- Categorized ATS keywords:
  - Hard skills (technical skills)
  - Soft skills (interpersonal skills)
  - Qualifications (education/certifications)
  - Experience requirements

### Quiz Generation

Based on job descriptions or custom topics, generate screening questions:

- 50% Multiple Choice Questions (MCQ)
- 20% True/False questions
- 30% Short Answer questions

Each question includes ideal answers and explanations for recruiters.

### Authentication Flow

1. User enters email on login page
2. OTP sent via Azure Communication Services
3. User enters OTP to authenticate
4. JWT session created for 24 hours

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

Ensure the platform supports:

- Node.js 18+
- Environment variables
- Next.js build process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
