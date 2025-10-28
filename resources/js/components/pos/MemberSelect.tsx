import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SearchableSelect } from '@/components/ui/searchable-select'
import React from 'react'

export type AccountOption = {
  id: number
  account_name: string
  member_name?: string | null
  mid?: string | null
}

type Props = {
  accounts: AccountOption[]
  value: string
  onChange: (v: string) => void
  error?: string
}

const MemberSelect: React.FC<Props> = ({ accounts, value, onChange, error }) => {
  const items = accounts.map((a) => ({
    value: a.account_name,
    label: a.member_name ? `${a.member_name} • ${a.account_name}` : a.account_name,
    render: (
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarFallback>{(a.member_name || a.account_name).slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="truncate">
          <div className="truncate text-sm font-medium">{a.member_name || a.account_name}</div>
          <div className="truncate text-xs text-slate-500">{a.account_name}{a.mid ? ` • ${a.mid}` : ''}</div>
        </div>
      </div>
    )
  }))

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-600">Member Account Name</label>
      <SearchableSelect items={items} value={value} onValueChange={onChange} placeholder="Search member..." />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default MemberSelect

