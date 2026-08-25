function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that photo."));
    image.src = src;
  });
}

function drawToRoomJpeg(
  source: CanvasImageSource,
  width: number,
  height: number,
  fallback?: string,
): string {
  const maxEdge = 1600;
  const longest = Math.max(width, height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const nextWidth = Math.max(1, Math.round(width * scale));
  const nextHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = nextWidth;
  canvas.height = nextHeight;
  const context = canvas.getContext("2d");
  if (!context) return fallback ?? "";
  context.drawImage(source, 0, 0, nextWidth, nextHeight);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function fileToRoomDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.readAsDataURL(file);
  });

  const image = await loadImage(raw);
  return drawToRoomJpeg(image, image.width, image.height, raw);
}

/** Grab one frame from a live camera (or other video) — a photo, not a mesh. */
export function videoFrameToRoomDataUrl(video: HTMLVideoElement): string {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    throw new Error("The camera has not produced a frame yet.");
  }
  return drawToRoomJpeg(video, width, height);
}

export function cameraErrorMessage(error: unknown): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Camera capture needs HTTPS or localhost. This page is not a secure context, so the browser blocked getUserMedia. Upload a photo or use a sample room.";
  }
  if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
    return "This browser does not expose a camera (getUserMedia is missing). Upload a photo or use a sample room.";
  }
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name: string }).name)
      : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was blocked. Allow the camera and try again, or upload a photo / use a sample room. This capture is a photo frame, not LiDAR.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device. Upload a photo or use a sample room.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use. Close the other app and try again, or upload a photo.";
  }
  if (name === "OverconstrainedError") {
    return "No camera matched the requested settings. Try the other camera, or upload a photo.";
  }
  if (name === "SecurityError") {
    return "The browser blocked camera access for this page. Upload a photo or use a sample room.";
  }
  const message = error instanceof Error ? error.message : "";
  return message
    ? `Could not open the camera (${message}). Upload a photo or use a sample room.`
    : "Could not open the camera. Upload a photo or use a sample room.";
}
