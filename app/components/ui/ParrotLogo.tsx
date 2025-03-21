import React from 'react';

const ParrotLogo: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
      className="stroke-primary"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M22 2L17 7M17 2L22 7"
      className="stroke-primary"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 9C15 9 16 9.5 16 12C16 14.5 15 15 15 15"
      className="stroke-primary"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 7C12 7 8 8 8 12C8 16 12 17 12 17"
      className="stroke-primary"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default ParrotLogo;