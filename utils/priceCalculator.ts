export const DEFAULT_EXCHANGE_RATE = 37;
export const HANDLING_FEE = 15;
export const FEE_THRESHOLD = 1000;

export const calculateFinalPriceEuro = (originalPrice: number): number => {
  if (originalPrice > FEE_THRESHOLD) {
    return originalPrice;
  }
  return originalPrice + HANDLING_FEE;
};

export const calculatePriceTWD = (finalEuroPrice: number, exchangeRate: number): number => {
  return Math.round(finalEuroPrice * exchangeRate);
};

export const generateCopyText = (
  brand: string,
  productName: string,
  originalPrice: number,
  exchangeRate: number
): string => {
  const finalEuro = calculateFinalPriceEuro(originalPrice);
  const twdPrice = calculatePriceTWD(finalEuro, exchangeRate);

  let euroLine = "";
  if (originalPrice > FEE_THRESHOLD) {
    // Case: Price > 1000, no fee
    euroLine = `💰付歐元: ${originalPrice}`;
  } else {
    // Case: Price <= 1000, add 15
    euroLine = `💰付歐元: ${originalPrice}+${HANDLING_FEE} = ${finalEuro}`;
  }

  const twdLine = `💰付台幣: ${finalEuro} * ${exchangeRate} = ${twdPrice}`;

  return `
品牌: ${brand}
品名: ${productName}
${euroLine}
${twdLine}
`.trim();
};