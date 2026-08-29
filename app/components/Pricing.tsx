import { MARKET_PRICING, type PricingMarket } from "../pricing";

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

function proFeatures(memoryBookPrice: string): Feature[] {
  return [
  { name: "Everything in Free" },
  { name: "Unlimited Phases and sub-phases" },
  { name: "Journal entries and milestones" },
  {
    name: "Nostalgic Camera Styles",
    description: "Dad's Camcorder, Kodak Gold, and Disposable",
  },
  { name: "Five Phase Recaps each month", comingSoon: true },
  {
    name: "Future Capsules",
    description:
      "Schedule letters, videos, and voice recordings to open on a meaningful future date. Can be sent to yourself or a loved one.",
    comingSoon: true,
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
      `Turn a completed Phase into a designed story with captions, milestones, transcripts, and quotes. Permanent copies are just ${memoryBookPrice}.`,
    comingSoon: true,
  },
  { name: "Bring your own cloud", comingSoon: true },
  ];
}

function plansForMarket(market: PricingMarket): Plan[] {
  const pricing = MARKET_PRICING[market];

  return [
  {
    name: "Free",
    price: pricing.free,
    cadence: "forever",
    features: [
      { name: "Two active Phases" },
      { name: "Add unlimited photos and videos" },
      { name: "Behind the Memory, in text or voice" },
      {
        name: "Camera Styles",
        description: "Original and Everyday Film",
      },
    ],
  },
  {
    name: "Pro monthly",
    price: pricing.proMonthly,
    cadence: "per month",
    features: proFeatures(pricing.memoryBook),
  },
  {
    name: "Pro annual",
    price: pricing.proAnnual,
    cadence: "per year",
    equivalent: pricing.proAnnualEquivalent,
    features: proFeatures(pricing.memoryBook),
    badge: "Best value",
    featured: true,
  },
  {
    name: "Founder's Pass",
    price: pricing.founder,
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
}

type PricingProps = {
  market: PricingMarket;
};

export function Pricing({ market }: PricingProps) {
  const pricing = MARKET_PRICING[market];
  const plans = plansForMarket(market);

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
            nostalgic Camera Styles, journals, milestones, and richer ways to
            preserve a Phase.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
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
              {pricing.rollCall} <span>per event</span>
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