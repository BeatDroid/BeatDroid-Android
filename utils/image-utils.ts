import * as FileSystem from "expo-file-system";
import { toast } from "sonner-native";

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
  searchParam: string,
  artistName: string,
  theme: string,
  accentLine: string
): Promise<boolean> {
  const toastId = toast("Downloading...");

  try {
    // Request directory permissions using SAF
    const userDirectory =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!userDirectory.granted) {
      throw new Error("Storage permission denied");
    }

    // Create file in chosen directory with unique name
    const localFileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        userDirectory.directoryUri,
        `${searchParam} by ${artistName} - ${theme} ${accentLine === "true" ? "with accent line" : ""}.jpg`,
        "image/jpeg"
      );

    // Write data directly to the new file
    await FileSystem.StorageAccessFramework.writeAsStringAsync(
      localFileUri,
      uri,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    toast.success("Success", {
      id: toastId,
      description: "Poster saved to your selected folder!",
    });

    return true;
  } catch (error) {
    console.error("Download error:", error);

    // Show more specific error message
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
