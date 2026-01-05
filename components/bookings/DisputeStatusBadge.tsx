"use client";

import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

interface DisputeStatusBadgeProps {
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  size?: "sm" | "md";
}

export default function DisputeStatusBadge({
  status,
  size = "md",
}: DisputeStatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
  };

  const iconSize = size === "sm" ? 12 : 16;

  const variants = {
    OPEN: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <AlertTriangle size={iconSize} />,
      label: "Open",
    },
    IN_REVIEW: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <Clock size={iconSize} />,
      label: "In Review",
    },
    RESOLVED: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <CheckCircle size={iconSize} />,
      label: "Resolved",
    },
    CLOSED: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: <XCircle size={iconSize} />,
      label: "Closed",
    },
  };

  const variant = variants[status];

  return (
    <span
      className={`inline-flex items-center space-x-1 ${variant.bg} ${variant.text} ${sizeClasses[size]} rounded-full font-medium`}
    >
      {variant.icon}
      <span>{variant.label}</span>
    </span>
  );
}