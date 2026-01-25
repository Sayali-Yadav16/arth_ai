
import { PDFParse } from "pdf-parse";
import fs from "fs";

async function test() {
    const buffer = fs.readFileSync("dummy.txt"); // It's not a real PDF so might fail parsing but let's see if API exists
    console.log("PDFParse class:", PDFParse);
    const parser = new PDFParse({ data: buffer });
    console.log("Parser created. Has getText?", typeof parser.getText);
}

test().catch(console.error);
