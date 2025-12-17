import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

const tiers = [
  {
    name: "Freelancer",
    id: "tier-freelancer",
    href: "#",
    priceMonthly: "$19",
    priceAnnually: "$190",
    description: "The essentials to provide your best work for clients.",
    features: [
      "5 products",
      "Up to 1,000 subscribers",
      "Basic analytics",
      "48-hour support response time",
    ],
    featured: false,
    ctaText: "Buy plan",
  },
  {
    name: "Startup",
    id: "tier-startup",
    href: "#",
    priceMonthly: "$29",
    priceAnnually: "$290",
    description: "A plan that scales with your rapidly growing business.",
    features: [
      "25 products",
      "Up to 10,000 subscribers",
      "Advanced analytics",
      "24-hour support response time",
      "Marketing automations",
    ],
    featured: true,
    badge: "Most popular",
    ctaText: "Buy plan",
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "#",
    priceMonthly: "$59",
    priceAnnually: "$590",
    description: "Dedicated support and infrastructure for your company.",
    features: [
      "Unlimited products",
      "Unlimited subscribers",
      "Advanced analytics",
      "1-hour, dedicated support response time",
      "Marketing automations",
      "Custom reporting tools",
    ],
    featured: false,
    ctaText: "Buy plan",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  return (
    <div className="bg-white dark:bg-gray-900 py-12 sm:py-20 lg:py-24 w-full min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main heading - responsive sizes */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            Pricing
          </h1>

          {/* Subheading - responsive sizes */}
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 sm:text-xl lg:mt-4">
            Pricing that grows with you
          </p>

          {/* Description - responsive sizes and line height */}
          <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg sm:leading-8 lg:mt-6">
            Choose an affordable plan that's packed with the best features for
            engaging your audience, creating customer loyalty, and driving
            sales.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={classNames(
                billingPeriod === "monthly"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 sm:px-4 sm:py-2"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("annually")}
              className={classNames(
                billingPeriod === "annually"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 sm:px-4 sm:py-2"
              )}
            >
              Annually
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured
                  ? "ring-2 ring-indigo-600 dark:ring-indigo-500"
                  : "ring-1 ring-gray-300 dark:ring-gray-700",
                "rounded-3xl p-6 bg-white dark:bg-gray-800 flex flex-col max-w-sm mx-auto sm:p-8 lg:p-10"
              )}
            >
              {/* Badge for featured tier - responsive padding */}
              {tier.badge && (
                <div className="inline-flex items-center justify-center mb-2 sm:mb-4">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300 sm:text-sm">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier Name - responsive sizes */}
              <div className="mt-2 sm:mt-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {tier.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:mt-3 sm:text-base">
                  {tier.description}
                </p>
              </div>

              {/* Price - responsive sizes */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    {billingPeriod === "monthly"
                      ? tier.priceMonthly
                      : tier.priceAnnually}
                  </span>
                  <span className="ml-2 text-base font-medium text-gray-600 dark:text-gray-400 sm:text-lg">
                    {billingPeriod === "monthly" ? "/month" : "/year"}
                  </span>
                </div>
                {billingPeriod === "annually" && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:mt-2">
                    Billed annually
                  </p>
                )}
              </div>

              {/* CTA Button - responsive padding */}
              <a
                href={tier.href}
                className={classNames(
                  tier.featured
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                    : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 focus-visible:outline-gray-900",
                  "mt-6 block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-8 sm:py-3 sm:text-base"
                )}
              >
                {tier.ctaText}
              </a>

              {/* Features List - responsive spacing and text */}
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400 flex-1 sm:mt-10 sm:space-y-4 sm:text-base"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={classNames(
                        tier.featured
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400 dark:text-gray-500",
                        "h-5 w-5 flex-none mt-0.5 sm:h-6 sm:w-6"
                      )}
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Optional: Add "Everything in previous tier" for higher tiers */}
              {tier.name === "Startup" && (
                <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 sm:mt-8 sm:text-sm">
                  All features from Freelancer, plus...
                </p>
              )}
              {tier.name === "Enterprise" && (
                <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 sm:mt-8 sm:text-sm">
                  All features from Startup, plus...
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Additional note - responsive text */}
        <div className="mt-12 text-center sm:mt-16 lg:mt-20">
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            All plans come with a 30-day money-back guarantee. No credit card
            required to start.
          </p>
        </div>
      </div>
    </div>
  );
}
