export default function Loading() {
  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#666' }}>
      <div className="spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #0070f3', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', marginRight: '1rem' }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span>Setting up your training session...</span>
    </div>
  )
}
