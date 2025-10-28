import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type AccountRow = {
  id: number
  account_name: string
  node?: string | null
  placement_account_name?: string | null
  direct_sponsor_name?: string | null
  package_type?: string | null
  created_at?: string | null
  status?: string | null
}

type IncomeRow = { id: number; amount: number; level?: number | null; created_at?: string | null }

import { router, usePage } from '@inertiajs/react'

type Paginator<T> = { data: T[]; links?: any; meta?: any }

export default function MembersOverview({
  accounts = { data: [] },
  incomes = [],
  totals = { earnings_month: 0, accounts: 0, pins: 0, last_pairing_at: null },
  filters = { q: '', package: '' },
}: {
  accounts: Paginator<AccountRow> | any
  incomes: IncomeRow[]
  totals: { earnings_month: number; accounts: number; pins: number; last_pairing_at?: string | null }
  filters?: { q?: string; package?: string }
}) {
  const q = filters.q ?? ''
  const pkg = filters.package ?? ''

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (pkg) params.set('package', pkg)
    router.get('/members/overview', Object.fromEntries(params as any), { preserveScroll: true, preserveState: true })
  }

  const exportCsv = () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (pkg) params.set('package', pkg)
    params.set('export', '1')
    window.location.href = `/members/overview?${params.toString()}`
  }
  return (
    <AppLayout breadcrumbs={[{ title: 'Overview', href: '/members/overview' }]}>
      <Head title="Member Overview" />
      <div className="grid gap-4 p-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Earnings (month)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">PHP {totals.earnings_month.toLocaleString()}</CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totals.accounts}</CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Available Pins</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totals.pins}</CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Last Pairing</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totals.last_pairing_at ? new Date(totals.last_pairing_at).toLocaleString() : '-'}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Accounts</CardTitle>
              <div className="flex items-center gap-2">
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                  <input name="q" defaultValue={q} placeholder="Search accounts" className="h-9 w-48 rounded-md border border-slate-300 px-3 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50 focus-visible:outline-none" />
                  <select name="package" defaultValue={pkg} className="h-9 rounded-md border border-slate-300 px-2 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50 focus-visible:outline-none">
                    <option value="">All Packages</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                  <button type="submit" className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground">Filter</button>
                </form>
                <button onClick={exportCsv} className="h-9 rounded-md border border-slate-300 px-3 text-sm">Export CSV</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Node</th>
                    <th className="px-4 py-3">Placement</th>
                    <th className="px-4 py-3">Direct Sponsor</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.data?.length ? (
                    accounts.data.map((a: AccountRow) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{a.account_name}</td>
                        <td className="px-4 py-3 text-slate-600">{a.node ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{a.placement_account_name ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{a.direct_sponsor_name ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{a.package_type ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{a.status ?? 'active'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-400">No accounts</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {accounts.meta && (
              <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                <span>Page {accounts.meta.current_page} of {accounts.meta.last_page}</span>
                <div className="flex items-center gap-1">
                  {accounts.links?.map((l: any, i: number) => (
                    <button key={i} disabled={!l.url} onClick={() => l.url && router.get(l.url, {}, { preserveScroll: true, preserveState: true })} className={`rounded-md px-2 py-1 ${l.active ? 'bg-primary text-primary-foreground' : 'border border-slate-300'}`}>{l.label.replace(/&laquo;|&raquo;/g, '')}</button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Income</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {incomes.length ? incomes.map((i) => (
                <li key={i.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">L{i.level ?? '-'} • {i.created_at ? new Date(i.created_at).toLocaleString() : '-'}</span>
                  <span className="font-medium text-slate-800">PHP {i.amount.toLocaleString()}</span>
                </li>
              )) : (
                <li className="text-center text-slate-400">No recent income</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
