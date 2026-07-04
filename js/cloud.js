/* =============================================
   PixelForge - Cloud Storage Integration
   Google Drive & Dropbox API connectors
   ============================================= */

const CloudStorage = (() => {
  // OAuth configuration (users need to provide their own API keys)
  const CONFIG = {
    google: {
      clientId: '',  // Set via settings
      apiKey: '',
      scopes: 'https://www.googleapis.com/auth/drive.file',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    },
    dropbox: {
      appKey: '',  // Set via settings
      scopes: ['files.content.write', 'files.content.read'],
    },
  };

  let googleTokenClient = null;
  let dropboxAccessToken = null;

  // ===== Google Drive =====

  function isGoogleReady() {
    return !!(window.gapi && window.google?.accounts?.oauth2);
  }

  async function initGoogle(clientId, apiKey) {
    CONFIG.google.clientId = clientId || CONFIG.google.clientId;
    CONFIG.google.apiKey = apiKey || CONFIG.google.apiKey;

    if (!CONFIG.google.clientId) {
      throw new Error('Google Drive Client ID not configured. Set it in Settings > Cloud Storage.');
    }

    // Load Google APIs
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    await new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: CONFIG.google.apiKey,
            discoveryDocs: CONFIG.discoveryDocs,
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });

    // Load GSI
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    googleTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.google.clientId,
      scope: CONFIG.scopes,
      callback: (response) => {
        if (response.access_token) {
          gapi.client.setToken({ access_token: response.access_token });
        }
      },
    });
  }

  function googleSignIn() {
    return new Promise((resolve, reject) => {
      if (!googleTokenClient) {
        reject(new Error('Google not initialized'));
        return;
      }
      googleTokenClient.callback = (response) => {
        if (response.access_token) {
          gapi.client.setToken({ access_token: response.access_token });
          resolve(response.access_token);
        } else {
          reject(new Error('Google sign-in failed'));
        }
      };
      googleTokenClient.requestAccessToken();
    });
  }

  async function uploadToGoogleDrive(blob, fileName) {
    if (!gapi?.client?.getToken()) {
      await googleSignIn();
    }

    const metadata = {
      name: fileName,
      mimeType: blob.type,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${gapi.client.getToken().access_token}` },
        body: form,
      }
    );

    if (!response.ok) throw new Error('Upload to Google Drive failed');
    return await response.json();
  }

  // ===== Dropbox =====

  function isDropboxReady() {
    return !!window.Dropbox;
  }

  async function initDropbox(appKey) {
    CONFIG.dropbox.appKey = appKey || CONFIG.dropbox.appKey;

    if (!CONFIG.dropbox.appKey) {
      throw new Error('Dropbox App Key not configured. Set it in Settings > Cloud Storage.');
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.setAttribute('data-app-key', CONFIG.dropbox.appKey);
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function dropboxSignIn() {
    return new Promise((resolve, reject) => {
      if (!window.Dropbox) {
        reject(new Error('Dropbox SDK not loaded'));
        return;
      }
      // Use Dropbox auth
      Dropbox.auth.authenticate({
        interactive: true,
        success: (token) => {
          dropboxAccessToken = token;
          resolve(token);
        },
        error: reject,
      });
    });
  }

  async function uploadToDropbox(blob, fileName) {
    if (!dropboxAccessToken) {
      await dropboxSignIn();
    }

    const dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken });
    const response = await dbx.filesUpload({
      path: `/${fileName}`,
      contents: blob,
      mode: 'add',
      autorename: true,
    });

    return response.result;
  }

  // ===== Generic Helpers =====

  function getStatus() {
    return {
      google: {
        configured: !!CONFIG.google.clientId,
        connected: !!(gapi?.client?.getToken?.()),
      },
      dropbox: {
        configured: !!CONFIG.dropbox.appKey,
        connected: !!dropboxAccessToken,
      },
    };
  }

  async function uploadToCloud(blob, fileName, provider) {
    if (provider === 'google') {
      return await uploadToGoogleDrive(blob, fileName);
    } else if (provider === 'dropbox') {
      return await uploadToDropbox(blob, fileName);
    }
    throw new Error(`Unknown provider: ${provider}`);
  }

  return {
    initGoogle,
    initDropbox,
    googleSignIn,
    dropboxSignIn,
    uploadToGoogleDrive,
    uploadToDropbox,
    uploadToCloud,
    isGoogleReady,
    isDropboxReady,
    getStatus,
  };
})();
