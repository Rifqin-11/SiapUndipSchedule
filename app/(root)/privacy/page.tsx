export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: November 1, 2025
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              SIAP UNDIP Schedule ("we", "our", or "us") respects your privacy.
              This Privacy Policy explains how we collect, use, and protect your
              information when you use our service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <div className="space-y-2">
              <p>
                <strong>Account Information:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address</li>
                <li>Name</li>
                <li>Student ID (optional)</li>
                <li>Profile picture (optional)</li>
              </ul>

              <p className="mt-4">
                <strong>Academic Data:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Class schedules</li>
                <li>Tasks and assignments</li>
                <li>Attendance records</li>
                <li>Subject information</li>
              </ul>

              <p className="mt-4">
                <strong>Google Calendar Access:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Permission to create events in your Google Calendar</li>
                <li>
                  We DO NOT read, modify, or delete your existing calendar
                  events
                </li>
                <li>
                  We ONLY create new events based on your class schedule and
                  tasks
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain the service</li>
              <li>Manage your class schedules and tasks</li>
              <li>Create calendar events in your Google Calendar</li>
              <li>Send reminders for classes and deadlines</li>
              <li>Track attendance records</li>
              <li>Improve our service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              4. Data Storage and Security
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Your data is stored securely in MongoDB database with encryption
              </li>
              <li>
                Google Calendar access tokens are stored ONLY in your browser's
                localStorage
              </li>
              <li>
                We do NOT store your Google Calendar tokens on our servers
              </li>
              <li>All communication is encrypted via HTTPS/TLS</li>
              <li>We implement industry-standard security measures</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Data Sharing</h2>
            <p>
              We DO NOT sell, trade, or share your personal information with
              third parties, except:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Google Calendar API:</strong> To create events in your
                calendar (with your explicit permission)
              </li>
              <li>
                <strong>Azure Computer Vision:</strong> For OCR processing of
                uploaded schedule documents (data not stored)
              </li>
              <li>
                <strong>Google Gemini AI:</strong> For parsing document content
                (data not stored)
              </li>
              <li>When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data</li>
              <li>Disconnect Google Calendar integration at any time</li>
              <li>
                Revoke Google Calendar access via your Google Account settings
              </li>
              <li>Opt-out of notifications</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              7. Google Calendar Integration
            </h2>
            <p>
              <strong>
                Specific Privacy Information for Google Calendar API:
              </strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We request limited access to create calendar events only</li>
              <li>Your tokens are stored locally in your browser</li>
              <li>We cannot access your existing calendar events</li>
              <li>You can disconnect at any time from the app settings</li>
              <li>Disconnecting will NOT delete events already created</li>
              <li>
                You can manually delete created events from Google Calendar
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              8. Cookies and Local Storage
            </h2>
            <p>We use cookies and local storage for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Authentication and session management</li>
              <li>Storing user preferences (theme, language)</li>
              <li>Caching data for better performance</li>
              <li>Storing Google Calendar tokens (client-side only)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Children's Privacy</h2>
            <p>
              Our service is intended for university students (typically 18+).
              We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              10. Changes to Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-2">
              <li>
                <strong>Email:</strong> rifqinaufal9009@gmail.com
              </li>
              <li>
                <strong>Website:</strong> https://schedule.rifqinaufal11.studio
              </li>
            </ul>
          </section>

          <section className="space-y-3 mt-8 p-4 bg-muted rounded-lg">
            <h2 className="text-lg font-semibold">Disclaimer</h2>
            <p className="text-sm">
              SIAP UNDIP Schedule is NOT officially affiliated with Universitas
              Diponegoro (UNDIP). This is an independent student project
              designed to complement the official SIAP UNDIP system. All
              trademarks and institutional names are property of their
              respective owners.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
