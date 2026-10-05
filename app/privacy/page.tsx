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
        <p className="info-page__updated">Effective October 5, 2026</p>

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
              Place-search text you enter when using location autocomplete. This
              text is sent to Google Places to return suggestions.
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
            Roll Call is separate from your private personal library. Photos,
            videos, and voice notes you intentionally contribute to a Roll Call
            are uploaded to Google Cloud Storage; contribution text and related
            metadata are stored by PhaseRoll. This content is made available to
            authorized participants in that invite-only event. Participants may
            save copies of shared content, which remain under their control.
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
          <h2>Place search</h2>
          <p>
            When you type into a place-search field, PhaseRoll sends the search
            text directly to Google Places for autocomplete. Google also receives
            the network information needed to handle the request, such as your IP
            address. This autocomplete request does not include your personal
            photos, journals, or voice notes. Place search is separate from
            permission to access your device&apos;s location: disabling location
            permission does not prevent text you enter in place search from being
            sent to Google. To avoid that sharing, do not use place autocomplete.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Service providers</h2>
          <ul>
            <li>
              Apple provides Sign in with Apple, private iCloud storage, and App
              Store purchases and subscriptions.
            </li>
            <li>
              Google provides Google Sign-In, Google Cloud Storage for Roll Call
              media, and Google Places for location autocomplete.
            </li>
            <li>
              RevenueCat processes account identifiers and purchase information to
              manage subscriptions, entitlements, and restore access.
            </li>
            <li>
              Vercel hosts our website and authentication service. Resend delivers
              account-recovery emails using your email address and the information
              needed to send the recovery message.
            </li>
          </ul>
          <p>
            We share information only as needed to provide, secure, and support the
            features described in this policy. We require any third party with
            which we share user data to provide the same or equivalent protection
            as this policy and applicable data-protection requirements. Providers
            processing information on our behalf must use it only for the
            authorized services and protect it under the applicable service and
            data-processing agreements. Their own privacy policies may also apply
            to services you use directly; those policies do not replace
            PhaseRoll&apos;s responsibilities under this policy.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Retention and deletion</h2>
          <p>
            We retain information while your account is active and as needed to
            provide the service, meet legal obligations, resolve disputes, and
            prevent abuse. You can permanently delete your account and associated
            PhaseRoll data from User Menu &gt; Account &gt; Delete account. You may
            also contact{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>{" "}
            for help. Files outside PhaseRoll&apos;s managed storage remain under
            your control through your Apple account and device.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Children</h2>
          <p>
            PhaseRoll is intended for people aged 13 and older, as required by our
            service terms. We do not knowingly collect personal information from
            children under 13. If you believe a child under 13 has provided personal
            information, contact support@phaseroll.com so we can investigate and
            take appropriate action.
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
