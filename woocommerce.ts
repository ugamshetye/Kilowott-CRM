const API_BASE = "http://localhost:5000/wp-json/wc/v3";

// TYPES
export type CustomerSegment = "loyal" | "at_risk" | "new";

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: {
    phone: string;
    city: string;
    country: string;
  };
  date_created: string;
  orders_count: number;
  total_spent: string;
  last_order_date: string | null;
  segment: CustomerSegment;
  churn_risk: number;
  ai_recommendation: string;
}

export interface WooOrder {
  id: number;
  status: string;
  date_created: string;
  total: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: {
    name: string;
    quantity: number;
    total: string;
  }[];
}

// ------------------------
// HELPERS
// ------------------------

const parseNumber = (val: any) => parseFloat(val) || 0;

const getSegment = (customer: any, lastOrderDate: string | null): CustomerSegment => {
  const spent = parseNumber(customer.total_spent);

  if (spent > 8000) return "loyal";

  if (lastOrderDate) {
    const diffDays =
      (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 60) return "at_risk";
  }

  if (customer.orders_count <= 2) return "new";

  return "loyal";
};

const getChurnRisk = (segment: CustomerSegment) =>
  segment === "loyal" ? 10 : segment === "at_risk" ? 80 : 40;

const getAIRecommendation = (segment: CustomerSegment) =>
  segment === "loyal"
    ? "Offer VIP discount"
    : segment === "at_risk"
    ? "Send win-back campaign"
    : "Send onboarding offer";

// ------------------------
// API FETCH
// ------------------------

const safeFetch = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API Error");
  return res.json();
};

// ------------------------
// ORDERS
// ------------------------

export async function fetchOrders(): Promise<WooOrder[]> {
  const data = await safeFetch(`${API_BASE}/orders`);

  if (!Array.isArray(data)) return [];

  return data.map((o: any) => ({
    id: o.id,
    status: o.status || "pending",
    date_created: o.date_created,
    total: o.total || "0",
    customer_id: o.customer_id || 0,
    billing: {
      first_name: o.billing?.first_name || "",
      last_name: o.billing?.last_name || "",
      email: o.billing?.email || "",
    },
    line_items: Array.isArray(o.line_items)
      ? o.line_items.map((i: any) => ({
          name: i.name || "",
          quantity: i.quantity || 0,
          total: i.total || "0",
        }))
      : [],
  }));
}

// ------------------------
// CUSTOMERS
// ------------------------

export async function fetchCustomers(): Promise<WooCustomer[]> {
  const [customers, orders] = await Promise.all([
    safeFetch(`${API_BASE}/customers`),
    fetchOrders(),
  ]);

  if (!Array.isArray(customers)) return [];

  return customers.map((c: any) => {
    const customerOrders = orders.filter(o => o.customer_id === c.id);

    const lastOrder =
      customerOrders.length > 0
        ? customerOrders.sort(
            (a, b) =>
              new Date(b.date_created).getTime() -
              new Date(a.date_created).getTime()
          )[0].date_created
        : null;

    const segment = getSegment(c, lastOrder);

    return {
      id: c.id,
      email: c.email || "",
      first_name: c.first_name || "",
      last_name: c.last_name || "",
      billing: {
        phone: c.billing?.phone || "N/A",
        city: c.billing?.city || "N/A",
        country: c.billing?.country || "N/A",
      },
      date_created: c.date_created,
      orders_count: c.orders_count || 0,
      total_spent: c.total_spent || "0",
      last_order_date: lastOrder,
      segment,
      churn_risk: getChurnRisk(segment),
      ai_recommendation: getAIRecommendation(segment),
    };
  });
}

// ------------------------
// SINGLE CUSTOMER
// ------------------------

export async function fetchCustomerById(id: number): Promise<WooCustomer | null> {
  const customers = await fetchCustomers();
  return customers.find(c => c.id === id) || null;
}

// ------------------------
// CUSTOMER ORDERS
// ------------------------

export async function fetchOrdersByCustomerId(id: number): Promise<WooOrder[]> {
  const orders = await fetchOrders();
  return orders.filter(o => o.customer_id === id);
}