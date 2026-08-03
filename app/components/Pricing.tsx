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
      { name: "Two active Phases" },
      { name: "Photos and videos included" },
      { name: "Voice notes on photos and videos" },
    ],
  },
  {
    name: "Pro monthly",
    price: "$6",
    cadence: "per month",
    features: [
      { name: "Everything in Free" },
      { name: "Unlimited Phases and sub-phases" },
      {
        name: "Notes, journal entries, milestones, and mood emoji",
      },
      { name: "Every camera style" },
      { name: "Three AI recaps each month" },
      { name: "Shared Phases", comingSoon: true },
      { name: "Bring your own cloud", comingSoon: true },
    ],
  },
  {
    name: "Pro annual",
    price: "$48",
    cadence: "per year",
    equivalent: "$4 per month",
    features: [
      { name: "Everything in Free" },
      { name: "Unlimited Phases and sub-phases" },
      {
        name: "Notes, journal entries, milestones, and mood emoji",
      },
      { name: "Every camera style" },
      { name: "Three AI recaps each month" },
      { name: "Shared Phases", comingSoon: true },
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
      { name: "Everything in Pro for life" },
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
            Photos, videos, and voice notes are free. Go Pro when you want to
            add journaling, milestones, progress tracking, and reflection.
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
            <span className="roll-call-offer__label">
              Roll Call
            </span>
            <h3 className="roll-call-offer__title">
              See the day through <span className="em">everyone&rsquo;s</span>{" "}
              eyes.
            </h3>
            <p>
              Create one shared album for an event and send guests a link.
              Everyone can add photos, videos, voice notes, and surprise notes
              (that unlock after the event), so every view and message stays
              together in one place.
            </p>
          </div>
          <div className="roll-call-offer__terms">
            <div className="roll-call-offer__stubhead">
              <span>Admit up to 50</span>
              <span>No. PR-001</span>
            </div>
            <p className="roll-call-offer__price">
              $25 <span>per event</span>
            </p>
            <p>
              Up to 50 contributors. Photos, videos, voice notes, and surprise
              notes. Guests join free.
            </p>
            <span className="roll-call-offer__barcode" aria-hidden="true" />
          </div>
        </article>
      </div>
    </section>
  );
}