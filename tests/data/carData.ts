export const makeCarPayload = () => {
  const uniq = Date.now().toString().slice(-6);
  const nowYear = new Date().getFullYear();

  return {
    registration: `TEST${uniq}`,
    make: 'Toyota',
    model: 'Corolla',
    colour: 'Blue', // NOTE: British spelling - your DB uses colour not color
    engine: 'Petrol',
    engineSize: '1.6',
    transmission: 'Manual',
    fuel: 'Petrol',
    logbook: 'Yes',
    purchaseYear: nowYear,
    source: 'Copart',
    winningBid: 8000,
    additionalFee: 500,
    delivery: 250,
    repairCost: 1250,
    mechanic: 'External',
    personalUse: 'No',
    mileage: 60000,
    mileagePurchase: 60000,
    mileageSale: 60500,
    totalSpent: 10000, // winningBid + fees + delivery + repair
    status: 'Available',
    profit: 0,
    saleAmount: 0,
    saleYear: 0,
    platformSoldOn: '',
    advertisedPlatforms: 'AutoTrader',
    advertDuration: '7 days'
  };
};

// For the PUT -> Sold test
export const makeSoldUpdatePayload = () => ({
  status: 'Sold',
  saleAmount: 13150,
  saleYear: new Date().getFullYear(),
  platformSoldOn: 'AutoTrader',
  mileageSale: 60500,
  profit: 3150
});