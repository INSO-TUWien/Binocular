import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';
import { ExportType } from '../../redux/reducer/export/exportReducer.ts';
import dataExportStyles from './dataExport/dataExport.module.scss'
import viewIcon from '../../assets/show_gray.svg'
import downloadIcon from '../../assets/arrow_down_gray.svg'
import type { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import { useEffect, useState } from 'react';
import DataPluginStorage from '../../utils/dataPluginStorage.ts';
import PouchDb from '../../plugins/dataPlugins/pouchDB/src/index.ts';
import type { JSONObject } from '../../plugins/interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import type { DataPlugin } from '../../plugins/interfaces/dataPlugin.ts';
import type BinocularBackend from '../../plugins/dataPlugins/binocularBackend/src/index.ts';

function ExportDialog() {
  const exportType = useSelector((state: RootState) => state.export.exportType);

  const exportSVGData = useSelector((state: RootState) => state.export.exportSVGData);
  const exportName = useSelector((state: RootState) => state.export.exportName);

  const availableDataPlugins: DatabaseSettingsDataPluginType[] = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const [selectedDataPlugin, setSelectedDataPlugin] = useState<DatabaseSettingsDataPluginType | undefined>(undefined);
  
  const initialState = {
    collections: {
      accounts: [],
      branches: [],
      builds: [],
      commits: [],
      files: [],
      issues: [],
      mergeRequests: [],
      milestones: [],
      modules: [],
      notes: [],
      users: [],
    },
    relations: {
      "accounts-users": [],
      "branches-files": [],
      "branches-files-files": [],
      "commits-builds": [],
      "commits-commits": [],
      "commits-files": [],
      "commits-files-users": [],
      "commits-modules": [],
      "commits-users": [],
      "issues-accounts": [],
      "issues-commits": [],
      "issues-milestones": [],
      "issues-notes": [],
      "issues-users": [],
      "mergeRequests-accounts": [],
      "mergeRequests-milestones": [],
      "mergeRequests-notes": [],
      "modules-files": [],
      "modules-modules": [],
      "notes-accounts": [],
    },
    previewTable: [],
    exportType: 'json',
  }

  const [state, setState ]= useState<any>(initialState);

  const [previewTableHeader, setPreviewTableHeader] = useState<string[]>([]);

  useEffect(() => {
    setState(initialState);
  }, [selectedDataPlugin]);

  async function loadData(name: string){
    const dP = selectedDataPlugin ? await DataPluginStorage.getDataPlugin(selectedDataPlugin) : undefined;
    let data;
    if (dP){
      switch (dP.name) {
        case 'PouchDb':
          data = await (dP as PouchDb).getCollection(name);
          break;
        case 'Binocular Backend':
          const currentDataConnection = dP[name as keyof DataPlugin];
          if (typeof currentDataConnection !== 'boolean' && typeof currentDataConnection !== 'string' && 'getAll' in currentDataConnection!) {
            data = await currentDataConnection.getAll(new Date(0).toISOString(), new Date().toISOString());
          }
          console.log(data);

          if (name == 'commits') {
            data = await (dP as BinocularBackend).export_temp.getAll();
            console.log(data);
          }
          
          break;
        default:
          data = [];
          break;
      }
      const newState = {...state};
      if (name.includes('-')) newState.relations[(name as keyof typeof state.relations)] = data;
      else newState.collections[(name as keyof typeof state.collections)] = data;
      setState(newState);
      console.log(state);
      
    }
  }

  function download(name: string, data: Blob) {
    const url = URL.createObjectURL(data);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = name;
    downloadLink.click();
  }

  function downloadFile(name: string, data: JSONObject[]) {
        switch (state.exportType) {
          case 'csv':
            download(name + '.csv', new Blob([convertToCSV(data)], { type: 'data:text/csv;charset=utf-8' }))
            break;
          default:
            download(name + '.json', new Blob([JSON.stringify(data)], { type: 'data:text/json;charset=utf-8' }))
            break;
        }
  }

  function convertToCSV(jsonObject: JSONObject[]) {
    const items = jsonObject;
    const replacer = (_key: string, value: string) => (value === null ? '' : value);
    const header = Object.keys(items[0]);
    const csv = [
      header.join(','),
      ...items.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')),
    ].join('\r\n');
    return csv;
  }


  return (
    <dialog id={'exportDialog'} className={'modal'}>
      <div className={`modal-box ${exportType === ExportType.all ? 'max-w-full' : 'w-full'}`}>
        {exportType === ExportType.all && (
          <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline'}>
            Export
          </h3>
        )}
        {exportType === ExportType.image && (
          <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline'}>
            Image Export
          </h3>
        )}
        {exportType === ExportType.data && (
          <h3 id={'informationDialogHeadline'} className={'font-bold text-lg underline'}>
            Data Export
          </h3>
        )}
        {exportType === ExportType.image && (
          <div>
            <h3>Preview:</h3>
            <div
              className={'w-full overflow-auto border-base-300 border mb-3'}
              style={{ height: '30rem' }}
              dangerouslySetInnerHTML={{ __html: exportSVGData }}></div>
            <button
              className={'btn btn-primary'}
              onClick={() => {
                download(exportName, new Blob([exportSVGData], { type: 'image/svg+xml;charset=utf-8' }));
              }}>
              Export SVG
            </button>
          </div>
        )}

        {exportType === ExportType.all && (
          <div className={dataExportStyles.chartContainer}>
                  <div className={dataExportStyles.mg1}>
                    <h1>1. Choose Database</h1>
                    <div className={'flex overflow-x-auto'}>
                    {availableDataPlugins.filter((dP) => dP.name == 'PouchDb' || dP.name == 'Binocular Backend').map((dP: DatabaseSettingsDataPluginType) => (
            <div
              className={'card w-fit bg-base-100 shadow-md mb-3 mr-3 border border-base-300 min-w-40'}
              style={{ background: dP.color }}
              key={`settingsDatabasePlugin${dP.id}`}
              onClick={() => {
                setSelectedDataPlugin(dP);
              }}>
              <div className="card-body">
                <div>
                  <h2 className="card-title">
                    {dP.name} #{dP.id}
                    {dP.id === 0 && <div className="badge badge-outline">pre-loaded</div>}
                    {dP.isDefault && <div className="badge badge-accent">Default</div>}
                  </h2>
                </div>
                {dP.parameters.endpoint && (
                  <div>
                    <span className={'font-bold'}>Endpoint:</span>
                    <span>{dP.parameters.endpoint}</span>
                  </div>
                )}
                {dP.parameters.fileName && (
                  <div>
                    <span className={'font-bold'}>Database:</span>
                    <span>{dP.parameters.fileName}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>

                    <h1>2. Choose Export Type</h1>
                    <div className={dataExportStyles.sectionArrowContainer}>
                      <div className={dataExportStyles.sectionArrowStem}></div>
                      <div className={dataExportStyles.sectionArrowHead}></div>
                    </div>
                    <div className={dataExportStyles.section}>
                      <button
                        className={'button ' + dataExportStyles.button + (state.exportType === 'json' ? ' ' + dataExportStyles.selected : '')}
                        onClick={() => {
                          setState({...state, exportType: 'json'})
                          console.log({...state, exportType: 'json'});
                          
                        }}>
                        JSON
                      </button>
                      <button
                        className={'button ' + dataExportStyles.button + (state.exportType === 'csv' ? ' ' + dataExportStyles.selected : '')}
                        onClick={() => {
                          setState({...state, exportType: 'csv'})
                          console.log(state);
                          
                        }}>
                        CSV
                      </button>
                    </div>
                    <h1>3. View and Download Data</h1>
                    <div className={dataExportStyles.sectionArrowContainer}>
                      <div className={dataExportStyles.sectionArrowStem}></div>
                      <div className={dataExportStyles.sectionArrowHead}></div>
                    </div>
                    <div className={dataExportStyles.section}>
                      <h2>Collections</h2>
                      {Object.keys(state.collections).map((c) => {
                        return (
                          <div key={c}>
                            {c}: {state.collections[(c as keyof typeof state.collections)].length}{' '}
                            {state.collections[(c as keyof typeof state.collections)].length > 10000 ? '(Too many Entries! Preview may crash Binocular.)' : ''}
                            <img
                              className={dataExportStyles.icon}
                              src={viewIcon}
                              onClick={async () => {
                                await loadData(c);
                                setState({...state, previewTable: state.collections[(c as keyof typeof state.collections)]})
                                setPreviewTableHeader(Object.keys(state.collections[(c as keyof typeof state.collections)][0]) ?? []);
                              }}></img>
                            <img
                              className={dataExportStyles.icon}
                              src={downloadIcon}
                              onClick={() => {
                                downloadFile(c, state.collections[(c as keyof typeof state.collections)]);
                              }}></img>
                          </div>
                        );
                      })}
          
                      <h2>Relations</h2>
                      {Object.keys(state.relations).map((r) => {
                        return (
                          <div key={r}>
                            {r}: {state.relations[(r as keyof typeof state.relations)].length}{' '}
                            {state.relations[(r as keyof typeof state.relations)].length > 10000 ? '(Too many Entries! Preview may crash Binocular.)' : ''}
                            <img
                              className={dataExportStyles.icon}
                              src={viewIcon}
                              onClick={async () => {
                                await loadData(r);
                                setState({...state, previewTable: state.relations[(r as keyof typeof state.relations)]})
                                setPreviewTableHeader(Object.keys(state.relations[(r as keyof typeof state.relations)][0]) ?? []);
                              }}></img>
                            <img
                              className={dataExportStyles.icon}
                              src={downloadIcon}
                              onClick={() => {
                                downloadFile(r, state.relations[(r as keyof typeof state.relations)]);
                              }}></img>
                          </div>
                        );
                      })}
                    </div>
                    <hr />
                    <button className={'button ' + dataExportStyles.button} onClick={() => {
                      DataPluginStorage.getDataPlugin(selectedDataPlugin!).then( (dataPlugin) => {dataPlugin?.export ? dataPlugin.export(selectedDataPlugin?.metadata) : {}})
                    }}>
                      Export Complete Database
                    </button>
                    <hr />
                    <div className={dataExportStyles.previewTableContainer}>
                      {state.previewTable.length !== 0 ? (
                        <table className={dataExportStyles.previewTable}>
                          <thead className={dataExportStyles.previewTableHeader}>
                            <tr>
                              {previewTableHeader.map((key, i) => {
                                return (
                                  <th
                                    key={'previewTableHeaderCol' + i}
                                    className={i % 2 === 0 ? dataExportStyles.previewTableHeaderEven : dataExportStyles.previewTableHeaderOdd}>
                                    {key}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {state.previewTable.map((row: JSONObject[], i: number) => {
                              return (
                                <tr key={'previewTableRow' + i}>
                                  {previewTableHeader.map((key: string, j: number) => {
                                    return (
                                      <th key={'previewTableRow' + i + 'Col' + j} className={dataExportStyles.previewTableCell}>
                                        {JSON.stringify(row[key as keyof typeof row])}
                                      </th>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
        )}

        <div className={'modal-action'}>
          <form method={'dialog'}>
            {/* if there is a button in form, it will close the modal */}
            <button className={'btn btn-sm btn-ghost'}>Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

//     collections: {
//       accounts: [],
//       branches: [],
//       builds: [],
//       commits: [],
//       files: [],
//       issues: [],
//       mergeRequests: [],
//       milestones: [],
//       modules: [],
//       notes: [],
//       users: [],
//     },
//     relations: {
//       accounts_users: [],
//       branches_files: [],
//       branches_files_files: [],
//       commits_builds: [],
//       commits_commits: [],
//       commits_files: [],
//       commits_files_users: [],
//       commits_modules: [],
//       commits_users: [],
//       issues_accounts: [],
//       issues_commits: [],
//       issues_milestones: [],
//       issues_notes: [],
//       issues_users: [],
//       mergeRequests_accounts: [],
//       mergeRequests_milestones: [],
//       mergeRequests_notes: [],
//       modules_files: [],
//       modules_modules: [],
//       notes_accounts: [],
//     },


export default ExportDialog;
