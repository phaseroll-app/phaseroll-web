import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { encodeRollCallId } from "@/app/roll-calls/rollCallId";
import { OpenRollCall } from "./OpenRollCall";

type RollCallPageProps = {
  params: Promise<{ id: string }>;
};

const title = "Open a shared Roll Call | PhaseRoll";
const description =
  "Open this shared Roll Call in the PhaseRoll app to see and add memories.";

export async function generateMetadata({
  params,
}: RollCallPageProps): Promise<Metadata> {
  const { id } = await params;
  const encodedId = encodeRollCallId(id);

  return {
    title,
    description,
    alternates: {
      canonical: `/roll-calls/${encodedId}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function RollCallPage({ params }: RollCallPageProps) {
  const { id } = await params;
  const encodedId = encodeRollCallId(id);
  const downloadUrl =
    process.env.NEXT_PUBLIC_PHASEROLL_DOWNLOAD_URL?.trim() || "/#waitlist";

  return (
    <main className="roll-call-page">
      <nav className="roll-call-page__nav" aria-label="PhaseRoll home">
        <Link href="/" aria-label="Go to the PhaseRoll homepage">
          <Logo className="logo--hero" priority />
        </Link>
      </nav>

      <section className="roll-call-page__card" aria-labelledby="roll-call-title">
        <div className="roll-call-page__accent" aria-hidden="true" />
        <p className="roll-call-page__eyebrow">Shared Roll Call</p>
        <h1 className="display-l" id="roll-call-title">
          This Roll Call opens in the Phase<span className="em">Roll</span> app.
        </h1>
        <p className="roll-call-page__copy">
          If PhaseRoll is installed, it should open automatically. You can also
          open it again or download the app to join this Roll Call.
        </p>
        <OpenRollCall encodedId={encodedId} downloadUrl={downloadUrl} />
      </section>
    </main>
  );
}
