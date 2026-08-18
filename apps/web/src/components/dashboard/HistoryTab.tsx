'use client';

import React, { useEffect, useState } from 'react';
import { getPerformanceHistory } from '@/app/actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './HistoryTab.module.css';

interface HistoryData {
  timeline: { date: string; score: number; type: string }[];
  weakestObjectives: { name: string; accuracy: number }[];
  historyLog: { date: string; score: number; mode: string; insights: string | null }[];
}

export default function HistoryTab({ certificationId }: { certificationId: string }) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const historyData = await getPerformanceHistory(certificationId);
        setData(historyData);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [certificationId]);

  if (loading) return <div className={styles.loading}>Loading performance history...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Performance History</h2>
      
      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Timeline</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.weakestLinks}>
          <h3 className={styles.sectionTitle}>Weakest Links</h3>
          {data.weakestObjectives.length === 0 ? (
            <p className={styles.emptyText}>Not enough data to determine weakest links.</p>
          ) : (
            <ul className={styles.weakList}>
              {data.weakestObjectives.map((obj, i) => (
                <li key={i} className={styles.weakItem}>
                  <div className={styles.objName}>{obj.name}</div>
                  <div className={styles.accuracy}>Accuracy: {obj.accuracy.toFixed(1)}%</div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${Math.min(100, Math.max(0, obj.accuracy))}%`, backgroundColor: obj.accuracy < 50 ? '#ff4b4b' : obj.accuracy < 70 ? '#ffb020' : '#4caf50' }}></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.historyLog}>
          <h3 className={styles.sectionTitle}>Session History</h3>
          {data.historyLog.length === 0 ? (
            <p className={styles.emptyText}>No sessions found.</p>
          ) : (
            <ul className={styles.logList}>
              {data.historyLog.map((log, i) => (
                <li key={i} className={styles.logItem}>
                  <div className={styles.logHeader}>
                    <span className={styles.logDate}>{log.date}</span>
                    <span className={styles.logScore}>Score: {log.score}%</span>
                    <span className={styles.logMode}>{log.mode}</span>
                  </div>
                  {log.insights && (
                    <div className={styles.logInsights}>
                      <strong>AI Insights:</strong> {log.insights}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
