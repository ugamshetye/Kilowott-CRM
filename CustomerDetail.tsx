import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCustomer, useOrdersByCustomerId } from "@/hooks/useWooCommerce";
import type { WooCustomer, WooOrder } from "@/api/woocommerce";
import SegmentBadge from "@/components/ui/SegmentBadge";
import { ArrowLeft, Mail, Phone, MapPin, Brain, Send } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function CustomerDetail() {
  const { id } = useParams();
  const customerId = Number(id);
  const navigate = useNavigate();
  const customerQuery = useCustomer(customerId);
  const orderQuery = useOrdersByCustomerId(customerId);
  const customer = customerQuery.data as WooCustomer | undefined;
  const orders = orderQuery.data as WooOrder[] | undefined;
  const { isLoading: customerLoading, isError: customerError } = customerQuery;
  const { isLoading: ordersLoading, isError: ordersError } = orderQuery;
  const [showMessageGen, setShowMessageGen] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");

  if (!id || Number.isNaN(customerId)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Invalid customer ID.</p>
        <button onClick={() => navigate("/customers")} className="mt-4 text-ai-purple underline text-sm">Back to customers</button>
      </div>
    );
  }

  if (customerLoading || ordersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (customerError || ordersError) {
    return <div className="p-6 text-red-500">Failed to load customer data. Please try again later.</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Customer not found.</p>
        <button onClick={() => navigate("/customers")} className="mt-4 text-ai-purple underline text-sm">Back to customers</button>
      </div>
    );
  }

  const handleGenerateMessage = () => {
    const templates: Record<string, string> = {
      loyal: `Hi ${customer.first_name}! 🎉\n\nAs one of our most valued customers, we'd love to offer you an exclusive 15% VIP discount on your next purchase.\n\nYour loyalty means the world to us. Use code VIP${customer.id}15 at checkout.\n\nThank you for being amazing!\n— The NexCart Team`,
      at_risk: `Hi ${customer.first_name},\n\nWe've missed you! It's been a while since your last visit, and we wanted to check in.\n\nHere's a special 20% welcome-back discount just for you: COMEBACK${customer.id}20\n\nWe've added exciting new products we think you'll love.\n\nHope to see you soon!\n— The NexCart Team`,
      new: `Welcome to our family, ${customer.first_name}! 🌟\n\nThank you for your recent purchase. We're thrilled to have you!\n\nAs a new customer, enjoy 10% off your next order with code NEW${customer.id}10.\n\nNeed any help? We're always here for you.\n\nCheers!\n— The NexCart Team`,
    };
    setGeneratedMessage(templates[customer.segment] || templates.new);
    setShowMessageGen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <button onClick={() => navigate("/customers")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{customer.first_name} {customer.last_name}</h2>
              <SegmentBadge segment={customer.segment} />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> {customer.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /> {customer.billing.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {customer.billing.city}, {customer.billing.country}</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-lg font-bold font-display">{customer.orders_count}</p>
              <p className="text-[10px] text-muted-foreground">Orders</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-lg font-bold font-display">₹{parseFloat(customer.total_spent).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Spent</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-lg font-bold font-display">{customer.churn_risk}%</p>
              <p className="text-[10px] text-muted-foreground">Churn Risk</p>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendation */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6 border-l-4 border-l-ai-purple lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-ai-purple" />
            <h3 className="font-display font-semibold">AI Recommendation</h3>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full ai-gradient text-accent-foreground font-semibold">AI</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{customer.ai_recommendation}</p>
          <button
            onClick={handleGenerateMessage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg ai-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" /> Generate Smart Message
          </button>

          {showMessageGen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">✨ AI-Generated Message</p>
                <pre className="text-sm whitespace-pre-wrap font-sans">{generatedMessage}</pre>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Copy to Clipboard</button>
                  <button className="px-3 py-1.5 rounded-lg bg-loyal text-accent-foreground text-xs font-medium">Send via Email</button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Order History */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
        <h3 className="font-display font-semibold text-lg mb-4">Order History</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found for this customer in recent data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left pb-3">Order</th>
                  <th className="text-left pb-3">Date</th>
                  <th className="text-left pb-3">Items</th>
                  <th className="text-right pb-3">Total</th>
                  <th className="text-right pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="py-3 font-medium">#{o.id}</td>
                    <td className="py-3 text-muted-foreground">{format(new Date(o.date_created), "MMM d, yyyy")}</td>
                    <td className="py-3 text-muted-foreground">{o.line_items.map(i => i.name).join(", ")}</td>
                    <td className="py-3 text-right font-medium">₹{parseFloat(o.total).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        o.status === "completed" ? "bg-loyal-bg text-loyal" : o.status === "processing" ? "bg-ai-purple-light text-ai-purple" : "bg-new-badge-bg text-new-badge"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
