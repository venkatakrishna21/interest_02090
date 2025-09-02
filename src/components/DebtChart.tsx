'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Debt } from '../types/database';

export default function DebtChart({ debts }: { debts: Debt[] }) {
  const data = debts.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + Number(d.principal || 0);
    return acc;
  }, {} as Record<string, number>);

  const arr = Object.entries(data).map(([status, total]) => ({ status, total }));

  return (
    <div style={{width:'100%',height:300}}>
      <ResponsiveContainer>
        <BarChart data={arr}>
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
