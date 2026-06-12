import AuthorList from './authorList/authorList.tsx';
import OtherAuthors from './otherAuthors/otherAuthors.tsx';
import { Icon } from '../../icon';
import HorizontalExpand from '../shared/horizontalExpand.tsx';

function Authors(props: { orientation?: string }) {
  return (
    <HorizontalExpand
      orientation={props.orientation}
      label="Authors"
      overlayMaxWidth={960}
      verticalContent={
        <>
          <AuthorList orientation={props.orientation} />
          <div className="text-[0.6rem] text-neutral-400 px-1 pt-1">Other</div>
          <OtherAuthors orientation={props.orientation} />
        </>
      }
      overlayContent={
        <>
          <div className="flex items-center justify-between border-b border-base-300 px-3 py-1.5 flex-none">
            <span className="text-xs font-semibold text-base-content/60">Authors</span>
            <button
              className="btn btn-xs"
              title="Author settings"
              onClick={() => window.dispatchEvent(new CustomEvent('openSettingsTab', { detail: { tab: 'Authors' } }))}>
              <Icon name="settings" size="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0 overflow-y-auto border-r border-base-300 p-2">
              <AuthorList orientation="vertical" showSettingsButton={false} />
            </div>
            <div className="flex-1 min-w-0 overflow-y-auto p-2">
              <p className="text-xs font-bold text-base-content/70 pb-1">Other</p>
              <OtherAuthors orientation="vertical" overlay />
            </div>
          </div>
        </>
      }
    />
  );
}

export default Authors;
