import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard({ metrics = {}, latestUsers = [] as any[] }) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Admin', href: '/admin' }]}>
      <Head title="Admin Dashboard" />
      <div className="grid gap-4 p-6 md:grid-cols-5">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Active Members</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{metrics.active_members ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">New (7d)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{metrics.new_members_7d ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Accounts</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{metrics.total_accounts ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Queue Pending</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{metrics.queue_pending ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Failed Jobs</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{metrics.failed_jobs ?? 0}</CardContent></Card>
      </div>
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Latest Users</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Created</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestUsers.length ? latestUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3">{u.email}</td><td className="px-4 py-3 capitalize">{u.utype ?? '-'}</td><td className="px-4 py-3">{u.created_at ? new Date(u.created_at).toLocaleString() : '-'}</td></tr>
                  )) : (<tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No users</td></tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

