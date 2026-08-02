type Plan = {
  name: string;
  price: string;
  cadence: string;
  equivalent?: string;
  features: string[];
  badge?: string;
  featured?: boolean;
  founding?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    features: [
      "Two active phases",
      "Voice memories included",
      "One AI recap to try",
    ],
    badge: "Start here",
  },
  {
    name: "Pro monthly",
    price: "$6",
    cadence: "per month",
    features: [
      "Unlimited phases",
      "Every film signature",
      "Five AI recaps each month",
    ],
    badge: "Flexible",
  },
  {
    name: "Pro annual",
    price: "$48",
    cadence: "per year",
    equivalent: "$4 per month",
    features: [
      "Unlimited phases",
      "Every film signature",
      "Five AI recaps each month",
    ],
    badge: "Best value",
    featured: true,
  },
  {
    name: "Founding Legacy",
    price: "$100",
    cadence: "once",
    features: [
      "Pro access for life",
      "Five AI recaps each month",
      "One Roll Call included",
    ],
    badge: "First 100 on waitlist",
    founding: true,
  },
];

export function Pricing() {
  return (
    <section
      className="frame pricing-frame on-ink"
      aria-labelledby="pricing-title"
    >
      <div className="frame__inner">
        <div className="pricing__intro">
          <h2 className="display-l" id="pricing-title">
            A plan for every <span className="em">budget.</span>
          </h2>
          <p className="body measure-52">
            Start free, step up to Pro, bring everyone into one Roll Call, or
            keep PhaseRoll for life as an early supporter.
          </p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <article
              className={`price-card${plan.featured ? " price-card--featured" : ""}${plan.founding ? " price-card--founding" : ""}`}
              key={plan.name}
            >
              <div className="price-card__topline">
                <h3 className="price-card__name">{plan.name}</h3>
                {plan.badge ? (
                  <span className="price-card__badge">{plan.badge}</span>
                ) : null}
              </div>
              <p className="price-card__price">
                {plan.price}
                <span>
                  {plan.cadence}
                  {plan.equivalent ? ` · ${plan.equivalent}` : ""}
                </span>
              </p>
              <ul className="price-card__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <article className="roll-call-offer">
          <div className="roll-call-offer__story">
            <h3 className="roll-call-offer__title">
              See the day through <span className="em">everyone&rsquo;s</span>{" "}
              eyes.
            </h3>
            <p>
              One person catches the vows. Another catches the laugh at the
              back of the room. Roll Call gathers every angle into one shared
              story, so the event feels whole when you return to it.
            </p>
          </div>
          <div className="roll-call-offer__terms">
            <p className="roll-call-offer__price">
              $20 <span>per event</span>
            </p>
            <p>Up to 50 contributors. One shared album. Guests join free.</p>
          </div>
        </article>
      </div>
    </section>
  );
}