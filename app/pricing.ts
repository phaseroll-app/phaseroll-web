export type PricingMarket = "global" | "india";

const SHOW_INR_PRICING = false;

export const MARKET_PRICING = {
  global: {
    free: "$0",
    proMonthly: "$6",
    proAnnual: "$48",
    proAnnualEquivalent: "$4 per month",
    founder: "$100",
    memoryBook: "$15",
    rollCall: "$25",
  },
  india: {
    free: "₹0",
    proMonthly: "₹249",
    proAnnual: "₹1,999",
    proAnnualEquivalent: "₹167 per month",
    founder: "₹2,999",
    memoryBook: "₹599",
    rollCall: "₹599",
  },
} as const;

export function pricingMarketForCountry(
  countryCode: string | null,
): PricingMarket {
  // Keep the regional catalog ready while public pricing is temporarily USD-only.
  return SHOW_INR_PRICING && countryCode?.toUpperCase() === "IN"
    ? "india"
    : "global";
}