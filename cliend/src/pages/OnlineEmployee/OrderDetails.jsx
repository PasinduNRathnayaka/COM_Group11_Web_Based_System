import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";

const OrderDetails = () => {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/api/orderdetails/${id}")
      .then(res => setOrderDetails(res.data))
      .catch(err => console.error(err));
  }, [id]);

   if (!orderDetails) return <div className="p-4">Loading...</div>;

   const { customer, shipping, payment, products, status, startDate, endDate } = orderDetails;

  const subtotal = products.reduce((sum, p) => sum + p.total, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Order Details</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Order Details</p>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order ID: #{orderDetails._id}</h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{orderDetails.status}</span>
      </div>

      <div className="text-sm text-gray-500 mb-6">
         {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Customer</h4>
           <p>Full Name: {customer.fullName}</p>
            <p>Email: {customer.email}</p>
            <p>Phone: {customer.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Order Info</h4>
            <p>Shipping: {shipping.method}</p>
            <p>Payment Method: {payment.method}</p>
            <p>Status: {status}</p>
            <Button className="mt-2 w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" /> Download info
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Deliver to</h4>
            <p>Address: {shipping.address}</p>

          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Payment Info</h4>
            <p>💳 {payment.method} **** **** {payment.cardLast4}</p>
            <p>Business name: {payment.businessName}</p>
            <p>Phone: {payment.phone}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Note</h4>
            <Textarea placeholder="Type some notes" defaultValue={orderDetails.note || ""} />
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
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2">{item.orderId}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">Rs:{item.total.toFixed(2)}</td>
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