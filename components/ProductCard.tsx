import React, { useState, useEffect } from 'react';
import { ProductData } from '../types';
import { generateCopyText } from '../utils/priceCalculator';

interface ProductCardProps {
  product: ProductData;
  exchangeRate: number;
  onUpdate: (id: string, updatedData: Partial<ProductData>) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, exchangeRate, onUpdate, onDelete }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Local state for immediate input feedback before syncing up
  const [localData, setLocalData] = useState({
    brand: product.brand,
    productName: product.productName,
    priceEuro: product.priceEuro
  });

  useEffect(() => {
    setLocalData({
       brand: product.brand,
       productName: product.productName,
       priceEuro: product.priceEuro
    });
  }, [product]);

  const handleCopy = () => {
    const text = generateCopyText(
      localData.brand,
      localData.productName,
      localData.priceEuro,
      exchangeRate
    );
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleChange = (field: keyof typeof localData, value: string | number) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    onUpdate(product.id, { [field]: value });
  };

  const generatedText = generateCopyText(
    localData.brand,
    localData.productName,
    localData.priceEuro,
    exchangeRate
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="md:w-1/3 h-64 md:h-auto relative bg-gray-100">
        <img
          src={product.originalImage}
          alt={product.productName}
          className="w-full h-full object-contain p-2"
        />
      </div>

      {/* Details Section */}
      <div className="md:w-2/3 p-6 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase">品牌 (Brand)</label>
            <input
              type="text"
              value={localData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase">標籤價格 (€)</label>
            <input
              type="number"
              value={localData.priceEuro}
              onChange={(e) => handleChange('priceEuro', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 font-bold text-green-600"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase">品名 (Name)</label>
            <input
              type="text"
              value={localData.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>
        </div>

        {/* Calculation Preview */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">預覽 (Preview)</h4>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {generatedText}
            </pre>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all ${
                copyFeedback ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copyFeedback ? (
                <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    已複製!
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    複製文字
                </>
            )}
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-shrink-0 px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;