// About `File` types and mimetypes.
// A File object has a `type` field that contains the mimetype of the file.
// A mimetype consists of a TYPE and a SUBTYPE (tipically, a file format):
// - In mimetype 'video/webm' the type is 'video' and the subtype or format is 'webm'.
// - In mimetype 'application/pdf' the type is 'application' and the subtype or format is 'pdf'.
// - etc.

/**
 * The media type that a `File` object or URL has.
 * We need this in order to filter between different kinds of media we support.
 * Note that this is not a mime type, neither any of its types or subtypes,
 * just a handy mixed utility type for our own purposes.
 */
export type FileMediaType =
  | "video"
  | "image"
  | "gif"
  | "pdf"
  | "doc"
  | "presentation";

/** A list of possible video formats. */
const VIDEO_SUPPORTED_FORMATS = [
  "mov",
  "mp4",
  "m4v",
  "quicktime",
  "mpeg",
  "3gp",
  "3g2",
  "x-m4v",
  "webm",
];

/** A list of possible image formats. */
const IMAGE_SUPPORTED_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "jfif",
  "jpe",
  "tiff",
  "bmp",
];

/** A list of possible gif formats. */
const GIF_SUPPORTED_FORMATS = ["gif"];

/** A list of possible PDF formats. */
const PDF_SUPPORTED_FORMATS = ["pdf"];

