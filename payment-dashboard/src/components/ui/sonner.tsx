"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-gray-600 group-[.toast]:font-sans",
          actionButton: "group-[.toast]:bg-amber-800 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:font-sans",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:rounded-xl group-[.toast]:font-sans",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-900",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-900",
          warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-900",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-900",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
