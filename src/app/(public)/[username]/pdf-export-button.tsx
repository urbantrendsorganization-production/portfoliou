"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { Profile, WorkSample } from "@/types/database";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PDFExportButtonProps {
  profile: Profile;
  samples: WorkSample[];
}

export function PDFExportButton({ profile, samples }: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!profile.is_premium) {
      alert("PDF Portfolio Export is a Premium feature. Upgrade to export your portfolio!");
      return;
    }

    setExporting(true);
    try {
      // We'll create a temporary hidden div to render the PDF content nicely
      const element = document.getElementById("portfolio-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add a header to the PDF
      pdf.setFontSize(20);
      pdf.setTextColor(79, 70, 229); // indigo-600
      pdf.text(profile.name || "Portfolio", 15, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // gray-500
      pdf.text(`${profile.discipline || ""} | ${profile.school || ""}`, 15, 27);
      
      pdf.addImage(imgData, "PNG", 0, 35, pdfWidth, pdfHeight);
      
      pdf.save(`${profile.name?.replace(/\s+/g, "_")}_Portfolio.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="flex-1"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      {exporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
