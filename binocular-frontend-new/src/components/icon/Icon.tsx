import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronBackIcon } from './icons/ChevronBackIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { DragIndicatorIcon } from './icons/DragIndicatorIcon';
import { EditIcon } from './icons/EditIcon';
import { GroupAddIcon } from './icons/GroupAddIcon';
import { GroupRemoveIcon } from './icons/GroupRemoveIcon';
import { HideIcon } from './icons/HideIcon';
import { InfoIcon } from './icons/InfoIcon';
import { OpenInNewIcon } from './icons/OpenInNewIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { ExportIcon } from './icons/ExportIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ShowIcon } from './icons/ShowIcon';

const ICONS = {
  arrow_down: ArrowDownIcon,
  arrow_left: ArrowLeftIcon,
  arrow_right: ArrowRightIcon,
  arrow_up: ArrowUpIcon,
  calendar: CalendarIcon,
  chevron_back: ChevronBackIcon,
  chevron_left: ChevronLeftIcon,
  chevron_right: ChevronRightIcon,
  delete: DeleteIcon,
  download: DownloadIcon,
  drag_indicator: DragIndicatorIcon,
  edit: EditIcon,
  export: ExportIcon,
  group_add: GroupAddIcon,
  group_remove: GroupRemoveIcon,
  hide: HideIcon,
  info: InfoIcon,
  open_in_new: OpenInNewIcon,
  refresh: RefreshIcon,
  settings: SettingsIcon,
  show: ShowIcon,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  colorClass?: string;
  size?: string;
  className?: string;
}

export function Icon({ name, colorClass = 'base-content', size = 'w-4 h-4', className }: IconProps) {
  const SvgComponent = ICONS[name];
  const colorStyle = colorClass ? { color: `var(--color-${colorClass})` } : undefined;
  return <SvgComponent style={colorStyle} className={[size, className].filter(Boolean).join(' ')} />;
}
