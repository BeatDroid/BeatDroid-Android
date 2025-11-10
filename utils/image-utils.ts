import * as FileSystem from "expo-file-system";
import { ImageSource } from "expo-image";
import { toast } from "sonner-native";

/**
 * Detects whether a hash string is a BlurHash or ThumbHash based on character set.
 * BlurHash uses Base83 encoding with special characters like #$%*~?[]{}
 * ThumbHash uses Base64 encoding with only alphanumeric + / = characters
 */

// TODO: Remove this function before release

export function detectHashType(
  hash: string,
): "blurhash" | "thumbhash" | "unknown" {
  if (!hash || hash.length === 0) return "unknown";

  // Base83 characters that are NOT in Base64
  const base83OnlyChars = /[#$%*\-.:;?@\[\]^_{|}~]/;

  if (base83OnlyChars.test(hash)) {
    return "blurhash";
  }

  // Base64 regex: only allows A-Z, a-z, 0-9, +, /, and = (for padding)
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;

  if (base64Regex.test(hash)) {
    return "thumbhash";
  }

  return "unknown";
}

/**
 * Creates an ImageSource object with the correct hash type.
 * Automatically detects whether the hash is a BlurHash or ThumbHash.
 */
export function createHashSource(
  hash: string | null | undefined,
): ImageSource | undefined {
  if (!hash) return undefined;

  const type = detectHashType(hash);

  if (type === "blurhash") {
    return { blurhash: hash };
  } else if (type === "thumbhash") {
    return { thumbhash: hash };
  }

  return undefined;
}

// Downloads a poster into the app cache using the backend download endpoint.
// Returns the local file uri and the filename.
export async function downloadPosterToCache(
  posterPathOrUrl: string,
): Promise<{ fileUri: string; filename: string }> {
  const baseUrl = (process.env.EXPO_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const raw = posterPathOrUrl.trim();
  const filename = (raw.split("/").pop() || raw).split("?")[0];

  const url = `${baseUrl}/api/v1/posters/download/${encodeURIComponent(
    filename,
  )}`;

  const targetPath = `${FileSystem.cacheDirectory ?? ""}${filename}`;
  const result = await FileSystem.downloadAsync(url, targetPath);
  if (result.status < 200 || result.status >= 300) {
    try {
      await FileSystem.deleteAsync(targetPath, { idempotent: true });
    } catch {}
    throw new Error(`HTTP ${result.status} while downloading poster`);
  }
  return { fileUri: result.uri, filename };
}

// Saves a cached file (downloaded earlier) into a user-selected folder using SAF.
export async function saveCachedPosterToUserFolder(
  fileUri: string,
  displayName: string,
  mimeType: string = "image/png",
): Promise<boolean> {
  const toastId = toast("Downloading...");
  try {
    const userDirectory =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!userDirectory.granted) {
      throw new Error("Storage permission denied");
    }

    const localFileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        userDirectory.directoryUri,
        displayName,
        mimeType,
      );

    // Read cached file as base64 and write to user-selected file
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.StorageAccessFramework.writeAsStringAsync(
      localFileUri,
      base64,
      { encoding: FileSystem.EncodingType.Base64 },
    );

    toast.success("Success", {
      id: toastId,
      description: "Poster saved to your selected folder!",
    });
    return true;
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to save the poster", {
      id: toastId,
      description:
        error instanceof Error && __DEV__
          ? `${error.message}`
          : "Please choose another folder",
    });
    return false;
  }
}
