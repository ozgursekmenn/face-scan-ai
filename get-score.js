import fs from 'fs';

const API_KEY = 'mobsf_api_key_123';
const BASE_URL = 'http://localhost:8000';
const APK_PATH = './public/facescan-ai.apk';

async function run() {
  try {
    console.log('Reading APK...');
    const fileBuffer = fs.readFileSync(APK_PATH);
    const fileBlob = new Blob([fileBuffer], { type: 'application/vnd.android.package-archive' });

    console.log('Uploading to MobSF...');
    const formData = new FormData();
    formData.append('file', fileBlob, 'facescan-ai.apk');

    const uploadResponse = await fetch(`${BASE_URL}/api/v1/upload`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY
      },
      body: formData
    });

    const uploadJson = await uploadResponse.json();
    const hash = uploadJson.hash;
    console.log(`Uploaded. Hash: ${hash}`);

    console.log('Scanning...');
    const scanParams = new URLSearchParams();
    scanParams.append('hash', hash);
    scanParams.append('scan_type', 'apk');

    const scanResponse = await fetch(`${BASE_URL}/api/v1/scan`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: scanParams
    });

    const scanJson = await scanResponse.json();
    if (scanJson.appsec) {
      console.log('--- SCAN RESULTS ---');
      console.log(`Security Score: ${scanJson.appsec.security_score}`);
      console.log(`High Issues: ${scanJson.appsec.high.length}`);
      console.log(JSON.stringify(scanJson.appsec.high, null, 2));
      console.log(`Warnings: ${scanJson.appsec.warning.length}`);
      console.log(JSON.stringify(scanJson.appsec.warning, null, 2));
      console.log(`Info: ${scanJson.appsec.info.length}`);
      console.log(`Secure: ${scanJson.appsec.secure.length}`);
    } else {
      console.log('Scan response did not contain appsec details, querying details...');
      // Query details
      const detailsParams = new URLSearchParams();
      detailsParams.append('hash', hash);
      const detailsResponse = await fetch(`${BASE_URL}/api/v1/appsec`, {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: detailsParams
      });
      const detailsJson = await detailsResponse.json();
      console.log('--- DETAILS ---');
      console.log(`Security Score: ${detailsJson.security_score}`);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
