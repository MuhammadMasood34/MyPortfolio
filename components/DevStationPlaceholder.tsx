import styles from "./DevStation.module.css";

export function StationBadges() {
  return (
    <>
      <div className={`${styles.chip} ${styles.live}`} aria-hidden="true">
        <span className={styles.dot} />DEV.STATION · LIVE
      </div>
      <div className={`${styles.chip} ${styles.hint}`} aria-hidden="true">
        <span className={styles.mouseHint}>drag to orbit · scroll to zoom</span>
        <span className={styles.touchHint}>two fingers to orbit &amp; zoom</span>
      </div>
    </>
  );
}

export function StationPlaceholderContent({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <div className={styles.placeholder} role="status">
      {unavailable ? (
        <>
          <strong>Developer workspace</strong>
          <p>The 3D workspace is unavailable on this device. You can still send me a message.</p>
        </>
      ) : (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <p>Preparing the workspace…</p>
        </>
      )}
    </div>
  );
}

export default function DevStationPlaceholder() {
  return <div className={styles.frame}><StationPlaceholderContent /><StationBadges /></div>;
}
