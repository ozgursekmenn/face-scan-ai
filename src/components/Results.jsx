import React from 'react';
import { RefreshCw, Activity, AlertTriangle, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react';

export default function Results({ result, onRestart }) {
  if (!result) return null;

  const { metrics, overallRisk, date } = result;

  // Helper component to render circular progress gauge
  const CircularProgress = ({ score, max = 100, label, colorVar }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / max) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div className="circular-progress">
          <svg width="120" height="120">
            <circle 
              className="bg-circle" 
              cx="60" 
              cy="60" 
              r={radius} 
            />
            <circle 
              className="fg-circle" 
              cx="60" 
              cy="60" 
              r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ stroke: `var(${colorVar})` }}
            />
          </svg>
          <div className="progress-text">
            <span className="progress-number" style={{ color: `var(${colorVar})` }}>{score}%</span>
            <span className="progress-label">{label}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>
          ANALİZ RAPORU
        </span>
        <h1 style={{ fontSize: '1.6rem', marginTop: '2px' }}>Tarama Sonuçları</h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oluşturulma Tarihi: {date}</span>
      </div>

      {/* Overall Risk Card */}
      <div 
        className="glass-card" 
        style={{ 
          borderLeft: `6px solid ${overallRisk === 'Yüksek' ? 'var(--error)' : overallRisk === 'Orta' ? 'var(--warning)' : 'var(--success)'}`,
          background: overallRisk === 'Yüksek' ? 'rgba(239, 68, 68, 0.03)' : overallRisk === 'Orta' ? 'rgba(245, 158, 11, 0.03)' : 'rgba(16, 185, 129, 0.03)'
        }}
      >
        <div className="flex-between">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Genel Sağlık Bulgusu</span>
            <h2 style={{ 
              fontSize: '1.4rem', 
              marginTop: '4px',
              color: overallRisk === 'Yüksek' ? 'var(--error)' : overallRisk === 'Orta' ? 'var(--warning)' : 'var(--success)' 
            }}>
              {overallRisk === 'Yüksek' ? 'Yüksek Risk Faktörü' : overallRisk === 'Orta' ? 'Orta Derece Belirti' : 'Düşük Risk Seviyesi'}
            </h2>
          </div>
          <HeartPulse 
            size={36} 
            style={{ 
              color: overallRisk === 'Yüksek' ? 'var(--error)' : overallRisk === 'Orta' ? 'var(--warning)' : 'var(--success)',
              opacity: 0.8 
            }} 
          />
        </div>
        <p style={{ fontSize: '0.8rem', marginTop: '8px', lineHeight: '1.4' }}>
          {overallRisk === 'Yüksek' 
            ? 'Analiz edilen yüz piksellerinde kritik düzeyde renk sapması veya yüksek asimetri tespit edilmiştir. Lütfen aşağıdaki bulguları inceleyiniz.' 
            : overallRisk === 'Orta' 
            ? 'Hafif düzeyde renk sapmaları (solgunluk veya sarılık eğilimi) tespit edilmiştir. Yetersiz uyku veya hafif yorgunluk kaynaklı olabilir.' 
            : 'Taranan bölgelerde belirgin bir patolojik renk sapmasına veya yüz asimetrisine rastlanmamıştır. Genel yüz parametreleri sağlıklı aralıktadır.'}
        </p>
      </div>

      {/* Gauges Grid */}
      <div className="glass-card" style={{ padding: '20px 10px' }}>
        <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '16px', paddingLeft: '10px' }}>Bulgu Parametreleri</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 8px' }}>
          <CircularProgress score={metrics.jaundice.score} label="Sarılık Endeksi" colorVar="--warning" />
          <CircularProgress score={metrics.anemia.score} label="Solgunluk" colorVar="--accent" />
          <CircularProgress score={metrics.cyanosis.score} label="Siyanoz Oranı" colorVar="--secondary" />
          <CircularProgress score={metrics.symmetry.score} label="Simetri" colorVar="--primary" />
        </div>
      </div>

      {/* Detailed Diagnostic Feedbacks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff' }}>Bulgu Detayları</h3>
        
        {/* Jaundice Detail */}
        <div className="glass-card glow-primary" style={{ padding: '16px' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>Sarılık Analizi (Sklera)</span>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: metrics.jaundice.status.includes('Kritik') ? 'var(--error)' : metrics.jaundice.status.includes('Hafif') ? 'var(--warning)' : 'var(--success)'
            }}>
              {metrics.jaundice.status}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '6px', lineHeight: '1.4' }}>
            {metrics.jaundice.status.includes('Kritik') 
              ? 'Göz aklarında ve alında yüksek yoğunlukta sarı pigmentasyonu saptandı. Karaciğer fonksiyonları veya safra akış anomalileriyle ilişkili olabilir.' 
              : metrics.jaundice.status.includes('Hafif') 
              ? 'Hafif sarımsı tonlama tespit edildi. Yetersiz sıvı tüketimi veya beslenmeye bağlı geçici pigment dalgalanması olabilir.' 
              : 'Göz aklarında sarı pigment birikimi görülmedi. Bilirubin seviyesi parametreleri görsel olarak olağandır.'}
          </p>
        </div>

        {/* Anemia Detail */}
        <div className="glass-card glow-primary" style={{ padding: '16px' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>Solgunluk Analizi (Kapiler Akış)</span>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: metrics.anemia.status.includes('Belirgin') ? 'var(--error)' : metrics.anemia.status.includes('Hafif') ? 'var(--warning)' : 'var(--success)'
            }}>
              {metrics.anemia.status}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '6px', lineHeight: '1.4' }}>
            {metrics.anemia.status.includes('Belirgin') 
              ? 'Cilt ve dudak altı hemoglobin yansıma tonu düşük. Demir eksikliği anemisi veya dolaşım zayıflığı yönünden değerlendirilebilir.' 
              : metrics.anemia.status.includes('Hafif') 
              ? 'Düşük hemoglobin rengi eğilimi. Tansiyon düşüklüğü veya yorgunluk durumlarında görülebilir.' 
              : 'Yüz genelinde kapiler dolaşım ve kan pigmentasyonu normal seviyede, solgun görünüm saptanmadı.'}
          </p>
        </div>

        {/* Cyanosis Detail */}
        <div className="glass-card glow-primary" style={{ padding: '16px' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>Siyanoz Analizi (Oksijenlenme)</span>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: metrics.cyanosis.status.includes('Yetersizliği') ? 'var(--error)' : metrics.cyanosis.status.includes('Hafif') ? 'var(--warning)' : 'var(--success)'
            }}>
              {metrics.cyanosis.status}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '6px', lineHeight: '1.4' }}>
            {metrics.cyanosis.status.includes('Yetersizliği') 
              ? 'Dudaklarda belirgin morarma ve oksijensiz kan akışı rengi algılandı. Solunum veya kardiyovasküler sistem yetersizliği belirtisi olabilir.' 
              : metrics.cyanosis.status.includes('Hafif') 
              ? 'Dudak çevresinde hafif soğukluk ve morumsu pigmentasyon. Aşırı soğuğa maruz kalma veya geçici dolaşım yavaşlaması kaynaklı olabilir.' 
              : 'Dudak renginde oksijen eksikliği belirteci (siyanoz) saptanmamıştır.'}
          </p>
        </div>

        {/* Symmetry Detail */}
        <div className="glass-card glow-primary" style={{ padding: '16px' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>Kas Simetrisi</span>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: metrics.symmetry.score < 80 ? 'var(--error)' : metrics.symmetry.score < 92 ? 'var(--warning)' : 'var(--success)'
            }}>
              {metrics.symmetry.status}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '6px', lineHeight: '1.4' }}>
            {metrics.symmetry.score < 80 
              ? 'Yüz hatlarında (göz, ağız kenarları) belirgin seviyede asimetri ölçüldü. Ani oluşan yüz asimetrisi nöropati veya inme belirtisi olabileceğinden takip edilmelidir.' 
              : metrics.symmetry.score < 92 
              ? 'Hafif veya fizyolojik düzeyde yüz asimetrisi. Doğal anatomik yapı veya tarama sırasındaki baş eğimi kaynaklı olabilir.' 
              : 'Yüz kas yapısı ve göz hizası yüksek oranda simetrik ve dengelidir.'}
          </p>
        </div>
      </div>

      {/* Strict WCAG/Medical Disclaimer */}
      <div className="alert-box warning" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Önemli Akademik ve Tıbbi Feragatname:</strong>
          <p style={{ color: 'inherit', fontSize: '0.72rem', marginTop: '4px' }}>
            Bu uygulama, Mobil Programlama ve Bulut Bilişim dersleri kapsamında tasarlanmış bir <strong>öğrenim prototipidir</strong>. Kesinlikle tıbbi bir teşhis, tedavi veya profesyonel sağlık tavsiyesi niteliği taşımamaktadır. Sağlıkla ilgili her türlü şüphe durumunda hemen yetkili bir sağlık kuruluşuna başvurulmalıdır.
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          className="btn-primary" 
          onClick={onRestart}
          style={{ flex: 1 }}
          aria-label="Yeni Analiz Başlat"
        >
          <RefreshCw size={18} />
          <span>Yeni Analiz Başlat</span>
        </button>
      </div>
    </div>
  );
}
