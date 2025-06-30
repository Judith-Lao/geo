import styles from "./loading-dots.module.css";

const LoadingDots = ({ color = "#000" }: { color?: string }) => {
  return (
    <span className={styles.loading + " " + "ml-2"}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
};

export default LoadingDots;
