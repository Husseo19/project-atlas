'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import styles from './ReadinessChart.module.css'

interface ReadinessChartProps {
  data: { name: string; score: number }[]
}

export default function ReadinessChart({ data }: ReadinessChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>No session data available to display.</p>
      </div>
    )
  }

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-surface)', 
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
            itemStyle={{ color: 'var(--color-primary)' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="var(--color-primary)" 
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--color-surface)', stroke: 'var(--color-primary)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-surface)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
