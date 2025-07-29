import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Navigate } from 'react-router-dom';

const Privacy = () => {
  const { user } = useAppContext();

  if (!user) return <Navigate to="/" replace />;

  return (
    <div>
      {/* Header Section */}
      <div className="bg-blue-500 text-white py-12 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 rounded-b-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Privacy Notice</h1>
          <p className="text-lg opacity-90">How we collect, use, and protect your information</p>
          <p className="text-sm opacity-75 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white py-12 px-4 md:px-20">
        <div className="max-w-4xl mx-auto prose prose-lg">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              At Kamal Auto Parts, we collect information to provide better services to our customers. 
              We collect the following types of information:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Name and contact information (email, phone number, address)</li>
              <li>Account credentials and preferences</li>
              <li>Payment and billing information</li>
              <li>Vehicle information for parts compatibility</li>
              <li>Communication history with our customer service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-700 mb-3">Usage Information</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Website browsing patterns and preferences</li>
              <li>Search queries and product interactions</li>
              <li>Device information and IP addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Personalizing your shopping experience</li>
              <li>Sending order confirmations, shipping updates, and important notices</li>
              <li>Improving our products, services, and website functionality</li>
              <li>Preventing fraud and ensuring account security</li>
              <li>Compliance with legal obligations</li>
              <li>Marketing communications (with your consent)</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>With service providers who assist in our operations (payment processors, shipping companies)</li>
              <li>When required by law or to protect our rights and safety</li>
              <li>With your explicit consent</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Encryption of sensitive data during transmission</li>
              <li>Secure servers and databases</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information by authorized personnel only</li>
              <li>Regular staff training on data protection practices</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              Our website uses cookies and similar technologies to enhance your browsing experience. 
              Cookies help us:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Remember your preferences and login information</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and recommendations</li>
              <li>Improve website functionality and performance</li>
            </ul>
            <p className="text-gray-600 mt-4">
              You can manage your cookie preferences through your browser settings.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access: Request information about the personal data we hold about you</li>
              <li>Correction: Request correction of inaccurate or incomplete information</li>
              <li>Deletion: Request deletion of your personal information (subject to legal requirements)</li>
              <li>Portability: Request a copy of your data in a structured format</li>
              <li>Withdrawal of consent: Opt-out of marketing communications at any time</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Data Retention</h2>
            <p className="text-gray-600">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
              privacy notice, comply with legal obligations, resolve disputes, and enforce our agreements. 
              Account information is retained while your account is active and for a reasonable period thereafter.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600">
              Our services are not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If we become aware that we have collected such 
              information, we will take steps to delete it promptly.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Changes to This Privacy Notice</h2>
            <p className="text-gray-600">
              We may update this privacy notice from time to time to reflect changes in our practices or legal 
              requirements. We will notify you of material changes by posting the updated notice on our website 
              and updating the "Last updated" date at the top of this page.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this privacy notice or our privacy practices, please contact us:
            </p>
            <div className="text-gray-700">
              <p><strong>Kamal Auto Parts</strong></p>
              <p>📍 No 128, Wewurukannala Road, Kekanadura, Sri Lanka</p>
              <p>📧 Email: kamalautoparts@gmail.com</p>
              <p>📞 Phone: +94 0777 555 919</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;