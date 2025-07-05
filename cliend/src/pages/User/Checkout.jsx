import React from 'react';

const Checkout = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 my-12 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Checkout</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Details */}
        <input type="text" placeholder="First Name" required className="p-3 rounded border" />
        <input type="text" placeholder="Last Name" required className="p-3 rounded border" />

        <input type="text" placeholder="Company Name (optional)" className="p-3 rounded border md:col-span-2" />
        <select required className="p-3 rounded border md:col-span-2">
          <option value="">Select Country</option>
          <option value="Sri Lanka">Sri Lanka</option>
        </select>

        <input type="text" placeholder="Street Address" required className="p-3 rounded border md:col-span-2" />
        <input type="text" placeholder="Town / City" required className="p-3 rounded border" />
        <input type="text" placeholder="ZIP Code" required className="p-3 rounded border" />
        <input type="text" placeholder="Phone Number" required className="p-3 rounded border" />
        <input type="email" placeholder="Email Address" required className="p-3 rounded border" />

        {/* Payment Method */}
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Select Payment Method:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" value="cash" defaultChecked />
              Cash on delivery
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" value="online" />
              Online Payment
            </label>
          </div>
        </div>

        {/* Additional Info */}
        <textarea
          placeholder="Order notes (optional)"
          className="md:col-span-2 p-3 rounded border"
        />

        <button
          type="submit"
          className="md:col-span-2 bg-black text-white py-3 rounded hover:bg-gray-800"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
