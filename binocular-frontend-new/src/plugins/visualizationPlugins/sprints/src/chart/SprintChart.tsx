import * as React from 'react';

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const SprintChart: React.FC = () => {
  return (
    <>
      <div
        className={'card bg-base-100 shadow-xl rounded border-2 p-2 break-all'}
        style={{
          position: 'fixed',
          visibility: 'hidden',
          minWidth: '10rem',
          maxWidth: '20rem',
        }}
      >
        <div className={'tooltip-label font-bold text-xs'}>Label</div>
        <div className={'tooltip-value badge badge-outline'}>Value</div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg">
        <g transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`} />
      </svg>
    </>
  );
};
