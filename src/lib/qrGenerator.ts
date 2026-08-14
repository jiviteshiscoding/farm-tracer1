import QRCode from "qrcode";

export async function generateQRCodeDataUrl(batchId: string): Promise<string> {
  const url = `${window.location.origin}/trace/${batchId}`;
  try {
    return await QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: "#15803d", // Deep Emerald
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });
  } catch (err) {
    console.error("QR Code Generation Error:", err);
    return "";
  }
}

export async function generateQRCodeSvg(batchId: string): Promise<string> {
  const url = `${window.location.origin}/trace/${batchId}`;
  try {
    return await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#15803d",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR SVG Generation Error:", err);
    return "";
  }
}

export function extractBatchIdFromUrl(scannedText: string): string {
  if (!scannedText) return "";
  const match = scannedText.match(/\/trace\/([A-Za-z0-9\-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return scannedText.trim();
}
