import React from 'react';
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../utils/passwordPolicy';

/**
 * PasswordStrengthMeter component
 * Displays a visual indicator of password strength
 * 
 * @param {Object} props - Component props
 * @param {string} props.password - The password to evaluate
 * @returns {JSX.Element} - Rendered component
 */
const PasswordStrengthMeter = ({ password }) => {
  // Calculate password strength score (0-100)
  const strengthScore = calculatePasswordStrength(password);
  
  // Get label and color based on score
  const { label, color } = getPasswordStrengthLabel(strengthScore);
  
  return (
    <div className="password-strength-meter mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">Password Strength:</small>
        <small style={{ color }}>{label}</small>
      </div>
      <div className="progress" style={{ height: '8px' }}>
        <div 
          className="progress-bar" 
          role="progressbar" 
          style={{ 
            width: `${strengthScore}%`, 
            backgroundColor: color,
            transition: 'width 0.3s ease-in-out'
          }} 
          aria-valuenow={strengthScore} 
          aria-valuemin="0" 
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;