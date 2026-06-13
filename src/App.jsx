import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Scan, HeartPulse, Info } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Results from './components/Results';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanHistory, setScanHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  // Load history from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('facescan_history');
    if (saved) {
      try {
        setScanHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Geçmiş yüklenirken hata oluştu:', e);
      }
    }
  }, []);

  // Save scan to history
  const handleScanComplete = (result) => {
    const newResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ...result
    };
    
    const updatedHistory = [newResult, ...scanHistory].slice(0, 10); // Limit to 10
    setScanHistory(updatedHistory);
    localStorage.setItem('facescan_history', JSON.stringify(updatedHistory));
    
    setCurrentResult(newResult);
    setActiveTab('results');
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('facescan_history');
  };

  return (
    <>
      {/* Skip to Content for Screen Readers (WCAG Compliance) */}
      <a href="#main-content" className="sr-only" style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}>
        Ana İçeriğe Atla
      </a>

      {/* Main Content Area */}
      <main id="main-content" className="app-container" tabIndex="-1">
        {activeTab === 'dashboard' && (
          <Dashboard 
            scanHistory={scanHistory} 
            onStartScan={() => setActiveTab('scanner')} 
            onViewResult={(result) => {
              setCurrentResult(result);
              setActiveTab('results');
            }}
            clearHistory={clearHistory}
          />
        )}
        
        {activeTab === 'scanner' && (
          <Scanner 
            onScanComplete={handleScanComplete}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}
        
        {activeTab === 'results' && (
          <Results 
            result={currentResult} 
            onRestart={() => setActiveTab('scanner')} 
          />
        )}

        {activeTab === 'info' && <InfoTab />}
      </main>

      {/* Navigation Drawer */}
      <nav className="nav-drawer" role="tablist" aria-label="Uygulama Menüsü">
        <button
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          aria-controls="main-content"
          id="tab-dashboard"
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={22} aria-hidden="true" />
          <span>Panel</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'scanner'}
          aria-controls="main-content"
          id="tab-scanner"
          className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <Scan size={22} aria-hidden="true" />
          <span>Tarama Yap</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'results'}
          aria-controls="main-content"
          id="tab-results"
          className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={!currentResult}
          style={{ opacity: !currentResult ? 0.4 : 1, cursor: !currentResult ? 'not-allowed' : 'pointer' }}
        >
          <HeartPulse size={22} aria-hidden="true" />
          <span>Sonuçlar</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'info'}
          aria-controls="main-content"
          id="tab-info"
          className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Info size={22} aria-hidden="true" />
          <span>Hakkında</span>
        </button>
      </nav>
    </>
  );
}

// Inline Info Tab Component
function InfoTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header>
        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          PROJE BİLGİLERİ
        </span>
        <h1 style={{ marginTop: '4px' }}>FaceScan AI</h1>
      </header>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>Dönem Projesi Hakkında</h2>
        <p style={{ fontSize: '0.9rem' }}>
          Bu uygulama hem <strong>Mobil Programlama</strong> hem de <strong>Bulut Bilişim</strong> derslerinin dönem sonu proje isterlerini karşılamak üzere geliştirilmiştir.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          <strong>Mobil Programlama kapsamında;</strong> PWA yapısı, kamera erişimi, çevrimdışı çalışma kabiliyeti ve MobSF analiz raporu uygunluğu gözetilmiştir.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          <strong>Bulut Bilişim kapsamında;</strong> Vercel/Netlify dağıtımı (deployment), istemci-sunucu modeline uyum ve LaTeX standartlarında hazırlanmış kurulum ve teknik mimari belgeleri mevcuttur.
        </p>
      </div>

      <div className="glass-card glow-primary" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>Tasarım ve Erişim Standartları</h3>
        <p style={{ fontSize: '0.85rem' }}>
          Uygulama arayüzü <strong>WCAG 2.1 (Web Content Accessibility Guidelines)</strong> standartlarına uygun olarak tasarlanmıştır:
        </p>
        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Aria-etiketleri ve ekran okuyucu uyumluluğu</li>
          <li>Klavye ile gezinebilme (Focus outline)</li>
          <li>Yüksek kontrastlı renk paleti (en az 4.5:1 kontrast oranı)</li>
          <li>Responsive ve büyütülebilir yazı boyutları</li>
        </ul>
      </div>

      <div className="glass-card glow-primary" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>Android APK ve Güvenlik Raporu</h3>
        <p style={{ fontSize: '0.85rem' }}>
          Mobil Programlama teslimi kapsamında üretilen yerel Android uygulamasını (.apk) ve MobSF güvenlik tarama raporunu (.pdf) doğrudan aşağıdan indirebilirsiniz.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a 
            href="/facescan-ai.apk" 
            download="facescan-ai.apk" 
            className="btn-primary"
            style={{ textDecoration: 'none', color: 'var(--text-inverse)', gap: '8px', fontSize: '0.9rem', padding: '10px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <span>APK Dosyasını İndir</span>
          </a>
          <a 
            href="/mobsf-report.pdf" 
            download="mobsf-report.pdf" 
            className="btn-primary"
            style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', gap: '8px', fontSize: '0.9rem', padding: '10px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <span>MobSF Güvenlik Raporunu İndir (PDF)</span>
          </a>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.8 }}>
        <h3 style={{ fontSize: '0.95rem', color: '#fff' }}>Geliştirici Bilgileri</h3>
        <p style={{ fontSize: '0.85rem' }}>
          <strong>Öğrenci:</strong> Özgür Sekmen<br />
          <strong>E-posta:</strong> ozgursekmen1741@gmail.com<br />
          <strong>Son Teslim Tarihi:</strong> 14 Haziran 2026
        </p>
      </div>

      <div className="alert-box info" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
        <strong>Tıbbi Uyarı:</strong> Bu uygulama bir yapay zeka ve görüntü işleme prototipidir. Elde edilen analizler kesin tıbbi tanı niteliği taşımaz. Sağlık sorunlarınız için lütfen uzman bir doktora danışınız.
      </div>
    </div>
  );
}
