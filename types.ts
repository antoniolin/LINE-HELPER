export interface ProductData {
  id: string;
  originalImage: string; // Object URL or Base64
  brand: string;
  productName: string;
  sku: string;
  priceEuro: number;
  hasPrice: boolean;
}

export interface AnalysisResult {
  hasPrice: boolean;
  brand: string;
  productName: string;
  priceEuro: number;
  sku: string;
}

export interface ProcessingStatus {
  total: number;
  current: number;
  completed: boolean;
}