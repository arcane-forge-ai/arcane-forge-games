import GameplayVideo from './GameplayVideo';
import styles from '@/app/crazy-chess-project/page.module.css';

export default function GameplayStage() {
  return (
    <figure className={styles.heroStage}>
      <GameplayVideo
        src="/crazy-chess-project/media/hero-montage.mp4"
        poster="/crazy-chess-project/media/hero-montage.webp"
        label="Montage of captured Crazy Chess prototype gameplay"
        autoPlay
        className={styles.heroVideo}
      />
      <figcaption>Captured from the current playable prototype</figcaption>
    </figure>
  );
}
