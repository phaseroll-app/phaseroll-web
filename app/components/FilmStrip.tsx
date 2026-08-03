const FRAMES = [
  {
    tier: "Free",
    title: "Photos & videos",
    copy: "Keep the media from each Phase together and arranged day by day, instead of lost in one endless camera roll.",
  },
  {
    tier: "Free",
    title: "Voice on media",
    copy: "Record a voice note directly over any photo or video, so the story can be heard as well as seen.",
  },
  {
    tier: "Free",
    title: "Rich Phases",
    copy: "Give every Phase a title, cover, story, dates, and sub-phases that preserve its full shape.",
  },
  {
    tier: "Pro",
    title: "Journal & progress",
    copy: "Add notes, journal entries, milestones, deadlines, and mood emoji as the chapter unfolds.",
  },
];

/** Each frame samples a different slice of the one gradient on the page. */
const SWATCH_POSITIONS = ["0%", "33%", "66%", "100%"];

const HOLES_ACROSS = 44;
const HOLES_DOWN = 16;

function Rail({
  orientation,
  code,
}: {
  orientation: "h" | "side";
  code: string;
}) {
  const count = orientation === "h" ? HOLES_ACROSS : HOLES_DOWN;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="rail__hole" />
      ))}
      <span className="rail__code">PHASEROLL&nbsp; 400&nbsp; {code}</span>
    </>
  );
}

export function FilmStrip() {
  const frames = FRAMES.map((frame, i) => (
    <div className="sframe" data-frame={`0${i + 1}`} key={frame.title}>
      <span className="rail rail--side" aria-hidden="true">
        <Rail orientation="side" code={`0${i + 1}A`} />
      </span>
      <div className="sframe__body">
        <div className="sframe__meta">
          <span
            className="sframe__swatch"
            style={{ backgroundPosition: `${SWATCH_POSITIONS[i]} 0` }}
            aria-hidden="true"
          />
          <span className="sframe__tier">{frame.tier}</span>
        </div>
        <h3 className="sframe__title">{frame.title}</h3>
        <p className="sframe__copy">{frame.copy}</p>
      </div>
      <span className="rail rail--side" aria-hidden="true">
        <Rail orientation="side" code={`0${i + 1}B`} />
      </span>
    </div>
  ));

  return (
    <div className="strip">
      <span className="rail rail--h" aria-hidden="true">
        <Rail orientation="h" code="01A" />
      </span>
      {frames[0]}
      {frames[1]}
      <span className="rail rail--h rail--mid" aria-hidden="true">
        <Rail orientation="h" code="02A" />
      </span>
      <span className="rail rail--h rail--mid rail--gap" aria-hidden="true">
        <Rail orientation="h" code="03A" />
      </span>
      {frames[2]}
      {frames[3]}
      <span className="rail rail--h" aria-hidden="true">
        <Rail orientation="h" code="04A" />
      </span>
    </div>
  );
}
