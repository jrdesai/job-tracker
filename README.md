# Job Tracker

A modern job application tracking application built with Next.js, TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL.

## Features

- 📋 Track job applications with detailed information
- 📄 Upload and store resumes for each job application
- 📊 Dashboard with status overview and statistics
- ✏️ Add, edit, and delete job applications
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Type-safe with TypeScript
- 🗄️ PostgreSQL database with Prisma ORM
- ☁️ Ready for cloud storage integration (AWS S3)

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd job-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/job_tracker?schema=public"
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── jobs/
│   │       ├── route.ts          # GET, POST /api/jobs
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE /api/jobs/[id]
│   ├── dashboard/
│   │   └── page.tsx             # Main dashboard page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (redirects to dashboard)
├── components/
│   ├── JobCard.tsx              # Job card component
│   └── JobForm.tsx              # Job form component
└── lib/
    ├── prisma.ts                # Prisma client configuration
    └── types.ts                 # TypeScript type definitions

prisma/
└── schema.prisma                # Database schema
```

## Database Schema

The application uses a Job model with the following fields:

- `id`: Unique identifier (CUID)
- `title`: Job title
- `company`: Company name
- `location`: Job location
- `status`: Application status (APPLIED, INTERVIEW, OFFER, REJECTED)
- `appliedDate`: Date when application was submitted
- `notes`: Optional notes
- `salary`: Optional salary information
- `jobUrl`: Optional job posting URL
- `resumePath`: Local file path for resume (for local storage)
- `resumeUrl`: URL for cloud-stored resume (for future S3 integration)
- `resumeName`: Original filename of resume
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

## API Endpoints

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/[id]` - Get a specific job
- `PUT /api/jobs/[id]` - Update a job
- `DELETE /api/jobs/[id]` - Delete a job
- `POST /api/upload-resume` - Upload a resume file

## Resume Storage

The application supports resume storage with two approaches:

### Local Storage (Current Implementation)
- Resumes are stored in `public/uploads/resumes/` directory
- Files are renamed with timestamps to prevent conflicts
- Supported formats: PDF, DOC, DOCX, TXT
- Maximum file size: 5MB

### Cloud Storage (Future AWS S3 Integration)
The schema is designed to support cloud storage:
- `resumePath`: For local file paths
- `resumeUrl`: For cloud storage URLs (S3, etc.)
- `resumeName`: Original filename for display

To integrate with AWS S3:
1. Install AWS SDK: `npm install @aws-sdk/client-s3`
2. Update `src/lib/resume-utils.ts` to use S3 upload
3. Set environment variables for AWS credentials
4. Modify the upload API route to use S3 instead of local storage

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `DATABASE_URL` environment variable in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to:
- Set up a PostgreSQL database
- Add the `DATABASE_URL` environment variable
- Run `npx prisma migrate deploy` to apply migrations
- Run `npx prisma generate` to generate the Prisma client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.