import { FilmStrip } from "./components/FilmStrip";
import { FoundingOffer } from "./components/FoundingOffer";
import { HeroMockup } from "./components/HeroMockup";
import { Logo } from "./components/Logo";
import { ParallaxText } from "./components/ParallaxText";
import { PhoneMockup } from "./components/PhoneMockup";
import { Pricing } from "./components/Pricing";
import { Reveal } from "./components/Reveal";
import { WaitlistForm } from "./components/WaitlistForm";

const MOCKUPS = [
  {
    src: "/phase_view.png",
    alt: "Phase view showing a vertical grid of photos with a voice-note marker",
    caption: "01 — Phases, day by day",
    slot: "Slot 01 — phase view",
  },
  {
    src: "/film_signature.png",
    alt: "Camera screen with film stock selector",
    caption: "02 — Camera styles",
    slot: "Slot 02 — camera styles",
  },
  {
    src: "/roll_call.png",
    alt: "Roll Call screen with contributor avatars",
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
              <div className="hero-copy measure-52">
                <p className="hero-caption mute">
                  Create a Phase for a chapter of your life like{" "}
                  <span className="border-l-2 border-amber-500 pl-1 font-medium text-amber-500">
                    Our First Home
                  </span>{" "}
                  or{" "}
                  <span className="border-l-2 border-orange-500 pl-1 font-medium text-orange-500">
                    My Fitness Journey
                  </span>
                  . Save photos, videos, and voice notes along the way, then
                  return anytime to relive the story.
                </p>
                <p className="hero-positioning">
                  <strong className="font-medium">
                    PhaseRoll brings photo albums, journaling, and planning together in one memory app.
                  </strong>
                </p>
              </div>
              <FoundingOffer />
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
                An album is a folder of media. A Phase is a memory journal for
                a meaningful part of your life. It keeps the photos and videos,
                but also the story, milestones, feelings, and voices that give
                them meaning.
              </p>
              <div className="difference-grid">
                <article className="difference-card difference-card--album shadow-lg shadow-black/5">
                  <p className="caption">A photo album</p>
                  <h3>Media grouped in one place</h3>
                  <p>
                    Useful for finding photos and videos later, usually by
                    person, event, or date.
                  </p>
                </article>
                <article className="difference-card difference-card--phase shadow-lg shadow-black/5">
                  <p className="caption">A Phase</p>
                  <h3>A chapter you can return to</h3>
                  <p>
                    Give it a title, cover, and sub-phases.
                    Add media, voice, journal entries, milestones, deadlines,
                    and mood emoji as life unfolds.
                  </p>
                  <p className="difference-tier">
                    <strong>Free:</strong> photos, videos, and voice notes.
                  </p>
                  <p className="difference-tier">
                    <strong>Pro:</strong> notes, journal entries, milestones,
                    deadlines, and mood emoji.
                  </p>
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
                Start with one Phase. Create as many as you need while life
                unfolds. PhaseRoll keeps every story ready to revisit.
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
                      Capture photos and videos, then record voice notes over
                      them. With Pro, add journal entries, milestones,
                      deadlines, and mood emoji.
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
                Keep the media for free. Add the journal, progress, and
                reflection around it with Pro.
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
                We don&rsquo;t <span className="em">keep</span> your photos or voice
                notes.
              </h2>
              <p className="body mute measure-60">
                Your photos and voice notes stay together in the storage your
                device already uses. PhaseRoll helps you shape the story
                without keeping a copy of either.
              </p>
              <aside className="storage-note">
                <div className="storage-note__heading">
                  <h3>Bring your own cloud</h3>
                  <span>Coming soon</span>
                </div>
                <p>
                  For now, photos and voice notes remain in iCloud on Apple
                  devices and in local device storage on Android. Bring your
                  own cloud support is coming soon.
                </p>
              </aside>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <Pricing />
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
