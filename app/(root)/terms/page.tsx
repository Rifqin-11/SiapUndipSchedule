export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: November 1, 2025
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SIAP UNDIP Schedule ("the Service"), you
              accept and agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p>
              SIAP UNDIP Schedule is a web application designed to help
              university students, particularly those at Universitas Diponegoro,
              manage their academic schedules, tasks, and assignments. The
              Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Class schedule management and viewing</li>
              <li>Task and assignment tracking with deadlines</li>
              <li>Attendance tracking via QR code scanning</li>
              <li>Google Calendar integration for schedule export</li>
              <li>
                IRS (Course Registration Form) document upload and parsing
              </li>
              <li>Exam schedule management</li>
              <li>Class rescheduling and conflict detection</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <div className="space-y-2">
              <p>
                <strong>Registration:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must create an account to use the Service</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 13 years old to use the Service</li>
              </ul>

              <p className="mt-4">
                <strong>Account Security:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>
                  You are responsible for all activities under your account
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service only for lawful purposes</li>
              <li>Not misuse or abuse the Service</li>
              <li>Not attempt to hack, disrupt, or damage the Service</li>
              <li>Not upload malicious content or viruses</li>
              <li>Not impersonate others or create fake accounts</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Verify the accuracy of your schedule data</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              5. Google Calendar Integration
            </h2>
            <p>When using the Google Calendar integration feature:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                You grant us permission to create events in your Google Calendar
              </li>
              <li>
                You understand that we will NOT access your existing calendar
                events
              </li>
              <li>
                Events created by the Service can be modified or deleted from
                Google Calendar
              </li>
              <li>You can disconnect the integration at any time</li>
              <li>
                You are responsible for managing calendar events after creation
              </li>
              <li>
                We are not responsible for any conflicts with existing calendar
                events
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Content and Data</h2>
            <div className="space-y-2">
              <p>
                <strong>Your Content:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  You retain ownership of data you upload (schedules, tasks,
                  documents)
                </li>
                <li>
                  You grant us a license to use your data to provide the Service
                </li>
                <li>You are responsible for the accuracy of your data</li>
              </ul>

              <p className="mt-4">
                <strong>Service Content:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  The Service interface, design, and code are our property
                </li>
                <li>
                  You may not copy, modify, or reverse engineer the Service
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Disclaimers</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-2">
              <p>
                <strong>IMPORTANT DISCLAIMERS:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>NOT OFFICIALLY AFFILIATED:</strong> This application
                  is NOT officially affiliated with, endorsed by, or connected
                  to Universitas Diponegoro (UNDIP)
                </li>
                <li>
                  <strong>NO WARRANTIES:</strong> The Service is provided "AS
                  IS" without warranties of any kind, express or implied
                </li>
                <li>
                  <strong>ACCURACY:</strong> We do not guarantee the accuracy,
                  completeness, or reliability of any schedule data
                </li>
                <li>
                  <strong>AVAILABILITY:</strong> We do not guarantee
                  uninterrupted or error-free service
                </li>
                <li>
                  <strong>VERIFICATION:</strong> You are responsible for
                  verifying all schedule information with official university
                  sources
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we shall NOT be liable for
              any:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Lost profits, revenue, data, or business opportunities</li>
              <li>Missed classes, deadlines, or academic consequences</li>
              <li>Errors or inaccuracies in schedule data</li>
              <li>Service interruptions or downtime</li>
              <li>
                Unauthorized access to your account (if caused by your
                negligence)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Termination</h2>
            <p>We reserve the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Suspend or terminate your account for violations of these Terms
              </li>
              <li>Modify or discontinue the Service at any time</li>
              <li>Remove or delete your data upon account termination</li>
            </ul>
            <p className="mt-2">
              You may delete your account at any time from the settings page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify users of significant changes via email or in-app
              notification. Continued use of the Service after changes
              constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                All trademarks, logos, and brand names are property of their
                respective owners
              </li>
              <li>
                "UNDIP" and related marks are property of Universitas Diponegoro
              </li>
              <li>The Service name and logo are our intellectual property</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">12. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              . Please review it to understand how we collect, use, and protect
              your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of Indonesia, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">14. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at:
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
            <h2 className="text-lg font-semibold">Acknowledgment</h2>
            <p className="text-sm">
              By using SIAP UNDIP Schedule, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service and
              our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
