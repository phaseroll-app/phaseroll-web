type FoundingOfferProps = {
  price: string;
};

export function FoundingOffer({ price }: FoundingOfferProps) {
  return (
    <aside className="founding-note">
      <span className="founding-note__pointer" aria-hidden="true" />
      <p>
        <strong>Get PhaseRoll for life for {price}.</strong>{" "}The Founder&rsquo;s
        Pass is limited to the first 100 waitlist members and includes one
        complimentary <a href="#roll-call">Roll Call</a>.
      </p>
    </aside>
  );
}