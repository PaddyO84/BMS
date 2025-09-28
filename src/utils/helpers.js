export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export const calculateJobTotal = (job) => {
    const labourTotal = (job.labour || []).reduce((sum, item) => sum + (item.hours * item.rate), 0);
    const materialsTotal = (job.materials || []).reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    const subTotal = labourTotal + materialsTotal;
    const taxRate = job.taxRate || 0;
    const taxAmount = subTotal * (taxRate / 100);
    const total = subTotal + taxAmount;

    return { subTotal, taxAmount, total };
};

export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        return '€0.00';
    }
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
};