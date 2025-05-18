import React from "react";
import { setGlobalCurrentFileData, setGlobalFiles } from "../reducer";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import { DataPluginFile } from "../../../../interfaces/dataPluginInterfaces/dataPluginFiles";

export interface SettingsType {
  file: string;
  splitAdditionsDeletions: boolean;
  visualizationStyle: string;
  showSprints: boolean;
  showExtraMetrics: boolean;
}

function FileSelector({
  selectedFile,
  onFileChange,
}: {
  selectedFile: string;
  onFileChange: (file: string) => void;
}) {
  const s = useSelector((state: RootState) => state);
  console.log("State:", s);
  const files : DataPluginFile[] = useSelector((state: RootState) => state.files.fileLists);
  
  if(files == null) {
    return <div className="alert alert-warning">No files found</div>;
  }

  const fileListsArray = Object.values(files)[0];

  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredFiles = fileListsArray.filter((file) =>
    file.element.path.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  //const filteredFiles = files.forEach((file) => {
  //  file.path.toLowerCase().includes(searchTerm.toLowerCase());
  //});

  return (
    <div className="w-full max-w-xs border rounded-lg input-bordered">
      {/* Search input */}
      <input
        type="text"
        className="input input-sm w-full mb-2"
        placeholder="Search files..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Select dropdown */}
      <select
        className="select select-sm w-full"
        value={selectedFile}
        onChange={(e) => onFileChange(e.target.value)}
      >
        {filteredFiles.map((file, index) => (
          <option key={index} value={file.path}>
            {file.element.path}
          </option>
        ))}
      </select>
    </div>
  );
}

function Settings(props: {
  settings: SettingsType;
  setSettings: (newSettings: SettingsType) => void;
}) {
  return (
    <>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">File:</span>
          </div>
          <FileSelector
            selectedFile={(props.settings.file as string) || ""}
            onFileChange={(file) => {
              setGlobalCurrentFileData(file);
              props.setSettings({
                ...props.settings,
                file: file,
              });
            }}
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Split Additions and Deletions:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitAdditionsDeletions}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                splitAdditionsDeletions: event.target.checked,
              })
            }
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Visualization Style:</span>
          </div>
          <select
            className="select select-bordered select-sm"
            defaultValue={props.settings.visualizationStyle}
            onChange={(e) =>
              props.setSettings({
                ...props.settings,
                visualizationStyle: e.target.value,
              })
            }
          >
            <option value={"curved"}>curved</option>
            <option value={"stepped"}>stepped</option>
            <option value={"linear"}>linear</option>
          </select>
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show Sprints:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.showSprints}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                showSprints: event.target.checked,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show extra Metrics</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.showExtraMetrics}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                showExtraMetrics: event.target.checked,
              })
            }
          />
        </label>
      </div>
    </>
  );
}

export default Settings;

//<select
//
//  className="select select-bordered select-sm"
//  defaultValue={props.settings.file}
//  onChange={(e) => {
//    setGlobalCurrentFile(e.target.value);
//    props.setSettings({
//      file: e.target.value,
//      splitAdditionsDeletions: props.settings.splitAdditionsDeletions,
//      visualizationStyle: props.settings.visualizationStyle,
//      showSprints: props.settings.showSprints,
//    });
//  }}
//>
//  {files.map((f, index) => (
//    <option key={index} value={f.path}>
//      {f.path}
//    </option>
//  ))}
//</select>
