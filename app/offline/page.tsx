import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline - SIAP UNDIP Schedule",
  description: "Offline mode for SIAP UNDIP Schedule application",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">📱</div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          You're Offline
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Some features may be limited while you're offline. Check your internet
          connection to access all features.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Available Offline Features:
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
            <li>• View cached schedule</li>
            <li>• Access saved tasks</li>
            <li>• Review attendance history</li>
            <li>• Browse subject information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
