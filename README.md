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

## 🌟 **Key Features**

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
- **Manual Code Input** - Alternative input method for accessibility
- **Attendance History** - View detailed attendance records and statistics
- **Meeting Tracking** - Track which meetings you've attended for each subject

### 👤 **User Profile Management**

- **Profile Customization** - Personalize your profile with photo and information
- **Academic Progress** - View overall academic statistics
- **Settings Management** - Customize app preferences and notifications

### 🎨 **Enhanced User Experience**

- **Dark Mode** - Eye-friendly dark theme with smooth transitions
- **Responsive Design** - Optimized for all screen sizes (mobile, tablet, desktop)
- **Progressive Web App (PWA)** - Install on any device like a native app
- **Offline Support** - Continue working without internet connection
- **Smart Notifications** - Timely reminders for classes and deadlines
- **Intuitive Navigation** - User-friendly bottom navigation on mobile

---

## 🛠️ **Tech Stack**

### **Frontend**

- **[Next.js 15.4.4](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5.7.2](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library

### **State Management & Data Fetching**

- **[TanStack Query 5.89.0](https://tanstack.com/query/latest)** - Powerful async state management
- **[React Query DevTools](https://tanstack.com/query/v4/docs/devtools)** - Development debugging

### **Backend & Database**

- **[MongoDB 6.18.0](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose 8.16.5](https://mongoosejs.com/)** - ODM for MongoDB
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless API endpoints

### **Authentication & Security**

- **[JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)** - Secure authentication
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **[js-cookie](https://github.com/js-cookie/js-cookie)** - Cookie management

### **AI & Document Processing**

- **[Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)** - OCR for document scanning
- **[Google Gemini AI](https://deepmind.google/technologies/gemini/)** - AI-powered document parsing
- **[googleapis](https://github.com/googleapis/google-api-nodejs-client)** - Google Calendar integration

### **UI Components & Icons**

- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### **QR Code & Media**

- **[@zxing/browser](https://github.com/zxing-js/browser)** - QR code scanning
- **[date-fns](https://date-fns.org/)** - Modern date utility library

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
   AZURE_COMPUTER_VISION_KEY=your_azure_computer_vision_key
   AZURE_COMPUTER_VISION_ENDPOINT=your_azure_endpoint_url

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
   - Fix Production Errors: [FIX_GOOGLE_403_ERROR.md](./FIX_GOOGLE_403_ERROR.md)

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

| Platform                | Support Level   | Features                    |
| ----------------------- | --------------- | --------------------------- |
| **Web (Desktop)**       | ✅ Full Support | All features available      |
| **Web (Mobile)**        | ✅ Full Support | Optimized mobile experience |
| **Progressive Web App** | ✅ Full Support | Install as native-like app  |
| **iOS**                 | ✅ PWA Support  | Add to home screen          |
| **Android**             | ✅ PWA Support  | Install via browser         |

---

## 🚀 **Deployment**

This application is deployed on **Vercel** and is production-ready.

**Live Demo:** [https://schedule.rifqinaufal11.studio](https://schedule.rifqinaufal11.studio)

### **Deploy Your Own**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rifqin-11/SiapUndipSchedule)

---

## 📸 **Screenshots**

### Desktop View

- Modern and clean interface optimized for desktop browsers
- Comprehensive dashboard with all features accessible

### Mobile View

- Responsive design that adapts to all screen sizes
- Touch-optimized controls for mobile devices
- Bottom navigation for easy thumb access

---

## 🎯 **Roadmap**

### Current Version (v2.1)

- ✅ Google Calendar Integration
- ✅ Privacy Policy & Terms of Service pages
- ✅ Cross-platform sync support

### Planned Features

- 🔄 Two-way Google Calendar sync
- 📊 Advanced analytics dashboard
- 🔔 Push notifications via PWA
- 👥 Study group collaboration features
- 📝 Note-taking integration
- 🎓 GPA calculator
- 📱 Native mobile app (iOS & Android)

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Rifqin Naufal**

- GitHub: [@Rifqin-11](https://github.com/Rifqin-11)
- LinkedIn: [Rifqin Naufal](https://www.linkedin.com/in/rifqin-naufal/)
- Email: rifqinaufal9009@gmail.com

---

## 🙏 **Acknowledgments**

- Universitas Diponegoro for inspiration
- All contributors who have helped improve this project
- Open source community for amazing tools and libraries
- Google for Calendar API and Gemini AI
- Microsoft Azure for Computer Vision services

---

## ⚠️ **Disclaimer**

This application is **NOT officially affiliated** with Universitas Diponegoro (UNDIP). It is an independent student project created to complement the official SIAP UNDIP system. All trademarks and institutional names are the property of their respective owners.

---

## 📞 **Support**

If you encounter any issues or have questions:

- Open an issue on GitHub
- Contact via email: rifqinaufal9009@gmail.com
- Check the [Documentation](./GOOGLE_CALENDAR_QUICKSTART.md)

---

**Made with ❤️ for UNDIP Students**
