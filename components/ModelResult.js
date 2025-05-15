import React from 'react';
import styles from '../styles/ModelResult.module.css';

const ModelResult = ({ name, data, type }) => {
  const renderData = () => {
    // This would be expanded based on the type of data
    // For now, just a placeholder
    return (
      <div className={styles.dataContainer}>
        <p>Model data would be displayed here</p>
        <p>Type: {type}</p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{name}</h3>
      {renderData()}
    </div>
  );
};

export default ModelResult;