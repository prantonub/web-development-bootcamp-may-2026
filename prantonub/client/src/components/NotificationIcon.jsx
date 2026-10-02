import { Bell, AlertTriangle, XCircle, Search, CheckCircle } from "lucide-react";

/** Notification type -> icon (replaces emoji). Shared by the bell and the page. */
const NOTIFICATION_ICONS = {
  budget_warning: AlertTriangle,
  budget_exceeded: XCircle,
  anomaly_detected: Search,
  goal_achieved: CheckCircle,
};

export default function NotificationIcon({ type, className = "w-5 h-5" }) {
  const Icon = NOTIFICATION_ICONS[type] || Bell;
  return <Icon className={className} aria-hidden="true" />;
}