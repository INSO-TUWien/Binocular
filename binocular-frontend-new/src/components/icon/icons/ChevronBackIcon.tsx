import React from 'react';

export function ChevronBackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14L5 10L9 6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10H15C17.7614 10 20 12.2386 20 15V19" />
    </svg>
  );
}
