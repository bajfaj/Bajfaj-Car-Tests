export const makeCarPayload = () => {
  const uniq = Date.now().toString().slice(-6); // 6 digits
  const nowYear = new Date().getFullYear();
  
  // Generate valid 7-char UK reg: AB12CDE format
  // Use last 2 digits of uniq for numbers, keep it unique but <=8 chars
  const numPart = uniq.slice(-2).padStart(2, '0'); // 2 digits
  const letterPart = String.fromCharCode(65 + (Number(uniq.slice(0,2)) % 26)) + 
                     String.fromCharCode(65 + (Number(uniq.slice(2,4)) % 26)) +
                     String.fromCharCode(65 + (Number(uniq.slice(4,6)) % 26));
  const registration = `T${numPart}${letterPart}E`.substring(0,7).toUpperCase(); // e.g. T12ABCE = 6-7 chars, always <8

  // Better even simpler: AB + 2 digits + 3 letters = 7 chars, still unique enough
  // const registration = `AB${numPart}${letterPart}`.substring(0,7);

  return {
    registration: `AB${numPart}${letterPart}`.substring(0,7), // AB12ABC = 7 chars VALID
    make: 'Toyota',
    model: 'Corolla',
    colour: 'Blue',
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
    totalSpent: 10000,
    status: 'Available',
    profit: 0,
    saleAmount: undefined, // don't send 0 for Available, let API handle
    saleYear: undefined,   // 0 fails validation, use undefined
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
  advertisedPlatforms: 'AutoTrader', // you were missing this, causes VAL-12 fail
  mileageSale: 60500,
  profit: 3150
});