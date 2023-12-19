import { makeInitDB } from "./database";
import LocalDB from "./localDB";
import ServerDB from "./serverDB";
import PreflighCheck from "../preflight"

let localdb = new LocalDB()
let serverdb = new ServerDB()

export const offlineContainer = {
  initDb: makeInitDB({ database: localdb }),
};
export const onlineContainer = {
  initDb: makeInitDB({ database: serverdb }),
};

export const container = () => {
  if(PreflighCheck.preflightCheck().online) {
    return {
      initDb: makeInitDB({ database: serverdb }),
    }
  } else {
    return {
      initDb: makeInitDB({ database: localdb }),
    }
  }
}

export const OfflineContainer = typeof offlineContainer;
export const OnlineContainer = typeof onlineContainer;
export const Container = typeof container();
