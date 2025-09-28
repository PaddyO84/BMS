import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '../utils/helpers';

export const generateInvoice = (job, profile) => {
    const doc = new jsPDF();

    // --- Header ---
    if (profile.logo) {
        try {
            doc.addImage(profile.logo, 'PNG', 14, 10, 30, 10);
        } catch (e) {
            console.error("Error adding logo to PDF:", e);
            doc.text("Logo could not be loaded", 14, 20);
        }
    }
    doc.setFontSize(20);
    doc.text(profile.name || "Invoice", 14, 40);
    doc.setFontSize(10);
    doc.text(`Invoice #${job.id}`, 14, 46);
    doc.text(`Date: ${formatDate(job.createdAt)}`, 14, 52);

    // --- Business & Customer Details ---
    const businessDetails = [
        profile.name || "Your Business Name",
        profile.address || "123 Business St.",
        profile.email || "business@email.com",
        profile.phone || "555-0101",
        profile.vatNumber ? `VAT: ${profile.vatNumber}` : ""
    ].filter(Boolean);

    const customerDetails = [
        "Bill To:",
        job.customer.name,
        job.customer.address,
        job.customer.email,
        job.customer.phone
    ].filter(Boolean);
    
    doc.setFontSize(10);
    doc.text("From:", 14, 62);
    doc.text(businessDetails, 14, 68);
    
    doc.text("To:", 110, 62);
    doc.text(customerDetails, 110, 68);
    
    // --- Invoice Body ---
    doc.setFontSize(14);
    doc.text(`Job: ${job.jobTitle}`, 14, 100);

    // Labour
    if (job.labour && job.labour.length > 0) {
        doc.setFontSize(12);
        doc.text("Labour", 14, 110);
        const labourData = job.labour.map(item => [
            item.description,
            item.hours,
            `€${item.rate.toFixed(2)}`,
            `€${(item.hours * item.rate).toFixed(2)}`
        ]);
        doc.autoTable({
            startY: 115,
            head: [['Description', 'Hours', 'Rate', 'Total']],
            body: labourData,
            theme: 'striped',
            headStyles: { fillColor: [74, 85, 104] }
        });
    }

    // Materials
    if (job.materials && job.materials.length > 0) {
        const materialsY = doc.autoTable.previous.finalY + 10;
        doc.setFontSize(12);
        doc.text("Materials", 14, materialsY);
        const materialsData = job.materials.map(item => [
            item.name,
            item.quantity,
            `€${item.cost.toFixed(2)}`,
            `€${(item.quantity * item.cost).toFixed(2)}`
        ]);
        doc.autoTable({
            startY: materialsY + 5,
            head: [['Name', 'Quantity', 'Cost', 'Total']],
            body: materialsData,
            theme: 'striped',
            headStyles: { fillColor: [74, 85, 104] }
        });
    }
    
    // --- Totals ---
    const totalsY = doc.autoTable.previous.finalY + 15;
    const totals = [
        ['Subtotal', `€${job.subTotal.toFixed(2)}`],
        ['Tax', `€${job.taxAmount.toFixed(2)}`],
        ['Total', `€${job.total.toFixed(2)}`]
    ];

    doc.autoTable({
        startY: totalsY,
        body: totals,
        theme: 'plain',
        tableWidth: 60,
        margin: { left: 135 },
        styles: {
            fontStyle: 'bold',
            halign: 'right'
        }
    });

    // --- Footer ---
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 14, doc.internal.pageSize.height - 10);

    // --- Save ---
    doc.save(`Invoice-${job.id}-${job.customer.name.replace(/\s/g, '_')}.pdf`);
};