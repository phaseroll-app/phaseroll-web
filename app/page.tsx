import { headers } from "next/headers";
import Image from "next/image";
import { FilmStrip } from "./components/FilmStrip";
import { FoundingOffer } from "./components/FoundingOffer";
import { HeroMockup } from "./components/HeroMockup";
import { Logo } from "./components/Logo";
import { ParallaxText } from "./components/ParallaxText";
import { PhoneMockup } from "./components/PhoneMockup";
import { Pricing } from "./components/Pricing";
import { Reveal } from "./components/Reveal";
import { WaitlistForm } from "./components/WaitlistForm";
import { MARKET_PRICING, pricingMarketForCountry } from "./pricing";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

const MOCKUPS = [
  {
    src: "/japan_trip_phase_view.png",
    alt: "Japan Trip Phase view with day-by-day photos, videos, voice recordings, and journal entries",
    caption: "01 — Phase View",
    slot: "Slot 01 — phase view",
  },
  {
    src: "/film_signature.png",
    alt: "Camera screen with film stock selector",
    caption: "02 — Camera styles",
    slot: "Slot 02 — camera styles",
  },
  {
    src: "/timeline.png",
    alt: "Day view showing multiple Phases with photos, videos, and personal notes",
    caption: "03 — Timeline",
    slot: "Slot 03 — timeline",
  },
];

