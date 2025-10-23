import React from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'

type IncomeRecord = {
  id: number
  amount: number
  source: string
  description?: string | null
  created_at?: string | null
  level?: number | null
  left_account_id?: number | null
  right_account_id?: number | null
}

export default function IncomeIndex({ incomes = [], message = null }: { incomes: IncomeRecord[]; message?: string | null }) {
  return (
    <AppLayout>
      <Head title="Income History" />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Pairing Income History</h1>
          <p className="text-sm text-slate-500">Your most recent pairing earnings.</p>
        </div>

        {message && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{message}</div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-700">Recent Earnings</h2>
            <p className="text-sm text-slate-500">Latest 200 income records from pairing bonuses.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.length ? (
                  incomes.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{row.level ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{`PHP ${row.amount.toLocaleString()}`}</td>
                      <td className="px-4 py-3 text-slate-600">{row.source}</td>
                      <td className="px-4 py-3 text-slate-600">{row.description ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No income recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

