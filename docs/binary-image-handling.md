# Working with Binary Image Data in Expo

This document explains how to handle binary image data in your Expo/React Native application.

## Overview

In React Native and Expo applications, you may need to work with binary image data in various scenarios:

- Receiving binary data from an API
- Working with camera captures
- Processing images from file pickers
- Handling base64 encoded images

## Utility Functions

We've created utility functions in `utils/image-utils.ts` to help convert binary data to formats that can be used with Expo's Image component:

### 1. Converting Binary Data to Data URI

```typescript
import { binaryToImageUri } from "@/utils/image-utils";

// Example usage
const dataUri = await binaryToImageUri(binaryData, "image/jpeg");
// Result: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBg..."
```

### 2. Creating Object URLs (Web Only)

```typescript
import { createObjectUrlFromBinary, revokeObjectUrl } from "@/utils/image-utils";

// Create an object URL
const objectUrl = createObjectUrlFromBinary(binaryData, "image/png");
// Result: "blob:https://example.com/1234-5678-9abc-def0"

// Important: Revoke the URL when done to prevent memory leaks
revokeObjectUrl(objectUrl);
```

## Using the AnimatedImage Component

Our enhanced `AnimatedImage` component can handle both URI strings and binary data:

```tsx
import AnimatedImage from "@/components/ui-custom/animated-image";

// Using with a URI string
<AnimatedImage uri="https://example.com/image.jpg" />

// Using with binary data
<AnimatedImage binaryData={binaryData} mimeType="image/png" />
```

## Common Binary Data Types

### 1. Blob

A Blob (Binary Large Object) represents data that isn't necessarily in a JavaScript-native format:

```typescript
// From an API response
const response = await fetch("https://api.example.com/image");
const blob = await response.blob();
```

### 2. ArrayBuffer

A low-level binary data buffer:

```typescript
// From an API response
const response = await fetch("https://api.example.com/image");
const arrayBuffer = await response.arrayBuffer();
```

### 3. Uint8Array

A typed array representing an array of 8-bit unsigned integers:

```typescript
// From an ArrayBuffer
const uint8Array = new Uint8Array(arrayBuffer);
```

## Converting Between Binary Formats

### Blob to Base64

```typescript
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### Base64 to Blob

```typescript
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}
```

## Best Practices

1. **Memory Management**: Binary data can consume significant memory. Release references when no longer needed.
2. **Error Handling**: Always include error handling when working with binary data conversions.
3. **MIME Types**: Specify the correct MIME type when converting binary data to ensure proper rendering.
4. **Image Optimization**: Consider resizing or compressing images before displaying them to improve performance.
5. **Caching**: Implement caching for frequently accessed images to reduce network requests and processing.

## Example Implementation

See `components/examples/binary-image-example.tsx` for a complete example of fetching and displaying binary image data.
