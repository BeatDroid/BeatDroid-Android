/**
 * Utility functions for handling image conversions in Expo
 */

/**
 * Converts binary data to a base64 data URI that can be used with Expo Image
 * @param binaryData The binary data as ArrayBuffer, Uint8Array, or Blob
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns A Promise that resolves to a data URI string
 */
export async function binaryToImageUri(
  binaryData: ArrayBuffer | Uint8Array | Blob,
  mimeType = 'image/png'
): Promise<string> {
  // If the data is already a Blob, use it directly
  const blob = binaryData instanceof Blob 
    ? binaryData 
    : new Blob([binaryData], { type: mimeType });
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert binary to data URI'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Creates an object URL from binary data
 * @param binaryData The binary data as ArrayBuffer, Uint8Array, or Blob
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns A URL object that can be used with Expo Image
 */
export function createObjectUrlFromBinary(
  binaryData: ArrayBuffer | Uint8Array | Blob,
  mimeType = 'image/png'
): string {
  const blob = binaryData instanceof Blob 
    ? binaryData 
    : new Blob([binaryData], { type: mimeType });
  
  return URL.createObjectURL(blob);
}

/**
 * Revokes an object URL to free memory
 * @param url The object URL to revoke
 */
export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}
