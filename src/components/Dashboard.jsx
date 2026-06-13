import React from 'react';
import { Scan, RotateCcw, AlertTriangle, ShieldCheck, Activity, Calendar, Trash2 } from 'lucide-react';

export default function Dashboard({ scanHistory, onStartScan, onViewResult, clearHistory }) {
  // Simple rotation for tips (could be dynamic)
  const healthTips = [
    { title: "Yüz Simetrisi & Felç", desc: "Yüzün bir tarafında ani sarkma, gülümserken oluşan asimetri erken inme (felç) belirtisi olabilir." },
    { title: "Sarılık Belirtileri", desc: "Göz aklarında ve ciltte belirgin sararma, karaciğer fonksiyon bozukluğuna işaret edebilir." },
    { title: "Solgunluk & Anemi", desc: "Yüz renginde aşırı solukluk ve dudak içlerinin beyazlaşması kansızlığın habercisi olabilir." },
    { title: "Siyanoz (Morarma)", desc: "Dudak çevresinde ve tırnaklarda morarma, kandaki oksijen seviyesinin düştüğünü gösterebilir." }
  ];

  const currentTip = healthTips[Math.floor((Date.now() / 86400000) % healthTips.length)]; // changes daily

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.05em' }}>
            SAĞLIK ANALİZ SİSTEMİ
          </span>
          <h1 style={{ fontSize: '1.8rem', marginTop: '2px' }}>FaceScan AI</h1>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <Activity size={20} className="pulse-slow" />
        </div>
      </header>

      {/* Main Scan Trigger Card */}
      <div className="glass-card glow-primary" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>Yüz Tarayıcı Hazır</h2>
          <p style={{ fontSize: '0.85rem' }}>
            Kameranızı kullanarak anlık renk, pigmentasyon ve yüz simetrisi analizi yapın.
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={onStartScan}
          aria-label="Kamera ile Taramayı Başlat"
        >
          <Scan size={20} />
          <span>Taramayı Başlat</span>
        </button>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            <span>%100 Yerel Veri Güvenliği</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} style={{ color: 'var(--secondary)' }} />
            <span>Anlık İstemci Analizi</span>
          </div>
        </div>
      </div>

      {/* Daily Health Tip Banner */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--secondary)', background: 'rgba(59, 130, 246, 0.03)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Günün Sağlık Hatırlatıcısı</span>
        <h3 style={{ fontSize: '0.95rem', color: '#fff', marginTop: '4px', marginBottom: '2px' }}>{currentTip.title}</h3>
        <p style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{currentTip.desc}</p>
      </div>

      {/* Scan History Section */}
      <div>
        <div className="flex-between" style={{ marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#fff' }}>Geçmiş Analizler</h2>
          {scanHistory.length > 0 && (
            <button 
              onClick={clearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--error)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'var(--transition-smooth)'
              }}
              aria-label="Tarama geçmişini temizle"
              onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              <Trash2 size={12} />
              Temizle
            </button>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Activity size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Henüz kaydedilmiş analiz bulunmuyor.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>İlk taramanızı gerçekleştirerek başlayın.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scanHistory.map((item) => (
              <div 
                key={item.id} 
                className="glass-card glow-primary" 
                style={{ 
                  cursor: 'pointer',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => onViewResult(item)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span>{item.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: '600', 
                      color: item.overallRisk === 'Yüksek' ? 'var(--error)' : item.overallRisk === 'Orta' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      Risk Seviyesi: {item.overallRisk}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Simetri: %{item.metrics.symmetry.score} | Sarılık Belirtisi: {item.metrics.jaundice.status}
                  </span>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: 'var(--primary)'
                }}>
                  Detaylar
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
