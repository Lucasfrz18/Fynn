"use client"

import { Toaster } from "react-hot-toast"

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 5000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        success: {
          style: {
            borderLeft: "4px solid hsl(var(--success))",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid hsl(var(--danger))",
          },
        },
      }}
    />
  )
}
