import { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale,
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from '../../styles/ColorEvolution.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ColorEvolution = ({ colorData }) => {
  const [selectedColors, setSelectedColors] = useState(['uMinusB', 'bMinusV', 'vMinusR', 'vMinusK']);
  
  const colorOptions = [
    { id: 'uMinusB', label: 'U-B', color: 'rgb(75, 192, 192)' },
    { id: 'bMinusV', label: 'B-V', color: 'rgb(255, 99, 132)' },
    { id: 'vMinusR', label: 'V-R', color: 'rgb(53, 162, 235)' },
    { id: 'vMinusK', label: 'V-K', color: 'rgb(255, 159, 64)' }
  ];
  
  const handleColorToggle = (colorId) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };
  
  // Prepare data for Chart.js
  const chartData = {
    labels: colorData.map(point => point.age),
    datasets: colorOptions
      .filter(color => selectedColors.includes(color.id))
      .map(color => ({
        label: color.label,
        data: colorData.map(point => point[color.id]),
        borderColor: color.color,
        backgroundColor: color.color.replace('rgb', 'rgba').replace(')', ', 0.5)'),
        pointRadius: colorData.length < 50 ? 4 : 2,
        pointHoverRadius: 6,
        borderWidth: 2,
      })),
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Color Evolution',
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(3)} mag`;
          },
          title: (items) => {
            return `Age: ${items[0].label} Myr`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age (Myr)',
          font: {
            size: 14,
          }
        },
      },
      y: {
        title: {
          display: true,
          text: 'Color Index (mag)',
          font: {
            size: 14,
          }
        },
      },
    },
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.colorToggles}>
          {colorOptions.map((color) => (
            <label key={color.id} className={styles.colorOption}>
              <input
                type="checkbox"
                checked={selectedColors.includes(color.id)}
                onChange={() => handleColorToggle(color.id)}
              />
              <span 
                className={styles.colorLabel}
                style={{ borderLeftColor: color.color }}
              >
                {color.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className={styles.chartWrapper}>
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className={styles.info}>
        <h3>Color Evolution Interpretation</h3>
        <p>
          Color indices show how stellar population colors evolve with time:
        </p>
        <ul>
          <li><strong>U-B</strong>: Ultraviolet to blue, sensitive to hot, young stars</li>
          <li><strong>B-V</strong>: Blue to visual, standard color index for stellar classification</li>
          <li><strong>V-R</strong>: Visual to red, influenced by cooler stars and dust</li>
          <li><strong>V-K</strong>: Visual to infrared, very sensitive to cool, evolved stars</li>
        </ul>
        <p>
          As stellar populations age, their colors generally become redder (increasing color indices),
          reflecting the evolution of the stellar population from hot, blue stars to cooler, redder stars.
        </p>
      </div>
    </div>
  );
};

export default ColorEvolution;