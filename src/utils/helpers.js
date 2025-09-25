export const formatCurrency = (amount) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount || 0);

export const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Assuming timestamp is an ISO 8601 string from SQLite
    return new Date(timestamp).toLocaleDateString('en-GB');
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