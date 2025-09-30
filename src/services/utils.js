import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const formatCurrency = (amount) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount || 0);

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
};

export const calculateJobTotal = (job) => {
    if (!job) return { subTotal: 0, taxAmount: 0, total: 0, taxRate: 13.5 };
    const labourTotal = job.labour?.reduce((sum, item) => sum + ((item.hours || 0) * (item.rate || 0)), 0) || 0;
    const materialsTotal = job.materials?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost || 0)), 0) || 0;
    const subTotal = labourTotal + materialsTotal;
    const taxRate = job.taxRate || 13.5;
    const taxAmount = subTotal * (taxRate / 100);
    const total = subTotal + taxAmount;
    return { subTotal, taxAmount, total, taxRate };
};

export const generatePdf = (docType, data, profile) => {
    const doc = new jsPDF();
    const { number, job, customer, issueDate, dueDate } = data;
    doc.setFontSize(20); doc.text(docType.toUpperCase(), 15, 20);
    doc.setFontSize(10);
    doc.text(profile?.name || "Your Business Name", 150, 15);
    doc.text(profile?.address || "123 Business Road, Dublin", 150, 20);
    doc.text(profile?.email || "your.email@business.com", 150, 25);
    doc.setFontSize(12); doc.text(`${docType} Number: ${number}`, 15, 40); doc.text(`Date of Issue: ${issueDate}`, 15, 46);
    if(dueDate) doc.text(`Due Date: ${dueDate}`, 15, 52);
    doc.text("Bill To:", 15, 65); doc.text(customer?.name || "N/A", 15, 71); doc.text(customer?.address || "N/A", 15, 77); doc.text(customer?.email || "N/A", 15, 83);
    const head = [['Description', 'Quantity/Hours', 'Unit Price', 'Total']];
    const labourBody = (job.labour || []).map(l => [l.description, `${l.hours} hrs`, formatCurrency(l.rate), formatCurrency(l.hours * l.rate)]);
    const materialsBody = (job.materials || []).map(m => [m.name, m.quantity, formatCurrency(m.cost), formatCurrency(m.quantity * m.cost)]);
    doc.autoTable({ startY: 95, head, body: [...labourBody, ...materialsBody], theme: 'striped', headStyles: { fillColor: [41, 128, 185] } });
    const finalY = doc.autoTable.previous.finalY;
    const totals = calculateJobTotal(job);
    doc.setFontSize(12); doc.text(`Subtotal:`, 140, finalY + 10, { align: 'right' }); doc.text(formatCurrency(totals.subTotal), 200, finalY + 10, { align: 'right' });
    doc.text(`VAT @ ${totals.taxRate}%:`, 140, finalY + 17, { align: 'right' }); doc.text(formatCurrency(totals.taxAmount), 200, finalY + 17, { align: 'right' });
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(`Total:`, 140, finalY + 25, { align: 'right' }); doc.text(formatCurrency(totals.total), 200, finalY + 25, { align: 'right' });
    doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.text("Thank you for your business!", 15, doc.internal.pageSize.height - 10);
    doc.save(`${docType}_${number}.pdf`);
};