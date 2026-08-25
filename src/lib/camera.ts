import { cameraErrorMessage } from "./image";

export async function openCameraStream(
  facing: "environment" | "user",
): Promise<MediaStream> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw Object.assign(new Error("insecure context"), { name: "SecurityError" });
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("getUserMedia missing"), { name: "NotFoundError" });
  }

  const attempts: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    },
    { audio: false, video: { facingMode: { ideal: facing } } },
    { audio: false, video: true },
  ];

  let last: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      last = error;
    }
  }
  throw last instanceof Error ? last : new Error(cameraErrorMessage(last));
}

export function attachCameraStream(video: HTMLVideoElement, stream: MediaStream): void {
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.srcObject = stream;
}

export function waitForVideoFrame(video: HTMLVideoElement, timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    function ready() {
      return video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2;
    }

    function tick() {
      if (ready()) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error("The camera opened but never produced a frame. Try again, or upload a photo."));
        return;
      }
      requestAnimationFrame(tick);
    }

    video.addEventListener("loadeddata", tick, { once: true });
    video.addEventListener("loadedmetadata", tick, { once: true });
    void video.play().then(tick).catch(() => tick());
    tick();
  });
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
