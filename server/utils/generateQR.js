import QRCode from "qrcode";

export const generateQR = async (text, outputPath) => {
  try {
    await QRCode.toFile(outputPath, text);
  } catch (err) {
    console.error("QR generation error:", err);
    throw err;
  }
};
