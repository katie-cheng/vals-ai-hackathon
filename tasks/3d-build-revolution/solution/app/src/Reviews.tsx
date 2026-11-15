const REVIEWS = [
  { name: "Claire Whitfield", place: "Two-storey family house, Surrey", text: "We changed the roof three times on the configurator before we met the architect. By the first meeting we were talking about details, not starting from a blank page." },
  { name: "Daniel Okafor", place: "Single-storey extension, Leeds", text: "Being able to drag the windows around the façade settled an argument at home in ten minutes. The drawings that came back matched what we had sent." },
  { name: "Mei Lin", place: "Timber-clad studio, Bristol", text: "Clear prices, a fixed programme and a site lead who answered the phone. The house was handed over in the week they said it would be." },
  { name: "Tomás Herrera", place: "Three-storey townhouse, Manchester", text: "The brief form let me explain how we use the house, which a list of options never could. The architect's reply showed they had read every line." },
  { name: "Hannah Price", place: "Brick house with hip roof, Norwich", text: "We picked the limestone floor and the sage paint online and the finished rooms look exactly like the samples we were sent afterwards." },
  { name: "Arjun Mehta", place: "Flat-roof house, Cambridge", text: "Calm, organised and honest about what things cost. I would build with them again." },
];

const Stars = () => (
  <span className="stars" role="img" aria-label="Rated 5 out of 5">
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l2.5 5.3 5.7.7-4.2 3.9 1.1 5.7-5.1-2.8-5.1 2.8 1.1-5.7L1.8 7.8l5.7-.7z" /></svg>
    ))}
  </span>
);

export function Reviews() {
  return (
    <section className="section reviews" id="reviews" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <h2 id="reviews-title">What clients say</h2>
          <p className="note">These reviews are samples written for this presentation, not from real clients.</p>
        </div>
        <ul className="review-grid">
          {REVIEWS.map((r, i) => (
            <li key={r.name} className="review" data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
              <Stars />
              <blockquote>
                <p>{r.text}</p>
              </blockquote>
              <p className="review-by">
                <strong>{r.name}</strong>
                <span>{r.place}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
