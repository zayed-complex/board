async function downloadPDF(filename) {
  const url = `/api/pdfs/${filename}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('PDF not found or offline');
    }

    const blob = await response.blob();
    const a = document.createElement('a');
    const blobUrl = URL.createObjectURL(blob);
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);

    console.log(`✅ PDF downloaded: ${filename}`);
  } catch (err) {
    console.error(`❌ Failed to download PDF "${filename}":`, err);
    alert(`❌ لا يمكن تحميل الملف "${filename}" حالياً.`);
  }
}
