type Feature = {
  name: string;
  description?: string;
  comingSoon?: boolean;
  href?: string;
  linkLabel?: string;
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

const PRO_FEATURES: Feature[] = [
  { name: "Everything in Free" },
  { name: "Unlimited Phases and sub-phases" },
  { name: "Journal entries and milestones" },
  { name: "Every camera style" },
  { name: "Five Phase Recaps each month" },
  {
    name: "Future Capsules",
    description:
      "Schedule letters, videos, and voice recordings to open on a meaningful future date.",
  },
  {
    name: "Shared Phases",
    description:
      "Invite another PhaseRoll user into a specific Phase so you can contribute together.",
    comingSoon: true,
  },
  {
    name: "Phase Memory Books",
    description:
      "Turn a completed Phase into a designed story with captions, milestones, transcripts, and quotes. Permanent copies are just $15.",
    comingSoon: true,
  },
  { name: "Bring your own cloud", comingSoon: true },
];

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    features: [
      { name: "Two active Phases" },
      { name: "Add unlimited photos and videos" },
      { name: "Behind the Memory, in text or voice" },
      { name: "Few camera styles" },
    ],
  },
  {
    name: "Pro monthly",
    price: "$6",
    cadence: "per month",
    features: PRO_FEATURES,
  },
  {
    name: "Pro annual",
    price: "$48",
    cadence: "per year",
    equivalent: "$4 per month",
    features: PRO_FEATURES,
    badge: "Best value",
    featured: true,
  },
  {
    name: "Founder's Pass",
    price: "$100",
    cadence: "once",
    features: [
      { name: "Everything in Pro for life" },
      {
        name: "One complimentary ",
        href: "#roll-call",
        linkLabel: "Roll Call",
      },
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
            Photos, videos, and the stories behind them are free. Go Pro for
            journals, milestones, Phase Recaps, and richer ways to preserve a Phase.
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
                      <span className="price-card__feature-heading">
                        {feature.href ? (
                          <span>
                            {feature.name}
                            <a href={feature.href}>
                              {feature.linkLabel ?? feature.name}
                            </a>
                          </span>
                        ) : (
                          <span>{feature.name}</span>
                        )}
                        {feature.comingSoon ? (
                          <span className="price-card__feature-badge">
                            Coming soon
                          </span>
                        ) : null}
                      </span>
                      {feature.description ? (
                        <span className="price-card__feature-description">
                          {feature.description}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <article className="roll-call-offer" id="roll-call">
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