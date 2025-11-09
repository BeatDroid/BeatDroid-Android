import { downloadPosterToCache } from "@/utils/image-utils";
import {
  getPosterRequestSchema,
  type GetPosterResponse,
  getPosterResponseSchema,
} from "./zod-schema";

export async function getPoster(
  posterPath: string,
): Promise<GetPosterResponse> {
  // Validate input (can be a full /static/... path or just a filename)
  const input = getPosterRequestSchema.parse(posterPath).trim();

  try {
    const { fileUri, filename } = await downloadPosterToCache(input);
    return getPosterResponseSchema.parse({
      success: true,
      message: "Poster fetched successfully",
      // Note: `image` now carries a file:// URI for direct preview
      data: { image: fileUri, filename },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to download poster";
    return getPosterResponseSchema.parse({
      success: false,
      message,
      error: message,
    });
  }
}
