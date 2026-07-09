/**
 * Uploads a file directly from the browser to Cloudinary.
 * Your backend never receives the file — only the resulting URL is sent
 * to your API after Cloudinary returns it. This keeps Render.com memory
 * usage minimal and speeds up uploads significantly.
 *
 * @param {File}     file        - The File object from the dropzone or input
 * @param {Function} onProgress  - Optional callback receiving 0–100 percentage
 * @returns {Promise<string>}    - Resolves with the Cloudinary secure_url
 */
export const uploadToCloudinary = (file, onProgress = null) => {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(new Error(
      'Cloudinary is not configured. ' +
      'Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in frontend/.env'
    ));
  }

  const formData = new FormData();
  formData.append('file',          file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder',        'civicpulse');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        let message = `Upload failed (HTTP ${xhr.status})`;
        try {
          const errData = JSON.parse(xhr.responseText);
          message = errData.error?.message || message;
        // eslint-disable-next-line no-empty
        } catch {}
        reject(new Error(message));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed — check your internet connection and try again'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.send(formData);
  });
};