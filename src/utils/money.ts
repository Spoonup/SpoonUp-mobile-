export const formatRupees = (amount: number): string =>
  `₹${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
