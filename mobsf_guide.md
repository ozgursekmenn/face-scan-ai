# MobSF (Mobile Security Framework) Analiz Kılavuzu

Bu kılavuz, geliştirdiğimiz PWA web uygulamasını Android **APK** formatına nasıl dönüştüreceğinizi ve ardından **MobSF** kullanarak güvenlik analiz raporunu nasıl oluşturacağınızı adım adım açıklamaktadır.

---

## Aşama 1: Web Uygulamasını APK'ya Dönüştürme

PWA'ları yerel (native) bir APK dosyasına dönüştürmek için en hızlı ve resmi yol Google tarafından geliştirilen **Bubblewrap** aracıdır.

### Yöntem A: Bubblewrap ile Paketleme (Önerilen)

1. **Gereksinimler:** Bilgisayarınızda Node.js ve Java Development Kit (JDK 11+) kurulu olmalıdır.
2. **Bubblewrap Kurulumu:** Terminalinizde (BypassSandbox ile) şu komutu çalıştırın:
   ```bash
   npm install -g @bubblewrap/cli
   ```
3. **Proje Başlatma:** Uygulamanız canlıya yüklendikten sonra (örneğin Vercel linkiniz `https://facescan-ai.vercel.app`), boş bir klasörde şu komutla APK yapılandırmasını başlatın:
   ```bash
   bubblewrap init --manifest=https://facescan-ai.vercel.app/manifest.json
   ```
   *Bu adım manifest dosyanızı okuyarak APK için gerekli `AndroidManifest.xml` ve renk ayarlarını otomatik oluşturur.*
4. **Derleme (Build):** APK'yı oluşturmak için:
   ```bash
   bubblewrap build
   ```
   *Komut bittiğinde klasörünüzde `app-release-signed.apk` isimli imzalanmış hazır bir APK oluşacaktır.*

### Yöntem B: Capacitor ile Paketleme (Alternatif)

Eğer yerel Android Studio projesi oluşturup APK almak isterseniz:
1. Uygulama klasörünüzde Capacitor kurun:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init FaceScanAI com.alperen.facescanai --web-dir=dist
   ```
2. Android platformunu ekleyin:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```
3. Web uygulamasını derleyip Android'e senkronize edin:
   ```bash
   npm run build
   npx cap sync
   ```
4. Android Studio'yu açıp projeyi derleyin:
   ```bash
   npx cap open android
   ```
   *Android Studio içerisinden "Build > Build Bundle(s) / APK(s) > Build APK(s)" yolunu izleyerek APK dosyanızı alabilirsiniz.*

---

## Aşama 2: MobSF Kurulumu ve Çalıştırılması

MobSF'i çalıştırmanın en kolay yolu **Docker** kullanmaktır. Bilgisayarınızda Docker kurulu ise:

1. **MobSF Docker İmajını Çalıştırın:**
   ```bash
   docker run -it --rm -p 8000:8000 opensecurity/mobsf:latest
   ```
2. **Arayüze Bağlanın:** Tarayıcınızda `http://localhost:8000` adresini açın.
3. **Analizi Başlatın:** 
   - Karşınıza gelen ekrandaki "Upload & Analyze" alanına oluşturduğunuz `.apk` dosyasını sürükleyip bırakın.
   - MobSF statik analizi otomatik olarak başlatacak ve birkaç dakika içinde güvenlik skorunu içeren detaylı raporu sunacaktır.

---

## Aşama 3: Raporu PDF Olarak Alma ve Teslim Etme

1. Analiz tamamlandığında, sağ üst köşede bulunan **"PDF Report"** veya **"Print Report"** butonuna tıklayın.
2. Açılan PDF belgesini bilgisayarınıza kaydedin.
3. **Önemli Hatırlatma:** Mobil programlama teslim kurallarına göre, bu PDF raporunun basılı çıktısını almanıza gerek yoktur. Dosyayı doğrudan teslim sistemine yüklemeniz ve Overleaf üzerinden paylaştığınız LaTeX raporunuzda GitHub linkinizle birlikte belirtmeniz yeterlidir.
