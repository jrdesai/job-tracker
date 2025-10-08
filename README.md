# 🎯 Job Tracker

A modern, full-stack job application tracking system built with Next.js 15, TypeScript, and Tailwind CSS.

![Job Tracker Dashboard](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern Components**: Built with shadcn/ui and Lucide React icons
- **Smooth Animations**: Framer Motion for delightful interactions

### 📊 **Job Management**
- **Application Tracking**: Track job applications with detailed information
- **Status Management**: Applied, Interview, Offer, Rejected statuses
- **Interview Scheduling**: Schedule and track interview dates
- **Salary Tracking**: Record salary with currency selection (GBP, USD, EUR)
- **Notes & URLs**: Add notes and job posting URLs

### 📄 **Resume Management**
- **File Upload**: Upload PDF, DOC, DOCX, and TXT files
- **Resume Reuse**: Use existing resumes for multiple applications
- **File Validation**: Size and type validation with error handling
- **Storage Strategy**: Flexible local/S3 storage with Strategy Pattern

### 🔍 **Search & Filter**
- **Smart Search**: Search by company, title, location, or notes
- **Status Filtering**: Filter applications by status
- **Real-time Updates**: Instant search results as you type

### 📈 **Dashboard Analytics**
- **Status Overview**: Visual cards showing application counts
- **Upcoming Interviews**: Track interviews scheduled in the next 7 days
- **Quick Actions**: Edit and delete applications with icon buttons

## 🚀 Tech Stack

### **Frontend**
- **Next.js 15**: React framework with App Router and Turbopack
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Framer Motion**: Animation library
- **Lucide React**: Beautiful icons

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Reliable database
- **File System**: Local file storage with S3 ready

### **Development**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turbopack**: Fast development builds

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-tracker.git
   cd job-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/jobtracker"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### **Job Model**
```prisma
model Job {
  id            String    @id @default(cuid())
  title         String
  company       String
  location      String
  status        String    @default("applied")
  appliedDate   DateTime  @default(now())
  salary        Int?
  currency      String    @default("GBP")
  jobUrl        String?
  notes         String?
  interviewDate DateTime?
  interviewNotes String?
  resumeId      String?
  resume        Resume?   @relation(fields: [resumeId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### **Resume Model**
```prisma
model Resume {
  id        String   @id @default(cuid())
  name      String
  path      String
  size      Int
  mimeType  String
  jobs      Job[]
  createdAt DateTime @default(now())
}
```

## 🎨 UI Components

### **Dashboard**
- Status overview cards with counts
- Upcoming interviews section
- Search and filter controls
- Job application grid

### **Job Cards**
- Company name and status badge
- Job title and location
- Applied date and salary
- Resume information
- Edit/delete actions

### **Job Form**
- Comprehensive form with validation
- Resume upload/selection
- Interview scheduling
- Currency selection

## 🔧 Configuration

### **Storage Strategy**
The application uses the Strategy Pattern for file storage:

```typescript
// Local storage (default)
STORAGE_TYPE=local

// S3 storage
STORAGE_TYPE=s3
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
```

### **Theme Configuration**
Themes are automatically detected and persisted:
- System preference detection
- Local storage persistence
- Smooth theme transitions

## 📁 Project Structure

```
job-tracker/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/
│       └── resumes/           # Resume storage
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── JobForm.tsx        # Job form component
│   │   └── ThemeToggle.tsx    # Theme toggle
│   └── lib/
│       ├── storage/           # Storage strategy
│       ├── types.ts           # TypeScript types
│       └── prisma.ts          # Database client
└── package.json
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### **Other Platforms**
- **Railway**: PostgreSQL + Next.js hosting
- **Netlify**: Static hosting with serverless functions
- **AWS**: EC2 + RDS for full control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Prisma](https://prisma.io/) - Database toolkit
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ by Jigar**
