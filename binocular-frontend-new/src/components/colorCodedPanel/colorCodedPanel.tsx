import type { ReactNode } from 'react';

interface ColorCodedPanelProps {
  color?: string;
  label?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

function ColorCodedPanel({
  color,
  label,
  isSelected = false,
  onSelect,
  selectable = false,
  loading = false,
  children,
  className = '',
}: ColorCodedPanelProps) {
  return (
    <div
      className={`card min-h-20 bg-base-100 shadow-md border-2 relative overflow-hidden transition-all ${selectable ? 'cursor-pointer' : ''} ${isSelected ? 'ring-1 ring-primary ring-offset-1' : ''} ${className}`}
      style={{ borderColor: isSelected ? undefined : color }}
      onClick={selectable ? onSelect : undefined}>
      {color && <div className="absolute left-0 inset-y-0 w-3" style={{ background: color }} />}
      <div className="card-body py-3 px-4 justify-center">
        {label && <p className="card-title text-sm justify-center w-full !mb-0">{label}</p>}
        {children}
      </div>
      {isSelected && !loading && (
        <span className="badge badge-sm absolute bottom-2 right-2 border-0 text-white" style={{ background: 'rgba(0,0,0,0.35)' }}>
          &#10003;
        </span>
      )}
      {isSelected && loading && <span className="loading loading-spinner loading-md absolute bottom-2 right-2 text-primary"></span>}
    </div>
  );
}

export default ColorCodedPanel;
