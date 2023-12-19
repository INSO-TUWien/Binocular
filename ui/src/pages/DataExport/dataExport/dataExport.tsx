import "./DataExport.scss"
import { useEffect, useRef, useState } from "react";
import { useSelector, useStore } from "react-redux";
import GetData from "./helper/getData";
import Database from "../../../database/database";
import LoadingSpinnerComponent from "../../../components/LoadingSpinner/LoadingSpinner";

export interface DataExportProps {
}

interface Collection {
  branches: Array<any>,
  builds: Array<any>,
  commits: Array<any>,
  files: Array<any>,
  issues: Array<any>,
  modules: Array<any>,
  stakeholders: Array<any>,
  mergeRequests: Array<any>,
}

interface Relation {
  commits_commits: Array<any>
  commits_files: Array<any>
  commits_files_stakeholders: Array<any>
  commits_stakeholders: Array<any>
  issues_commits: Array<any>
  issues_stakeholders: Array<any>
  modules_files: Array<any>
  modules_modules: Array<any>
}

const className = "DataExport"

const DataExport: React.FC<DataExportProps> = ({
}) => {
  // const exportType = useSelector((state) => state.exportType)
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<Array>([]);
  const [collections, setCollections] = useState<Collection>();
  const [relations, setRelations] = useState<Relation>();

  // const store = useStore()
  // console.log(store.getState())

  useEffect(() => {
    async function init() {
      const database = await Database.getDatabase()

      setCollections({
        branches: database.branches,
        builds: database.builds,
        commits: database.commits,
        files: database.files,
        issues: database.issues,
        modules: database.modules,
        stakeholders: database.stakeholders,
        mergeRequests: database.mergeRequests
      })

      setRelations({
        commits_commits: database.commits_commits,
        commits_files: database.commits_files,
        commits_files_stakeholders: database.commits_files_stakeholders,
        commits_stakeholders: database.commits_stakeholders,
        issues_commits: database.issues_commits,
        issues_stakeholders: database.issues_stakeholders,
        modules_files: database.modules_files,
        modules_modules: database.modules_modules,
      })

      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return <LoadingSpinnerComponent />
  }

  function preview(r) {
    console.log(r)
    setPreviewData(r)
  }

  const createObjectContainer = (object) => {
    return Object.keys(object).map((r) => {
      return (
        <div className="is-flex is-justify-content-space-between mb-2">
          <span className="mr-6">{r}</span>
          <button className="button is-primary" onClick={() => preview(object[r])}>Preview</button>
        </div>
      )
    })
  }

  return (<div className={`${className} mt-2`}>
    <div>
      <div className="is-flex is-justify-content-space-evenly">
        <h1 className="title">Data Export</h1>
        <button className="button is-primary " onClick={() => setPreviewData(undefined)}>Reset</button>
      </div>
      <div className="is-flex is-justify-content-space-around">
        <div className="is-fullwidth">
          <h2 className="subtitle has-text-centered">Collections</h2>
          <div className="is-fullwidth">
            {createObjectContainer(collections)}
          </div>
        </div>
        {/* <hr /> */}
        <div className="">
          <h2 className="subtitle has-text-centered">Relations</h2>
          <div>
            {createObjectContainer(relations)}
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div className="preview pr-7">
      <h2 className="title pb-2 pt-2">
        Preview
      </h2>
      <div className="table-container">
        <table className="table is-fullwidth">
          <thead>
            <tr>
              {previewData && previewData[0] && Object.keys(previewData[0]).map(val => {
                return (<th>{val}</th>)
              })
              }
            </tr>
          </thead>
          <tbody>
            {previewData && previewData.map((data) => {
              return (<tr key={data["_id"]}>{
                Object.keys(data).map((k, v) => {
                  return (<td>{JSON.stringify(data[k])}</td>)
                })
              }</tr>)
            })
            }
          </tbody>
        </table>
      </div>
    </div>
    <hr />
    <div className="dropdown is-active is-up">
      <div className="dropdown-trigger">
        <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={() => setShow(!show)}>
          <span>Download</span>
          <span className="icon is-small">
            <i className="fas fa-angle-up" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div className={`dropdown-menu ${show ? '' : 'is-hidden'}`} id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          <a href="#" className="dropdown-item">
            Dropdown item
          </a>
          <a className="dropdown-item">
            <p>CSV</p>
          </a>
          <a className="dropdown-item">
            <p>JSON</p>
          </a>
        </div>
      </div>
    </div>
  </div>
  )
}

export default DataExport;
