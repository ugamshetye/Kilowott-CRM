import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "@/hooks/useWooCommerce";
import SegmentBadge from "@/components/ui/SegmentBadge";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const navigate = useNavigate();
  const { data: customers, isLoading, isError, error } = useCustomers();

  const filtered = (customers ?? []).filter(c => {
    const matchesSearch = `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesSegment = filterSegment === "all" || c.segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load customers. {(error as Error)?.message || "Please try again later."}</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers?.length ?? 0} customers managed by NexCart</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {["all", "loyal", "at_risk", "new"].map(seg => (
            <button
              key={seg}
              onClick={() => setFilterSegment(seg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterSegment === seg ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {seg === "at_risk" ? "At Risk" : seg === "all" ? "All" : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-right px-5 py-3">Total Spend</th>
                <th className="text-left px-5 py-3">Last Order</th>
                <th className="text-center px-5 py-3">Segment</th>
                <th className="text-center px-5 py-3">Churn Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-medium">{c.first_name} {c.last_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3 text-right font-medium">₹{parseFloat(c.total_spent).toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.last_order_date ? format(new Date(c.last_order_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-5 py-3 text-center"><SegmentBadge segment={c.segment} /></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${c.churn_risk}%`,
                            backgroundColor: c.churn_risk > 60 ? "hsl(0, 84%, 60%)" : c.churn_risk > 30 ? "hsl(43, 96%, 56%)" : "hsl(142, 76%, 36%)",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{c.churn_risk}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
