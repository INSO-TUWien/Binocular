import { DataPluginIssue, DataPluginIssues } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default class Issues implements DataPluginIssues {
  constructor() {}

  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    return new Promise<DataPluginIssue[]>((resolve) => {
      const issues: DataPluginIssue[] = [
        {
          "iid": "235",
          "title": "✨ Stakeholders Collection Redesign",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/235",
          "createdAt": "2024-03-19T07:20:53Z",
          "closedAt": "2024-06-12T14:44:10Z",
          "author": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignee": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignees": [
            {
              "login": "Nyzabes",
              "name": "Sebastian Watzinger"
            }
          ]
        },
        {
          "iid": "238",
          "title": "Update Arango Image",
          "state": "OPEN",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/238",
          "createdAt": "2024-04-24T17:34:24Z",
          "closedAt": null,
          "author": {
            "login": "uberroot4",
            "name": "Manuel Stöger"
          },
          "assignee": null,
          "assignees": []
        },
        {
          "iid": "245",
          "title": "✨ Offline Launch Performance",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/245",
          "createdAt": "2024-07-02T09:29:21Z",
          "closedAt": "2024-07-22T10:39:35Z",
          "author": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignee": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignees": [
            {
              "login": "Nyzabes",
              "name": "Sebastian Watzinger"
            }
          ]
        },
        {
          "iid": "249",
          "title": "✨ Commit History",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/249",
          "createdAt": "2024-07-24T08:58:00Z",
          "closedAt": "2024-08-02T14:47:24Z",
          "author": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignee": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignees": [
            {
              "login": "Nyzabes",
              "name": "Sebastian Watzinger"
            }
          ]
        },
        {
          "iid": "251",
          "title": "✅ additional tests",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/251",
          "createdAt": "2024-08-02T14:51:37Z",
          "closedAt": "2024-09-25T08:23:12Z",
          "author": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignee": {
            "login": "Nyzabes",
            "name": "Sebastian Watzinger"
          },
          "assignees": [
            {
              "login": "Nyzabes",
              "name": "Sebastian Watzinger"
            }
          ]
        },
        {
          "iid": "258",
          "title": "♻️ convert CI Indexer to TS",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/258",
          "createdAt": "2024-10-04T10:05:57Z",
          "closedAt": "2024-11-08T11:42:35Z",
          "author": {
            "login": "MaximilianZenz",
            "name": "Maximilian Zenz"
          },
          "assignee": {
            "login": "bastianferch",
            "name": "Bastian Ferch"
          },
          "assignees": [
            {
              "login": "bastianferch",
              "name": "Bastian Ferch"
            }
          ]
        },
        {
          "iid": "261",
          "title": "✨ (New Frontend) Receive Updates from the Backend",
          "state": "OPEN",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/261",
          "createdAt": "2024-10-11T06:14:29Z",
          "closedAt": null,
          "author": {
            "login": "MaximilianZenz",
            "name": "Maximilian Zenz"
          },
          "assignee": {
            "login": "MaximilianZenz",
            "name": "Maximilian Zenz"
          },
          "assignees": [
            {
              "login": "MaximilianZenz",
              "name": "Maximilian Zenz"
            }
          ]
        },
        {
          "iid": "263",
          "title": "✨ (New Frontend) Port Ci Builds Visualization",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/263",
          "createdAt": "2024-11-11T08:43:29Z",
          "closedAt": "2024-11-29T10:23:40Z",
          "author": {
            "login": "bastianferch",
            "name": "Bastian Ferch"
          },
          "assignee": {
            "login": "bastianferch",
            "name": "Bastian Ferch"
          },
          "assignees": [
            {
              "login": "bastianferch",
              "name": "Bastian Ferch"
            }
          ]
        },
        {
          "iid": "265",
          "title": "✨ (New Frontend) Stats Component",
          "state": "OPEN",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/265",
          "createdAt": "2024-11-21T12:23:00Z",
          "closedAt": null,
          "author": {
            "login": "Megalokom",
            "name": "Michael Strasser"
          },
          "assignee": {
            "login": "Megalokom",
            "name": "Michael Strasser"
          },
          "assignees": [
            {
              "login": "Megalokom",
              "name": "Michael Strasser"
            }
          ]
        },
        {
          "iid": "266",
          "title": "🔨 Update Actions for new Repository Path",
          "state": "CLOSED",
          "webUrl": "https://github.com/INSO-World/Binocular/issues/266",
          "createdAt": "2024-11-22T06:28:11Z",
          "closedAt": "2024-11-29T11:06:02Z",
          "author": {
            "login": "MaximilianZenz",
            "name": "Maximilian Zenz"
          },
          "assignee": {
            "login": "MaximilianZenz",
            "name": "Maximilian Zenz"
          },
          "assignees": [
            {
              "login": "MaximilianZenz",
              "name": "Maximilian Zenz"
            }
          ]
        },
      ];
      resolve(issues);
    });
  }
}
