type Feature = {
  name: string;
  comingSoon?: boolean;
};

type Plan = {
  name: string;
  price: string;
  cadence: string;
  equivalent?: string;
  features: Feature[];
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
      { name: "Two active phases" },
      { name: "Voice memories included" },
      { name: "One AI recap to try" },
    ],
  },
  {
    name: "Pro monthly",
    price: "$6",
    cadence: "per month",
    features: [
      { name: "Unlimited phases" },
      { name: "Every camera style" },
      { name: "Five AI recaps each month" },
      { name: "Shared phases", comingSoon: true },
      { name: "Bring your own cloud", comingSoon: true },
    ],
  },
  {
    name: "Pro annual",
    price: "$48",
    cadence: "per year",
    equivalent: "$4 per month",
    features: [
      { name: "Unlimited phases" },
      { name: "Every camera style" },
      { name: "Five AI recaps each month" },
      { name: "Shared phases", comingSoon: true },
      { name: "Bring your own cloud", comingSoon: true },
    ],
    badge: "Best value",
    featured: true,
  },
  {
    name: "Founder's Pass",
    price: "$100",
    cadence: "once",
    features: [
      { name: "Pro access for life" },
      { name: "Five AI recaps each month" },
      { name: "One complimentary Roll Call" },
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
                  <li key={feature.name}>
                    <span className="price-card__feature-copy">
                      <span>{feature.name}</span>
                      {feature.comingSoon ? (
                        <span className="price-card__feature-badge">
                          Coming soon
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <article className="roll-call-offer">
          <div className="roll-call-offer__story">
            <span className="roll-call-offer__label">Roll Call</span>
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
              $25 <span>per event</span>
            </p>
            <p>Up to 50 contributors. One shared album. Guests join free.</p>
          </div>
        </article>
      </div>
    </section>
  );
}