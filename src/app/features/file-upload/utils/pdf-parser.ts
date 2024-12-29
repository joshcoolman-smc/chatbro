import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";

// Configure PDF.js
if (typeof window !== "undefined") {
  const pdfJsVersion = "4.9.155"; // Match the version in our package.json
  const cdnBase = `https://unpkg.com/pdfjs-dist@${pdfJsVersion}`;

  // Set worker source from CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${cdnBase}/build/pdf.worker.min.js`;

  console.log("PDF.js configured:", {
    version: pdfjsLib.version,
    workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
  });
}

export async function parsePDF(data: ArrayBuffer): Promise<string> {
  try {
    console.log("Starting PDF parsing, data size:", data.byteLength);

    // Create a copy of the data
    const pdfData = new Uint8Array(data);
    console.log("PDF data prepared:", {
      byteLength: pdfData.byteLength,
      firstBytes: Array.from(pdfData.slice(0, 4)),
    });

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      verbosity: 1, // Enable more detailed logging
      enableXfa: false, // Disable XFA to reduce complexity
      useSystemFonts: true, // Use system fonts when possible
    });

    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully, pages:", pdf.numPages);

    const pageTextPromises = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");
      pageTextPromises.push(pageText);
      console.log(`Page ${pageNum} processed, text length: ${pageText.length}`);
    }

    const allText = (await Promise.all(pageTextPromises)).join("\n\n");
    console.log("PDF parsing complete, total text length:", allText.length);
    return allText;
  } catch (error) {
    // Improved error logging with proper error object handling
    const errorDetails = {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      dataSize: data.byteLength,
      // Additional context that might help debugging
      pdfJsVersion: pdfjsLib.version,
      workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
    };

    console.error("Error parsing PDF:", errorDetails);
    // Re-throw with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to parse PDF: ${errorMessage}. Check console for details.`
    );
  }
}
