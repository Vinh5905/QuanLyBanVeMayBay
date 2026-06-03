import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'Không có dữ liệu', action }: { message?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Inbox size={40} strokeWidth={1.5} className="mb-3" />
      <p className="text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
