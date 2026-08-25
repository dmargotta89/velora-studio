export type XrProbe =
  | { ready: true }
  | { ready: false; reason: string };

export async function probeImmersiveAr(): Promise<XrProbe> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      ready: false,
      reason:
        "On-device AR runs in the browser on a compatible device. AR is not running here.",
    };
  }
  if (!window.isSecureContext) {
    return {
      ready: false,
      reason:
        "WebXR needs HTTPS or localhost. This page is not a secure context, so AR is not running. Use the PREVIEW walkthrough.",
    };
  }
  if (!navigator.xr) {
    return {
      ready: false,
      reason:
        "This browser has no WebXR. On-device AR needs a compatible device — typically Android Chrome with ARCore. Use the PREVIEW walkthrough. AR is not running.",
    };
  }
  try {
    const supported = await navigator.xr.isSessionSupported("immersive-ar");
    if (!supported) {
      return {
        ready: false,
        reason:
          "This device does not support WebXR immersive-ar. The PREVIEW walkthrough is the path here — AR is not running.",
      };
    }
    return { ready: true };
  } catch {
    return {
      ready: false,
      reason:
        "Could not check WebXR support. AR is not running. Use the PREVIEW walkthrough.",
    };
  }
}

export function arStartError(error: unknown): Error {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name: string }).name)
      : "";
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (name === "NotSupportedError" || /hit-test|not supported/i.test(message)) {
    return new Error(
      "This device cannot start immersive AR with floor hit-test. AR is not running. Use the PREVIEW walkthrough.",
    );
  }
  if (name === "SecurityError") {
    return new Error("The browser blocked the AR session. AR is not running.");
  }
  if (name === "NotAllowedError") {
    return new Error("AR permission was denied. AR is not running.");
  }
  return new Error(
    message
      ? `Could not start AR (${message}). AR is not running. Use PREVIEW.`
      : "Could not start AR. AR is not running. Use PREVIEW.",
  );
}
