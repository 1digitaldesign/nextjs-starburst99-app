import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  LogarithmicScale,
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Zoom
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from '../../styles/SpectralChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SpectralChart = ({ spectrumData, wavelengthUnit = 'Angstrom', fluxUnit = 'erg/s/cm2/A' }) => {
  const [logScale, setLogScale] = useState(true);
  const [zoomMode, setZoomMode] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    min: Math.min(...spectrumData.map(d => d.wavelength)),
    max: Math.max(...spectrumData.map(d => d.wavelength))
  });
  
  // Filter data to zoom range if zoom is active
  const filteredData = zoomMode 
    ? spectrumData.filter(d => d.wavelength >= selectedRange.min && d.wavelength <= selectedRange.max)
    : spectrumData;
  
  // Downsample data for better rendering if there are too many points
  const downsampleData = (data, maxPoints = 500) => {
    if (data.length <= maxPoints) return data;
    
    const factor = Math.ceil(data.length / maxPoints);
    const result = [];
    
    for (let i = 0; i < data.length; i += factor) {
      result.push(data[i]);
    }
    
    return result;
  };
  
  const dataToDisplay = downsampleData(filteredData);
  
  // Prepare data for Chart.js
  const chartData = {
    labels: dataToDisplay.map(point => point.wavelength),
    datasets: [
      {
        label: 'Spectral Energy Distribution',
        data: dataToDisplay.map(point => point.flux),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        pointRadius: dataToDisplay.length < 100 ? 2 : 0,
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };
  
  // Configure chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Starburst99 Spectral Energy Distribution',
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.parsed.y;
            if (Math.abs(value) < 0.01 || Math.abs(value) > 999) {
              value = value.toExponential(2);
            } else {
              value = value.toFixed(4);
            }
            return `Flux: ${value} ${fluxUnit}`;
          },
          title: (items) => {
            return `Wavelength: ${items[0].label} ${wavelengthUnit}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Wavelength (${wavelengthUnit})`,
          font: {
            size: 14,
          }
        },
        ticks: {
          callback: function(value, index, values) {
            if (values.length > 10) {
              // Show fewer ticks on large datasets
              const ticksToShow = 10;
              if (index % Math.ceil(values.length / ticksToShow) !== 0) {
                return null;
              }
            }
            return this.getLabelForValue(value);
          }
        }
      },
      y: {
        title: {
          display: true,
          text: `Flux (${fluxUnit})`,
          font: {
            size: 14,
          }
        },
        type: logScale ? 'logarithmic' : 'linear',
        min: logScale ? null : 0,
      },
    },
  };
  
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setSelectedRange(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const resetZoom = () => {
    setZoomMode(false);
    setSelectedRange({
      min: Math.min(...spectrumData.map(d => d.wavelength)),
      max: Math.max(...spectrumData.map(d => d.wavelength))
    });
  };
  
  const applyZoom = () => {
    setZoomMode(true);
  };
  
  return (
    <div className={styles.chartContainer}>
      <div className={styles.controls}>
        <div className={styles.scaleToggle}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={logScale} 
              onChange={() => setLogScale(!logScale)}
            />
            <span className={styles.slider}></span>
          </label>
          <span>Logarithmic Y Scale</span>
        </div>
        
        <div className={styles.zoomControls}>
          <div className={styles.rangeInputs}>
            <div className={styles.inputGroup}>
              <label htmlFor="minWavelength">Min Wavelength:</label>
              <input 
                type="number" 
                id="minWavelength"
                name="min"
                value={selectedRange.min}
                onChange={handleRangeChange}
                step="10"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="maxWavelength">Max Wavelength:</label>
              <input 
                type="number" 
                id="maxWavelength"
                name="max"
                value={selectedRange.max}
                onChange={handleRangeChange}
                step="10"
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.zoomButtons}>
            <button 
              onClick={applyZoom}
              className={`${styles.button} ${zoomMode ? styles.activeButton : ''}`}
            >
              Apply Zoom
            </button>
            <button 
              onClick={resetZoom}
              className={styles.button}
              disabled={!zoomMode}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.chart}>
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Wavelength Range:</span>
          <span className={styles.statValue}>
            {Math.min(...dataToDisplay.map(d => d.wavelength)).toFixed(2)} - 
            {Math.max(...dataToDisplay.map(d => d.wavelength)).toFixed(2)} {wavelengthUnit}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Points Displayed:</span>
          <span className={styles.statValue}>{dataToDisplay.length} of {spectrumData.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Peak Flux:</span>
          <span className={styles.statValue}>
            {Math.max(...dataToDisplay.map(d => d.flux)).toExponential(2)} {fluxUnit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpectralChart;