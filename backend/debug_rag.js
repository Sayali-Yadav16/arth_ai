
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Create a minimal valid PDF for testing
function createDummyPDF(filename) {
    const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT /F1 24 Tf 100 700 Td (Income Tax Test 100000) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000157 00000 n
0000000302 00000 n
0000000388 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
483
%%EOF`;

    fs.writeFileSync(filename, content);
}

async function testUpload() {
    const filename = 'test_tax_doc.pdf';
    try {
        createDummyPDF(filename);

        const form = new FormData();
        form.append('files', fs.createReadStream(filename));

        console.log('Sending request with PDF to http://localhost:4000/api/rag/analyze...');
        try {
            const response = await axios.post('http://localhost:4000/api/rag/analyze', form, {
                headers: {
                    ...form.getHeaders()
                },
                timeout: 45000 // Increase timeout for graph processing
            });
            console.log('Response Success:', JSON.stringify(response.data, null, 2));
        } catch (e) {
            console.error("Axios Error:", e.message);
            if (e.response) {
                console.error("Status:", e.response.status);
                console.error("Data:", e.response.data);
            }
        }

    } catch (err) {
        console.error('Test Setup Error:', err.message);
    } finally {
        // Cleanup
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
    }
}

testUpload();
