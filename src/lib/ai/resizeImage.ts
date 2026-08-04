/**
 * Downscales a user-picked photo before sending it to the Gemini API, since
 * phone camera photos (often several MB) are unnecessarily large for a food
 * estimate and slow to upload on mobile connections.
 */
export async function resizeImageFileToBase64(
  file: File,
  maxDimension = 1024,
  quality = 0.8
): Promise<{ base64: string; mimeType: string }> {
  const dataUrl = await readFileAsDataUrl(file);

  try {
    const image = await loadImage(dataUrl);

    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas non disponible dans ce navigateur");
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const resizedDataUrl = canvas.toDataURL("image/jpeg", quality);
    const base64 = resizedDataUrl.split(",")[1] ?? "";
    return { base64, mimeType: "image/jpeg" };
  } catch {
    // The browser couldn't decode this file for canvas resizing - e.g. a
    // HEIC/HEIF photo, which many Android browsers can't render in <img>/
    // canvas even though the camera or gallery happily hands it out. Fall
    // back to the original bytes: Gemini's API accepts HEIC/HEIF directly,
    // so skipping the resize still produces a usable estimate instead of
    // failing outright.
    const base64 = dataUrl.split(",")[1] ?? "";
    return { base64, mimeType: file.type || "image/jpeg" };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de charger l'image"));
    img.src = src;
  });
}
