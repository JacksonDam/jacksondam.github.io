import profileImg from '../../assets/profile.webp';

export function About() {
  return (
    <div className="about">
      <figure className="card about-id">
        <img src={profileImg} alt="Jackson Dam" width="320" height="320" />
        <figcaption>
          <span className="about-name">Jackson Dam</span>
          <span className="outline-label">Software Dev Engineer, Amazon</span>
        </figcaption>
      </figure>
      <section className="card prose about-text">
        <p className="lead">👋 Hello, I'm Jackson Dam!</p>
        <p>
          I am a full-stack developer who builds in order <strong>to delight</strong>.
        </p>
        <p>
          Currently, I am a Software Dev Engineer at Amazon on the Selection Contribution Platform (Contribution
          Catalog) team, based in London, UK.
        </p>
        <p>
          Previously, I studied at the University of Glasgow for my BSc in Computer Science, where I graduated with
          First Class Honours.
        </p>
        <p>
          I started out coding through game development, eventually running a freelance Roblox game development
          business, before moving into the broader software industry.
        </p>
      </section>
    </div>
  );
}