/** A list of possible word-processing formats. */
const DOC_SUPPORTED_FORMATS = [
  "msword",
  "vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const DOC_SUPPORTED_EXTENSIONS = ["doc", "docx"];

/** A list of possible presentation formats. */
const PRESENTATION_SUPPORTED_FORMATS = [
  "vnd.ms-powerpoint",
  "vnd.openxmlformats-officedocument.presentationml.presentation",
];

const PRESENTATION_SUPPORTED_EXTENSIONS = ["ppt", "pptx"];

/** Video extensions that are not supported natively in main browsers. */
const VIDEO_UNSUPPORTED_FORMATS_IN_BROWSER = [
  "mov",
  "m4v",
  "quicktime",
  "x-m4v",
];

/** Video extensions that our backend can transform to mp4. */
const VIDEO_UNSUPPORTED_FORMATS = ["mov", "m4v", "quicktime", "x-m4v", "webm"];

/** Image extensions that is better to convert to a more standard image format. */
const IMAGE_UNSUPPORTED_FORMATS = ["webp"];

const getMimeRegExp = (kind: string, array: string[]) =>
  new RegExp(`${kind}/(${array.join("|")})`, "g");

const VIDEO_MIME_REGEX = getMimeRegExp("video", VIDEO_SUPPORTED_FORMATS);
const IMAGE_MIME_REGEX = getMimeRegExp("image", IMAGE_SUPPORTED_FORMATS);
const GIF_MIME_REGEX = getMimeRegExp("image", GIF_SUPPORTED_FORMATS);
const PDF_MIME_REGEX = getMimeRegExp("application", PDF_SUPPORTED_FORMATS);
const DOC_MIME_REGEX = getMimeRegExp("application", DOC_SUPPORTED_FORMATS);
const PRESENTATION_MIME_REGEX = getMimeRegExp(
  "application",
  PRESENTATION_SUPPORTED_FORMATS
);

const VIDEO_UNSUPPORTED_FORMATS_REGEX = getMimeRegExp(
  "video",
  VIDEO_UNSUPPORTED_FORMATS
);
const VIDEO_UNSUPPORTED_FORMATS_IN_BROWSER_REGEX = getMimeRegExp(
  "video",
  VIDEO_UNSUPPORTED_FORMATS_IN_BROWSER
);
const IMAGE_UNSUPPORTED_FORMATS_REGEX = getMimeRegExp(
  "image",
  IMAGE_UNSUPPORTED_FORMATS
);

/** Returns the file media type from the File mimetype, if any. */
export const getFileTypeFromFile = (file: File): FileMediaType | undefined => {
  if (!file) return;

  // Get type from mimetype
  const type: FileMediaType | undefined = getFileTypeFromMimeType(file.type);

  return type;
};

export const getFileTypeFromMimeType = (
  mimeType: string | undefined
): FileMediaType | undefined => {
  if (!mimeType) return;

  let type: FileMediaType | undefined;

  // Get type from mimetype
  if (mimeType.match(VIDEO_MIME_REGEX)) type = "video";
  else if (mimeType.match(IMAGE_MIME_REGEX)) type = "image";
  else if (mimeType.match(GIF_MIME_REGEX)) type = "gif";
  else if (mimeType.match(PDF_MIME_REGEX)) type = "pdf";
  else if (mimeType.match(DOC_MIME_REGEX)) type = "doc";
  else if (mimeType.match(PRESENTATION_MIME_REGEX)) type = "presentation";

  return type;
};

/** Returns the mime types associated with the specified file media type */
export const getSupportedMimeTypes = (
  mediaType: FileMediaType
): string[] | undefined => {
  if (mediaType === "image")
    return IMAGE_SUPPORTED_FORMATS.map((format) => `image/${format}`);
  else if (mediaType === "video")
    return VIDEO_SUPPORTED_FORMATS.map((format) => `video/${format}`);
  else if (mediaType === "gif")
    return GIF_SUPPORTED_FORMATS.map((format) => `image/${format}`);
  else if (mediaType === "pdf")
    return PDF_SUPPORTED_FORMATS.map((format) => `application/${format}`);
  else if (mediaType === "doc")
    return DOC_SUPPORTED_FORMATS.map((format) => `application/${format}`);
  else if (mediaType === "presentation")
    return PRESENTATION_SUPPORTED_FORMATS.map(
      (format) => `application/${format}`
    );
};

/** Returns the type part of the mimetype of the file contained in an url, if any. */

/** Returns the extension of the file contained in the specified URL, if any. */
export const getFileNameExtensionFromUrl = (
  url: string
): string | undefined => {
  let urlObject: URL | undefined = undefined;
  try {
    urlObject = new URL(url);
  } catch (error) {
    console.warn("Cannot get filename extension from url: " + url);
  }

  if (!urlObject) return;

  const pathnameChunks = urlObject.pathname.split("/");
  const lastChunk = pathnameChunks[pathnameChunks.length - 1];
  if (!lastChunk) return;

  const index = lastChunk.lastIndexOf(".");
  if (index < 0) return;

  const extension = lastChunk.substring(index + 1);
  if (extension) return extension.toLowerCase();
};
export const getFileTypeFromUrl = (url: string): FileMediaType | undefined => {
  if (!url) return;

  let type: FileMediaType | undefined;

  // Get the extension of the file in the url
  const lowerCaseExtension = getFileNameExtensionFromUrl(url);

  if (lowerCaseExtension) {
    if (VIDEO_SUPPORTED_FORMATS.includes(lowerCaseExtension)) type = "video";
    else if (IMAGE_SUPPORTED_FORMATS.includes(lowerCaseExtension))
      type = "image";
    else if (GIF_SUPPORTED_FORMATS.includes(lowerCaseExtension)) type = "gif";
    else if (PDF_SUPPORTED_FORMATS.includes(lowerCaseExtension)) type = "pdf";
    else if (DOC_SUPPORTED_EXTENSIONS.includes(lowerCaseExtension))
      type = "doc";
    else if (PRESENTATION_SUPPORTED_EXTENSIONS.includes(lowerCaseExtension))
      type = "presentation";
  }

  // Another try, just looking if the URL contains a matching word (do not use this for pdfs as their
  // extension is easily found in hash strings that may be included in a gdrive url)
  if (!type) {
    const lowerCaseFilename = decodeURIComponent(url.toLowerCase());

    // https://app.asana.com/0/1200135212133421/1206785206438105/f This needs to be first for urls like this:
    // https://thyssenkrupp.canto.global/direct/image/ooflkophbh309c4kc2u2hh8a27/gCnWPaHxKdh4hxwL4KHN5jcL_Qo/original?content-type=image%2Fgif&name=V3+Fabrication+4.gif
    if (lowerCaseFilename.includes("image/gif")) type = "gif";
    else if (lowerCaseFilename.includes("image")) type = "image";
    else if (lowerCaseFilename.includes("video")) type = "video";
  }

  return type;
};

export const getFileNameExtension = (fileName: string): string | undefined => {
  if (!fileName) return;
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex >= 0 ? fileName.substring(lastDotIndex) : undefined;
};

export const getFileNameWithoutExtension = (
  fileName: string | undefined
): string | undefined => {
  if (!fileName) return;
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
};

/** Returns the mime subtype of the specified file, tipically the file format. */
export const getFileFormat = (file: File): string | undefined => {
  return getMimeTypeFormat(file.type);
};

/**
 * Returns the mime subtype of the specified mime type, tipically the file format.
 * For example:
 * - For a mimetype `video/webm`, returns `webm`.
 * - For a mimetype `application/vnd.openxmlformats-officedocument.presentationml.presentation`,
 * returns `vnd.openxmlformats-officedocument.presentationml.presentation`.
 */
export const getMimeTypeFormat = (mimeType: string): string | undefined => {
  if (!mimeType.includes("/")) return;
  return mimeType.split("/").pop();
};

export const getHash = async (buffer: BufferSource, algorithm = "SHA-256") => {
  const hash = await crypto.subtle.digest(algorithm, buffer);

  // here hash is an arrayBuffer, so we'll convert it to its hex version
  let result = "";
  const view = new DataView(hash);
  for (let i = 0; i < hash.byteLength; i += 4) {
    result += ("00000000" + view.getUint32(i).toString(16)).slice(-8);
  }

  return result;
};

/**
 * Returns if the format of the specified video file is supported as is.
 * That is, the file does not need any transformation to be shown or published.
 */
export const isVideoFileFormatSupported = (file: File): boolean => {
  return isFileFormatSupported(file, VIDEO_UNSUPPORTED_FORMATS_REGEX);
};

/** Returns if the format of the specified video file can be shown in the browser. */
export const isVideoFileFormatSupportedInBrowser = (file: File): boolean => {
  return isFileFormatSupported(
    file,
    VIDEO_UNSUPPORTED_FORMATS_IN_BROWSER_REGEX
  );
};

/**
 * Returns if the format of the specified image file is supported as is.
 * That is, the file does not need any transformation to be shown or published.
 */
export const isImageFileFormatSupported = (file: File): boolean => {
  return isFileFormatSupported(file, IMAGE_UNSUPPORTED_FORMATS_REGEX);
};

export const readableFileSize = (sizeBytes: number): string => {
  const i =
    sizeBytes == 0 ? 0 : Math.floor(Math.log(sizeBytes) / Math.log(1024));
  return (
    Number((sizeBytes / Math.pow(1024, i)).toFixed(2)) * 1 +
    " " +
    ["B", "KB", "MB", "GB", "TB"][i]
  );
};

/** Returns `true` for any `File` object whose `type` does NOT match the specified regex.  */
const isFileFormatSupported = (file: File, regex: RegExp): boolean => {
  if (!file || !file.type) return true;
  const matchResult = file.type.match(regex);
  return matchResult == null || matchResult.length === 0;
};

/** Returns true if the URL contains any of the specified words */
export const urlContainsAnyWord = (url: string, words: string[]): boolean => {
  const lowerCaseUrl = url.toLowerCase();
  return words.some((word) => lowerCaseUrl.includes(word.toLowerCase()));
};

const allowedCdn = ["metricool-temp", "static.metricool.com", "metricool.com"];
export const urlToImageFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const data = await response.blob();
  let extension = data.type.split("/")[1];
  if (extension === "octet-stream" && urlContainsAnyWord(url, allowedCdn)) {
    const urlParts = url.split(".");
    extension = urlParts[urlParts.length - 1];
  }
  return new File([data], `dummy.${extension}`, { type: data.type });
};

/* -------------- * Base64 and File Conversion Utilities */

/**
 * Converts a base64 string to a File object.
 * @param base64 The base64 string to convert.
 * @param mimeType The MIME type of the file.
 * @param fileName The name of the file.
 * @returns A Promise that resolves to a File object.
 */
export const base64ToFile = async (
  base64: string,
  mimeType: string,
  fileName: string
): Promise<File | undefined> => {
  try {
    // 1. Crear Data URL si el base64 es un base64 puro.
    let dataUrl = base64;
    if (!base64.startsWith("data:")) {
      dataUrl = `data:${mimeType};base64,${base64}`;
    }

    // 2. Usar fetch para convertir (más eficiente)
    const fetchResponse = await fetch(dataUrl);

    // 3. Crear File desde Blob
    const blob = await fetchResponse.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error("❌ Error en conversión optimizada:", error);
  }
};

export const imageFileToBase64 = async (
  file: File
): Promise<string | undefined> => {
  if (!file) return;

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
  });
};

export const imageUrlToBase64 = async (
  url: string
): Promise<string | undefined> => {
  const fileImage = await urlToImageFile(url);
  const base64Image = await imageFileToBase64(fileImage);
  return base64Image;
};

/** --------------- */
