import { useOrders } from "@/hooks/useWooCommerce";
import { format } from "date-fns";

const statusClasses: Record<string, string> = {
  completed: "bg-loyal-bg text-loyal",
  processing: "bg-ai-purple-light text-ai-purple",
  pending: "bg-new-badge-bg text-new-badge",
  cancelled: "bg-risk-bg text-risk",
  refunded: "bg-muted text-muted-foreground",
};

export default function OrdersPage() {
  const { data: orders, isLoading, isError, error } = useOrders();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load orders. {(error as Error)?.message || "Please try again later."}</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders?.length ?? 0} orders from WooCommerce</p>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Items</th>
                <th className="text-right px-5 py-3">Total</th>
                <th className="text-right px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(orders ?? []).map(o => (
                <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 font-medium">#{o.id}</td>
                  <td className="px-5 py-3">{o.billing.first_name} {o.billing.last_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{format(new Date(o.date_created), "MMM d, yyyy h:mm a")}</td>
                  <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate">{o.line_items.map(i => i.name).join(", ")}</td>
                  <td className="px-5 py-3 text-right font-medium">₹{parseFloat(o.total).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusClasses[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
