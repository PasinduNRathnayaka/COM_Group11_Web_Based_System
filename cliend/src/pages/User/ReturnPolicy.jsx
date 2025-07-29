import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Navigate } from 'react-router-dom';

const ReturnPolicy = () => {
  const { user } = useAppContext();

  return (
    <div>
      {/* Header Section */}
      <div className="bg-blue-500 text-white py-12 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 rounded-b-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Return Policy</h1>
          <p className="text-lg opacity-90">Your satisfaction is our priority - Easy returns and exchanges</p>
          <p className="text-sm opacity-75 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white py-12 px-4 md:px-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Overview */}
          <div className="mb-8 bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Return Policy Overview</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              At Kamal Auto Parts, we want you to be completely satisfied with your purchase. If you're not 
              happy with your auto parts for any reason, we offer a hassle-free return policy within 
              <strong> 7 days</strong> of delivery for most items.
            </p>
          </div>

          {/* General Return Conditions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. General Return Conditions</h2>
            <p className="text-gray-600 mb-4">
              To be eligible for a return, your item must meet the following conditions:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Item must be unused and in the same condition as received</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Original packaging, labels, and accessories must be included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Return must be initiated within 7 days of delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Item must not be damaged by misuse or normal wear</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Original receipt or proof of purchase required</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Non-Returnable Items</h2>
            <p className="text-gray-600 mb-4">
              For safety and hygiene reasons, the following items cannot be returned:
            </p>
            <div className="bg-red-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span className="text-gray-700">Electrical components that have been installed or connected</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span className="text-gray-700">Brake pads, brake fluid, and other brake system components</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span className="text-gray-700">Engine oil, lubricants, and other fluids</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span className="text-gray-700">Custom-ordered or special-order parts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span className="text-gray-700">Items damaged by customer misuse or installation attempts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span className="text-gray-700">Items without original packaging or missing parts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How to Return */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How to Return Items</h2>
            <p className="text-gray-600 mb-4">
              Follow these simple steps to return your items:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-700 mb-3">Step 1: Contact Us</h3>
                <p className="text-gray-700 mb-2">Call us at <strong>+94 0777 555 919</strong> or email <strong>kamalautoparts@gmail.com</strong></p>
                <p className="text-gray-600 text-sm">Provide your order number and reason for return</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-700 mb-3">Step 2: Get Approval</h3>
                <p className="text-gray-700 mb-2">We'll verify your return eligibility</p>
                <p className="text-gray-600 text-sm">You'll receive a Return Authorization Number (RAN)</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-700 mb-3">Step 3: Package Item</h3>
                <p className="text-gray-700 mb-2">Pack the item securely in original packaging</p>
                <p className="text-gray-600 text-sm">Include all accessories and documentation</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-700 mb-3">Step 4: Ship or Drop Off</h3>
                <p className="text-gray-700 mb-2">Send to our address or visit our store</p>
                <p className="text-gray-600 text-sm">Include RAN with your return package</p>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Refund Process</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Processing Timeline</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Inspection:</strong> 1-2 business days after we receive your return</li>
                <li><strong>Approval:</strong> You'll be notified via email about the approval status</li>
                <li><strong>Refund:</strong> 3-5 business days after approval</li>
                <li><strong>Credit Card:</strong> May take additional 1-2 billing cycles to appear</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Refunds will be processed to the original payment method. 
                  If paying by cash, store credit or cash refund will be provided.
                </p>
              </div>
            </div>
          </div>

          {/* Exchange Policy */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Exchange Policy</h2>
            <p className="text-gray-600 mb-4">
              We gladly accept exchanges for the same item in different specifications or for items of equal value.
            </p>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Exchange Conditions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Same return conditions apply as listed above</li>
                <li>• Exchanges must be for items of equal or greater value</li>
                <li>• Price differences must be paid before shipping replacement</li>
                <li>• Exchange processing takes 3-7 business days</li>
                <li>• Customer pays shipping for exchange unless item was defective</li>
              </ul>
            </div>
          </div>

          {/* Shipping Costs */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Return Shipping Costs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Customer Responsibility</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Changed your mind</li>
                  <li>• Ordered wrong part</li>
                  <li>• No longer needed</li>
                  <li>• Better price found elsewhere</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Our Responsibility</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Item arrived damaged</li>
                  <li>• Wrong item shipped</li>
                  <li>• Manufacturing defect</li>
                  <li>• Our error in description</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Damaged Items */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Damaged or Defective Items</h2>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                If you receive a damaged or defective item, please contact us immediately:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Contact us within 24 hours of delivery</li>
                <li>• Provide photos of the damage or defect</li>
                <li>• Keep all original packaging</li>
                <li>• We'll arrange pickup or provide prepaid return label</li>
                <li>• Full refund or replacement will be provided promptly</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;