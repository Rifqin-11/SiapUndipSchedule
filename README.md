# 📚 SIAP UNDIP Schedule

![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack_Query-5.89.0-red?logo=react-query&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.18.0-green?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)

**SIAP UNDIP Schedule** is a comprehensive, unofficial web application designed to help Universitas Diponegoro students manage their academic life efficiently. Built with modern web technologies and optimized for all devices, this application addresses the limitation of the official Android-only "SIAP UNDIP" app by providing cross-platform accessibility.

## ✨ **What's New in v2.1**

- 📅 **Google Calendar Integration** - Export schedules & tasks to Google Calendar with one click
- 🔄 **Cross-Platform Sync** - Access your schedule on all devices via Google Calendar
- 🔔 **Smart Reminders** - Automatic notifications for classes and task deadlines
- 🎨 **Priority Colors** - Visual task prioritization in Google Calendar

## 🎉 **What's New in v2.0**

- 🎓 **Exam Schedule Upload** - Upload UTS/UAS cards with OCR + AI extraction
- 🔄 **Automatic Class Rescheduling** - Smart conflict resolution during exam periods
- 📊 **Enhanced Attendance Analytics** - Accurate calculations excluding exam schedules
- 🤖 **AI-Powered Document Parsing** - Powered by Azure Computer Vision & Google Gemini
- ⚡ **Optimistic UI Updates** - Instant feedback for all CRUD operations
- 📱 **Improved Mobile Experience** - Better performance and responsiveness

## �🌟 **Key Features**

### 📅 **Schedule Management**

- **Interactive Weekly Calendar** - View and navigate through your class schedule with an intuitive interface
- **Real-time Schedule Updates** - Instant synchronization across all devices
- **Class Rescheduling** - Easily reschedule classes with automatic conflict detection
- **Multi-view Support** - Daily, weekly, and monthly calendar views

### 📚 **Subject Management**

- **IRS Upload Integration** - Automatically import subjects by uploading your IRS (Isian Rencana Studi) document using OCR + AI
- **Exam Schedule Upload (NEW)** - Upload UTS/UAS exam cards with automatic class rescheduling during exam period
- **Intelligent Class Shifting** - Automatically shifts regular classes that conflict with exam schedules and adds replacement meetings
- **Course Registration** - Add, edit, and remove subjects from your schedule
- **Subject Details** - Comprehensive information including lecturer, room, and course materials
- **Credit Hours Tracking** - Monitor your academic load and credit distribution
- **Subject Timeline** - Track important dates and milestones for each course
- **Flexible Meeting Types** - Support for both recurring weekly classes and one-time specific date meetings

### ✅ **Task & Assignment Management**

- **Task Creation & Organization** - Create, categorize, and prioritize assignments
- **Due Date Tracking** - Never miss a deadline with smart deadline management
- **Progress Monitoring** - Track completion status and progress for all tasks
- **Subject Integration** - Link tasks directly to specific courses

### 📅 **Google Calendar Integration (NEW)**

- **Schedule Export** - Export all your class schedules to Google Calendar as recurring events
- **Task Sync** - Sync incomplete tasks with automatic reminders
- **Smart Event Creation** - Events include complete details (room, lecturer, description)
- **Priority-Based Colors** - Tasks color-coded by priority (High: Red, Medium: Yellow, Low: Green)
- **Automatic Reminders** - Class reminders (30 & 10 min before), Task reminders (1 day & 1 hour before)
- **Cross-Platform Sync** - Access your schedule on all devices (desktop, mobile, tablet)
- **One-Click Export** - Export 14 weeks of classes with a single click

### 📷 **QR Code Attendance System**

- **QR Scanner Integration** - Scan QR codes for quick attendance marking
- **Attendance History** - Comprehensive attendance tracking and reporting
- **Smart Attendance Analytics** - View attendance percentages calculated only from regular classes (excludes exam schedules)
- **Dynamic Meeting Calculation** - Accurate attendance tracking for both recurring and one-time classes
- **Manual Entry Support** - Alternative attendance marking methods

### 🔔 **Smart Notifications**

- **Class Reminders** - Automated notifications 15 minutes before class starts
- **Assignment Alerts** - Due date reminders for pending tasks
- **Schedule Changes** - Instant notifications for any schedule modifications
- **Customizable Settings** - Configure notification preferences and timing

### 👤 **User Profile & Authentication**

- **Secure Authentication** - JWT-based login system with session management
- **Profile Management** - Customize user information and preferences
- **Data Synchronization** - Seamless data sync across multiple devices
- **Privacy Controls** - Granular privacy settings and data management

### 🎨 **User Experience**

- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode** - Theme customization for comfortable viewing
- **Offline Support** - Core functionality available without internet connection
- **Progressive Web App** - Install as a native app on any device

### ⚡ **Performance & Reliability**

- **Smart Caching** - Intelligent data caching for 93% faster load times
- **Optimistic Updates** - Instant UI feedback with automatic error rollback
- **Bundle Optimization** - Minimal bundle size for faster initial loading
- **Error Recovery** - Robust error handling with automatic retry mechanisms

---

## ✨ **New Feature: Exam Schedule Management**

### 📝 **UTS/UAS Upload & Automatic Class Rescheduling**

The application now features intelligent exam schedule management that automatically handles class conflicts during exam periods:

#### **How It Works:**

1. **Upload Exam Card** - Upload your UTS or UAS exam schedule (image or PDF format)
2. **AI-Powered Extraction** - Azure Computer Vision + Google Gemini AI extract exam details:
   - Subject names
   - Exam dates and times
   - Room locations
   - Exam types (UTS/UAS)
3. **Automatic Class Management**:
   - 🔍 **Detect Conflicts** - Identifies regular classes that fall within exam period
   - 🗑️ **Remove Conflicting Classes** - Automatically removes classes during exam week(s)
   - ➕ **Add Replacement Meetings** - Schedules replacement classes after semester ends
   - ✅ **Maintain Total Count** - Ensures you still have 14 meetings per subject
4. **Smart Attendance** - Exam schedules are excluded from attendance statistics

#### **Example Scenario:**

```
Original Schedule:
- Matematika: 14 meetings (every Monday)
- Meeting 5: Feb 17 (during UTS period) ❌
- Meeting 6: Feb 24 (during UTS period) ❌

After UTS Upload:
- Meetings 5-6: Removed from schedule
- Replacement meetings: Added on Apr 28 & May 5
- Total meetings: Still 14 ✅
- UTS Exam: Added as separate one-time event
- Attendance calculation: Only counts regular classes (not exams)
```

---

## 🚀 **Live Demo**

🔗 **[Try the Application](https://schedule.rifqinaufal11.studio/)**

---

## 🛠️ **Technology Stack**

### **Frontend**

- **[Next.js 15.4.4](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19](https://react.dev/)** - Modern UI library with concurrent features
- **[TypeScript 5.7.2](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework

### **State Management & Data Fetching**

- **[TanStack Query 5.89.0](https://tanstack.com/query)** - Smart caching and synchronization
- **[React Hook Form](https://react-hook-form.com/)** - Performant form management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### **Backend & Database**

- **[MongoDB 6.18.0](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose 8.16.5](https://mongoosejs.com/)** - MongoDB object modeling
- **[JWT Authentication](https://jwt.io/)** - Secure token-based authentication
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing

### **AI & OCR Integration**

- **[Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)** - OCR text extraction from IRS and exam cards
- **[Google Gemini AI](https://ai.google.dev/)** - Intelligent document parsing and data extraction
- **[Axios](https://axios-http.com/)** - HTTP client for API integrations

### **UI Components**

- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### **Development Tools**

- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)** - Bundle optimization
- **[React Query DevTools](https://tanstack.com/query/v4/docs/devtools)** - Development debugging

---

## 📦 **Getting Started**

### **Prerequisites**

- Node.js 18.0 or higher
- npm or yarn package manager
- MongoDB database (local or cloud)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/Rifqin-11/SiapUndipSchedule.git
   cd SiapUndipSchedule
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Azure Computer Vision (for OCR)
   AZURE_VISION_KEY=your_azure_computer_vision_key
   AZURE_VISION_ENDPOINT=your_azure_endpoint_url

   # Google Gemini AI (for document parsing)
   GEMINI_API_KEY=your_google_gemini_api_key

   # Google Calendar API (for calendar integration)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

   **📖 For Google Calendar setup guide, see:**

   - Quick Start: [GOOGLE_CALENDAR_QUICKSTART.md](./GOOGLE_CALENDAR_QUICKSTART.md)
   - Full Documentation: [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### **Available Scripts**

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
```

---

## 📱 **Platform Support**

| Platform             | Support Level      | Features                       |
| -------------------- | ------------------ | ------------------------------ |
| **Web (Desktop)**    | ✅ Full Support    | All features available         |
| **Web (Mobile)**     | ✅ Full Support    | Optimized mobile experience    |
| **iOS (Safari)**     | ✅ Full Support    | PWA installation supported     |
| **Android (Chrome)** | ✅ Full Support    | PWA installation supported     |
| **Offline Mode**     | ✅ Partial Support | Core features with cached data |

---

## 🔒 **Security Features**

- **JWT Authentication** - Secure token-based user authentication
- **Password Encryption** - bcrypt hashing for secure password storage
- **Input Validation** - Comprehensive client and server-side validation
- **CORS Protection** - Configured cross-origin resource sharing
- **Rate Limiting** - API endpoint protection against abuse

---

## 📈 **Performance Metrics**

| Metric                  | Achievement           |
| ----------------------- | --------------------- |
| **First Load Time**     | < 2 seconds           |
| **Subsequent Loads**    | < 200ms (93% faster)  |
| **Bundle Size**         | 1.6MB (24% reduction) |
| **Cache Hit Rate**      | 85%                   |
| **Lighthouse Score**    | 95+ Performance       |
| **OCR Processing Time** | 3-5 seconds           |
| **AI Parsing Accuracy** | 95%+ for documents    |

---

## 🤝 **Contributing**

We welcome contributions to improve SIAP UNDIP Schedule! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📢 **Disclaimer**

This is an unofficial project and is not affiliated with Universitas Diponegoro or the original "SIAP UNDIP" developers. This application is created solely to enhance accessibility and provide cross-platform support for students.

---

## 📞 **Support**

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/Rifqin-11/SiapUndipSchedule/issues)
- **Documentation**: Check our comprehensive [guides](./docs/)
- **Live Demo**: [schedule.rifqinaufal11.studio](https://schedule.rifqinaufal11.studio/)

---

_Built with ❤️ for Universitas Diponegoro students_
