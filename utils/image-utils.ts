import * as FileSystem from "expo-file-system";
import { toast } from "sonner-native";
import { parsePosterUrlWithApi } from "./text-utls";
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
  mimeType = "image/png"
): Promise<string> {
  // If the data is already a Blob, use it directly
  const blob =
    binaryData instanceof Blob
      ? binaryData
      : new Blob([binaryData], { type: mimeType });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert binary to data URI"));
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
  mimeType = "image/png"
): string {
  const blob =
    binaryData instanceof Blob
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

/**
 * Handles downloading a poster image and saving it to the user's device
 * Optimized for Android using Storage Access Framework with direct writing
 *
 * @param uri The URI of the poster to download
 * @param onProgress Optional callback for progress updates
 * @returns Promise<boolean> Indicates if the download was successful
 */
export async function handleDownloadPoster(
  uri: string,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  const toastId = toast("Downloading...");

  try {
    // Parse the URL if needed
    const parsedUri = parsePosterUrlWithApi(uri);
    if (!parsedUri) {
      throw new Error("Invalid poster URL");
    }

    // Create a unique filename to avoid conflicts
    const filename = `poster_${Date.now()}.jpg`;
    const cacheFileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Configure download callback
    const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;

      // Update progress toast with rounded percentage
      toast.info("Downloading", {
        id: toastId,
        description: `Progress: ${Math.round(progress * 100)}%`,
      });

      // Call optional progress callback
      onProgress?.(progress);
    };

    // Create download resumable with proper typing
    const downloadResumable = FileSystem.createDownloadResumable(
      parsedUri,
      cacheFileUri,
      {
        headers: {}, // Add headers if needed
        md5: false, // Set to true if you want MD5 verification
      },
      callback
    );

    // Start download with proper error handling
    const downloadResult = await downloadResumable.downloadAsync();
    if (!downloadResult || !downloadResult.uri) {
      throw new Error("Download failed");
    }

    // Request directory permissions using SAF
    const userDirectory =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!userDirectory.granted) {
      throw new Error("Storage permission denied");
    }

    // Read the downloaded file data
    const fileData = await FileSystem.readAsStringAsync(downloadResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!fileData) {
      throw new Error("Failed to read downloaded file");
    }

    // Create file in chosen directory with unique name
    const savedFileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        userDirectory.directoryUri,
        filename,
        "image/jpeg"
      );

    // Write data directly to the new file
    await FileSystem.StorageAccessFramework.writeAsStringAsync(
      savedFileUri,
      fileData,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // Clean up the temporary file
    try {
      await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary file:", cleanupError);
    }

    toast.success("Success", {
      id: toastId,
      description: "Poster saved to your selected folder!",
    });

    return true;
  } catch (error) {
    console.error("Download error:", error);

    // Show more specific error message
    toast.error("Error", {
      id: toastId,
      description:
        error instanceof Error
          ? `Failed to save the poster: ${error.message}`
          : "Failed to save the poster",
    });

    return false;
  }
}
