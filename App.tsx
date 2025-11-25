import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ProductCard from './components/ProductCard';
import Gallery from './components/Gallery';
import { analyzeImage, fileToBase64 } from './services/geminiService';
import { ProductData, ProcessingStatus } from './types';
import { DEFAULT_EXCHANGE_RATE } from './utils/priceCalculator';

// Simple ID generator since we can't import crypto easily in this environment
const generateId = () => Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [otherImages, setOtherImages] = useState<ProductData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>({ total: 0, current: 0, completed: false });
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);

  const handleUpload = async (files: File[]) => {
    setIsProcessing(true);
    setStatus({ total: files.length, current: 0, completed: false });

    // Process all images in parallel
    await Promise.all(files.map(async (file) => {
      try {
        const base64 = await fileToBase64(file);
        const objectUrl = URL.createObjectURL(file);
        
        // Analyze image
        const analysis = await analyzeImage(base64, file.type);
        
        const newItem: ProductData = {
          id: generateId(),
          originalImage: objectUrl,
          brand: analysis.brand,
          productName: analysis.productName,
          sku: analysis.sku,
          priceEuro: analysis.priceEuro,
          hasPrice: analysis.hasPrice,
        };

        if (analysis.hasPrice && analysis.priceEuro > 0) {
          setProducts(prev => [...prev, newItem]);
        } else {
          setOtherImages(prev => [...prev, newItem]);
        }
      } catch (error) {
        console.error("Failed to process file", file.name, error);
      } finally {
        setStatus(prev => ({ ...prev, current: prev.current + 1 }));
      }
    }));

    setIsProcessing(false);
    setStatus(prev => ({ ...prev, completed: true }));
  };

  const handleUpdateProduct = (id: string, updatedData: Partial<ProductData>) => {
    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, ...updatedData } : p)
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    if(window.confirm("Are you sure you want to clear all data?")) {
        setProducts([]);
        setOtherImages([]);
        setStatus({ total: 0, current: 0, completed: false });
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
                <span className="text-2xl mr-2">🛍️</span>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Luxury Hunter AI</h1>
            </div>
            
            {/* Exchange Rate Input */}
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <label htmlFor="exchangeRate" className="text-sm font-semibold text-gray-700 mr-2">
                    匯率 (Rate):
                </label>
                <input
                    type="number"
                    id="exchangeRate"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-1 text-center font-mono font-bold"
                />
            </div>

            { (products.length > 0 || otherImages.length > 0) && (
                <button onClick={handleClearAll} className="text-sm text-red-500 hover:text-red-700 font-medium">
                    清除全部
                </button>
            )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">上傳照片 (Upload Photos)</h2>
          <ImageUploader onUpload={handleUpload} isProcessing={isProcessing} />
          
          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                <span>正在分析...</span>
                <span>{status.current} / {status.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(status.current / status.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        <section>
          {products.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🏷️</span> 有價格商品 ({products.length})
              </h2>
              <div className="space-y-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    exchangeRate={exchangeRate}
                    onUpdate={handleUpdateProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Images Gallery */}
          <Gallery images={otherImages} title="其他圖片 (無價格)" />
          
          {/* Empty State */}
          {!isProcessing && products.length === 0 && otherImages.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <p className="text-gray-400 text-lg">請上傳圖片開始分析</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;