export default async function Home() {
  const requestHeaders = await headers();
  const countryCode =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    process.env.PHASEROLL_PRICING_COUNTRY ??
    (process.env.NODE_ENV === "development" ? "IN" : null);
  const pricingMarket = pricingMarketForCountry(countryCode);
  const pricing = MARKET_PRICING[pricingMarket];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, Android",
    isAccessibleForFree: true,
    featureList: [
      "Photo and video memory journals",
      "Behind the Memory prompts for photos and videos",
      "Text or voice stories attached to media",
      "Pro journal entries and milestones",
      "Future Capsules",
      "Phase Memory Books",
      "Shared event albums with Roll Call",
    ],
    sameAs: [
      "https://x.com/phaseroll",
      "https://instagram.com/phaseroll",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <main id="main">
        <section className="frame hero" aria-labelledby="hero-title">
          <div className="frame__inner hero__inner">
            <ParallaxText className="hero__head">
              <Logo className="logo--hero" priority />
              <h1 className="display-xl hero__title" id="hero-title">
                <span className="motto-word">Remember</span>{" "}
                <span className="motto-word">life</span>{" "}
                <span className="motto-word">in</span>{" "}
                <span className="motto-word em">phases.</span>
              </h1>
              <div className="hero-copy measure-52">
                <p className="hero-caption mute">
                  Create a Phase for any chapter of your life like{" "}
                  <span className="border-l-2 border-pink-500 pl-1 font-medium text-pink-500">
                    Japan Trip 2026
                  </span>{" "}
                  or{" "}
                  <span className="border-l-2 border-orange-500 pl-1 font-medium text-orange-500">
                    Our First Home
                  </span>
                  . As the chapter unfolds, save the photos and videos you&rsquo;ll
                  want to return to, then add your own words or voice so you
                  never forget why each one mattered.
                </p>
              </div>
              <FoundingOffer price={pricing.founder} />
              <WaitlistForm source="hero" note />
              <aside className="hero-social">
                <p>
                  PhaseRoll is still becoming. Follow the story as we shape
                  what comes next.
                </p>
                <nav aria-label="Follow PhaseRoll">
                  <a
                    href="https://x.com/phaseroll"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow on X
                  </a>
                  <a
                    href="https://instagram.com/phaseroll"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow on Instagram
                  </a>
                </nav>
              </aside>
            </ParallaxText>

            <div className="hero__mockup">
              <HeroMockup {...MOCKUPS[0]} />
            </div>
          </div>
        </section>

        <Reveal>
          <section
            className="frame frame--center story-frame"
            aria-labelledby="problem"
          >
            <div className="frame__inner frame__inner--narrow">
              <h2 className="display-l" id="problem">
                Albums organize photos. PhaseRoll preserves{" "}
                <span className="em">why they mattered.</span>
              </h2>
              <p className="body mute measure-60">
                PhaseRoll brings photo albums, journaling, and progress tracking
                together in one memory app, preserving not just photos and
                videos, but the stories, milestones, and voices that
                give them meaning.
              </p>
              <div className="difference-grid">
                <article className="difference-card difference-card--album">
                  <div className="polaroid" aria-hidden="true">
                    <div className="polaroid__photo">
                      <Image
                        src="/japan_collage.jpg"
                        alt=""
                        fill
                        sizes="(min-width: 640px) 24rem, 82vw"
                      />
                    </div>
                    <p>Japan · Jan 2026</p>
                  </div>
                  <div className="difference-card__copy">
                    <p className="caption">A photo album</p>
                    <h3>Media grouped in one place</h3>
                    <p>
                      Useful for finding photos and videos later, usually by
                      person, event, or date.
                    </p>
                  </div>
                </article>
                <div className="difference-versus" aria-hidden="true">
                  <span>VS</span>
                </div>
                <article className="difference-card difference-card--phase">
                  <div className="phase-album" aria-hidden="true">
                    <div className="phase-album__rings">
                      {Array.from({ length: 10 }, (_, index) => (
                        <span key={index} className="phase-album__ring" />
                      ))}
                    </div>
                    <div className="phase-album__cover">
                      <div className="phase-album__image">
                        <Image
                          src="/fuji_album.jpg"
                          alt=""
                          fill
                          sizes="(min-width: 640px) 30rem, 88vw"
                        />
                      </div>
                      <div className="phase-album__details">
                        <p>Japan Trip 2026</p>
                        <span>873 memories · 12 journals · 6 milestones</span>
                      </div>
                    </div>
                  </div>
                  <div className="difference-card__copy">
                    <p className="caption">A Phase</p>
                    <h3>A chapter you can return to</h3>
                    <p>
                      A title, cover, story, and sub-phases, with the memories,
                      journals, and milestones that made the chapter yours.
                    </p>
                    <div className="difference-tiers">
                      <p className="difference-tier">
                        <strong>Free</strong>
                        <span>photos, videos, and Behind the Memory</span>
                      </p>
                      <p className="difference-tier">
                        <strong>Pro</strong>
                        <span>journals, milestones, and richer ways to preserve a Phase</span>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section
            className="frame mockups-frame"
            aria-labelledby="mockups"
          >
            <div className="frame__inner">
              <h2 className="display-l" id="mockups">
                Step inside <span className="em">PhaseRoll.</span>
              </h2>
              <p className="body mute measure-60 mockups-intro">
                Start with a chapter worth remembering. Add to it as life
                unfolds, then return anytime to see the whole story take shape.
              </p>
              <ol className="phase-flow" aria-label="How PhaseRoll works">
                <li className="phase-flow__step">
                  <span className="phase-flow__number">01</span>
                  <div>
                    <h3>Create a Phase</h3>
                    <p>
                      Choose a chapter worth remembering, like life in a new
                      city, a dream trip, or building something of your own.
                    </p>
                  </div>
                </li>
                <li className="phase-flow__step">
                  <span className="phase-flow__number">02</span>
                  <div>
                    <h3>Save what happens</h3>
                    <p>
                      Add the story behind your photos and videos. At day&rsquo;s
                      end, share what stayed with you in your own voice. A
                      question or two follows your story, then shapes your words
                      into a personal journal entry.
                    </p>
                  </div>
                </li>
                <li className="phase-flow__step">
                  <span className="phase-flow__number">03</span>
                  <div>
                    <h3>Relive it anytime</h3>
                    <p>
                      Open any Phase later to see, hear, and
                      relive the people, places, and moments that made it special.
                    </p>
                  </div>
                </li>
              </ol>
              <p className="caption mockups-label">Inside the app</p>
              <div
                className="mockups"
                tabIndex={0}
                role="group"
                aria-label="App screens"
              >
                {MOCKUPS.map((mockup, i) => (
                  <PhoneMockup
                    key={mockup.src}
                    {...mockup}
                    priority={i === 0}
                  />
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <section
          className="frame frame--ink film-section on-ink"
          aria-labelledby="features-title"
        >
          <div className="frame__inner">
            <div className="film-intro">
              <h2 className="display-l" id="features-title">
                Everything an album <span className="em">leaves out.</span>
              </h2>
              <p className="body measure-52">
                Keep each chapter together day by day, preserve the story
                behind every photo or video, and deepen it with sub-phases,
                guided journals, and milestones.
              </p>
            </div>
            <FilmStrip />
          </div>
        </section>

        <Reveal>
          <section
            className="frame privacy-frame"
            aria-labelledby="storage"
          >
            <div className="frame__inner stack">
              <h2 className="display-l" id="storage">
                Your memories <span className="em">stay yours.</span>
              </h2>
              <p className="body mute measure-60">
                Your photos, videos, text, and voice recordings stay in the
                storage your device already uses. PhaseRoll helps you shape the
                story without keeping a copy.
              </p>
              <aside className="storage-note">
                <div className="storage-note__heading">
                  <h3>Bring your own cloud</h3>
                  <span>Coming soon</span>
                </div>
                <p>
                  For now, your photos, videos, text, and voice recordings
                  remain in iCloud on Apple devices and in local device storage
                  on Android. Bring your own cloud support is coming soon.
                </p>
              </aside>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <Pricing market={pricingMarket} />
        </Reveal>

        <Reveal>
          <section
            className="frame waitlist-frame"
            id="waitlist"
            aria-labelledby="join"
          >
            <div className="frame__inner stack">
              <h2 className="display-l" id="join">
                Get the <span className="em">first</span> roll.
              </h2>
              <p className="body mute measure-60">
                Be among the first to turn your camera roll into chapters.
                Join the waitlist for early access.
              </p>
              <FoundingOffer price={pricing.founder} />
              <WaitlistForm source="waitlist" size="large" />
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="footer on-ink">
        <div className="footer__inner">
          <Logo className="footer__logo" />
          <div className="footer__bottom">
            <div className="footer__meta">
              <span>© 2026 PhaseRoll</span>
              <span>
                Created with <span aria-label="love">❤️</span> by{" "}
                <a
                  href="https://indrajitvijayakumar.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Indrajit
                </a>
              </span>
            </div>
            <ul className="footer__links">
              <li>
                <a
                  className="footer__link"
                  href="https://x.com/phaseroll"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @phaseroll on X
                </a>
              </li>
              <li>
                <a
                  className="footer__link"
                  href="https://instagram.com/phaseroll"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @phaseroll on Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
