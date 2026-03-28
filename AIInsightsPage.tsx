import { Brain, AlertTriangle, TrendingUp, Lightbulb, Users, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SegmentBadge from "@/components/ui/SegmentBadge";
import { motion } from "framer-motion";
import { useCustomers } from "@/hooks/useWooCommerce";

export default function AIInsightsPage() {
  const navigate = useNavigate();
  const { data: customers, isLoading, isError, error } = useCustomers();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load AI insights. {(error as Error)?.message || "Please try again later."}</div>;
  }

  const atRiskCustomers = (customers ?? []).filter(c => c.segment === "at_risk").sort((a, b) => b.churn_risk - a.churn_risk);
  const topCustomers = (customers ?? []).filter(c => c.segment === "loyal").sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent));
  const newCustomers = (customers ?? []).filter(c => c.segment === "new");
  const loyalCount = (customers ?? []).filter(c => c.segment === "loyal").length;
  const atRiskCount = atRiskCustomers.length;
  const newCount = newCustomers.length;

  const insights = [
    {
      type: "warning" as const,
      title: `${atRiskCount} customers at high churn risk`,
      description: `${atRiskCount} customers have not ordered recently or have low activity. Send win-back campaigns to reduce churn.`,
    },
    {
      type: "success" as const,
      title: `${loyalCount} loyal customers driving revenue`,
      description: `${loyalCount} customers have spent over ₹8,000. Offer VIP promotions to keep them engaged.`,
    },
    {
      type: "info" as const,
      title: `${newCount} new customers this period`,
      description: `${newCount} customers are new. Start onboarding sequences to build loyalty quickly.`,
    },
    {
      type: "tip" as const,
      title: "Focus on cross-sell opportunities",
      description: "Customers in the loyal segment respond well to premium offers and bundles. Add AI-driven promotions to your next campaign.",
    },
  ];

  const iconMap = { warning: AlertTriangle, success: TrendingUp, info: Users, tip: Lightbulb };
  const colorMap = {
    warning: "text-risk bg-risk-bg",
    success: "text-loyal bg-loyal-bg",
    info: "text-ai-teal bg-ai-teal-light",
    tip: "text-ai-purple bg-ai-purple-light",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Actionable intelligence powered by AI</p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[insight.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At Risk */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-risk">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-risk" />
            <h3 className="font-display font-semibold text-lg">At-Risk Customers</h3>
          </div>
          <div className="space-y-3">
            {atRiskCustomers.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-muted-foreground">{c.ai_recommendation}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-risk">{c.churn_risk}% risk</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-loyal">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-loyal" />
            <h3 className="font-display font-semibold text-lg">Top Customers</h3>
          </div>
          <div className="space-y-3">
            {topCustomers.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-muted-foreground">{c.orders_count} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">₹{parseFloat(c.total_spent).toLocaleString()}</span>
                  <SegmentBadge segment={c.segment} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
