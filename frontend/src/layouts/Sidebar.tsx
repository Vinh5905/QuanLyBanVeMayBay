import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Plane, Ticket, Search,
  CreditCard, Briefcase, LogIn, BarChart2,
  Settings, UserCog, ChevronDown, ChevronUp, PlaneTakeoff, User,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  label: string
  icon: React.ReactNode
  to?: string
  children?: { label: string; to: string }[]
  roles?: string[]
  hideForRoles?: string[]
}

const navItems: NavItem[] = [
  // Staff/Admin/Agent only
  { label: 'Tổng quan', icon: <LayoutDashboard size={18} />, to: '/', hideForRoles: ['KhachHang'] },
  { label: 'Chuyến bay', icon: <Plane size={18} />, to: '/flights', hideForRoles: ['KhachHang'] },
  { label: 'Khách hàng', icon: <Users size={18} />, to: '/customers', roles: ['Admin', 'NhanVien', 'DaiLy'] },
  { label: 'Danh sách vé', icon: <Ticket size={18} />, to: '/tickets', roles: ['Admin'] },

  // Ticket submenu - KhachHang sees only book + my tickets
  {
    label: 'Vé máy bay', icon: <Ticket size={18} />,
    hideForRoles: ['Admin'],
    children: [
      { label: 'Bán vé tại quầy', to: '/tickets/sell' },
      { label: 'Đặt vé online', to: '/tickets/book' },
      { label: 'Danh sách vé', to: '/tickets' },
    ],
  },

  // KhachHang only
  { label: 'Tìm chuyến bay', icon: <Search size={18} />, to: '/flights/search', roles: ['KhachHang'] },

  { label: 'Hành lý ký gửi', icon: <Briefcase size={18} />, to: '/baggage' },
  { label: 'Thanh toán', icon: <CreditCard size={18} />, to: '/payments' },
  { label: 'Check-in online', icon: <LogIn size={18} />, to: '/checkin' },

  // Staff only
  { label: 'Tra cứu chuyến bay', icon: <Search size={18} />, to: '/flights/search', roles: ['NhanVien'] },
  { label: 'Báo cáo', icon: <BarChart2 size={18} />, to: '/reports', roles: ['Admin', 'NhanVien'] },
  { label: 'Tài khoản', icon: <UserCog size={18} />, to: '/accounts', roles: ['Admin'] },
  { label: 'Tham số hệ thống', icon: <Settings size={18} />, to: '/config', roles: ['Admin', 'NhanVien'] },

  // KhachHang profile
  { label: 'Thông tin của tôi', icon: <User size={18} />, to: '/profile', roles: ['KhachHang'] },
]

// Ticket children filtering by role
const ticketChildrenByRole: Record<string, string[]> = {
  KhachHang: ['/tickets/book', '/tickets'],
  DaiLy: ['/tickets/sell', '/tickets'],
  default: ['/tickets/sell', '/tickets/book', '/tickets'],
}

export default function Sidebar({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState<string[]>(['Vé máy bay'])

  const toggle = (label: string) => {
    setOpen((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label])
  }

  const role = user?.vaiTro ?? ''

  const visible = navItems.filter((item) => {
    if (item.hideForRoles?.includes(role)) return false
    if (item.roles && !item.roles.includes(role)) return false
    return true
  })

  return (
    <div className={`h-full flex flex-col bg-gray-900 text-gray-100 ${collapsed ? 'w-16' : 'w-60'} transition-all`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700">
        <PlaneTakeoff size={24} className="text-blue-400 shrink-0" />
        {!collapsed && <span className="font-bold text-sm leading-tight">Quản Lý<br/>Bán Vé Máy Bay</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {visible.map((item) => {
          if (item.children) {
            const isOpen = open.includes(item.label)
            const allowedPaths = ticketChildrenByRole[role] ?? ticketChildrenByRole['default']
            const visibleChildren = item.children.filter((c) => allowedPaths.includes(c.to))
            if (visibleChildren.length === 0) return null

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </>}
                </button>
                {isOpen && !collapsed && (
                  <div className="pl-10 pb-1">
                    {visibleChildren.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.to === '/tickets'}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 text-sm rounded-lg mb-0.5 transition-colors ${
                            isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to!}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
