import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function extractText(filePath) {
  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();

  return data.text;
}
