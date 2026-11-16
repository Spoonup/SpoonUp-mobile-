export const formatRupees = (amount: number): string =>
  `₹${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

// Credit can carry paise; whole rupees stay unpadded, like the website.
export const formatMoney = (amount: number): string =>
  Number.isInteger(amount) ? formatRupees(amount) : `₹${amount.toFixed(2)}`;
