import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

/**
 * Drag-and-drop photo uploader that uploads directly to Cloudinary.
 * Shows a local preview immediately on file selection, then a progress
 * bar during upload, then a success badge on completion.
 *
 * Props:
 *   onUploadComplete(url|null) — called with the Cloudinary URL on success,
 *                                or null when the photo is removed
 *   onUploadStart()            — called when upload begins (optional)
 *   label                      — field label text
 *   required                   — shows red asterisk
 *   disabled                   — disables the dropzone
 *   existingUrl                — pre-fill with an existing photo URL
 */
export default function PhotoUploader({
  onUploadComplete,
  onUploadStart,
  label      = 'Photo',
  required   = false,
  disabled   = false,
  existingUrl = null,
}) {
  const [preview,   setPreview]   = useState(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [uploaded,  setUploaded]  = useState(!!existingUrl);
  const [error,     setError]     = useState('');

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejections (wrong type, too large)
    if (rejectedFiles.length > 0) {
      const reason = rejectedFiles[0].errors[0]?.code;
      if (reason === 'file-too-large') {
        setError('Photo must be under 10MB');
      } else if (reason === 'file-invalid-type') {
        setError('Only JPG, PNG and WebP images are accepted');
      } else {
        setError('Could not accept this file');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Show local preview immediately for responsiveness
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError('');
    setUploaded(false);
    setUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      const cloudinaryUrl = await uploadToCloudinary(file, setProgress);
      onUploadComplete(cloudinaryUrl);
      setUploaded(true);
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Upload failed! please try again');
      setPreview(existingUrl || null);
      setUploaded(false);
      onUploadComplete(null);
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete, onUploadStart, existingUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize:  10 * 1024 * 1024, // 10MB
    disabled: disabled || uploading,
  });

  const removePhoto = (e) => {
    e.stopPropagation();
    setPreview(null);
    setUploaded(false);
    setProgress(0);
    setError('');
    onUploadComplete(null);
  };

  return (
    <div>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-main mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {preview ? (
        /* ── Photo preview state ── */
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-52 object-cover"
          />

          {/* Progress overlay during upload */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white text-sm font-medium">
                Uploading… {progress}%
              </p>
            </div>
          )}

          {/* Success badge */}
          {!uploading && uploaded && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              ✓ Photo uploaded
            </div>
          )}

          {/* Remove button */}
          {!uploading && (
            <button
              type="button"
              onClick={removePhoto}
              title="Remove photo"
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        /* ── Dropzone empty state ── */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${isDragActive
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : disabled
                ? 'border-border bg-bg cursor-not-allowed opacity-50'
                : 'border-border bg-bg cursor-pointer hover:border-primary hover:bg-primary/5'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-3">📷</div>
          {isDragActive ? (
            <p className="text-primary font-semibold text-sm">Drop your photo here</p>
          ) : (
            <>
              <p className="text-text-main text-sm font-semibold mb-1">
                Drag and drop a photo here
              </p>
              <p className="text-text-muted text-xs">or click to browse your device</p>
              <p className="text-text-muted text-xs mt-2">
                JPG · PNG · WebP · Maximum 10MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-danger text-xs mt-1.5 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}