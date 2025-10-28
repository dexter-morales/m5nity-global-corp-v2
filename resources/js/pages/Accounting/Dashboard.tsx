import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AccountingDashboard({ metrics = {}, recentIncome = [] as any[] }) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }]}>
      <Head title="Accounting Dashboard" />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Pairing (month)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">PHP {(metrics.pairing_month ?? 0).toLocaleString?.() ?? metrics.pairing_month ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Payouts (month)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">PHP {(metrics.payouts_month ?? 0).toLocaleString?.() ?? metrics.payouts_month ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Payouts Count</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{metrics.payouts_count_month ?? 0}</CardContent></Card>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Recent Income</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Description</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {recentIncome.length ? recentIncome.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50"><td className="px-4 py-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td><td className="px-4 py-3 font-medium">PHP {Number(r.amount ?? 0).toLocaleString()}</td><td className="px-4 py-3">{r.source ?? '-'}</td><td className="px-4 py-3">{r.description ?? '-'}</td></tr>
                  )) : (<tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No data</td></tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

