import Chart from './chart';
import Details from './details';
import styles from '../styles.scss';

export default () => {
  return (
    <div className={styles.container}>
      <Chart />
      <Details />
    </div>
  );
};
