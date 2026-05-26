import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CheckBoxIcon } from './icons/CheckBoxIcon';
import { CheckBoxOutlineIcon } from './icons/CheckBoxOutlineIcon';
import { ChevronBackIcon } from './icons/ChevronBackIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ConnectedToApiIcon } from './icons/ConnectedToApiIcon';
import { ConnectedToApiFailedIcon } from './icons/ConnectedToApiFailedIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { DragIndicatorIcon } from './icons/DragIndicatorIcon';
import { EditIcon } from './icons/EditIcon';
import { FileIcon } from './icons/FileIcon';
import { FlipIcon } from './icons/FlipIcon';
import { FolderIcon } from './icons/FolderIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { GroupAddIcon } from './icons/GroupAddIcon';
import { GroupRemoveIcon } from './icons/GroupRemoveIcon';
import { HelpIcon } from './icons/HelpIcon';
import { HideIcon } from './icons/HideIcon';
import { IdleIcon } from './icons/IdleIcon';
import { InfoIcon } from './icons/InfoIcon';
import { LogoIcon } from './icons/LogoIcon';
import { LogoIconTextIcon } from './icons/LogoIconTextIcon';
import { OpenInNewIcon } from './icons/OpenInNewIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { RemovePersonIcon } from './icons/RemovePersonIcon';
import { ExportIcon } from './icons/ExportIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ShowIcon } from './icons/ShowIcon';
import { VisualizationsIcon } from './icons/VisualizationsIcon';

const ICONS = {
  arrow_down: ArrowDownIcon,
  arrow_left: ArrowLeftIcon,
  arrow_right: ArrowRightIcon,
  arrow_up: ArrowUpIcon,
  calendar: CalendarIcon,
  check_box: CheckBoxIcon,
  check_box_outline: CheckBoxOutlineIcon,
  chevron_back: ChevronBackIcon,
  chevron_left: ChevronLeftIcon,
  chevron_right: ChevronRightIcon,
  connected_to_api: ConnectedToApiIcon,
  connected_to_api_failed: ConnectedToApiFailedIcon,
  delete: DeleteIcon,
  download: DownloadIcon,
  drag_indicator: DragIndicatorIcon,
  edit: EditIcon,
  file: FileIcon,
  flip: FlipIcon,
  folder: FolderIcon,
  folder_open: FolderOpenIcon,
  group_add: GroupAddIcon,
  group_remove: GroupRemoveIcon,
  help: HelpIcon,
  hide: HideIcon,
  idle: IdleIcon,
  info: InfoIcon,
  logo: LogoIcon,
  logo_text: LogoIconTextIcon,
  open_in_new: OpenInNewIcon,
  refresh: RefreshIcon,
  remove_person: RemovePersonIcon,
  export: ExportIcon,
  settings: SettingsIcon,
  show: ShowIcon,
  visualizations: VisualizationsIcon,
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
  return <SvgComponent role="img" aria-label={name} style={colorStyle} className={[size, className].filter(Boolean).join(' ')} />;
}
