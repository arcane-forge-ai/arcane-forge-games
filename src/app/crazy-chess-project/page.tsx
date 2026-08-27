import type { Metadata } from 'next';
import GameplayStage from '@/components/crazy-chess/GameplayStage';
import GameplayVideo from '@/components/crazy-chess/GameplayVideo';
import PlaytestSignupForm from '@/components/crazy-chess/PlaytestSignupForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Crazy Chess — Every Piece Comes Alive | Arcane Forge',
  description: 'A working-title chess game where pieces have faces, loyalties, and stories—and every match writes their history.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Crazy Chess — Every Piece Comes Alive',
    description: 'Win pieces over, reshape the battlefield, and write a history that remembers every match.',
    images: ['/crazy-chess-project/media/hero-montage.webp'],
  },
};

const battlefieldClips = [
  { name: 'Treasure', detail: 'Claim the reward.', file: 'battlefield-treasure' },
  { name: 'Traps', detail: 'Read the danger.', file: 'battlefield-trap' },
  { name: 'Mystery Tiles', detail: 'Reveal the unknown.', file: 'battlefield-mystery' },
  { name: 'Shrines', detail: 'Transform the army.', file: 'battlefield-shrine' },
];

const livingClips = [
  { name: 'The campaign creates a briefing', file: 'living-pre-battle' },
  { name: 'Moves, sacrifices, and survivors become canon', file: 'living-battle' },
  { name: 'The Chronicle remembers—and continues', file: 'living-ending' },
];

export default function CrazyChessProjectPage() {
  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <a href="#top" className={styles.brand}>Arcane Forge <span>Games</span></a>
        <nav aria-label="Crazy Chess page navigation">
          <a href="#game">The Game</a>
          <a href="#campaigns">Campaigns</a>
          <a href="#playtest" className={styles.navCta}>Join the Playtest</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Working title · playable prototype</p>
            <p className={styles.projectTitle}>Project Crazy Chess</p>
            <h1 id="hero-title">Every piece <span>comes alive.</span></h1>
            <p className={styles.heroLead}>They choose sides. They have faces, loyalties, and stories. Every match writes their history.</p>
            <div className={styles.heroActions}>
              <a href="#playtest" className={styles.primaryButton}>Join the Playtest</a>
              <a href="#game" className={styles.secondaryButton}>See the Game</a>
            </div>
          </div>
          <GameplayStage />
        </section>

        <section className={styles.section} id="game" aria-labelledby="layers-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>What is Crazy Chess?</p>
            <h2 id="layers-title">Familiar chess becomes <span>a lasting world.</span></h2>
          </div>
          <div className={styles.layerGrid}>
            <article><span>01 / Board</span><h3>The board changes.</h3><p>Offers, shifting loyalty, new allies, and battlefield events transform each match.</p></article>
            <article><span>02 / People</span><h3>Pieces become people.</h3><p>Countries, identities, abilities, and relationships make every army a cast.</p></article>
            <article><span>03 / History</span><h3>Every move becomes history.</h3><p>Campaigns remember critical moves, recruited allies, survivors, and victories.</p></article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.featureSplit}`} aria-labelledby="recruitment-title">
          <div className={styles.featureCopy}>
            <p className={styles.eyebrow}>The core hook</p>
            <h2 id="recruitment-title">Win enemy pieces over—and <span>turn them into allies.</span></h2>
            <p>Win over the enemy queen, bring her to your side, and turn the match around.</p>
            <ol className={styles.steps}>
              <li><span>01</span>Make an offer to an enemy piece.</li>
              <li><span>02</span>Loyalty determines whether it accepts.</li>
              <li><span>03</span>Redeploy your new ally and reshape the board.</li>
            </ol>
          </div>
          <figure className={styles.featureMedia}>
            <GameplayVideo src="/crazy-chess-project/media/queen-betrayal.mp4" poster="/crazy-chess-project/media/queen-betrayal.webp" label="A captured Crazy Chess match where an enemy queen accepts an offer and changes sides" className={styles.featureVideo} />
            <figcaption>Offer → loyalty check → recruit → redeploy</figcaption>
          </figure>
        </section>

        <section className={`${styles.section} ${styles.battlefieldSection}`} aria-labelledby="battlefields-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Dynamic battlefields</p>
            <h2 id="battlefields-title">Recruitment changes the army. <span>Battlefields change the plan.</span></h2>
          </div>
          <div className={styles.battlefieldGrid}>
            {battlefieldClips.map((clip) => (
              <figure key={clip.file}>
                <GameplayVideo src={`/crazy-chess-project/media/${clip.file}.mp4`} poster={`/crazy-chess-project/media/${clip.file}.webp`} label={`${clip.name} battlefield effect captured in Crazy Chess`} className={styles.tileVideo} />
                <figcaption><strong>{clip.name}</strong><span>{clip.detail}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.livingSection}`} id="campaigns" aria-labelledby="living-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Living Campaign</p>
            <h2 id="living-title">Every match writes <span>the next mission.</span></h2>
            <p>Each result becomes part of a personal chronicle and changes what the campaign creates next.</p>
          </div>
          <div className={styles.livingGrid}>
            {livingClips.map((clip, index) => (
              <figure key={clip.file}>
                <GameplayVideo src={`/crazy-chess-project/media/${clip.file}.mp4`} poster={`/crazy-chess-project/media/${clip.file}.webp`} label={`${clip.name} in the Crazy Chess Living Campaign`} className={styles.livingVideo} />
                <figcaption><span>0{index + 1}</span>{clip.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.featureSplit} ${styles.lastPiece}`} aria-labelledby="last-piece-title">
          <figure className={styles.featureMedia}>
            <GameplayVideo src="/crazy-chess-project/media/last-piece-queen.mp4" poster="/crazy-chess-project/media/last-piece-queen.webp" label="Captured Last Piece gameplay with the queen survivor" className={styles.featureVideo} />
            <figcaption>Last Piece · The First Encirclement</figcaption>
          </figure>
          <div className={styles.featureCopy}>
            <p className={styles.eyebrow}>Last Piece</p>
            <h2 id="last-piece-title">One survivor. <span>A new way to know each country.</span></h2>
            <p>Survive with one piece, build familiarity, and unlock more of its portraits, stories, and character world.</p>
          </div>
        </section>

        <section className={styles.signupSection} id="playtest" aria-labelledby="signup-title">
          <div>
            <p className={styles.eyebrow}>Help shape what comes next</p>
            <h2 id="signup-title">Join the Crazy Chess playtest.</h2>
            <p>Familiar rules. An army you can know, recruit, protect, and remember.</p>
          </div>
          <PlaytestSignupForm />
        </section>
      </main>

      <footer className={styles.footer}>
        <p><strong>Crazy Chess</strong> is a working title from Arcane Forge AI.</p>
        <p>Stockfish-powered AI components are distributed under GPLv3. <a href="/open-source/crazy-chess/android-0.9.0-1/">Notices and corresponding source</a>.</p>
      </footer>
    </div>
  );
}
