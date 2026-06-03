import { Outlet } from 'react-router-dom'
import { PlaneTakeoff } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
            <PlaneTakeoff size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Quản Lý Bán Vé Máy Bay</h1>
          <p className="text-blue-200 text-sm mt-1">Hệ thống quản lý nghiệp vụ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
