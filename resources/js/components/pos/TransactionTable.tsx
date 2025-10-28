import React from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search } from 'lucide-react'

export type TxRow = {
  id: number
  trans_no: string
  member_name: string | null
  total_amount: number
  date: string | null
  status: string
}

type Props = {
  rows: TxRow[]
}

type SortKey = keyof Pick<TxRow, 'trans_no' | 'member_name' | 'total_amount' | 'date' | 'status'>

const TransactionTable: React.FC<Props> = ({ rows }) => {
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' })

  const filtered = React.useMemo(() => {
    const qs = query.toLowerCase().trim()
    const list = qs
      ? rows.filter(r =>
          [r.trans_no, r.member_name ?? '', r.status].some(v => v.toLowerCase().includes(qs)),
        )
      : rows
    const sorted = [...list].sort((a, b) => {
      const { key, dir } = sort
      const va = a[key] ?? ''
      const vb = b[key] ?? ''
      let cmp = 0
      if (key === 'total_amount') cmp = (va as number) - (vb as number)
      else cmp = String(va).localeCompare(String(vb))
      return dir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [rows, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = filtered.slice((page - 1) * pageSize, page * pageSize)

  const changeSort = (key: SortKey) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  const currency = (v: number) => `₱ ${v.toFixed(2)}`

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-slate-800">Recent Transactions</div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-8" placeholder="Search transactions..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  { key: 'trans_no', label: 'Transaction ID' },
                  { key: 'member_name', label: 'Member Name' },
                  { key: 'total_amount', label: 'Total Amount' },
                  { key: 'date', label: 'Date' },
                  { key: 'status', label: 'Status' },
                ].map((c) => (
                  <th key={c.key} className="px-4 py-3">
                    <button className="flex items-center gap-1" onClick={() => changeSort(c.key as SortKey)}>
                      <span>{c.label}</span>
                      {sort.key === c.key ? (
                        sort.dir === 'asc' ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownWideNarrow className="size-4" />
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {current.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.trans_no}</td>
                  <td className="px-4 py-3 text-slate-600">{r.member_name ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{currency(r.total_amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {current.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TransactionTable

