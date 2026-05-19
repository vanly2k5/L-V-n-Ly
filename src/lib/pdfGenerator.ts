import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CheckInRecord } from "../types";

// Extend jsPDF with autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateAttendancePDF = (userData: any, history: CheckInRecord[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Load a simple font if needed, but for now we'll use standard ones
  // Vietnamese characters might need a specific font (encoded as base64)
  // For simplicity, we'll try to use standard fonts but warn user if characters might not show perfectly
  // or use basic ASCII if needed.

  // Helper to remove Vietnamese diacritics for basic PDF support if needed
  // Note: For production use, a custom font with Vietnamese support should be embedded.
  const removeDiacritics = (str: string) => {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  // Header
  doc.setFillColor(91, 80, 214); // #5B50D6
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CAMPUSHUB - MINH CHUNG REN LUYEN", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("He thong quan ly hoat dong sinh vien", pageWidth / 2, 28, { align: "center" });

  // User Info Section
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("THONG TIN SINH VIEN", 20, 55);
  
  doc.setDrawColor(91, 80, 214);
  doc.setLineWidth(0.5);
  doc.line(20, 58, 80, 58);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const leftCol = 20;
  const rightCol = 110;
  
  doc.text(`Ho va ten: ${removeDiacritics(userData.name)}`, leftCol, 70);
  doc.text(`Ma sinh vien: ${userData.school || "N/A"}`, leftCol, 78);
  doc.text(`Khoa/Truong: ${removeDiacritics(userData.subInfo || "")}`, leftCol, 86);
  
  doc.text(`Tong diem RL: ${userData.points || 0}`, rightCol, 70);
  doc.text(`Diem hoc thuat: ${userData.academicPoints || 0}`, rightCol, 78);
  doc.text(`Diem dao duc: ${userData.ethicsPoints || 0}`, rightCol, 86);

  // Stats Summary
  doc.setFillColor(245, 246, 255);
  doc.roundedRect(20, 95, pageWidth - 40, 25, 3, 3, 'F');
  
  doc.setTextColor(91, 80, 214);
  doc.setFont("helvetica", "bold");
  doc.text("KET QUA REN LUYEN", pageWidth / 2, 103, { align: "center" });
  
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  const status = userData.points >= 90 ? "XUAT SAC" : userData.points >= 80 ? "TOT" : userData.points >= 65 ? "KHA" : "TRUNG BINH";
  doc.text(`Xep loai: ${status}`, pageWidth / 2, 112, { align: "center" });

  // History Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LICH SU HOAT DONG", 20, 140);
  doc.line(20, 143, 80, 143);

  const tableData = history.map(h => [
    h.date,
    removeDiacritics(h.eventName),
    h.status === "Hoàn thành" ? "CHECK-OUT" : "CHECK-IN",
    `+${h.points}d`,
    removeDiacritics(h.location || "N/A")
  ]);

  doc.autoTable({
    startY: 150,
    head: [['Ngay', 'Ten Su Kien', 'Trang Thai', 'Diem', 'Dia Diem']],
    body: tableData,
    headStyles: { fillColor: [91, 80, 214], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 249, 254] },
    margin: { top: 150 },
    theme: 'striped',
    styles: { font: "helvetica" }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Xuat luc: ${new Date().toLocaleString()} - Trang ${i}/${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    doc.text("CAMPUSHUB - SMART CAMPUS ECOSYSTEM", pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" });
  }

  // Save the PDF or return data URL
  if (userData.returnUrl) {
    return doc.output('datauristring');
  }
  doc.save(`minh_chung_ren_luyen_${userData.name.replace(/\s+/g, '_')}.pdf`);
  return null;
};
