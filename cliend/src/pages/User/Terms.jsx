import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Navigate } from 'react-router-dom';

const Terms = () => {
  const { user } = useAppContext();

  return (
    <div>
      {/* Header Section */}
      <div className="bg-blue-500 text-white py-12 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 rounded-b-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-lg opacity-90">Terms of service for using our website and services</p>
          <p className="text-sm opacity-75 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white py-12 px-4 md:px-20">
        <div className="max-w-4xl mx-auto prose prose-lg">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using the Kamal Auto Parts website and services, you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, please do not 
              use this service.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily download one copy of the materials on Kamal Auto Parts' website 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer 
              of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
            <p className="text-gray-600 mt-4">
              This license shall automatically terminate if you violate any of these restrictions and may be 
              terminated by Kamal Auto Parts at any time.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Account Registration</h2>
            <p className="text-gray-600 mb-4">
              To access certain features of our service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Product Information and Pricing</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide accurate product descriptions and pricing information. However:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We do not warrant that product descriptions or pricing are error-free</li>
              <li>We reserve the right to correct any errors, inaccuracies, or omissions</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to refuse or cancel orders for any reason</li>
              <li>All prices are in Sri Lankan Rupees (LKR) unless otherwise stated</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Order Process and Payment</h2>
            <p className="text-gray-600 mb-4">
              By placing an order, you agree to the following terms:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All orders are subject to acceptance and availability</li>
              <li>Payment must be made in full before order processing</li>
              <li>We accept various payment methods as displayed at checkout</li>
              <li>You are responsible for providing accurate delivery information</li>
              <li>Risk of loss and title for items passes to you upon delivery</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Shipping and Delivery</h2>
            <p className="text-gray-600 mb-4">
              Delivery terms and conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Shipping costs are calculated based on weight, size, and destination</li>
              <li>You must inspect items upon delivery and report any damage immediately</li>
              <li>We are not responsible for delays caused by factors beyond our control</li>
              <li>Additional charges may apply for remote or special delivery locations</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Returns and Warranties</h2>
            <p className="text-gray-600 mb-4">
              Return and warranty policies:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Returns must be initiated within 7 days of delivery</li>
              <li>Items must be in original condition with all packaging</li>
              <li>Electrical parts and custom orders are non-returnable</li>
              <li>Customer is responsible for return shipping costs unless item is defective</li>
              <li>Manufacturer warranties apply to all applicable products</li>
              <li>We provide additional warranty coverage as specified for each product</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Prohibited Uses</h2>
            <p className="text-gray-600 mb-4">
              You may not use our service:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Disclaimer</h2>
            <p className="text-gray-600">
              The materials on Kamal Auto Parts' website are provided on an 'as is' basis. Kamal Auto Parts makes 
              no warranties, expressed or implied, and hereby disclaims and negates all other warranties including 
              without limitation, implied warranties or conditions of merchantability, fitness for a particular 
              purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Limitations of Liability</h2>
            <p className="text-gray-600">
              In no event shall Kamal Auto Parts or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising out of the 
              use or inability to use the materials on our website, even if Kamal Auto Parts or its authorized 
              representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Governing Law</h2>
            <p className="text-gray-600">
              These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka. 
              Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction 
              of the courts of Sri Lanka.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-600">
              Kamal Auto Parts reserves the right to revise these terms of service at any time. By using this 
              website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;