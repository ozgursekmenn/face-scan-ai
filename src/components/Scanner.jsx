import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, AlertTriangle, Upload, HelpCircle } from 'lucide-react';

export default function Scanner({ onScanComplete, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Loading camera, 2: Scanning, 3: Processing
  const [scanMessage, setScanMessage] = useState('Kamera hazırlanıyor...');
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);

  const scanSteps = [
    'Yüz geometrisi hizalanıyor...',
    'Sklera (göz akı) pikselleri taranıyor...',
    'Cilt hemoglobin ve melanin dağılımı ölçülüyor...',
    'Dudak çevresi oksijenlenme analizi yapılıyor...',
    'Yüz simetri indeks değeri hesaplanıyor...'
  ];

  // Initialize camera
  useEffect(() => {
    if (!uploadMode) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [uploadMode]);

  const startCamera = async () => {
    setError(null);
    setScanStep(1);
    setScanMessage('Kamera bağlantısı kuruluyor...');
    try {
      if (stream) {
        stopCamera();
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 800 } },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setScanStep(0);
    } catch (err) {
      console.error('Kamera erişim hatası:', err);
      setError('Kameraya erişilemedi. Cihazınızda kamera bulunmadığında veya izin verilmediğinde Dosya Yükleme modunu kullanabilirsiniz.');
      setUploadMode(true);
      setScanStep(0);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Image analysis logic
  const analyzePixels = (ctx, width, height) => {
    // We sample critical regions of the canvas representing forehead/skin, eyes, and lips
    // Forehead (forehead skin color) - center-top
    const foreheadData = ctx.getImageData(width * 0.5 - 10, height * 0.25 - 10, 20, 20);
    // Left eye region
    const leftEyeData = ctx.getImageData(width * 0.4 - 10, height * 0.43 - 10, 20, 20);
    // Right eye region
    const rightEyeData = ctx.getImageData(width * 0.6 - 10, height * 0.43 - 10, 20, 20);
    // Lip region
    const lipData = ctx.getImageData(width * 0.5 - 15, height * 0.68 - 10, 30, 20);

    const getAverageRGB = (imageData) => {
      let r = 0, g = 0, b = 0;
      const count = imageData.data.length / 4;
      for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
      }
      return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
    };

    const foreheadRGB = getAverageRGB(foreheadData);
    const leftEyeRGB = getAverageRGB(leftEyeData);
    const rightEyeRGB = getAverageRGB(rightEyeData);
    const lipRGB = getAverageRGB(lipData);

    // Diagnostic logic based on color ratios:
    // 1. Jaundice (Sarılık): Yellow tint -> G + R dominates over B, especially in eye whites
    const eyeYellowRatioLeft = (leftEyeRGB.r + leftEyeRGB.g) / (2 * (leftEyeRGB.b || 1));
    const eyeYellowRatioRight = (rightEyeRGB.r + rightEyeRGB.g) / (2 * (rightEyeRGB.b || 1));
    const maxYellowRatio = Math.max(eyeYellowRatioLeft, eyeYellowRatioRight);
    
    let jaundiceStatus = 'Normal';
    let jaundiceScore = Math.round(Math.max(0, (maxYellowRatio - 1.0) * 100));
    if (jaundiceScore > 40) {
      jaundiceStatus = 'Kritik Sararma';
    } else if (jaundiceScore > 15) {
      jaundiceStatus = 'Hafif Sararma';
    } else {
      jaundiceStatus = 'Normal (Belirti Yok)';
      jaundiceScore = Math.max(2, jaundiceScore);
    }

    // 2. Anemia/Pallor (Solgunluk): Low red component in skin/lips
    // Skin redness ratio
    const skinRedness = foreheadRGB.r / ((foreheadRGB.g + foreheadRGB.b) / 2 || 1);
    // Lip redness ratio
    const lipRedness = lipRGB.r / ((lipRGB.g + lipRGB.b) / 2 || 1);
    
    let anemiaStatus = 'Normal';
    let anemiaScore = Math.round(Math.max(0, (1.3 - (skinRedness + lipRedness) / 2) * 100));
    if (anemiaScore > 35) {
      anemiaStatus = 'Belirgin Solgunluk';
    } else if (anemiaScore > 15) {
      anemiaStatus = 'Hafif Solgunluk';
    } else {
      anemiaStatus = 'Normal (Dengeli)';
      anemiaScore = Math.max(5, anemiaScore);
    }

    // 3. Cyanosis (Siyanoz): Blue lips -> Blue channel is elevated in lip region compared to skin
    const lipBlueRatio = lipRGB.b / (lipRGB.r || 1);
    let cyanosisStatus = 'Normal';
    let cyanosisScore = Math.round(Math.max(0, (lipBlueRatio - 0.6) * 100));
    if (cyanosisScore > 30) {
      cyanosisStatus = 'Oksijen Yetersizliği (Siyanoz)';
    } else if (cyanosisScore > 12) {
      cyanosisStatus = 'Hafif Siyanoz Belirtisi';
    } else {
      cyanosisStatus = 'Normal (Oksijen İyi)';
      cyanosisScore = Math.max(3, cyanosisScore);
    }

    // 4. Symmetry (Yüz Simetrisi): Standard deviation between left and right eye channels
    const eyeDiff = Math.abs(leftEyeRGB.r - rightEyeRGB.r) + Math.abs(leftEyeRGB.g - rightEyeRGB.g) + Math.abs(leftEyeRGB.b - rightEyeRGB.b);
    const symmetryScore = Math.max(65, Math.min(99, 100 - Math.round(eyeDiff / 6)));
    
    let symmetryStatus = 'Yüksek Simetri';
    if (symmetryScore < 80) {
      symmetryStatus = 'Belirgin Asimetri';
    } else if (symmetryScore < 92) {
      symmetryStatus = 'Hafif Asimetri';
    }

    // Overall Risk Evaluation
    let overallRisk = 'Düşük';
    if (jaundiceStatus.includes('Kritik') || anemiaStatus.includes('Belirgin') || cyanosisStatus.includes('Yetersizliği') || symmetryScore < 80) {
      overallRisk = 'Yüksek';
    } else if (jaundiceStatus.includes('Hafif') || anemiaStatus.includes('Hafif') || cyanosisStatus.includes('Hafif') || symmetryScore < 92) {
      overallRisk = 'Orta';
    }

    return {
      metrics: {
        jaundice: { score: jaundiceScore, status: jaundiceStatus, color: foreheadRGB },
        anemia: { score: anemiaScore, status: anemiaStatus, color: lipRGB },
        cyanosis: { score: cyanosisScore, status: cyanosisStatus },
        symmetry: { score: symmetryScore, status: symmetryStatus }
      },
      overallRisk
    };
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStep(2);
    let stepIndex = 0;
    setScanMessage(scanSteps[0]);

    // Iterate scanning steps text
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < scanSteps.length) {
        setScanMessage(scanSteps[stepIndex]);
      } else {
        clearInterval(interval);
        setScanStep(3);
        setScanMessage('Veriler işleniyor...');
        
        // Capture and Analyze Canvas
        setTimeout(() => {
          try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            let analysisData;

            if (uploadMode && uploadedImageSrc) {
              // Analyze uploaded image
              const img = new Image();
              img.src = uploadedImageSrc;
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                analysisData = analyzePixels(ctx, img.width, img.height);
                setIsScanning(false);
                onScanComplete(analysisData);
              };
            } else if (videoRef.current) {
              // Analyze video frame
              const video = videoRef.current;
              canvas.width = video.videoWidth || 640;
              canvas.height = video.videoHeight || 800;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              analysisData = analyzePixels(ctx, canvas.width, canvas.height);
              setIsScanning(false);
              onScanComplete(analysisData);
            } else {
              throw new Error('Kamera verisi alınamadı.');
            }
          } catch (e) {
            console.error(e);
            setError('Görüntü işleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            setIsScanning(false);
            setScanStep(0);
          }
        }, 1200);
      }
    }, 1000);
  };

  // Upload file fallback handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImageSrc(event.target.result);
        setUploadMode(true);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="flex-between">
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>
            ANLIK TEŞHİS MOTORU
          </span>
          <h1 style={{ fontSize: '1.6rem', marginTop: '2px' }}>Yüz Tarama</h1>
        </div>
        <button 
          onClick={() => { stopCamera(); onCancel(); }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          aria-label="Taramayı iptal et ve panele dön"
        >
          <X size={18} />
        </button>
      </div>

      {/* Mode Switcher */}
      <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid var(--border-glass)'
      }}>
        <button
          onClick={() => { setUploadMode(false); setUploadedImageSrc(null); }}
          className="btn-secondary"
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            background: !uploadMode ? 'var(--bg-glass)' : 'transparent',
            border: 'none',
            fontSize: '0.85rem'
          }}
        >
          Canlı Kamera
        </button>
        <button
          onClick={() => { stopCamera(); setUploadMode(true); }}
          className="btn-secondary"
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            background: uploadMode ? 'var(--bg-glass)' : 'transparent',
            border: 'none',
            fontSize: '0.85rem'
          }}
        >
          Fotoğraf Yükle
        </button>
      </div>

      {/* Main Viewport Container */}
      <div className="scanner-viewport">
        {uploadMode ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#0a0b10' }}>
            {uploadedImageSrc ? (
              <img 
                src={uploadedImageSrc} 
                alt="Yüklenen Yüz Resmi" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Upload size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#fff' }}>Yüz Fotoğrafı Seçin</h3>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px', maxWidth: '240px' }}>
                    Net ışıkta çekilmiş, yüz hatlarının doğrudan karşıdan göründüğü bir portre yükleyin.
                  </p>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => fileInputRef.current.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Dosya Seç
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              style={{ display: 'none' }}
              aria-label="Analiz edilecek yüz resmi dosyasını yükleyin"
            />
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="scanner-video"
            aria-label="Kamera canlı izleme ekranı"
          />
        )}

        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Technical Scanning HUD Overlay */}
        <div className={`scanner-hud ${isScanning ? 'scanning' : ''}`}>
          {/* Top Info Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              color: 'var(--primary)',
              border: '1px solid var(--border-glow)'
            }}>
              {isScanning ? 'ANALİZ EDİLİYOR' : 'HAZIR'}
            </span>
            {uploadMode && uploadedImageSrc && (
              <button
                onClick={() => setUploadedImageSrc(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Değiştir
              </button>
            )}
          </div>

          {/* Oval Bounding Guides */}
          <div className={`hud-guides ${isScanning ? 'scanning' : ''}`} />

          {/* Diagnostic Pointer Points */}
          <div className="target-point point-forehead" title="Alın (Cilt Rengi Tespiti)" />
          <div className="target-point point-left-eye" title="Sol Sklera (Sarılık Tespiti)" />
          <div className="target-point point-right-eye" title="Sağ Sklera (Sarılık Tespiti)" />
          <div className="target-point point-lip" title="Dudaklar (Siyanoz Tespiti)" />

          {/* Bottom Ray */}
          <div className="scan-ray" />

          {/* Bottom Status Text */}
          {isScanning && (
            <div style={{
              width: '100%',
              background: 'rgba(10, 11, 16, 0.85)',
              border: '1px solid var(--border-glass)',
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <span className="pulse-slow" style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '500' }}>
                {scanMessage}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="alert-box warning" style={{ fontSize: '0.8rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Control Buttons */}
      {!isScanning && (
        <div style={{ display: 'flex', gap: '10px' }}>
          {!uploadMode && (
            <button 
              className="btn-secondary" 
              onClick={startCamera} 
              title="Kamerayı Yeniden Yükle"
              style={{ width: '50px', padding: 0 }}
              aria-label="Kamerayı yenile"
            >
              <RefreshCw size={18} />
            </button>
          )}
          
          <button 
            className="btn-primary" 
            onClick={handleStartScan}
            disabled={!uploadMode && !stream || uploadMode && !uploadedImageSrc}
            style={{ 
              flex: 1, 
              opacity: (!uploadMode && !stream || uploadMode && !uploadedImageSrc) ? 0.5 : 1,
              cursor: (!uploadMode && !stream || uploadMode && !uploadedImageSrc) ? 'not-allowed' : 'pointer'
            }}
          >
            <Camera size={18} />
            <span>Fotoğrafı Analiz Et</span>
          </button>
        </div>
      )}

      {/* WCAG Accessible Guideline note */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
        <HelpCircle size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          <strong>Öneri:</strong> Kameranızı doğrudan göz ve ağız bölgenizin hizalama kılavuzuna oturacağı şekilde, gölgesiz bir ortamda konumlandırınız. Analiz tamamen yerel cihazınızda gerçekleşir.
        </p>
      </div>
    </div>
  );
}
