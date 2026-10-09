import { GIFEncoder, applyPalette, quantize } from "gifenc";

export type Fit = "fill" | "fit";
export type Quality = "high" | "medium" | "low";

/** Colors per frame and pixel format for each quality level. */
const QUALITY: Record<Quality, { colors: number; format: "rgb565" | "rgb444" }> = {
  high: { colors: 256, format: "rgb565" },
  medium: { colors: 128, format: "rgb565" },
  low: { colors: 48, format: "rgb444" },
};

/**
 * Draws one image into a width × height frame. "fill" crops it to cover the
 * frame; "fit" shows all of it on the background color.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { naturalWidth: number; naturalHeight: number },
  width: number,
  height: number,
  fit: Fit,
  background: string,
) {
  const scale =
    fit === "fill"
      ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
      : Math.min(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
}

export async function encodeGif({
  images,
  width,
  height,
  delay,
  loop,
  quality,
  fit,
  background,
  onProgress,
}: {
  images: (CanvasImageSource & { naturalWidth: number; naturalHeight: number })[];
  width: number;
  height: number;
  /** Milliseconds each frame is shown. */
  delay: number;
  loop: boolean;
  quality: Quality;
  fit: Fit;
  background: string;
  onProgress?: (done: number) => void;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas isn't available in this browser.");

  const { colors, format } = QUALITY[quality];
  const gif = GIFEncoder();
  for (let i = 0; i < images.length; i++) {
    drawFrame(ctx, images[i], width, height, fit, background);
    const { data } = ctx.getImageData(0, 0, width, height);
    const palette = quantize(data, colors, { format });
    const index = applyPalette(data, palette, format);
    gif.writeFrame(index, width, height, { palette, delay, repeat: loop ? 0 : -1 });
    onProgress?.(i + 1);
    // Let the page repaint the progress bar between frames.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}
