import { createRoot } from "react-dom/client";
import type { GeneratedInvoice } from "../hooks/useGeneratedInvoices";

type DownloadInvoicePdfOptions = {
  invoice: GeneratedInvoice;
  fileName?: string;
};

export async function downloadInvoicePdf({ invoice, fileName }: DownloadInvoicePdfOptions) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-10000px";
  mount.style.top = "0";
  mount.style.width = "794px";
  mount.style.background = "#fff";
  mount.style.pointerEvents = "none";
  document.body.appendChild(mount);

  const root = createRoot(mount);

  try {
    // Adjust the import path if your InvoicePreview component lives elsewhere
    const { default: InvoicePreview } = await import("../components/invoice/InvoicePreview");
    root.render(<InvoicePreview invoice={invoice.invoiceData} isPro />);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(mount, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: mount.scrollWidth,
      windowHeight: mount.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.97);
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;

    let remaining = imgH;
    let y = 0;

    pdf.addImage(imgData, "JPEG", 0, y, imgW, imgH);
    remaining -= pageH;

    while (remaining > 0) {
      y = remaining - imgH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, y, imgW, imgH);
      remaining -= pageH;
    }

    pdf.save(fileName ?? `invoice-${invoice.invoiceNumber || "draft"}.pdf`);
  } finally {
    root.unmount();
    mount.remove();
  }
}
