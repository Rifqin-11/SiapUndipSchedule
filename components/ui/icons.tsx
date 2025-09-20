// Optimized icon imports untuk mengurangi bundle size
import { lazy, Suspense } from "react";
import type { LucideIcon } from "lucide-react";

// Core icons yang sering digunakan - di-import langsung
export {
  User,
  Settings,
  Calendar,
  BookOpen,
  Edit3,
  Bell,
  LogOut,
  Home,
} from "lucide-react";

// Icons yang jarang digunakan - lazy loaded
export const LazyIcons = {
  Camera: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.Camera }))
  ),
  Palette: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.Palette }))
  ),
  History: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.History }))
  ),
  PencilIcon: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.PencilIcon }))
  ),
  UserRoundCog: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.UserRoundCog }))
  ),
  InfoIcon: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.Info }))
  ),
  CheckCircle: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.CheckCircle }))
  ),
  Clock: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.Clock }))
  ),
  X: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.X }))
  ),
  Upload: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.Upload }))
  ),
  BarChart3: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.BarChart3 }))
  ),
  MapPin: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.MapPin }))
  ),
  Shield: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.Shield }))
  ),
  FileText: lazy(() =>
    import("lucide-react").then((module) => ({ default: module.FileText }))
  ),
};

// Icon wrapper component untuk lazy icons
interface LazyIconProps {
  name: keyof typeof LazyIcons;
  className?: string;
  size?: number;
}

export const LazyIcon: React.FC<LazyIconProps> = ({
  name,
  className,
  size = 24,
}) => {
  const IconComponent = LazyIcons[name];

  return (
    <Suspense
      fallback={<div className={`w-6 h-6 bg-gray-200 rounded ${className}`} />}
    >
      <IconComponent className={className} size={size} />
    </Suspense>
  );
};
