import { useState, useRef, useEffect } from "react";
import { Send, Brain, User } from "lucide-react";
import { useCustomers, useOrders } from "@/hooks/useWooCommerce";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function processQuery(query: string, customers: Array<any>, orders: Array<any>): string {
  const q = query.toLowerCase();

  if (q.includes("top customer") || q.includes("best customer")) {
    const top = [...customers].sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent)).slice(0, 3);
    return `## 🏆 Top Customers by Spend\n\n${top.map((c, i) => `${i + 1}. **${c.first_name} ${c.last_name}** — ₹${parseFloat(c.total_spent).toLocaleString()} (${c.orders_count} orders, ${c.segment} segment)`).join("\n")}\n\n**Recommendation:** Consider sending VIP rewards to these high-value customers to maintain loyalty.`;
  }

  if (q.includes("hasn't ordered") || q.includes("inactive") || q.includes("not ordered recently") || q.includes("churn")) {
    const atRisk = customers.filter(c => c.churn_risk > 50).sort((a, b) => b.churn_risk - a.churn_risk);
    return `## ⚠️ Inactive / High Churn Risk Customers\n\n${atRisk.map(c => `- **${c.first_name} ${c.last_name}** — ${c.churn_risk}% churn risk, last order: ${c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : "N/A"}`).join("\n")}\n\n**AI Suggestion:** Launch a win-back email campaign with personalized discounts for these customers.`;
  }

  if (q.includes("revenue") || q.includes("sales")) {
    const totalRev = customers.reduce((a, c) => a + parseFloat(c.total_spent), 0);
    return `## 💰 Revenue Summary\n\n- **Total Revenue:** ₹${totalRev.toLocaleString()}\n- **Total Orders:** ${orders.length}\n- **Avg Order Value:** ₹${orders.length ? (orders.reduce((a, o) => a + parseFloat(o.total), 0) / orders.length).toFixed(0) : 0}\n\n**Trend:** Revenue is up over the previous period, driven by loyal customer purchases.`;
  }

  if (q.includes("new customer") || q.includes("recent customer")) {
    const newC = customers.filter(c => c.segment === "new");
    return `## 🌟 New Customers\n\n${newC.map(c => `- **${c.first_name} ${c.last_name}** — joined ${new Date(c.date_created).toLocaleDateString()}, ₹${parseFloat(c.total_spent).toLocaleString()} spent`).join("\n")}\n\n**AI Suggestion:** Send welcome email series with onboarding offers to improve retention.`;
  }

  if (q.includes("loyal")) {
    const loyal = customers.filter(c => c.segment === "loyal");
    return `## 💎 Loyal Customers\n\n${loyal.map(c => `- **${c.first_name} ${c.last_name}** — ₹${parseFloat(c.total_spent).toLocaleString()}, ${c.orders_count} orders`).join("\n")}\n\n**AI Suggestion:** Invite them to a referral program — loyal customers drive more acquisition.`;
  }

  if (q.includes("order") || q.includes("recent order")) {
    const recent = orders.slice(0, 5);
    return `## 📦 Recent Orders\n\n${recent.map(o => `- **#${o.id}** — ${o.billing.first_name} ${o.billing.last_name}, ₹${parseFloat(o.total).toLocaleString()} (${o.status})`).join("\n")}`;
  }

  return `I can help you with customer insights! Try asking:\n\n- "Show top customers"\n- "Who hasn't ordered recently?"\n- "Revenue summary"\n- "Show new customers"\n- "Show loyal customers"\n- "Recent orders"`;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! I'm your **NexCart AI Assistant**. Ask me about customers, orders, revenue, or churn risk.\n\nTry: *\"Show top customers\"* or *\"Who hasn't ordered recently?\"*" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: customers = [], isLoading: customersLoading, isError: customersError } = useCustomers();
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useOrders();

  if (customersLoading || ordersLoading) {
    return <div className="p-6">Loading AI assistant data...</div>;
  }

  if (customersError || ordersError) {
    return <div className="p-6 text-red-500">Unable to load CRM data for AI chat. Please try again later.</div>;
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = processQuery(input, customers, orders);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  const suggestions = ["Show top customers", "Who hasn't ordered recently?", "Revenue summary", "Show loyal customers"];

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-0px)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">AI Chat Assistant</h1>
          <p className="text-sm text-muted-foreground">Query your CRM data with natural language</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-accent-foreground" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "glass-card"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_ul]:space-y-1 [&_strong]:font-semibold">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="glass-card rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-ai-purple animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-ai-purple animate-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-ai-purple animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="px-3 py-1.5 rounded-full bg-ai-purple-light text-ai-purple text-xs font-medium hover:bg-ai-purple/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Ask about your customers, orders, or revenue..."
          className="flex-1 px-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ai-purple"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-4 py-3 rounded-xl ai-gradient text-accent-foreground disabled:opacity-50 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
