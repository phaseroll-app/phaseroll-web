const FRAMES = [
  {
    title: "Phases",
    copy: "Create a phase for your child’s first years, the trip you took together, or your university days. Every memory from that chapter stays together.",
  },
  {
    title: "Film signatures",
    copy: "Give each moment a distinct visual signature: camcorder, grain, monochrome, and more.",
  },
  {
    title: "Voice memories",
    copy: "Pair any photo with ten seconds of your voice. Preserve what the image alone cannot.",
  },
  {
    title: "Roll Call",
    copy: "Share a link for an important event. Everyone adds photos from their perspective to one shared album. You keep the whole story.",
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
        <span
          className="sframe__swatch"
          style={{ backgroundPosition: `${SWATCH_POSITIONS[i]} 0` }}
          aria-hidden="true"
        />
        <h2 className="sframe__title">{frame.title}</h2>
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
