import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { ShoppingCart, Plus, Minus, Trash2, FileText, Printer, X, Calculator, Camera, Clock, User, Phone } from 'lucide-react';

const BillingScanner = () => {
  const [cameraActive, setCameraActive] = useState(true);
  const [scannedData, setScannedData] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [billNumber, setBillNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTotal, setBillTotal] = useState(0);

  const videoRef = useRef(null);

  // Generate bill number on component mount
  useEffect(() => {
    setBillNumber(`BILL-${Date.now()}`);
  }, []);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total whenever bill items change
  useEffect(() => {
    const total = billItems.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
    setBillTotal(total);
  }, [billItems]);

  // Camera setup
  useEffect(() => {
    if (!cameraActive) {
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
        console.error('Error accessing camera:', error);
        setMessage('❌ Unable to access camera. Please check camera permissions.');
        setMessageType('error');
      }
    };

    enableCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const handleScan = async (data) => {
    if (data && !scanning) {
      const currentTime = Date.now();
      
      // Add 1 second delay between scans to prevent multiple scans of same QR
      if (currentTime - lastScanTime < 1000) {
        return;
      }
      
      setScanning(true);
      setLastScanTime(currentTime);
      setScannedData(data);

      setMessage('📱 Processing QR Code...');
      setMessageType('warning');

      try {
        // Extract product ID from QR data
        const productId = data.replace('Product ID: ', '').trim();
        
        // Fetch product details
        const response = await fetch(`http://localhost:4000/api/products`);
        const products = await response.json();
        
        const product = products.find(p => p.productId === productId);
        
        if (!product) {
          setMessage('❌ Product not found!');
          setMessageType('error');
          return;
        }

        if (product.stock <= 0) {
          setMessage('❌ Product out of stock!');
          setMessageType('error');
          return;
        }

        // Check if product already exists in bill
        const existingItemIndex = billItems.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Update quantity if product already exists
          const updatedItems = [...billItems];
          if (updatedItems[existingItemIndex].quantity < product.stock) {
            updatedItems[existingItemIndex].quantity += 1;
            setBillItems(updatedItems);
            setMessage(`✅ Added more ${product.productName} to bill!`);
            setMessageType('success');
          } else {
            setMessage('❌ Cannot add more - insufficient stock!');
            setMessageType('error');
          }
        } else {
          // Add new product to bill
          const newItem = {
            _id: product._id,
            productId: product.productId,
            productName: product.productName,
            salePrice: product.salePrice || product.regularPrice,
            quantity: 1,
            availableStock: product.stock,
            image: product.image
          };
          
          setBillItems(prev => [...prev, newItem]);
          setMessage(`✅ Added ${product.productName} to bill!`);
          setMessageType('success');
        }

      } catch (err) {
        console.error('Product scanning failed:', err);
        setMessage('❌ Failed to process product. Please try again.');
        setMessageType('error');
      }

      setTimeout(() => {
        setMessage('');
        setMessageType('');
        setScanning(false);
        setScannedData('');
      }, 3000);
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeBillItem(index);
      return;
    }

    const updatedItems = [...billItems];
    const item = updatedItems[index];
    
    if (newQuantity > item.availableStock) {
      setMessage(`❌ Only ${item.availableStock} items available in stock!`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    updatedItems[index].quantity = newQuantity;
    setBillItems(updatedItems);
  };

  const removeBillItem = (index) => {
    const updatedItems = billItems.filter((_, i) => i !== index);
    setBillItems(updatedItems);
  };

  const clearBill = () => {
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setBillNumber(`BILL-${Date.now()}`);
  };

  const generatePDF = async () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${billNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .company-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
          .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .customer-info, .bill-details { width: 45%; }
          .info-title { font-weight: bold; margin-bottom: 10px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Kamal Auto Parts</div>
          <div class="company-subtitle">Quality Parts, Trusted Service</div>
          <hr>
        </div>
        
        <div class="bill-info">
          <div class="bill-details">
            <div class="info-title">Bill Information</div>
            <p><strong>Bill No:</strong> ${billNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
          </div>
          <div class="customer-info">
            <div class="info-title">Customer Information</div>
            <p><strong>Name:</strong> ${customerName || 'Walk-in Customer'}</p>
            <p><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price (Rs)</th>
              <th>Total (Rs)</th>
            </tr>
          </thead>
          <tbody>
            ${billItems.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.salePrice.toFixed(2)}</td>
                <td>${(item.quantity * item.salePrice).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>Total Amount:</strong></td>
              <td><strong>Rs ${billTotal.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Kamal Auto Parts - Quality Parts, Trusted Service</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const finalizeBill = async () => {
    if (billItems.length === 0) {
      setMessage('❌ No items in bill!');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    try {
      setMessage('🔄 Processing bill...');
      setMessageType('warning');

      const billData = {
        billNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: billItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.salePrice
        })),
        totalAmount: billTotal,
        paymentStatus: 'paid',
        paidAmount: billTotal,
        notes: `Bill created via QR scanner on ${new Date().toLocaleString()}`
      };

      const response = await fetch('http://localhost:4000/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create bill');
      }

      await generatePDF();
      clearBill();
      setMessage('✅ Bill completed successfully! Stock updated automatically.');
      setMessageType('success');
      setShowBillModal(false);

      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);

    } catch (error) {
      console.error('Error finalizing bill:', error);
      setMessage(`❌ Error completing bill: ${error.message}`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const getMessageStyle = () => {
    const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium";
    
    switch (messageType) {
      case 'success':
        return `${baseStyle} bg-green-100 text-green-800 border border-green-300`;
      case 'error':
        return `${baseStyle} bg-red-100 text-red-800 border border-red-300`;
      case 'warning':
        return `${baseStyle} bg-yellow-100 text-yellow-800 border border-yellow-300`;
      default:
        return `${baseStyle} bg-blue-100 text-blue-800 border border-blue-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kamal Auto Parts</h1>
                <p className="text-sm text-gray-500">Professional Billing System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Side - Camera Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Scanner View
                </h2>
                <button
                  onClick={() => setCameraActive((prev) => !prev)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    cameraActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  disabled={scanning}
                >
                  {cameraActive ? 'Turn Off' : 'Turn On'}
                </button>
              </div>

              {/* Camera Display */}
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3', maxHeight: '300px' }}>
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p>Camera is turned off</p>
                    </div>
                  </div>
                )}
                
                {/* Scanning Overlay */}
                {scanning && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-700 font-medium">Processing QR Code...</span>
                    </div>
                  </div>
                )}

                {/* QR Scanner Targeting Frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border-2 border-blue-500 border-dashed rounded-lg opacity-75"></div>
                </div>
              </div>

              {/* Status Message */}
              {message && (
                <div className={`mt-4 ${getMessageStyle()}`}>
                  {message}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Position QR codes within the scanning frame</li>
                  <li>• Hold steady until the code is processed</li>
                  <li>• Items will automatically appear in the bill</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Bill Section */}
          <div className="space-y-4">
            {/* Bill Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Current Bill
                </h2>
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {billNumber}
                </span>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <User className="w-3 h-3 inline mr-1" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter name (Optional)"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Phone className="w-3 h-3 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone (Optional)"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{billItems.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">Rs {billTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
              
              {billItems.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {billItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.productName}</h4>
                          <p className="text-xs text-gray-500">Rs {item.salePrice} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 text-xs"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 text-xs"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <p className="font-semibold text-sm">Rs {(item.quantity * item.salePrice).toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeBillItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Scan products to add items</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={clearBill}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={billItems.length === 0}
                >
                  <Trash2 size={16} />
                  Clear
                </button>
                <button
                  onClick={() => setShowBillModal(true)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={billItems.length === 0}
                >
                  <Calculator size={16} />
                  Review
                </button>
                <button
                  onClick={finalizeBill}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={billItems.length === 0}
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden QR Reader */}
      <div style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none', position: 'absolute', height: 0, width: 0 }}>
        {cameraActive && (
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
        )}
      </div>

      {/* Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bill Review</h2>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Customer Details */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bill Items */}
              {billItems.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Bill Items</h3>
                  <div className="space-y-3">
                    {billItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <p className="text-sm text-gray-500">Rs {item.salePrice} each</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-lg font-medium w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="font-semibold">Rs {(item.quantity * item.salePrice).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeBillItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total Amount:</span>
                      <span>Rs {billTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No items in bill. Scan products to add them.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Continue Shopping
                </button>
                {billItems.length > 0 && (
                  <button
                    onClick={finalizeBill}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Printer size={16} />
                    Finish & Print
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingScanner;