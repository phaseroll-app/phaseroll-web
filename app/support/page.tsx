import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | PhaseRoll",
  description: "Get help with PhaseRoll, purchases, storage, and your account.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <main className="info-page">
      <nav className="info-page__nav" aria-label="Back to PhaseRoll">
        <Link className="info-page__back" href="/">
          ← PhaseRoll
        </Link>
      </nav>

      <article className="info-page__content">
        <h1 className="display-l">PhaseRoll Support</h1>
        <p className="info-page__updated">
          Help with memories, purchases, and your account.
        </p>

        <section className="info-page__section">
          <h2>Contact support</h2>
          <p>
            Email{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>{" "}
            with a description of the issue, your device model, and your iOS version.
            Please do not attach private photos, videos, passwords, or payment
            details.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Purchases and subscriptions</h2>
          <p>
            Purchases are billed through your Apple ID. You can manage or cancel a
            subscription in iOS Settings under your Apple ID and Subscriptions. If
            an existing purchase is not recognized, open PhaseRoll&apos;s
            subscription screen and choose Restore Purchases.
          </p>
        </section>

        <section className="info-page__section">
          <h2>iCloud storage</h2>
          <p>
            Make sure you are signed in to iCloud, iCloud Drive is enabled, and your
            account has available storage. PhaseRoll needs a network connection to
            synchronize iCloud content between devices.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Camera, microphone, photos, and location</h2>
          <p>
            You can review PhaseRoll&apos;s access in iOS Settings. Camera and photo
            access are used to capture or select memories, microphone access is used
            for videos and voice notes, and location access adds a place to a memory
            when you choose to allow it.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Account and privacy requests</h2>
          <p>
            To request access to or deletion of your PhaseRoll account and associated
            service data, email{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>{" "}
            from the address connected to your account. See the{" "}
            <Link href="/privacy">Privacy Policy</Link> for more information.
          </p>
        </section>
      </article>
    </main>
  );
}
