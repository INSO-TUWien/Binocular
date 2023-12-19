// TODO: should be inside src!

import { createRoot } from "react-dom/client";
import MainApp from "./src/main";
import Database from "./src/database/database";
import PreflighCheck from "./src/preflight";
import React from "react";

const isOnline = PreflighCheck.preflightCheck().online;
if(!isOnline) {
  console.log("init")
  Database.initDB().then();
}

createRoot(document.getElementById('root') as HTMLElement).render(<React.StrictMode><MainApp/></React.StrictMode>);
// createRoot(document.getElementById('root') as HTMLElement).render(<MainApp/>);
