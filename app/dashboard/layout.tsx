import type { ReactNode } from "react"
import Header from "@/components/dashboard/header"
import Sidebar from "@/components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  )
}
