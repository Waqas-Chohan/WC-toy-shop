export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / imageBitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(imageBitmap.width * ratio);
  canvas.height = Math.round(imageBitmap.height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create canvas context');
  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

export async function uploadCompressedImage(file: File, folder = 'products'): Promise<string> {
  const compressedBlob = await compressImage(file);
  const name = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const compressedFile = new File([compressedBlob], name, { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('folder', folder);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Image upload failed');
  }

  return data.url;
}
