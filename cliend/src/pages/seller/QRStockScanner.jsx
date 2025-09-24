import React, { useState, useEffect, useRef } from "react";
import { QrReader } from 'react-qr-reader';
import { Camera, Plus, X, Package, AlertCircle, CheckCircle, Loader } from "lucide-react";

const QRStockScanner = ({ onStockUpdate }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

  const videoRef = useRef(null);

  // Camera setup for mirror preview
  useEffect(() => {
    if (!showScanner) {
      // Stop camera when modal is closed
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      return;
    }

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera for mirror preview:', error);
        setMessage('Unable to access camera. Please check camera permissions.');
        setMessageType('error');
      }
    };

    if (showScanner) {
      enableCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScanner]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleScan = async (data) => {
    if (data && !scanning) {
      const currentTime = Date.now();
      
      // Prevent multiple scans of same QR within 2 seconds
      if (currentTime - lastScanTime < 2000) {
        return;
      }
      
      setScanning(true);
      setLastScanTime(currentTime);
      setIsProcessing(true);

      try {
        // Extract product ID from QR data
        const productId = data.replace('Product ID: ', '').trim();
        
        // Fetch product details
        const response = await fetch(`http://localhost:4000/api/products`);
        const products = await response.json();
        
        const product = products.find(p => p.productId === productId);
        
        if (!product) {
          setMessage('Product not found! Please check the QR code.');
          setMessageType('error');
          setIsProcessing(false);
          setScanning(false);
          return;
        }

        // Set the scanned product for quantity input
        setScannedProduct(product);
        setMessage(`Product "${product.productName}" found! Enter quantity to add.`);
        setMessageType('success');
        
      } catch (error) {
        console.error('Error scanning product:', error);
        setMessage('Error scanning product. Please try again.');
        setMessageType('error');
      } finally {
        setIsProcessing(false);
        setTimeout(() => {
          setScanning(false);
        }, 1000);
      }
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
  };

  const handleAddStock = async () => {
    if (!scannedProduct || !quantityToAdd || parseInt(quantityToAdd) <= 0) {
      setMessage('Please enter a valid quantity greater than 0.');
      setMessageType('error');
      return;
    }

    setIsProcessing(true);

    try {
      // Use the existing products endpoint with PATCH method to update stock
      const newStock = (scannedProduct.stock || 0) + parseInt(quantityToAdd);
      
      const response = await fetch(`http://localhost:4000/api/products/${scannedProduct._id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantityToAdd: parseInt(quantityToAdd)
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update stock');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      
      setMessage(`Successfully added ${quantityToAdd} items to "${scannedProduct.productName}". New stock: ${newStock}`);
      setMessageType('success');

      // Clear form
      setScannedProduct(null);
      setQuantityToAdd('');

      // Notify parent component to refresh the product list
      if (onStockUpdate) {
        onStockUpdate();
      }

    } catch (error) {
      console.error('Error updating stock:', error);
      setMessage(`Error updating stock: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedProduct(null);
    setQuantityToAdd('');
    setMessage('');
    setMessageType('');
    setScanning(false);
  };

  const closeScanner = () => {
    setShowScanner(false);
    resetScanner();
  };

  const getMessageStyle = () => {
    const baseStyle = "px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2";
    
    switch (messageType) {
      case 'success':
        return `${baseStyle} bg-green-50 text-green-800 border border-green-200`;
      case 'error':
        return `${baseStyle} bg-red-50 text-red-800 border border-red-200`;
      case 'warning':
        return `${baseStyle} bg-yellow-50 text-yellow-800 border border-yellow-200`;
      default:
        return `${baseStyle} bg-blue-50 text-blue-800 border border-blue-200`;
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* QR Scanner Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Camera className="w-4 h-4" />
        QR Stock Scanner
      </button>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">QR Stock Scanner</h2>
                    <p className="text-sm text-gray-600">Scan product QR codes to add stock</p>
                  </div>
                </div>
                <button
                  onClick={closeScanner}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(110vh-200px)]">
              {/* QR Scanner */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Step 1: Scan Product QR Code</h3>
                
                {/* Hidden QR Reader for actual scanning */}
                <div style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none', position: 'absolute', height: 0, width: 0 }}>
                  <QrReader
                    constraints={{ 
                      facingMode: 'environment',
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                    onResult={(result, error) => {
                      if (result) {
                        handleScan(result?.text);
                      }
                      if (error) {
                        handleError(error);
                      }
                    }}
                    containerStyle={{ width: '100%', height: '100%' }}
                    videoStyle={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Mirror Preview with QR Frame */}
                <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '300px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror effect
                  />
                  
                  {/* Scanning Overlay */}
                  {scanning && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                        <Loader className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-gray-700 font-medium">Processing QR Code...</span>
                      </div>
                    </div>
                  )}

                  {/* QR Frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-blue-500 border-dashed rounded-lg opacity-75">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Position the QR code within the scanning frame and hold steady
                </div>
              </div>

              {/* Status Message */}
              {message && (
                <div className={getMessageStyle()}>
                  {getMessageIcon()}
                  {message}
                </div>
              )}

              {/* Stock Addition Form */}
              {scannedProduct && (
                <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900">Step 2: Add Stock Quantity</h3>
                  
                  {/* Product Info */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-4">
                      {scannedProduct.image && (
                        <img
                          src={scannedProduct.image}
                          alt={scannedProduct.productName}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{scannedProduct.productName}</h4>
                        <p className="text-sm text-gray-600">{scannedProduct.category}</p>
                        <p className="text-sm font-medium text-blue-600">
                          Current Stock: {scannedProduct.stock} items
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to Add <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantityToAdd}
                        onChange={(e) => setQuantityToAdd(e.target.value)}
                        placeholder="Enter quantity"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <button
                        onClick={handleAddStock}
                        disabled={!quantityToAdd || parseInt(quantityToAdd) <= 0 || isProcessing}
                        className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Stock
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Quantity Buttons */}
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600 self-center mr-2">Quick add:</span>
                    {[1, 5, 10, 25, 50].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantityToAdd(qty.toString())}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isProcessing}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetScanner}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                    disabled={isProcessing}
                  >
                    Scan different product
                  </button>
                </div>
              )}

              {/* Instructions */}
              {!scannedProduct && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Point your camera at a product QR code</li>
                    <li>• Hold steady until the product is detected</li>
                    <li>• Enter the quantity you want to add to stock</li>
                    <li>• Click "Add Stock" to update the inventory</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRStockScanner;