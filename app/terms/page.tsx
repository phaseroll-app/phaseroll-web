import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | PhaseRoll",
  description: "The terms that govern your use of PhaseRoll.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="info-page">
      <nav className="info-page__nav" aria-label="Back to PhaseRoll">
        <Link className="info-page__back" href="/">
          ← PhaseRoll
        </Link>
      </nav>

      <article className="info-page__content">
        <h1 className="display-l">Terms and Conditions</h1>
        <p className="info-page__updated">Effective September 22, 2026</p>

        <section className="info-page__section">
          <h2>Agreement to these terms</h2>
          <p>
            These Terms and Conditions govern your access to and use of
            PhaseRoll, including its apps, website, and related services. By
            creating an account or using PhaseRoll, you agree to these terms. If
            you do not agree, do not use the service.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Who may use PhaseRoll</h2>
          <p>
            You must be at least 13 years old and legally able to enter into
            these terms. If you use PhaseRoll on behalf of an organization, you
            confirm that you have authority to bind that organization.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Your account</h2>
          <p>
            You are responsible for the accuracy of your account information,
            for keeping access to your account secure, and for activity under
            your account. Notify us promptly at{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>{" "}
            if you believe your account has been compromised.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Your content</h2>
          <p>
            You retain ownership of the photos, videos, voice notes, journals,
            captions, and other content you add to PhaseRoll. You grant
            PhaseRoll a limited, worldwide license to host, process, reproduce,
            and display that content only as needed to provide, secure, and
            improve the service.
          </p>
          <p>
            You represent that you have the rights and permissions needed to
            upload and share your content. You are responsible for your content
            and for any consequences of sharing it with others.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Shared experiences</h2>
          <p>
            Features such as Roll Call may let you contribute content to a
            shared experience. Content you share may be viewed, saved, or
            further shared by other participants. Only share content you are
            comfortable making available to those participants, and respect
            their privacy and rights.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Acceptable use</h2>
          <p>You may not use PhaseRoll to:</p>
          <ul>
            <li>Break the law or violate another person&apos;s rights.</li>
            <li>
              Upload malicious code or interfere with the security, integrity,
              or operation of the service.
            </li>
            <li>
              Access accounts, content, or systems without authorization, or
              attempt to bypass usage limits or safeguards.
            </li>
            <li>
              Harass, exploit, impersonate, or harm another person, or publish
              unlawful, abusive, or infringing content.
            </li>
            <li>
              Scrape, reverse engineer, resell, or commercially exploit the
              service except where applicable law expressly permits it.
            </li>
          </ul>
        </section>

        <section className="info-page__section">
          <h2>Purchases and subscriptions</h2>
          <p>
            Paid features may be offered as subscriptions or one-time
            purchases. Prices, billing periods, and included features are shown
            before purchase. Purchases made through Apple are billed to your
            Apple ID and are subject to Apple&apos;s payment and refund terms.
          </p>
          <p>
            Subscriptions renew automatically unless canceled before the end of
            the current billing period. You can manage or cancel them in your
            Apple ID subscription settings. Except where required by law or the
            applicable store&apos;s policies, payments are non-refundable.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Service changes and availability</h2>
          <p>
            PhaseRoll may add, change, suspend, or discontinue features as the
            service evolves. We work to keep PhaseRoll available and your data
            accessible, but do not guarantee uninterrupted or error-free
            operation. You should keep copies of content that is important to
            you and maintain sufficient device and iCloud storage where needed.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Intellectual property</h2>
          <p>
            PhaseRoll and its software, design, branding, and other service
            materials are owned by PhaseRoll or its licensors. These terms give
            you a personal, limited, non-exclusive, non-transferable, and
            revocable right to use the service; they do not transfer ownership
            of any PhaseRoll intellectual property.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Termination</h2>
          <p>
            You may stop using PhaseRoll at any time and can delete your account
            in the app under User Menu &gt; Account &gt; Delete account. We may
            suspend or terminate access if you materially or repeatedly violate
            these terms, create risk or harm, or if required by law. Where
            practical, we will provide notice and an opportunity to address the
            issue.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Disclaimers</h2>
          <p>
            To the fullest extent permitted by law, PhaseRoll is provided
            &quot;as is&quot; and &quot;as available.&quot; We disclaim implied warranties of
            merchantability, fitness for a particular purpose, non-infringement,
            and any warranties arising from course of dealing or usage of trade.
            Nothing in these terms limits rights that cannot legally be waived.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, PhaseRoll will not be liable
            for indirect, incidental, special, consequential, or punitive
            damages, or for lost profits, revenues, data, goodwill, or business
            opportunities arising from your use of the service. PhaseRoll&apos;s
            total liability for claims relating to the service will not exceed
            the amount you paid to PhaseRoll during the 12 months before the
            event giving rise to the claim.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Privacy</h2>
          <p>
            Our <Link href="/privacy">Privacy Policy</Link> explains how
            PhaseRoll collects, uses, stores, and protects information. It forms
            part of your use of the service.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Changes and contact</h2>
          <p>
            We may update these terms as PhaseRoll evolves. If a change is
            material, we will provide reasonable notice through the service or
            by another appropriate method. Continued use after the updated terms
            take effect means you accept them.
          </p>
          <p>
            Questions about these terms can be sent to{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}