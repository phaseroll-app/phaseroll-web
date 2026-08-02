import { FilmStrip } from "./components/FilmStrip";
import { FoundingOffer } from "./components/FoundingOffer";
import { HeroMockup } from "./components/HeroMockup";
import { Logo } from "./components/Logo";
import { ParallaxText } from "./components/ParallaxText";
import { PhoneMockup } from "./components/PhoneMockup";
import { Reveal } from "./components/Reveal";
import { WaitlistForm } from "./components/WaitlistForm";

const MOCKUPS = [
  {
    src: "/mockups/phase-view.png",
    alt: "Phase view showing a vertical grid of photos with a voice-note marker",
    caption: "01 — The phase view",
    slot: "Slot 01 — phase view",
  },
  {
    src: "/mockups/camera.png",
    alt: "Camera screen with film stock selector",
    caption: "02 — Film signatures",
    slot: "Slot 02 — film signatures",
  },
  {
    src: "/mockups/roll-call.png",
    alt: "Roll Call event screen with contributor avatars",
    caption: "03 — Roll Call",
    slot: "Slot 03 — Roll Call",
  },
];

export default function Home() {
  return (
    <>
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
              <p className="body mute measure-52">
                Organize your memories by life&rsquo;s chapters, not camera
                rolls. Capture photos, record voice memories, and relive what
                mattered.
              </p>
              <FoundingOffer />
              <WaitlistForm source="hero" note />
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
                Your camera roll has 10,000 photos and{" "}
                <span className="em">no story.</span>
              </h2>
              <p className="body mute measure-60">
                Years later, you won&rsquo;t look for a date. You&rsquo;ll look
                for your child&rsquo;s first steps, the trip you took with your
                partner, or the home where everything began. Memory keeps
                chapters. Your camera roll should too.
              </p>
            </div>
          </section>
        </Reveal>

        <section
          className="frame frame--ink film-section on-ink"
          aria-label="Why PhaseRoll"
        >
          <div className="frame__inner">
            <FilmStrip />
          </div>
        </section>

        <Reveal>
          <section
            className="frame mockups-frame"
            aria-labelledby="mockups"
          >
            <div className="frame__inner">
              <h2 className="display-l" id="mockups">
                A <span className="em">closer</span> look.
              </h2>
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

        <Reveal>
          <section
            className="frame privacy-frame"
            aria-labelledby="storage"
          >
            <div className="frame__inner stack">
              <h2 className="display-l" id="storage">
                We don&rsquo;t <span className="em">keep</span> your photos.
              </h2>
              <p className="body mute measure-60">
                They stay on your phone and in your own cloud. PhaseRoll holds
                the story, not the storage.
              </p>
            </div>
          </section>
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
              <FoundingOffer />
              <WaitlistForm source="waitlist" size="large" />
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="footer on-ink">
        <div className="footer__inner">
          <Logo className="footer__logo" />
          <div className="footer__bottom">
            <p className="footer__meta">© 2026 PhaseRoll</p>
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
