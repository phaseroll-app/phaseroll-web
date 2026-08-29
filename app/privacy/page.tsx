import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PhaseRoll",
  description: "How PhaseRoll collects, uses, stores, and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="info-page">
      <nav className="info-page__nav" aria-label="Back to PhaseRoll">
        <Link className="info-page__back" href="/">
          ← PhaseRoll
        </Link>
      </nav>

      <article className="info-page__content">
        <h1 className="display-l">Privacy Policy</h1>
        <p className="info-page__updated">Effective August 29, 2026</p>

        <section className="info-page__section">
          <h2>Overview</h2>
          <p>
            PhaseRoll helps you organize photos, videos, voice notes, journals,
            milestones, and the stories behind your memories. This policy explains
            what information PhaseRoll processes and why.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Information we process</h2>
          <ul>
            <li>
              Account information provided through sign-in, such as your name,
              email address, profile image, and account identifier.
            </li>
            <li>
              Content and organization data you create, including Phases,
              sub-phases, journals, milestones, captions, dates, and voice notes.
            </li>
            <li>
              Media metadata needed to organize your memories, such as capture
              time, file type, dimensions, camera style, and location when you
              choose to grant location access.
            </li>
            <li>
              Purchase and entitlement information processed by RevenueCat and
              Apple to provide subscriptions, purchases, and restore access.
            </li>
            <li>
              Basic device, session, and diagnostic information needed to
              authenticate you, secure the service, and troubleshoot problems.
            </li>
          </ul>
        </section>

        <section className="info-page__section">
          <h2>Photos, videos, and storage</h2>
          <p>
            On Apple devices, your original personal media is stored in your private
            iCloud container. PhaseRoll processes the files you select or capture so
            it can display and organize them in the app. PhaseRoll&apos;s service
            stores the account, content, and media metadata required to keep your
            library organized and synchronized.
          </p>
          <p>
            If you use a sharing feature, content you intentionally contribute may
            be uploaded and made available to the people participating in that
            shared experience.
          </p>
        </section>

        <section className="info-page__section">
          <h2>How we use information</h2>
          <ul>
            <li>Provide, synchronize, and improve PhaseRoll.</li>
            <li>Authenticate your account and keep it secure.</li>
            <li>Process purchases and determine feature access.</li>
            <li>Respond to support requests and investigate service issues.</li>
            <li>Comply with legal obligations and prevent misuse.</li>
          </ul>
          <p>PhaseRoll does not sell your personal information.</p>
        </section>

        <section className="info-page__section">
          <h2>Permissions</h2>
          <p>
            PhaseRoll requests access only when a feature needs it: camera and photo
            library access for memories, microphone access for video and voice
            notes, and location access to remember where media was captured. You can
            change these permissions in iOS Settings.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Service providers</h2>
          <p>
            PhaseRoll relies on service providers to operate the app, including
            Google for authentication, Apple for iCloud and App Store services, and
            RevenueCat for purchase and subscription management. These providers
            process information under their own privacy policies and applicable
            agreements.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Retention and deletion</h2>
          <p>
            We retain information while your account is active and as needed to
            provide the service, meet legal obligations, resolve disputes, and
            prevent abuse. You may request account and associated service-data
            deletion by emailing{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>.
            Files stored in your personal iCloud storage may also be managed through
            your Apple account and device.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Children</h2>
          <p>
            PhaseRoll is not directed to children under 13, and we do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Changes and contact</h2>
          <p>
            We may update this policy as PhaseRoll evolves. The effective date above
            will show when it last changed. For privacy questions or requests,
            contact{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
