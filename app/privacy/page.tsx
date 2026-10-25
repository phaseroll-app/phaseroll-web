import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PhaseRoll",
  description: "How PhaseRoll handles your memories, reflections, capsules, and privacy choices.",
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
        <p className="info-page__updated">Effective October 25, 2026</p>

        <section className="info-page__section">
          <h2>Overview</h2>
          <p>
            PhaseRoll helps you organize photos, videos, voice notes, journals,
            milestones, chapter goals, weekly reflections, and the stories behind
            your memories. It also supports invite-only Roll Calls and Future
            Capsules. This policy explains what information these features process,
            where it is stored, and the choices available to you.
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
              sub-phases, journals, milestones, captions, dates, voice notes and
              their transcripts, and chapter goals with deadlines and completion
              status.
            </li>
            <li>
              Weekly reflection answers in text or voice, an optional mood, the
              week they relate to, and prompt and save history.
            </li>
            <li>
              Future Capsule titles, notes or voice messages, recipient email
              addresses used to find an account, sender and recipient identities,
              opening dates and time zones, and any Phase you attach.
            </li>
            <li>
              Roll Call invitations, participant details and contributions;
              accounts you block; reports, report reasons, and details you submit
              to help us investigate a safety concern.
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
            On Apple devices, PhaseRoll keeps your original personal photos and
            videos in app-managed device storage and, when available, your private
            iCloud container. Memories captured offline can remain on your device
            until they can be published after reconnecting. Availability across
            devices depends on completed publishing and synchronization, your
            connection, and available device and iCloud storage.
          </p>
          <p>
            PhaseRoll&apos;s service stores account information, library metadata,
            and written content such as captions, journals, milestones, chapter
            goals, and reflections. Not all content stays only on your device or
            in iCloud: Behind the Memory voice notes uploaded for transcription,
            weekly reflection recordings, and Future Capsule recordings are
            stored in Google Cloud Storage.
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
          <h2>Chapter goals and weekly reflections</h2>
          <p>
            Chapter goals store your intentions, deadlines, time zones, and
            completion status alongside your Phase. If you choose to turn a
            completed goal into a milestone, you can edit the draft before saving
            it. Weekly reflections use the week&apos;s memories to help you look
            back; your answer and optional mood are stored with your account and
            are not published to Roll Call participants. You can edit or delete a
            saved reflection in the app.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Future Capsules and recipients</h2>
          <p>
            When you send a capsule, PhaseRoll uses the email address you enter to
            find an existing, eligible PhaseRoll account. The service stores the
            message and opening schedule so it can make the message available to
            that recipient on or after the selected opening date. The recipient
            can see the capsule&apos;s title, sender name, and opening date before
            then, but not its note or voice message. The sender can read the
            message before opening day. Attaching a Phase does not give the
            recipient access to that Phase.
          </p>
          <p>
            A &quot;sealed&quot; capsule uses timed access controls; it is not a
            promise of end-to-end encryption or storage only on your device. You
            can cancel a capsule before its opening date. Cancellation removes
            access to the message in the app, but storage cleanup is not
            instantaneous. Once a recipient has access, they may keep a copy that
            PhaseRoll cannot remove.
          </p>
        </section>

        <section className="info-page__section">
          <h2>Voice notes and transcription</h2>
          <p>
            Behind the Memory and Roll Call voice notes may be automatically
            transcribed using OpenAI. For this processing, the recording is
            uploaded to Google Cloud Storage and sent to OpenAI&apos;s
            transcription service. PhaseRoll stores the resulting transcript with
            the note or contribution so it can be displayed and searched. A Roll
            Call transcript follows the contribution&apos;s sharing permissions.
          </p>
          <p>
            You can use a text note instead of recording your voice if you do not
            want audio processed this way. Weekly reflection and Future Capsule
            recordings are stored for playback; their current save flows do not
            request this transcription service.
          </p>
        </section>

        <section className="info-page__section">
          <h2>How we use information</h2>
          <ul>
            <li>
              Provide, synchronize, and improve PhaseRoll, including organizing
              your library, displaying reflections, and opening capsules for their
              intended recipients.
            </li>
            <li>Deliver invitations and relevant in-app notifications.</li>
            <li>Authenticate your account and keep it secure.</li>
            <li>Process purchases and determine feature access.</li>
            <li>Respond to support requests and investigate service issues.</li>
            <li>Comply with legal obligations and prevent misuse.</li>
          </ul>
          <p>PhaseRoll does not sell your personal information.</p>
        </section>

        <section className="info-page__section">
          <h2>Your privacy choices and permissions</h2>
          <p>
            PhaseRoll requests access only when a feature needs it: camera and photo
            library access for memories, microphone access for video and voice
            notes, and location access to remember where media was captured. You can
            change these permissions in iOS Settings.
          </p>
          <ul>
            <li>
              Choose which photos and videos to import and what to contribute to
              a Roll Call. Capturing a personal memory does not automatically
              share it with an event.
            </li>
            <li>
              Choose text or voice for a weekly reflection, and leave the mood
              unset if you prefer.
            </li>
            <li>
              Report a Roll Call contribution or block an account using the
              event&apos;s controls. Review and unblock people under User Menu
              &gt; Safety &amp; Support &gt; Blocked accounts. Blocking filters
              shared contributions and restricts capsule interactions; unblocking
              does not restore a removed Roll Call invitation or membership.
            </li>
            <li>
              Cancel an unopened capsule or use the available edit and delete
              controls for your content. These actions cannot remove copies
              another person already saved.
            </li>
          </ul>
          <p>
            Revoking a device permission stops future access through that
            permission; it does not delete content you already saved or shared.
            For a safety concern or help with these choices, visit{" "}
            <Link href="/support">Support</Link>.
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
              media and the voice recordings described above, and Google Places
              for location autocomplete.
            </li>
            <li>
              OpenAI processes voice recordings to produce Behind the Memory and
              Roll Call transcripts.
            </li>
            <li>
              RevenueCat processes account identifiers and purchase information to
              manage subscriptions, entitlements, and restore access.
            </li>
            <li>
              Vercel hosts our website and authentication service. Resend delivers
              account-recovery and Roll Call invitation emails using the recipient
              email address and information needed for the message, such as the
              inviter&apos;s name and event details.
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
            prevent abuse. Deleting a reflection removes its answer and mood from
            the saved reflection; a record of the week and prompt may remain.
            Canceling a capsule removes its message text and schedules its voice
            recording for cleanup. Removing content from the app and completing
            storage cleanup are separate steps.
          </p>
          <p>
            You can request permanent account deletion from User Menu &gt; Account
            &gt; Delete account. The app shows progress while PhaseRoll removes
            service data and uploaded media, deletes your sign-in, and clears
            app-managed content on that device and in iCloud. Follow the process
            through to completion; interrupted cleanup may need to be resumed.
            Deleting your account does not cancel or refund an App Store
            subscription. Manage that separately in your Apple subscription
            settings.
          </p>
          <p>
            You may also contact{" "}
            <a href="mailto:support@phaseroll.com">support@phaseroll.com</a>{" "}
            for help. Files outside PhaseRoll&apos;s managed storage remain under
            your control through your Apple account and device, and copies saved
            by other people remain under their control.
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
