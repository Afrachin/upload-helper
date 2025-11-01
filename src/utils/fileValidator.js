/**
 * File validation utility using magic bytes (file signatures)
 * @module utils/fileValidator
 */

/**
 * File signature definition
 * @typedef {Object} FileSignature
 * @property {number[]} bytes - Array of byte values to match
 * @property {number} offset - Offset in file where bytes should match
 * @property {Function} [additionalCheck] - Optional additional validation function
 */

/**
 * File type magic bytes signatures
 * Maps MIME types to their corresponding byte signatures
 * @constant {Object.<string, FileSignature[]>}
 */
const FILE_SIGNATURES = {
  // Images
  "image/jpeg": [
    { bytes: [0xFF, 0xD8, 0xFF], offset: 0 }
  ],
  "image/png": [
    { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 }
  ],
  "image/gif": [
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], offset: 0 }, // GIF87a
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], offset: 0 }  // GIF89a
  ],
  "image/webp": [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, additionalCheck: (buffer) => {
      return buffer.length > 12 && 
             buffer[8] === 0x57 && buffer[9] === 0x45 && 
             buffer[10] === 0x42 && buffer[11] === 0x50
    } }
  ],
  "image/bmp": [
    { bytes: [0x42, 0x4D], offset: 0 }
  ],
  "image/svg+xml": [
    { bytes: [0x3C, 0x73, 0x76, 0x67], offset: 0 }, // <svg
    { bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], offset: 0 } // <?xml
  ],
  
  // Documents
  "application/pdf": [
    { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 } // %PDF
  ],
  
  // Archives
  "application/zip": [
    { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 },
    { bytes: [0x50, 0x4B, 0x05, 0x06], offset: 0 },
    { bytes: [0x50, 0x4B, 0x07, 0x08], offset: 0 }
  ],
  
  // Video
  "video/mp4": [
    { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 } // ftyp at offset 4
  ],
  "video/webm": [
    { bytes: [0x1A, 0x45, 0xDF, 0xA3], offset: 0 }
  ],
  
  // Audio
  "audio/mpeg": [
    { bytes: [0xFF, 0xFB], offset: 0 },
    { bytes: [0x49, 0x44, 0x33], offset: 0 } // ID3
  ]
}

/**
 * Mapping of common file extensions to MIME types
 * @constant {Object.<string, string>}
 */
const EXT_TO_MIME = {
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "webp": "image/webp",
  "bmp": "image/bmp",
  "svg": "image/svg+xml",
  "pdf": "application/pdf",
  "zip": "application/zip",
  "mp4": "video/mp4",
  "webm": "video/webm",
  "mp3": "audio/mpeg"
}

/**
 * Checks if a buffer matches a file signature
 * @private
 * @param {Buffer} buffer - File buffer to check
 * @param {FileSignature} signature - Signature definition to match against
 * @returns {boolean} True if buffer matches signature
 */
function matchesSignature(buffer, signature) {
  const { bytes, offset, additionalCheck } = signature
  
  if (buffer.length < offset + bytes.length) {
    return false
  }
  
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[offset + i] !== bytes[i]) {
      return false
    }
  }
  
  if (additionalCheck && !additionalCheck(buffer)) {
    return false
  }
  
  return true
}

/**
 * Detects MIME type from buffer using magic bytes
 * @param {Buffer} buffer - File buffer to analyze
 * @returns {string|null} Detected MIME type or null if not recognized
 * 
 * @example
 * const buffer = fs.readFileSync('image.png')
 * const mimeType = detectMimeType(buffer)
 * console.log(mimeType) // 'image/png'
 */
function detectMimeType(buffer) {
  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (matchesSignature(buffer, signature)) {
        return mimeType
      }
    }
  }
  return null
}

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the file is valid
 * @property {string|null} detectedMime - MIME type detected from file content
 * @property {string|null} expectedMime - Expected MIME type based on extension
 * @property {string|null} [reason] - Reason for validation failure (if invalid)
 */

/**
 * Validates that file content matches the expected extension
 * Uses magic byte detection to prevent file type spoofing
 * 
 * @param {Buffer} buffer - File buffer to validate
 * @param {string} extension - Expected file extension (without dot, e.g., 'png')
 * @returns {ValidationResult} Validation result with details
 * 
 * @example
 * const result = validateFileType(fileBuffer, 'png')
 * if (!result.valid) {
 *   console.error(`Validation failed: ${result.reason}`)
 * }
 */
function validateFileType(buffer, extension) {
  const expectedMime = EXT_TO_MIME[extension.toLowerCase()]
  const detectedMime = detectMimeType(buffer)
  
  if (!expectedMime) {
    // Extension not in our supported list
    return { 
      valid: false, 
      detectedMime, 
      expectedMime: null,
      reason: "Unsupported file extension"
    }
  }
  
  if (!detectedMime) {
    return { 
      valid: false, 
      detectedMime: null, 
      expectedMime,
      reason: "Could not detect file type from content"
    }
  }
  
  // For SVG, be more lenient as it's text-based
  if (expectedMime === "image/svg+xml" && detectedMime === "image/svg+xml") {
    return { valid: true, detectedMime, expectedMime }
  }
  
  const valid = detectedMime === expectedMime
  
  return { 
    valid, 
    detectedMime, 
    expectedMime,
    reason: valid ? null : "File content does not match extension"
  }
}

module.exports = {
  validateFileType,
  detectMimeType,
  EXT_TO_MIME
}

