import styles from '../styles/loading.module.css';

const LoadingScreen = () => {
  console.log("loading Overlay started")
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.spinner}></div>
    </div>
  );
  
};

export default LoadingScreen;
