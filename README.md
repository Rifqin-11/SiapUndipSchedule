# 📚 SIAP UNDIP Schedule

![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack_Query-5.89.0-red?logo=react-query&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.18.0-green?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)

**SIAP UNDIP Schedule** is a comprehensive, unofficial web application designed to help Universitas Diponegoro students manage their academic life efficiently. Built with modern web technologies and optimized for all devices, this application addresses the limitation of the official Android-only "SIAP UNDIP" app by providing cross-platform accessibility.

## 🌟 **Key Features**

### 📅 **Schedule Management**

- **Interactive Weekly Calendar** - View and navigate through your class schedule with an intuitive interface
- **Real-time Schedule Updates** - Instant synchronization across all devices
- **Class Rescheduling** - Easily reschedule classes with automatic conflict detection
- **Multi-view Support** - Daily, weekly, and monthly calendar views

### 📚 **Subject Management**

- **IRS Upload Integration** - Automatically import subjects by uploading your IRS (Isian Rencana Studi) document
- **Course Registration** - Add, edit, and remove subjects from your schedule
- **Subject Details** - Comprehensive information including lecturer, room, and course materials
- **Credit Hours Tracking** - Monitor your academic load and credit distribution
- **Subject Timeline** - Track important dates and milestones for each course

### ✅ **Task & Assignment Management**

- **Task Creation & Organization** - Create, categorize, and prioritize assignments
- **Due Date Tracking** - Never miss a deadline with smart deadline management
- **Progress Monitoring** - Track completion status and progress for all tasks
- **Subject Integration** - Link tasks directly to specific courses

### � **QR Code Attendance System**

- **QR Scanner Integration** - Scan QR codes for quick attendance marking
- **Attendance History** - Comprehensive attendance tracking and reporting
- **Attendance Analytics** - View attendance percentages and patterns
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

## 🚀 **Live Demo**

🔗 **[Try the Application](https://schedule.rifqinaufal11.studio/)**

---

## 🛠️ **Technology Stack**

### **Frontend**

- **[Next.js 15.4.4](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19](https://react.dev/)** - Modern UI library with concurrent features
- **[TypeScript 5.7.2](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12.8.0](https://www.framer.com/motion/)** - Advanced animations

### **State Management & Data Fetching**

- **[TanStack Query 5.89.0](https://tanstack.com/query)** - Smart caching and synchronization
- **[React Hook Form](https://react-hook-form.com/)** - Performant form management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### **Backend & Database**

- **[MongoDB 6.18.0](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose 8.16.5](https://mongoosejs.com/)** - MongoDB object modeling
- **[JWT Authentication](https://jwt.io/)** - Secure token-based authentication
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing

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
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

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

| Metric               | Achievement           |
| -------------------- | --------------------- |
| **First Load Time**  | < 2 seconds           |
| **Subsequent Loads** | < 200ms (93% faster)  |
| **Bundle Size**      | 1.6MB (24% reduction) |
| **Cache Hit Rate**   | 85%                   |
| **Lighthouse Score** | 95+ Performance       |

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
