import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { ExportType } from '../../redux/exportReducer.ts';

function ExportDialog() {
  const exportType = useSelector((state: RootState) => state.export.exportType);

  const exportSVGData = useSelector((state: RootState) => state.export.exportSVGData);
  const exportName = useSelector((state: RootState) => state.export.exportName);

  return (
    <dialog id={'exportDialog'} className={'modal'}>
      <div className={'modal-box'}>
        {exportType === ExportType.all && (
          <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
            Export
          </h3>
        )}
        {exportType === ExportType.image && (
          <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
            Image Export
          </h3>
        )}
        {exportType === ExportType.data && (
          <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
            Data Export
          </h3>
        )}
        {exportType === ExportType.image && (
          <div>
            <button
              className={'btn btn-accent'}
              onClick={() => {
                const svgBlob = new Blob([exportSVGData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = svgUrl;
                downloadLink.download = exportName;
                downloadLink.click();
              }}>
              Export SVG
            </button>
          </div>
        )}
        <div className={'modal-action'}>
          <form method={'dialog'}>
            {/* if there is a button in form, it will close the modal */}
            <button className={'btn btn-sm btn-accent'}>Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default ExportDialog;
