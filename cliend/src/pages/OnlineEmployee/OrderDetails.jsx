import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Printer, Download } from "lucide-react";

const OrderDetails = () => {
  const products = Array(4).fill({
    name: 'Lorem Ipsum',
    orderId: '#25421',
    quantity: 2,
    total: 'Rs:800.40',
  });

  const subtotal = 3201.6;
  const tax = 640.32;
  const total = subtotal + tax;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Order Details</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Order Details</p>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order ID: #6743</h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Pending</span>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Feb 16, 2025 - Feb 20, 2025
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Customer</h4>
            <p>Full Name: Shristi Singh</p>
            <p>Email: shristi@kamal.com</p>
            <p>Phone: +91 904 231 1212</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Order Info</h4>
            <p>Shipping: Next express</p>
            <p>Payment Method: Paypal</p>
            <p>Status: Pending</p>
            <Button className="mt-2 w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" /> Download info
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Deliver to</h4>
            <p>Address: Dharam Colony,</p>
            <p>Palam Vihar, Gurgaon, Haryana</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Payment Info</h4>
            <p>💳 Master Card **** **** 6557</p>
            <p>Business name: Shristi Singh</p>
            <p>Phone: +94 764 231 121</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Note</h4>
            <Textarea placeholder="Type some notes" />
          </CardContent>
        </Card>
        <div className="flex justify-end items-center">
          <Button variant="outline" className="mr-2">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button>Save</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-lg mb-4">Products</h4>
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-2"><input type="checkbox" /></th>
                <th className="p-2">Product Name</th>
                <th className="p-2">Order ID</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2"><input type="checkbox" /></td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.orderId}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-full sm:w-1/3 text-sm text-right space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span><span>Rs:{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (20%)</span><span>Rs:{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span><span>Rs:0</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Rate</span><span>Rs:0</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-black">
                <span>Total</span><span>Rs:{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
  
    </div>
    
  );
};

export default OrderDetails;
