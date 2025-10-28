import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SuperadminDashboard({ system = {}, queues = {} }: any) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Superadmin', href: '/superadmin' }]}>
      <Head title="Superadmin Dashboard" />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">PHP</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{system.php ?? '-'}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Laravel</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{system.laravel ?? '-'}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Queues</CardTitle></CardHeader><CardContent className="text-sm"><div>Pending: <b>{queues.pending ?? 0}</b></div><div>Failed: <b>{queues.failed ?? 0}</b></div></CardContent></Card>
      </div>
    </AppLayout>
  )
}

