import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onResult: (result: { name: string; calories: number; protein: number; carbs: number; fat: number }) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onResult, onClose }: BarcodeScannerProps) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );

    scannerRef.current.render(
      async (decodedText) => {
        if (loading) return;
        setLoading(true);
        // Pause scanner while fetching
        scannerRef.current?.pause(true);

        try {
          const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
          const data = await res.json();
          
          if (data.status === 1 && data.product) {
            const p = data.product;
            const nutriments = p.nutriments || {};
            
            // Cleanup and send result
            if (scannerRef.current) {
              await scannerRef.current.clear();
            }
            
            onResult({
              name: p.product_name || 'Unknown Product',
              calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
              protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
              carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
              fat: Math.round(nutriments.fat_100g || nutriments.fat || 0),
            });
          } else {
            setError('Product not found in OpenFoodFacts database.');
            setTimeout(() => {
              setError('');
              setLoading(false);
              scannerRef.current?.resume();
            }, 3000);
          }
        } catch (err) {
          setError('Failed to fetch product data.');
          setTimeout(() => {
            setError('');
            setLoading(false);
            scannerRef.current?.resume();
          }, 3000);
        }
      },
      () => {
        // Ignore scan failures (happens every frame it doesn't see a barcode)
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-sl-blue transition-colors bg-sl-surface border border-sl-border p-2 rounded-full z-10"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-md bg-sl-surface border border-sl-blue p-4 shadow-[0_0_30px_rgba(74,158,255,0.2)]">
        <h2 className="font-rajdhani text-2xl font-bold text-white tracking-[2px] mb-4 text-center">SCAN BARCODE</h2>
        
        <div id="reader" className="w-full bg-black min-h-[300px] border border-sl-border"></div>
        
        {loading && (
          <div className="mt-4 text-center font-share text-sl-blue tracking-widest text-xs animate-pulse">
            ANALYZING MACRONUTRIENTS...
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-center font-share text-red-500 tracking-widest text-xs bg-red-500/10 border border-red-500 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
