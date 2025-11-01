import { lazy, Suspense } from "react";
import { ComponentType } from "react";

// Lazy load pages yang tidak critical
export const LazyPages = {
  UserProfile: lazy(() => import("@/app/(root)/user/profile/page")),
  UserNotifications: lazy(() => import("@/app/(root)/user/notifications/page")),
  UserSecurity: lazy(() => import("@/app/(root)/user/security/page")),
  SettingsAbout: lazy(() => import("@/app/(root)/settings/about/page")),
  SettingsAppearance: lazy(
    () => import("@/app/(root)/settings/appearance/page")
  ),
  AttendanceHistory: lazy(
    () => import("@/app/(root)/settings/attendance-history/page")
  ),
  UploadKRS: lazy(() => import("@/app/(root)/settings/upload-krs/page")),
  Tasks: lazy(() => import("@/app/(root)/tasks/page")),
};

// Lazy load heavy components
export const LazyComponents = {
  QRScanner: lazy(() => import("@/components/QRScanner")),
  SubjectModal: lazy(() => import("@/components/SubjectModal")),
  RescheduleModal: lazy(
    () => import("@/components/reschedule/RescheduleModal")
  ),
  TaskDetailDrawer: lazy(() =>
    import("@/components/tasks/TaskDetailDrawer").then((m) => ({
      default: m.TaskDetailDrawer,
    }))
  ),
  TaskFormDrawer: lazy(() =>
    import("@/components/tasks/TaskFormDrawer").then((m) => ({
      default: m.TaskFormDrawer,
    }))
  ),
  CalendarCard: lazy(() => import("@/components/schedule/CalendarCard")),
};

// HOC untuk lazy loading dengan loading state
export function withLazyLoading<T extends {}>(
  LazyComponent: ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <Suspense
        fallback={
          fallback || <div className="animate-pulse bg-gray-200 rounded h-32" />
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
