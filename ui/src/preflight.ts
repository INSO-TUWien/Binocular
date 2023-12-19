export class PreflighCheckResult {
  online: boolean = false;

  constructor(online: boolean) {
    this.online = online;
  }
};

let preflightResult: PreflighCheckResult
let instance;

const default_fetch_options: RequestInit = {
  mode: 'no-cors',
};

class PreflighCheck {
  constructor() {
    if (instance) {
      throw new Error("You can only create one instance!");
    }
    instance = this;
  }

  getInstance() {
    return this;
  }

  preflightCheck(fetch_options: RequestInit = default_fetch_options): PreflighCheckResult {
    if (preflightResult) {
      console.log("cached");
    }
    else {
      console.log("non cached")
      preflightResult = this._preflightCheck(fetch_options)
    }
    return preflightResult
  }
  
  private _preflightCheck(fetch_options: RequestInit = default_fetch_options): PreflighCheckResult {
    if (navigator.onLine) {
      console.log('navigator is online');
      Promise.all([
        // URL proxies as defined in vite.config.ts
        fetch('/api', fetch_options),
        fetch('/graphQl', fetch_options),
        fetch('/wsapi', fetch_options),
      ])
        .then(([res_api, res_graphql, res_wsapi]) => {
          if (res_api.ok && res_graphql.ok && res_wsapi.ok) {
            const check_status = (response: Response) => response.status >= 200 && response.status < 300;
            // if (check_status(res_api) && check_status(res_graphql) && check_status(res_wsapi)) {
            if ([res_api, res_graphql, res_wsapi].map((r) => check_status(r))) {
              console.log('CONNECTED TO INTERNET');
              // TODO: normal app
              return new PreflighCheckResult(true);
            }
          } else {
            console.log('INTERNET CONNECTIVITY ISSUE');
            return new PreflighCheckResult(false);
          }
        })
        .catch((error) => {
          console.error(error);
          throw new Error('Error in preflight check');
        });
    } else {
      console.log('navigator is offline');
    }
    return new PreflighCheckResult(false);
  }
}

const singletonCounter = Object.freeze(new PreflighCheck());
export default singletonCounter;
