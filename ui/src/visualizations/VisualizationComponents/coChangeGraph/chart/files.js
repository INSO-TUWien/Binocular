const files = [
    {
        "id": "files/2318",
        "path": ".editorconfig"
    },
    {
        "id": "files/2320",
        "path": ".gitignore"
    },
    {
        "id": "files/2322",
        "path": ".jscsrc"
    },
    {
        "id": "files/2324",
        "path": "package.json"
    },
    {
        "id": "files/2326",
        "path": ".jshintrc"
    },
    {
        "id": "files/2328",
        "path": "pupil.js"
    },
    {
        "id": "files/2330",
        "path": ".nvmrc"
    },
    {
        "id": "files/2396",
        "path": "yarn.lock"
    },
    {
        "id": "files/2430",
        "path": "lib/config.js"
    },
    {
        "id": "files/2534",
        "path": "lib/package.json"
    },
    {
        "id": "files/2537",
        "path": "test/.jshintrc"
    },
    {
        "id": "files/2539",
        "path": "test/pupil.test.js"
    },
    {
        "id": "files/2616",
        "path": "webpack.config.js"
    },
    {
        "id": "files/2621",
        "path": "ui/index.html"
    },
    {
        "id": "files/2623",
        "path": "ui/index.js"
    },
    {
        "id": "files/2684",
        "path": ".gitlab-ci.yml"
    },
    {
        "id": "files/2759",
        "path": "lib/context.js"
    },
    {
        "id": "files/2913",
        "path": ".nodemonrc"
    },
    {
        "id": "files/2927",
        "path": "ui/index.jsx"
    },
    {
        "id": "files/2941",
        "path": "ui/components/hello-world.jsx"
    },
    {
        "id": "files/3114",
        "path": "lib/git.js"
    },
    {
        "id": "files/3210",
        "path": "lib/db.js"
    },
    {
        "id": "files/3466",
        "path": "ui/components/app.jsx"
    },
    {
        "id": "files/3468",
        "path": "ui/components/sidebar.jsx"
    },
    {
        "id": "files/3557",
        "path": ".babelrc"
    },
    {
        "id": "files/3562",
        "path": ".jestrc"
    },
    {
        "id": "files/3581",
        "path": "scripts/collect-coverage.js"
    },
    {
        "id": "files/3584",
        "path": ".jestrc-coverage"
    },
    {
        "id": "files/3588",
        "path": "ui/actions.jsx"
    },
    {
        "id": "files/3592",
        "path": "ui/reducers/activeVisualization.jsx"
    },
    {
        "id": "files/3602",
        "path": "ui/reducers/index.jsx"
    },
    {
        "id": "files/3608",
        "path": "ui/reducers/visualizations.jsx"
    },
    {
        "id": "files/3607",
        "path": "ui/test/.jshintrc"
    },
    {
        "id": "files/3612",
        "path": "ui/test/switchVisualization.test.js"
    },
    {
        "id": "files/3616",
        "path": "ui/components/sidebar/SidebarPanel.jsx"
    },
    {
        "id": "files/3618",
        "path": "ui/components/sidebar/PanelLink.jsx"
    },
    {
        "id": "files/3622",
        "path": "ui/components/sidebar/sidebar.css"
    },
    {
        "id": "files/3624",
        "path": "ui/components/sidebar/index.jsx"
    },
    {
        "id": "files/3626",
        "path": "ui/components/sidebar/Link.jsx"
    },
    {
        "id": "files/3785",
        "path": "lib/endpoints/get-commits.js"
    },
    {
        "id": "files/3862",
        "path": "test/fake.js"
    },
    {
        "id": "files/3864",
        "path": "test/helpers.js"
    },
    {
        "id": "files/4071",
        "path": "ui/components/app.css"
    },
    {
        "id": "files/4076",
        "path": "ui/components/charts/code-ownership-river.css"
    },
    {
        "id": "files/4080",
        "path": "ui/components/charts/code-ownership-river.jsx"
    },
    {
        "id": "files/4083",
        "path": "ui/components/charts/issue-impact.css"
    },
    {
        "id": "files/4084",
        "path": "ui/components/charts/hotspot-dials.css"
    },
    {
        "id": "files/4086",
        "path": "ui/components/charts/hotspot-dials.jsx"
    },
    {
        "id": "files/4092",
        "path": "ui/components/charts/issue-impact.jsx"
    },
    {
        "id": "files/4217",
        "path": "ui/icons/config.svg"
    },
    {
        "id": "files/4221",
        "path": "ui/icons/index.jsx"
    },
    {
        "id": "files/4227",
        "path": "ui/components/config-dialog/config-dialog.scss"
    },
    {
        "id": "files/4229",
        "path": "ui/components/config-dialog/config-dialog.jsx"
    },
    {
        "id": "files/4233",
        "path": "ui/components/config-button/ConfigButton.jsx"
    },
    {
        "id": "files/4237",
        "path": "ui/components/config-dialog/index.jsx"
    },
    {
        "id": "files/4239",
        "path": "ui/components/icon/index.jsx"
    },
    {
        "id": "files/4241",
        "path": "ui/components/config-button/config-button.css"
    },
    {
        "id": "files/4243",
        "path": "ui/components/config-button/index.jsx"
    },
    {
        "id": "files/4245",
        "path": "ui/components/icon/icon.css"
    },
    {
        "id": "files/4395",
        "path": "ui/components/config-dialog/ConfigDialog.jsx"
    },
    {
        "id": "files/4398",
        "path": "ui/components/message/Message.jsx"
    },
    {
        "id": "files/4400",
        "path": "ui/components/message/index.jsx"
    },
    {
        "id": "files/4406",
        "path": "ui/components/sidebar/Sidebar.jsx"
    },
    {
        "id": "files/4408",
        "path": "ui/components/message/message.css"
    },
    {
        "id": "files/4558",
        "path": "ui/utils.jsx"
    },
    {
        "id": "files/4560",
        "path": "lib/endpoints/get-config.js"
    },
    {
        "id": "files/4574",
        "path": "ui/reducers/config.jsx"
    },
    {
        "id": "files/4578",
        "path": "ui/components/monospaced/monospaced.scss"
    },
    {
        "id": "files/4580",
        "path": "ui/components/monospaced/index.jsx"
    },
    {
        "id": "files/4681",
        "path": "ui/components/config-button/config-button.scss"
    },
    {
        "id": "files/4782",
        "path": "ui/global.scss"
    },
    {
        "id": "files/4788",
        "path": "ui/components/FormControl.jsx"
    },
    {
        "id": "files/4794",
        "path": "ui/icons/link.svg"
    },
    {
        "id": "files/4886",
        "path": ".jshintignore"
    },
    {
        "id": "files/4985",
        "path": "lib/RepositoryIndexer.js"
    },
    {
        "id": "files/5229",
        "path": "lib/endpoints/update-config.js"
    },
    {
        "id": "files/5325",
        "path": "ui/components/Labeled.jsx"
    },
    {
        "id": "files/5699",
        "path": "lib/indexers/LocalIndexer.js"
    },
    {
        "id": "files/5701",
        "path": "lib/indexers/GitLabIndexer.js"
    },
    {
        "id": "files/6398",
        "path": "ui/reducers/commits.jsx"
    },
    {
        "id": "files/6402",
        "path": "ui/reducers/notifications.jsx"
    },
    {
        "id": "files/6425",
        "path": "ui/components/notifications/Notification.jsx"
    },
    {
        "id": "files/6428",
        "path": "ui/components/notifications/index.jsx"
    },
    {
        "id": "files/6429",
        "path": "ui/components/notifications/Notifications.jsx"
    },
    {
        "id": "files/6431",
        "path": "ui/components/notifications/notification.scss"
    },
    {
        "id": "files/6433",
        "path": "ui/components/notifications/notifications.scss"
    },
    {
        "id": "files/6447",
        "path": "ui/components/visualizations/code-ownership-river/Axis.jsx"
    },
    {
        "id": "files/6449",
        "path": "ui/components/visualizations/code-ownership-river/chart.jsx"
    },
    {
        "id": "files/6451",
        "path": "ui/components/visualizations/code-ownership-river/config.jsx"
    },
    {
        "id": "files/6453",
        "path": "ui/components/visualizations/code-ownership-river/index.jsx"
    },
    {
        "id": "files/6612",
        "path": "lib/setup-db.js"
    },
    {
        "id": "files/6652",
        "path": "lib/models/Commit.js"
    },
    {
        "id": "files/6656",
        "path": "lib/models/File.js"
    },
    {
        "id": "files/6658",
        "path": "lib/models/Issue.js"
    },
    {
        "id": "files/6660",
        "path": "lib/models/User.js"
    },
    {
        "id": "files/6662",
        "path": "lib/models/Hunk.js"
    },
    {
        "id": "files/7212",
        "path": "lib/models/BlameHunk.js"
    },
    {
        "id": "files/7331",
        "path": "ui/components/visualizations/code-ownership-river/styles.scss"
    },
    {
        "id": "files/7678",
        "path": "lib/progress-reporter.js"
    },
    {
        "id": "files/7698",
        "path": "test/progress-reporter.test.js"
    },
    {
        "id": "files/7720",
        "path": "lib/endpoints/progress.js"
    },
    {
        "id": "files/7726",
        "path": "ui/reducers/progress.jsx"
    },
    {
        "id": "files/7892",
        "path": "ui/components/progress-bar/Filler.jsx"
    },
    {
        "id": "files/7899",
        "path": "ui/components/progress-bar/ProgressBar.jsx"
    },
    {
        "id": "files/7902",
        "path": "ui/components/progress-bar/index.jsx"
    },
    {
        "id": "files/7904",
        "path": "ui/components/progress-bar/progress-bar.scss"
    },
    {
        "id": "files/8012",
        "path": ".eslintignore"
    },
    {
        "id": "files/8013",
        "path": ".eslintrc.yml"
    },
    {
        "id": "files/8028",
        "path": "test/.eslintrc.yml"
    },
    {
        "id": "files/8030",
        "path": "ui/.eslintrc.yml"
    },
    {
        "id": "files/8032",
        "path": "ui/test/.eslintrc.yml"
    },
    {
        "id": "files/8172",
        "path": "ui/src/actions.js"
    },
    {
        "id": "files/8291",
        "path": "ui/src/customErrorReporter.js"
    },
    {
        "id": "files/8290",
        "path": "ui/src/global.scss"
    },
    {
        "id": "files/8293",
        "path": "ui/src/index.js"
    },
    {
        "id": "files/8310",
        "path": "ui/src/routes.js"
    },
    {
        "id": "files/8314",
        "path": "ui/src/utils.js"
    },
    {
        "id": "files/8318",
        "path": "ui/src/reducers/commits.js"
    },
    {
        "id": "files/8320",
        "path": "ui/src/reducers/activeVisualization.js"
    },
    {
        "id": "files/8322",
        "path": "ui/src/reducers/config.js"
    },
    {
        "id": "files/8324",
        "path": "ui/src/reducers/index.js"
    },
    {
        "id": "files/8326",
        "path": "ui/src/reducers/progress.js"
    },
    {
        "id": "files/8328",
        "path": "ui/src/reducers/notifications.js"
    },
    {
        "id": "files/8330",
        "path": "ui/src/components/FormControl.js"
    },
    {
        "id": "files/8332",
        "path": "ui/src/reducers/visualizations.js"
    },
    {
        "id": "files/8334",
        "path": "ui/src/components/Labeled.js"
    },
    {
        "id": "files/8336",
        "path": "ui/src/components/Root.js"
    },
    {
        "id": "files/8342",
        "path": "ui/src/components/App/app.css"
    },
    {
        "id": "files/8344",
        "path": "ui/src/components/App/index.js"
    },
    {
        "id": "files/8346",
        "path": "ui/src/components/ConfigButton/ConfigButton.js"
    },
    {
        "id": "files/8348",
        "path": "ui/src/components/ConfigButton/config-button.scss"
    },
    {
        "id": "files/8352",
        "path": "ui/src/components/ConfigButton/index.js"
    },
    {
        "id": "files/8354",
        "path": "ui/src/components/ConfigDialog/ConfigDialog.js"
    },
    {
        "id": "files/8357",
        "path": "ui/src/components/ConfigDialog/index.js"
    },
    {
        "id": "files/8358",
        "path": "ui/src/components/ConfigDialog/config-dialog.scss"
    },
    {
        "id": "files/8360",
        "path": "ui/src/components/ProgressBar/Filler.js"
    },
    {
        "id": "files/8362",
        "path": "ui/src/components/ProgressBar/ProgressBar.js"
    },
    {
        "id": "files/8364",
        "path": "ui/src/components/ProgressBar/index.js"
    },
    {
        "id": "files/8366",
        "path": "ui/src/components/ProgressBar/progress-bar.scss"
    },
    {
        "id": "files/8368",
        "path": "ui/src/components/Sidebar/Link.js"
    },
    {
        "id": "files/8370",
        "path": "ui/src/components/Sidebar/PanelLink.js"
    },
    {
        "id": "files/8372",
        "path": "ui/src/components/Sidebar/Sidebar.js"
    },
    {
        "id": "files/8375",
        "path": "ui/src/components/Sidebar/index.js"
    },
    {
        "id": "files/8376",
        "path": "ui/src/components/Sidebar/sidebar.css"
    },
    {
        "id": "files/8378",
        "path": "ui/src/components/charts/code-ownership-river.css"
    },
    {
        "id": "files/8380",
        "path": "ui/src/components/charts/code-ownership-river.js"
    },
    {
        "id": "files/8382",
        "path": "ui/src/components/charts/code-ownership-river.jsx"
    },
    {
        "id": "files/8384",
        "path": "ui/src/components/charts/hotspot-dials.css"
    },
    {
        "id": "files/8386",
        "path": "ui/src/components/charts/hotspot-dials.js"
    },
    {
        "id": "files/8388",
        "path": "ui/src/components/charts/hotspot-dials.jsx"
    },
    {
        "id": "files/8390",
        "path": "ui/src/components/charts/issue-impact.css"
    },
    {
        "id": "files/8392",
        "path": "ui/src/components/charts/issue-impact.jsx"
    },
    {
        "id": "files/8394",
        "path": "ui/src/components/icon/icon.css"
    },
    {
        "id": "files/8396",
        "path": "ui/src/components/charts/issue-impact.js"
    },
    {
        "id": "files/8398",
        "path": "ui/src/components/icon/index.js"
    },
    {
        "id": "files/8400",
        "path": "ui/src/components/message/Message.js"
    },
    {
        "id": "files/8402",
        "path": "ui/src/components/message/index.js"
    },
    {
        "id": "files/8404",
        "path": "ui/src/components/monospaced/index.js"
    },
    {
        "id": "files/8406",
        "path": "ui/src/components/message/message.css"
    },
    {
        "id": "files/8408",
        "path": "ui/src/components/monospaced/monospaced.scss"
    },
    {
        "id": "files/8410",
        "path": "ui/src/components/notifications/Notification.js"
    },
    {
        "id": "files/8413",
        "path": "ui/src/components/notifications/index.js"
    },
    {
        "id": "files/8414",
        "path": "ui/src/components/notifications/Notifications.js"
    },
    {
        "id": "files/8416",
        "path": "ui/src/components/notifications/notification.scss"
    },
    {
        "id": "files/8420",
        "path": "ui/src/components/notifications/notifications.scss"
    },
    {
        "id": "files/8426",
        "path": "ui/src/components/visualizations/code-ownership-river/chart.js"
    },
    {
        "id": "files/8428",
        "path": "ui/src/components/visualizations/code-ownership-river/Axis.js"
    },
    {
        "id": "files/8432",
        "path": "ui/src/components/visualizations/code-ownership-river/config.js"
    },
    {
        "id": "files/8431",
        "path": "ui/src/components/visualizations/code-ownership-river/index.js"
    },
    {
        "id": "files/8434",
        "path": "ui/src/components/visualizations/code-ownership-river/styles.scss"
    },
    {
        "id": "files/8864",
        "path": "foxx/index.js"
    },
    {
        "id": "files/8866",
        "path": "foxx/LICENSE"
    },
    {
        "id": "files/8913",
        "path": "foxx/manifest.json"
    },
    {
        "id": "files/8927",
        "path": "foxx/schema.graphql"
    },
    {
        "id": "files/8931",
        "path": "foxx/schema.js"
    },
    {
        "id": "files/8939",
        "path": "foxx/scripts/teardown.js"
    },
    {
        "id": "files/8943",
        "path": "foxx/scripts/setup.js"
    },
    {
        "id": "files/8945",
        "path": "foxx/test/LICENSE"
    },
    {
        "id": "files/8947",
        "path": "foxx/test/introspection.js"
    },
    {
        "id": "files/8949",
        "path": "foxx/test/queries.js"
    },
    {
        "id": "files/8951",
        "path": "foxx/test/validation.js"
    },
    {
        "id": "files/8953",
        "path": "lib/errors/IllegalArgumentError.js"
    },
    {
        "id": "files/8955",
        "path": "lib/foxx/index.js"
    },
    {
        "id": "files/8957",
        "path": "lib/models/BlameHunkFileConnection.js"
    },
    {
        "id": "files/8959",
        "path": "lib/models/CommitBlameHunkConnection.js"
    },
    {
        "id": "files/8961",
        "path": "lib/models/Connection.js"
    },
    {
        "id": "files/8963",
        "path": "lib/models/Model.js"
    },
    {
        "id": "files/9231",
        "path": "foxx/types/commit.js"
    },
    {
        "id": "files/9232",
        "path": "foxx/types/blameHunk.js"
    },
    {
        "id": "files/9234",
        "path": "foxx/types/file.js"
    },
    {
        "id": "files/9430",
        "path": "foxx/types/stakeholder.js"
    },
    {
        "id": "files/9449",
        "path": "lib/models/BlameHunkStakeholderConnection.js"
    },
    {
        "id": "files/9451",
        "path": "lib/models/CommitStakeholderConnection.js"
    },
    {
        "id": "files/9453",
        "path": "lib/models/ModelCursor.js"
    },
    {
        "id": "files/9455",
        "path": "lib/models/Stakeholder.js"
    },
    {
        "id": "files/9610",
        "path": "ui/src/reducers/activeConfigTab.js"
    },
    {
        "id": "files/9726",
        "path": "foxx/types/issue.js"
    },
    {
        "id": "files/9749",
        "path": "lib/models/IssueStakeholderConnection.js"
    },
    {
        "id": "files/10457",
        "path": "package-lock.json"
    },
    {
        "id": "files/10473",
        "path": "ui/src/components/ProgressBar/Pie.js"
    },
    {
        "id": "files/10560",
        "path": "ui/src/sagas.js"
    },
    {
        "id": "files/10643",
        "path": "ui/src/components/visualizations/code-ownership-river/GridLines.js"
    },
    {
        "id": "files/11557",
        "path": "ui/src/components/visualizations/code-ownership-river/CommitMarker.js"
    },
    {
        "id": "files/11652",
        "path": ".jestrc.json"
    },
    {
        "id": "files/11654",
        "path": ".jestrc-coverage.json"
    },
    {
        "id": "files/12381",
        "path": ".dockerignore"
    },
    {
        "id": "files/12383",
        "path": ".npmignore"
    },
    {
        "id": "files/12397",
        "path": "Dockerfile"
    },
    {
        "id": "files/12404",
        "path": "lib/utils.js"
    },
    {
        "id": "files/12584",
        "path": "ui/src/reducers/codeOwnershipData.js"
    },
    {
        "id": "files/12711",
        "path": "lib/models/IssueCommitConnection.js"
    },
    {
        "id": "files/12942",
        "path": "ui/src/reducers/codeOwnershipConfig.js"
    },
    {
        "id": "files/12951",
        "path": "ui/src/sagas/CodeOwnershipRiver.js"
    },
    {
        "id": "files/13094",
        "path": "ui/src/components/SearchBox/index.js"
    },
    {
        "id": "files/13096",
        "path": "ui/src/components/SearchBox/styles.scss"
    },
    {
        "id": "files/13232",
        "path": "ui/src/sagas/index.js"
    },
    {
        "id": "files/13248",
        "path": "ui/src/sagas/utils.js"
    },
    {
        "id": "files/13256",
        "path": "ui/src/sagas/config.js"
    },
    {
        "id": "files/13408",
        "path": "ui/src/components/svg/Asterisk.js"
    },
    {
        "id": "files/13410",
        "path": "ui/src/components/svg/X.js"
    },
    {
        "id": "files/13665",
        "path": "lib/models/CommitCommitConnection.js"
    },
    {
        "id": "files/13826",
        "path": "ui/src/components/visualizations/code-ownership-river/StackedArea.js"
    },
    {
        "id": "files/13970",
        "path": "ui/src/components/Legend/index.js"
    },
    {
        "id": "files/13972",
        "path": "ui/src/components/Legend/Legend.js"
    },
    {
        "id": "files/13974",
        "path": "ui/src/components/Legend/legend.scss"
    },
    {
        "id": "files/14071",
        "path": "foxx/types/hunk.js"
    },
    {
        "id": "files/14092",
        "path": "lib/errors/error-class-factory.js"
    },
    {
        "id": "files/14104",
        "path": "lib/models/CommitHunkConnection.js"
    },
    {
        "id": "files/14106",
        "path": "lib/models/FileHunkConnection.js"
    },
    {
        "id": "files/14339",
        "path": "ui/src/components/visualizations/issue-impact/chart.js"
    },
    {
        "id": "files/14341",
        "path": "ui/src/components/visualizations/issue-impact/index.js"
    },
    {
        "id": "files/14343",
        "path": "ui/src/components/visualizations/issue-impact/styles.scss"
    },
    {
        "id": "files/14454",
        "path": "ui/src/reducers/issueImpactConfig.js"
    },
    {
        "id": "files/14456",
        "path": "ui/src/reducers/issueImpactData.js"
    },
    {
        "id": "files/14458",
        "path": "ui/src/sagas/IssueImpact.js"
    },
    {
        "id": "files/14582",
        "path": "foxx/types/fileInCommit.js"
    },
    {
        "id": "files/14586",
        "path": "foxx/types/json.js"
    },
    {
        "id": "files/14717",
        "path": "ui/src/components/visualizations/issue-impact/config.js"
    },
    {
        "id": "files/14889",
        "path": "ui/src/components/FilterBox/index.js"
    },
    {
        "id": "files/14903",
        "path": "ui/src/components/FilterBox/styles.scss"
    },
    {
        "id": "files/15127",
        "path": "ui/src/components/svg/AsteriskMarker.js"
    },
    {
        "id": "files/15133",
        "path": "ui/src/components/svg/XMarker.js"
    },
    {
        "id": "files/15277",
        "path": "ui/src/sagas/notifications.js"
    },
    {
        "id": "files/15382",
        "path": "ui/src/components/visualizations/issue-impact/hunkTransitions.scss"
    },
    {
        "id": "files/15459",
        "path": "lib/indexers/index.js"
    },
    {
        "id": "files/15490",
        "path": "lib/indexers/ci/GitLabCIIndexer.js"
    },
    {
        "id": "files/15494",
        "path": "lib/indexers/ci/index.js"
    },
    {
        "id": "files/15496",
        "path": "lib/indexers/vcs/GitIndexer.js"
    },
    {
        "id": "files/15498",
        "path": "lib/indexers/vcs/index.js"
    },
    {
        "id": "files/15500",
        "path": "lib/indexers/its/GitLabIndexer.js"
    },
    {
        "id": "files/15502",
        "path": "lib/indexers/its/index.js"
    },
    {
        "id": "files/15504",
        "path": "ui/src/components/morph/Morph.js"
    },
    {
        "id": "files/15506",
        "path": "ui/src/components/morph/MorphGroup.js"
    },
    {
        "id": "files/15508",
        "path": "ui/src/components/morph/index.js"
    },
    {
        "id": "files/15670",
        "path": "lib/indexers/its/GitHubIndexer.js"
    },
    {
        "id": "files/15723",
        "path": "foxx/pagination.js"
    },
    {
        "id": "files/15796",
        "path": "foxx/types/paginated.js"
    },
    {
        "id": "files/15893",
        "path": "foxx/query-helpers.js"
    },
    {
        "id": "files/15901",
        "path": "foxx/types/Timestamp.js"
    },
    {
        "id": "files/15978",
        "path": "foxx/types/Sort.js"
    },
    {
        "id": "files/16003",
        "path": "ui/src/reducers/graphQl.js"
    },
    {
        "id": "files/16029",
        "path": "ui/src/components/visualizations/code-ownership-river/chart.old.js"
    },
    {
        "id": "files/16031",
        "path": "ui/src/components/visualizations/code-ownership-river/getData.js"
    },
    {
        "id": "files/16195",
        "path": "lib/endpoints/graphQl.js"
    },
    {
        "id": "files/16400",
        "path": "ui/src/components/SearchBox/index.old.js"
    },
    {
        "id": "files/16598",
        "path": "ui/src/visualizations/code-ownership-river/CommitMarker.js"
    },
    {
        "id": "files/16600",
        "path": "ui/src/visualizations/code-ownership-river/Axis.js"
    },
    {
        "id": "files/16602",
        "path": "ui/src/visualizations/code-ownership-river/GridLines.js"
    },
    {
        "id": "files/16606",
        "path": "ui/src/visualizations/code-ownership-river/StackedArea.js"
    },
    {
        "id": "files/16608",
        "path": "ui/src/visualizations/code-ownership-river/chart.js"
    },
    {
        "id": "files/16610",
        "path": "ui/src/visualizations/code-ownership-river/chart.old.js"
    },
    {
        "id": "files/16612",
        "path": "ui/src/visualizations/code-ownership-river/config.js"
    },
    {
        "id": "files/16614",
        "path": "ui/src/visualizations/code-ownership-river/getData.js"
    },
    {
        "id": "files/16616",
        "path": "ui/src/visualizations/code-ownership-river/index.js"
    },
    {
        "id": "files/16618",
        "path": "ui/src/visualizations/code-ownership-river/styles.scss"
    },
    {
        "id": "files/16620",
        "path": "ui/src/visualizations/issue-impact/config.js"
    },
    {
        "id": "files/16622",
        "path": "ui/src/visualizations/issue-impact/chart.js"
    },
    {
        "id": "files/16624",
        "path": "ui/src/visualizations/issue-impact/hunkTransitions.scss"
    },
    {
        "id": "files/16626",
        "path": "ui/src/visualizations/issue-impact/index.js"
    },
    {
        "id": "files/16628",
        "path": "ui/src/visualizations/issue-impact/styles.scss"
    },
    {
        "id": "files/16636",
        "path": "ui/src/visualizations/code-ownership-river/sagas/getBounds.js"
    },
    {
        "id": "files/16638",
        "path": "ui/src/visualizations/code-ownership-river/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/16640",
        "path": "ui/src/visualizations/code-ownership-river/sagas/getCommitData.js"
    },
    {
        "id": "files/16642",
        "path": "ui/src/visualizations/code-ownership-river/sagas/getIssueData.js"
    },
    {
        "id": "files/16644",
        "path": "ui/src/visualizations/code-ownership-river/sagas/index.js"
    },
    {
        "id": "files/16825",
        "path": "ui/src/utils/ClosingPathContext.js"
    },
    {
        "id": "files/16829",
        "path": "ui/src/utils/graphQl.js"
    },
    {
        "id": "files/16838",
        "path": "ui/src/utils/index.js"
    },
    {
        "id": "files/17146",
        "path": "ui/src/visualizations/issue-impact/sagas/index.js"
    },
    {
        "id": "files/17351",
        "path": "ui/src/components/svg/ZoomableSvg.js"
    },
    {
        "id": "files/17419",
        "path": "lib/gitlab.js"
    },
    {
        "id": "files/17423",
        "path": "lib/paginater.js"
    },
    {
        "id": "files/17469",
        "path": "ui/src/components/svg/ChartContainer.js"
    },
    {
        "id": "files/17476",
        "path": "ui/src/components/svg/CustomZoomableChartContainer.js"
    },
    {
        "id": "files/17478",
        "path": "ui/src/components/svg/CustomZoomableSvg.js"
    },
    {
        "id": "files/17480",
        "path": "ui/src/components/svg/OffsetGroup.js"
    },
    {
        "id": "files/17625",
        "path": "lib/paginator.js"
    },
    {
        "id": "files/17627",
        "path": "test/paginator.test.js"
    },
    {
        "id": "files/17761",
        "path": "ui/src/utils/zoom.js"
    },
    {
        "id": "files/17775",
        "path": "ui/src/components/svg/GlobalZoomableSvg.js"
    },
    {
        "id": "files/17803",
        "path": "ui/src/components/svg/ZoomableChartContainer.js"
    },
    {
        "id": "files/17944",
        "path": "foxx/types/build.js"
    },
    {
        "id": "files/17960",
        "path": "lib/indexers/BaseGitLabIndexer.js"
    },
    {
        "id": "files/17971",
        "path": "lib/models/Build.js"
    },
    {
        "id": "files/17981",
        "path": "lib/indexers/its/GitLabITSIndexer.js"
    },
    {
        "id": "files/18228",
        "path": "ui/src/visualizations/issue-impact/SemiCircleScale.js"
    },
    {
        "id": "files/18568",
        "path": "foxx/types/histogram.js"
    },
    {
        "id": "files/18570",
        "path": "foxx/types/DateHistogramGranularity.js"
    },
    {
        "id": "files/18654",
        "path": "ui/src/visualizations/hotspot-dials/ClockScale.js"
    },
    {
        "id": "files/18659",
        "path": "ui/src/visualizations/hotspot-dials/chart.js"
    },
    {
        "id": "files/18661",
        "path": "ui/src/visualizations/hotspot-dials/config.js"
    },
    {
        "id": "files/18663",
        "path": "ui/src/visualizations/hotspot-dials/index.js"
    },
    {
        "id": "files/18665",
        "path": "ui/src/visualizations/hotspot-dials/styles.scss"
    },
    {
        "id": "files/18673",
        "path": "ui/src/visualizations/hotspot-dials/sagas/index.js"
    },
    {
        "id": "files/18787",
        "path": "ui/src/reducers/hotspotDialsConfig.js"
    },
    {
        "id": "files/18789",
        "path": "ui/src/reducers/hotspotDialsData.js"
    },
    {
        "id": "files/18938",
        "path": "ui/src/visualizations/hotspot-dials/Dial.js"
    },
    {
        "id": "files/19153",
        "path": "lib/url-providers/GitHubUrlProvider.js"
    },
    {
        "id": "files/19155",
        "path": "lib/url-providers/GitLabUrlProvider.js"
    },
    {
        "id": "files/19166",
        "path": "lib/url-providers/index.js"
    },
    {
        "id": "files/19205",
        "path": "ui/src/visualizations/hotspot-dials/DoubleDial.js"
    },
    {
        "id": "files/19443",
        "path": "ui/src/visualizations/code-ownership-river/reducers/data.js"
    },
    {
        "id": "files/19445",
        "path": "ui/src/visualizations/code-ownership-river/reducers/index.js"
    },
    {
        "id": "files/19447",
        "path": "ui/src/visualizations/code-ownership-river/reducers/config.js"
    },
    {
        "id": "files/19449",
        "path": "ui/src/visualizations/hotspot-dials/reducers/data.js"
    },
    {
        "id": "files/19451",
        "path": "ui/src/visualizations/hotspot-dials/reducers/config.js"
    },
    {
        "id": "files/19453",
        "path": "ui/src/visualizations/hotspot-dials/reducers/index.js"
    },
    {
        "id": "files/19455",
        "path": "ui/src/visualizations/issue-impact/reducers/config.js"
    },
    {
        "id": "files/19457",
        "path": "ui/src/visualizations/issue-impact/reducers/data.js"
    },
    {
        "id": "files/19459",
        "path": "ui/src/visualizations/issue-impact/reducers/index.js"
    },
    {
        "id": "files/19715",
        "path": "ui/src/visualizations/code-ownership-river/chart/Axis.js"
    },
    {
        "id": "files/19717",
        "path": "ui/src/visualizations/code-ownership-river/chart/CommitMarker.js"
    },
    {
        "id": "files/19719",
        "path": "ui/src/visualizations/code-ownership-river/chart/GridLines.js"
    },
    {
        "id": "files/19721",
        "path": "ui/src/visualizations/code-ownership-river/chart/StackedArea.js"
    },
    {
        "id": "files/19723",
        "path": "ui/src/visualizations/code-ownership-river/chart/chart.js"
    },
    {
        "id": "files/19725",
        "path": "ui/src/visualizations/code-ownership-river/chart/index.js"
    },
    {
        "id": "files/20105",
        "path": "ui/src/visualizations/code-ownership-river/sagas/getBuildData.js"
    },
    {
        "id": "files/20214",
        "path": "ui/src/components/TabCombo.js"
    },
    {
        "id": "files/20280",
        "path": "ui/src/components/Help/index.js"
    },
    {
        "id": "files/20290",
        "path": "ui/src/components/Help/styles.scss"
    },
    {
        "id": "files/20298",
        "path": "ui/src/visualizations/code-ownership-river/help.js"
    },
    {
        "id": "files/20304",
        "path": "ui/src/components/Help/HelpButton/HelpButton.js"
    },
    {
        "id": "files/20307",
        "path": "ui/src/components/Help/HelpButton/help-button.scss"
    },
    {
        "id": "files/20308",
        "path": "ui/src/components/Help/HelpButton/index.js"
    },
    {
        "id": "files/20504",
        "path": "ui/src/visualizations/hotspot-dials/help.js"
    },
    {
        "id": "files/20523",
        "path": "ui/src/visualizations/issue-impact/help.js"
    },
    {
        "id": "files/20529",
        "path": "ui/src/visualizations/code-ownership-river/chart/CommitMarker.scss"
    },
    {
        "id": "files/20695",
        "path": "lib/errors/ConfigurationError.js"
    },
    {
        "id": "files/21157",
        "path": "ui/favicon.ico"
    },
    {
        "id": "files/21301",
        "path": "README.md"
    },
    {
        "id": "files/21306",
        "path": "docs/CONTRIBUTING.md"
    },
    {
        "id": "files/21308",
        "path": "docs/cors.png"
    },
    {
        "id": "files/21310",
        "path": "docs/zivsed-architecture.png"
    },
    {
        "id": "files/21422",
        "path": "LICENSE"
    },
    {
        "id": "files/21577",
        "path": ".travis.yml"
    },
    {
        "id": "files/21880",
        "path": "ui/src/visualizations/dashboard/help.js"
    },
    {
        "id": "files/21882",
        "path": "ui/src/visualizations/dashboard/config.js"
    },
    {
        "id": "files/21936",
        "path": "ui/src/visualizations/dashboard/index.js"
    },
    {
        "id": "files/21938",
        "path": "ui/src/visualizations/dashboard/styles.scss"
    },
    {
        "id": "files/21940",
        "path": "ui/src/components/CheckboxLegend/CheckboxLegend.js"
    },
    {
        "id": "files/21943",
        "path": "ui/src/components/CheckboxLegend/checkboxLegend.scss"
    },
    {
        "id": "files/21944",
        "path": "ui/src/components/CheckboxLegend/index.js"
    },
    {
        "id": "files/21946",
        "path": "ui/src/components/LegendCompact/LegendCompact.js"
    },
    {
        "id": "files/21948",
        "path": "ui/src/components/LegendCompact/index.js"
    },
    {
        "id": "files/21950",
        "path": "ui/src/components/LegendCompact/legendCompact.scss"
    },
    {
        "id": "files/21956",
        "path": "ui/src/visualizations/dashboard/chart/Axis.js"
    },
    {
        "id": "files/21958",
        "path": "ui/src/visualizations/dashboard/chart/CommitMarker.js"
    },
    {
        "id": "files/21960",
        "path": "ui/src/visualizations/dashboard/chart/CommitMarker.scss"
    },
    {
        "id": "files/21962",
        "path": "ui/src/visualizations/dashboard/chart/GridLines.js"
    },
    {
        "id": "files/21964",
        "path": "ui/src/visualizations/dashboard/chart/StackedArea.js"
    },
    {
        "id": "files/21966",
        "path": "ui/src/visualizations/dashboard/chart/chart.js"
    },
    {
        "id": "files/21968",
        "path": "ui/src/visualizations/dashboard/reducers/config.js"
    },
    {
        "id": "files/21970",
        "path": "ui/src/visualizations/dashboard/chart/index.js"
    },
    {
        "id": "files/21972",
        "path": "ui/src/visualizations/dashboard/reducers/data.js"
    },
    {
        "id": "files/21974",
        "path": "ui/src/visualizations/dashboard/reducers/index.js"
    },
    {
        "id": "files/21976",
        "path": "ui/src/visualizations/dashboard/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/21978",
        "path": "ui/src/visualizations/dashboard/sagas/getBounds.js"
    },
    {
        "id": "files/21982",
        "path": "ui/src/visualizations/dashboard/sagas/getCommitData.js"
    },
    {
        "id": "files/21984",
        "path": "ui/src/visualizations/dashboard/sagas/getBuildData.js"
    },
    {
        "id": "files/21986",
        "path": "ui/src/visualizations/dashboard/sagas/index.js"
    },
    {
        "id": "files/21988",
        "path": "ui/src/visualizations/dashboard/sagas/getIssueData.js"
    },
    {
        "id": "files/22767",
        "path": "ui/src/components/ThemeRiverChart/ThemeRiverChart.js"
    },
    {
        "id": "files/22769",
        "path": "ui/src/components/ThemeRiverChart/index.js"
    },
    {
        "id": "files/22774",
        "path": "ui/src/components/ThemeRiverChart/themeRiverChart.scss"
    },
    {
        "id": "files/23975",
        "path": "ui/src/components/StackedAreaChart/index.js"
    },
    {
        "id": "files/23977",
        "path": "ui/src/components/StackedAreaChart/StackedAreaChart.js"
    },
    {
        "id": "files/23979",
        "path": "ui/src/components/StackedAreaChart/stackedAreaChart.scss"
    },
    {
        "id": "files/27401",
        "path": "ui/.eslintignore"
    },
    {
        "id": "files/28096",
        "path": "lib/errors/DatabaseError.js"
    },
    {
        "id": "files/28234",
        "path": "lib/importer/GenericImporter.js"
    },
    {
        "id": "files/28624",
        "path": "lib/url-providers/BaseGitProvider.js"
    },
    {
        "id": "files/28684",
        "path": "lib/travis-ci.js"
    },
    {
        "id": "files/28725",
        "path": "lib/url-providers/TravisCIUrlProvider.js"
    },
    {
        "id": "files/28731",
        "path": "lib/indexers/ci/CIIndexer.js"
    },
    {
        "id": "files/28735",
        "path": "lib/indexers/ci/TravisCIIndexer.js"
    },
    {
        "id": "files/29399",
        "path": "lib/core/provider/git.js"
    },
    {
        "id": "files/29402",
        "path": "lib/core/provider/travis-ci.js"
    },
    {
        "id": "files/29404",
        "path": "lib/core/provider/gitlab.js"
    },
    {
        "id": "files/29406",
        "path": "lib/core/db/db.js"
    },
    {
        "id": "files/29408",
        "path": "lib/core/db/setup-db.js"
    },
    {
        "id": "files/29539",
        "path": "scripts/antlr-grammar-installer.js"
    },
    {
        "id": "files/29628",
        "path": "lib/gateway-service.js"
    },
    {
        "id": "files/29649",
        "path": "services/grpc/comm/registration.service.proto"
    },
    {
        "id": "files/29651",
        "path": "services/grpc/messages/registration.message.proto"
    },
    {
        "id": "files/29873",
        "path": "lib/core/provider/language-provider.js"
    },
    {
        "id": "files/29901",
        "path": "services/grpc/comm/language.message.proto"
    },
    {
        "id": "files/29930",
        "path": "services/grpc/comm/language.service.proto"
    },
    {
        "id": "files/29932",
        "path": "services/grpc/comm/registration.message.proto"
    },
    {
        "id": "files/29934",
        "path": "services/language/detector/.gitignore"
    },
    {
        "id": "files/29948",
        "path": "services/language/detector/Gemfile"
    },
    {
        "id": "files/29950",
        "path": "services/language/detector/Gemfile.lock"
    },
    {
        "id": "files/29958",
        "path": "services/language/detector/Rakefile"
    },
    {
        "id": "files/29960",
        "path": "services/language/detector/detector.gemspec"
    },
    {
        "id": "files/29962",
        "path": "services/language/detector/detector.iml"
    },
    {
        "id": "files/29968",
        "path": "services/language/detector/bin/console"
    },
    {
        "id": "files/29970",
        "path": "services/language/detector/bin/detector-service"
    },
    {
        "id": "files/29972",
        "path": "services/language/detector/bin/setup"
    },
    {
        "id": "files/29974",
        "path": "services/language/detector/lib/detector.rb"
    },
    {
        "id": "files/29976",
        "path": "services/language/detector/lib/version.rb"
    },
    {
        "id": "files/29978",
        "path": "services/language/detector/test/detector_test.rb"
    },
    {
        "id": "files/29980",
        "path": "services/language/detector/test/test_helper.rb"
    },
    {
        "id": "files/29982",
        "path": "services/language/detector/lib/api/language.message_pb.rb"
    },
    {
        "id": "files/29986",
        "path": "services/language/detector/lib/api/language.service_pb.rb"
    },
    {
        "id": "files/29988",
        "path": "services/language/detector/lib/api/language.service_services_pb.rb"
    },
    {
        "id": "files/29990",
        "path": "services/language/detector/lib/api/registration.message_pb.rb"
    },
    {
        "id": "files/29992",
        "path": "services/language/detector/lib/api/registration.service_pb.rb"
    },
    {
        "id": "files/29994",
        "path": "services/language/detector/lib/api/registration.service_services_pb.rb"
    },
    {
        "id": "files/29996",
        "path": "services/language/detector/lib/config/config.rb"
    },
    {
        "id": "files/29998",
        "path": "services/language/detector/lib/service/language_service.rb"
    },
    {
        "id": "files/30002",
        "path": "services/language/detector/lib/service/registration.rb"
    },
    {
        "id": "files/30008",
        "path": "services/language/detector/out/production/detector/detector.rb"
    },
    {
        "id": "files/30010",
        "path": "services/language/detector/out/production/detector/version.rb"
    },
    {
        "id": "files/30012",
        "path": "services/language/detector/out/test/detector/detector_test.rb"
    },
    {
        "id": "files/30014",
        "path": "services/language/detector/out/test/detector/test_helper.rb"
    },
    {
        "id": "files/30020",
        "path": "services/language/detector/out/production/detector/service/registration.rb"
    },
    {
        "id": "files/30022",
        "path": "services/language/detector/out/production/detector/config/config.rb"
    },
    {
        "id": "files/30771",
        "path": ".gitattributes"
    },
    {
        "id": "files/30859",
        "path": "services/language/detector/lib/service/i_service.rb"
    },
    {
        "id": "files/30985",
        "path": "foxx/types/language.js"
    },
    {
        "id": "files/30987",
        "path": "foxx/types/languageInCommit.js"
    },
    {
        "id": "files/30995",
        "path": "foxx/types/stats.js"
    },
    {
        "id": "files/31072",
        "path": "lib/models/CommitLanguageConnection.js"
    },
    {
        "id": "files/31080",
        "path": "lib/models/Language.js"
    },
    {
        "id": "files/31082",
        "path": "lib/models/LanguageFileConnection.js"
    },
    {
        "id": "files/31335",
        "path": "services/language/detector/bin/binocular-language-detector"
    },
    {
        "id": "files/32010",
        "path": "lib/models/CommitModuleConnection.js"
    },
    {
        "id": "files/32024",
        "path": "lib/models/Module.js"
    },
    {
        "id": "files/32026",
        "path": "lib/models/ModuleFileConnection.js"
    },
    {
        "id": "files/32031",
        "path": "lib/models/ModuleModuleConnection.js"
    },
    {
        "id": "files/32246",
        "path": "foxx/types/module.js"
    },
    {
        "id": "files/32248",
        "path": "foxx/types/moduleInCommit.js"
    },
    {
        "id": "files/33662",
        "path": ".idea/Binocular.iml"
    },
    {
        "id": "files/33664",
        "path": ".idea/misc.xml"
    },
    {
        "id": "files/33666",
        "path": ".idea/vcs.xml"
    },
    {
        "id": "files/33671",
        "path": ".idea/modules.xml"
    },
    {
        "id": "files/33760",
        "path": "ui/src/visualizations/code-ownership-transfer/config.js"
    },
    {
        "id": "files/33762",
        "path": "ui/src/visualizations/code-ownership-transfer/help.js"
    },
    {
        "id": "files/33764",
        "path": "ui/src/visualizations/code-ownership-transfer/styles.scss"
    },
    {
        "id": "files/33766",
        "path": "ui/src/visualizations/code-ownership-transfer/index.js"
    },
    {
        "id": "files/33770",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/Axis.js"
    },
    {
        "id": "files/33772",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/CommitMarker.js"
    },
    {
        "id": "files/33774",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/CommitMarker.scss"
    },
    {
        "id": "files/33776",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/GridLines.js"
    },
    {
        "id": "files/33778",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/StackedArea.js"
    },
    {
        "id": "files/33780",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/chart.js"
    },
    {
        "id": "files/33782",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/index.js"
    },
    {
        "id": "files/33784",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/sankey.json"
    },
    {
        "id": "files/33786",
        "path": "ui/src/visualizations/code-ownership-transfer/chart/sankey.jsx"
    },
    {
        "id": "files/33788",
        "path": "ui/src/visualizations/code-ownership-transfer/reducers/config.js"
    },
    {
        "id": "files/33790",
        "path": "ui/src/visualizations/code-ownership-transfer/reducers/data.js"
    },
    {
        "id": "files/33792",
        "path": "ui/src/visualizations/code-ownership-transfer/reducers/index.js"
    },
    {
        "id": "files/33794",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/33796",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getBounds.js"
    },
    {
        "id": "files/33798",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getBuildData.js"
    },
    {
        "id": "files/33800",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getCommitData.js"
    },
    {
        "id": "files/33802",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getIssueData.js"
    },
    {
        "id": "files/33804",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/index.js"
    },
    {
        "id": "files/34060",
        "path": "ui/src/visualizations/code-ownership-transfer/SemiCircleScale.js"
    },
    {
        "id": "files/34063",
        "path": "ui/src/visualizations/code-ownership-transfer/chart.js"
    },
    {
        "id": "files/34072",
        "path": "ui/src/visualizations/code-ownership-transfer/hunkTransitions.scss"
    },
    {
        "id": "files/34203",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getDevelopers.js"
    },
    {
        "id": "files/34383",
        "path": "foxx/types/developer.js"
    },
    {
        "id": "files/34460",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getAllFiles.js"
    },
    {
        "id": "files/34605",
        "path": "ui/src/visualizations/code-ownership-transfer/entity/fileFilter.js"
    },
    {
        "id": "files/34706",
        "path": "ui/src/visualizations/code-ownership-transfer/entity/developer.js"
    },
    {
        "id": "files/34708",
        "path": "ui/src/visualizations/code-ownership-transfer/entity/commitEnt.js"
    },
    {
        "id": "files/34722",
        "path": "ui/src/visualizations/code-ownership-transfer/entity/fileEnt.js"
    },
    {
        "id": "files/34897",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getOwner.js"
    },
    {
        "id": "files/35233",
        "path": "ui/src/visualizations/code-ownership-transfer/MysteriousSankey.js"
    },
    {
        "id": "files/35258",
        "path": "ui/src/visualizations/code-ownership-transfer/sagas/getFilesForDeveloper.js"
    },
    {
        "id": "files/35563",
        "path": "ui/src/visualizations/code-hotspots/chart.js"
    },
    {
        "id": "files/35565",
        "path": "ui/src/visualizations/code-hotspots/codeMirror.css"
    },
    {
        "id": "files/35567",
        "path": "ui/src/visualizations/code-hotspots/colorMixer.js"
    },
    {
        "id": "files/35569",
        "path": "ui/src/visualizations/code-hotspots/config.js"
    },
    {
        "id": "files/35571",
        "path": "ui/src/visualizations/code-hotspots/help.js"
    },
    {
        "id": "files/35573",
        "path": "ui/src/visualizations/code-hotspots/index.js"
    },
    {
        "id": "files/35575",
        "path": "ui/src/visualizations/code-hotspots/styles.scss"
    },
    {
        "id": "files/35585",
        "path": "ui/src/visualizations/code-hotspots/reducers/config.js"
    },
    {
        "id": "files/35587",
        "path": "ui/src/visualizations/code-hotspots/reducers/data.js"
    },
    {
        "id": "files/35589",
        "path": "ui/src/visualizations/code-hotspots/reducers/index.js"
    },
    {
        "id": "files/35591",
        "path": "ui/src/visualizations/code-hotspots/sagas/index.js"
    },
    {
        "id": "files/35875",
        "path": "ui/src/visualizations/code-hotspots/chart/colorMixer.js"
    },
    {
        "id": "files/35877",
        "path": "ui/src/visualizations/code-hotspots/chart/charts.js"
    },
    {
        "id": "files/35888",
        "path": "ui/src/visualizations/code-hotspots/chart/vcsData.js"
    },
    {
        "id": "files/35890",
        "path": "ui/src/visualizations/code-hotspots/css/codeMirror.css"
    },
    {
        "id": "files/36015",
        "path": "ui/src/visualizations/code-hotspots/chart/chart.js"
    },
    {
        "id": "files/36037",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/colorMixer.js"
    },
    {
        "id": "files/36143",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/loading.js"
    },
    {
        "id": "files/36233",
        "path": "ui/src/visualizations/code-hotspots/config/config.js"
    },
    {
        "id": "files/36235",
        "path": "ui/src/visualizations/code-hotspots/config/fileBrowser.js"
    },
    {
        "id": "files/36237",
        "path": "ui/src/visualizations/code-hotspots/css/fileBrowser.scss"
    },
    {
        "id": "files/36337",
        "path": "foxx/types/branch.js"
    },
    {
        "id": "files/36341",
        "path": "lib/models/Branch.js"
    },
    {
        "id": "files/36405",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/modeSwitcher.js"
    },
    {
        "id": "files/36407",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/vcsData.js"
    },
    {
        "id": "files/36594",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/hunkHandler.js"
    },
    {
        "id": "files/36596",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/developerList.js"
    },
    {
        "id": "files/36696",
        "path": "ui/src/visualizations/code-hotspots/css/settings.scss"
    },
    {
        "id": "files/36698",
        "path": "ui/src/visualizations/code-hotspots/images/icons.js"
    },
    {
        "id": "files/36727",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/chartGeneration.js"
    },
    {
        "id": "files/36729",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/chartUpdater.js"
    },
    {
        "id": "files/36733",
        "path": "ui/src/visualizations/code-hotspots/chart/settings/settings.js"
    },
    {
        "id": "files/36997",
        "path": "ui/src/visualizations/language-module-river/config.js"
    },
    {
        "id": "files/37001",
        "path": "ui/src/visualizations/language-module-river/help.js"
    },
    {
        "id": "files/37003",
        "path": "ui/src/visualizations/language-module-river/index.js"
    },
    {
        "id": "files/37005",
        "path": "ui/src/visualizations/language-module-river/styles.scss"
    },
    {
        "id": "files/37017",
        "path": "ui/src/visualizations/language-module-river/chart/chart.js"
    },
    {
        "id": "files/37019",
        "path": "ui/src/visualizations/language-module-river/chart/index.js"
    },
    {
        "id": "files/37021",
        "path": "ui/src/visualizations/language-module-river/reducers/config.js"
    },
    {
        "id": "files/37023",
        "path": "ui/src/visualizations/language-module-river/reducers/data.js"
    },
    {
        "id": "files/37025",
        "path": "ui/src/visualizations/language-module-river/reducers/index.js"
    },
    {
        "id": "files/37027",
        "path": "ui/src/visualizations/language-module-river/sagas/getBounds.js"
    },
    {
        "id": "files/37029",
        "path": "ui/src/visualizations/language-module-river/sagas/getBuildData.js"
    },
    {
        "id": "files/37031",
        "path": "ui/src/visualizations/language-module-river/sagas/getCommitData.js"
    },
    {
        "id": "files/37033",
        "path": "ui/src/visualizations/language-module-river/sagas/getIssueData.js"
    },
    {
        "id": "files/37035",
        "path": "ui/src/visualizations/language-module-river/sagas/index.js"
    },
    {
        "id": "files/37526",
        "path": "ui/src/visualizations/language-module-river/chart/RiverData.js"
    },
    {
        "id": "files/37527",
        "path": "ui/src/visualizations/language-module-river/chart/DataRiverChart.js"
    },
    {
        "id": "files/37596",
        "path": ".run/Binocular.run.xml"
    },
    {
        "id": "files/37681",
        "path": "ui/src/utils/date.js"
    },
    {
        "id": "files/37701",
        "path": "ui/src/components/DataRiverChart/RiverData.js"
    },
    {
        "id": "files/37708",
        "path": "ui/src/components/DataRiverChart/data-river-chart.component.js"
    },
    {
        "id": "files/37710",
        "path": "ui/src/components/DataRiverChart/data-river-chart.component.scss"
    },
    {
        "id": "files/37715",
        "path": "ui/src/components/DataRiverChart/index.js"
    },
    {
        "id": "files/37717",
        "path": "ui/src/components/ScalableBaseChart/index.js"
    },
    {
        "id": "files/37719",
        "path": "ui/src/components/ScalableBaseChart/scalable-base-chart.js"
    },
    {
        "id": "files/37892",
        "path": "ui/src/components/ScalableBaseChart/scalable-base-chart.component.js"
    },
    {
        "id": "files/37894",
        "path": "ui/src/components/ScalableBaseChart/scalable-base-chart.component.scss"
    },
    {
        "id": "files/37985",
        "path": "ui/src/utils/exception/RuntimeException.js"
    },
    {
        "id": "files/37987",
        "path": "ui/src/utils/exception/NoImplementationException.js"
    },
    {
        "id": "files/38171",
        "path": "ui/src/utils/exception/InvalidArgumentException.js"
    },
    {
        "id": "files/38170",
        "path": "ui/src/components/DataRiverChart/RiverDataContainer.js"
    },
    {
        "id": "files/38294",
        "path": "ui/src/utils/crypto-utils.js"
    },
    {
        "id": "files/38301",
        "path": "ui/src/components/DataRiverChart/river-tooltip.js"
    },
    {
        "id": "files/38976",
        "path": "ui/src/utils/format.js"
    },
    {
        "id": "files/39147",
        "path": "ui/src/components/DataRiverChart/StreamKey.js"
    },
    {
        "id": "files/39324",
        "path": "ui/src/components/DataRiverChart/IssueStream.js"
    },
    {
        "id": "files/39564",
        "path": "ui/src/utils/Enum.js"
    },
    {
        "id": "files/39823",
        "path": "ui/src/utils/colors.js"
    },
    {
        "id": "files/39825",
        "path": "ui/src/components/DataRiverChart/LanguageData.js"
    },
    {
        "id": "files/39855",
        "path": "ui/src/visualizations/language-module-river/sagas/getLanguageData.js"
    },
    {
        "id": "files/39956",
        "path": "ui/src/visualizations/language-module-river/sagas/getModuleData.js"
    },
    {
        "id": "files/40057",
        "path": "ui/src/utils/math.js"
    },
    {
        "id": "files/40347",
        "path": "ui/src/visualizations/language-module-river/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/40784",
        "path": "ui/src/visualizations/code-hotspots/chart/helper/listGeneration.js"
    },
    {
        "id": "files/43906",
        "path": "lib/endpoints/get-fileSourceCode.js"
    },
    {
        "id": "files/43918",
        "path": "ui/src/visualizations/code-hotspots/css/loading.scss"
    },
    {
        "id": "files/44186",
        "path": "ui/src/visualizations/code-hotspots/chart/components/settings.js"
    },
    {
        "id": "files/44188",
        "path": "ui/src/visualizations/code-hotspots/chart/components/backgroundRefreshIndicator.js"
    },
    {
        "id": "files/44479",
        "path": "ui/src/visualizations/code-hotspots/config/search.js"
    },
    {
        "id": "files/44590",
        "path": "ui/src/visualizations/code-hotspots/components/searchBar/searchBar.js"
    },
    {
        "id": "files/44592",
        "path": "ui/src/visualizations/code-hotspots/components/searchBar/searchAlgorithm.js"
    },
    {
        "id": "files/44594",
        "path": "ui/src/visualizations/code-hotspots/components/searchBar/searchBar.scss"
    },
    {
        "id": "files/44596",
        "path": "ui/src/visualizations/code-hotspots/components/searchBar/searchTextHighlighting.js"
    },
    {
        "id": "files/44598",
        "path": "ui/src/visualizations/code-hotspots/components/fileBrowser/fileBrowser.js"
    },
    {
        "id": "files/44600",
        "path": "ui/src/visualizations/code-hotspots/components/fileBrowser/fileBrowser.scss"
    },
    {
        "id": "files/44602",
        "path": "ui/src/visualizations/code-hotspots/components/backgroundRefreshIndicator/backgroundRefreshIndicator.js"
    },
    {
        "id": "files/44606",
        "path": "ui/src/visualizations/code-hotspots/components/settings/settings.js"
    },
    {
        "id": "files/44608",
        "path": "ui/src/visualizations/code-hotspots/components/settings/settings.scss"
    },
    {
        "id": "files/44825",
        "path": "ui/src/visualizations/code-hotspots/components/VisulaizationSelector/visualizationSelector.js"
    },
    {
        "id": "files/44850",
        "path": "ui/src/visualizations/code-hotspots/components/VisulaizationSelector/visualizationSelector.scss"
    },
    {
        "id": "files/45145",
        "path": "ui/src/visualizations/code-hotspots/components/dateRangeFilter/dateRangeFilter.js"
    },
    {
        "id": "files/45155",
        "path": "ui/src/visualizations/code-hotspots/components/dateRangeFilter/dateRangeFilter.scss"
    },
    {
        "id": "files/45343",
        "path": "ui/src/visualizations/code-hotspots/chart/chart.scss"
    },
    {
        "id": "files/45511",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/subCharts/columnChartGeneration.js"
    },
    {
        "id": "files/45513",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/subCharts/heatmapChartGeneration.js"
    },
    {
        "id": "files/45515",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/subCharts/rowChartGeneration.js"
    },
    {
        "id": "files/46224",
        "path": "babel.config.json"
    },
    {
        "id": "files/46248",
        "path": "webpack.common.js"
    },
    {
        "id": "files/46250",
        "path": "webpack.dev.js"
    },
    {
        "id": "files/46261",
        "path": "webpack.prod.js"
    },
    {
        "id": "files/47889",
        "path": "ui/src/visualizations/dashboard/assets/deleteIcon.svg"
    },
    {
        "id": "files/48070",
        "path": "ui/src/visualizations/dashboard/assets/largeVisualizationIcon.svg"
    },
    {
        "id": "files/48072",
        "path": "ui/src/visualizations/dashboard/assets/settings.svg"
    },
    {
        "id": "files/48134",
        "path": "ui/src/visualizations/dashboard/assets/smallVisualizationIcon.svg"
    },
    {
        "id": "files/48136",
        "path": "ui/src/visualizations/dashboard/assets/wideVisualizationIcon.svg"
    },
    {
        "id": "files/48138",
        "path": "ui/src/visualizations/dashboard/components/dashboard.js"
    },
    {
        "id": "files/48149",
        "path": "ui/src/visualizations/dashboard/styles/dashboard.scss"
    },
    {
        "id": "files/48159",
        "path": "ui/src/visualizations/legacy/code-hotspots/help.js"
    },
    {
        "id": "files/48161",
        "path": "ui/src/visualizations/legacy/code-hotspots/index.js"
    },
    {
        "id": "files/48163",
        "path": "ui/src/visualizations/legacy/code-hotspots/styles.scss"
    },
    {
        "id": "files/48165",
        "path": "ui/src/visualizations/legacy/issue-impact/SemiCircleScale.js"
    },
    {
        "id": "files/48167",
        "path": "ui/src/visualizations/legacy/issue-impact/chart.js"
    },
    {
        "id": "files/48169",
        "path": "ui/src/visualizations/legacy/issue-impact/config.js"
    },
    {
        "id": "files/48171",
        "path": "ui/src/visualizations/legacy/issue-impact/help.js"
    },
    {
        "id": "files/48173",
        "path": "ui/src/visualizations/legacy/issue-impact/hunkTransitions.scss"
    },
    {
        "id": "files/48175",
        "path": "ui/src/visualizations/legacy/issue-impact/index.js"
    },
    {
        "id": "files/48177",
        "path": "ui/src/visualizations/legacy/issue-impact/styles.scss"
    },
    {
        "id": "files/48179",
        "path": "ui/src/visualizations/legacy/code-ownership-river/config.js"
    },
    {
        "id": "files/48181",
        "path": "ui/src/visualizations/legacy/code-ownership-river/help.js"
    },
    {
        "id": "files/48183",
        "path": "ui/src/visualizations/legacy/code-ownership-river/index.js"
    },
    {
        "id": "files/48185",
        "path": "ui/src/visualizations/legacy/code-ownership-river/styles.scss"
    },
    {
        "id": "files/48187",
        "path": "ui/src/visualizations/legacy/dashboard/config.js"
    },
    {
        "id": "files/48189",
        "path": "ui/src/visualizations/legacy/dashboard/help.js"
    },
    {
        "id": "files/48191",
        "path": "ui/src/visualizations/legacy/dashboard/index.js"
    },
    {
        "id": "files/48193",
        "path": "ui/src/visualizations/legacy/dashboard/styles.scss"
    },
    {
        "id": "files/48195",
        "path": "ui/src/visualizations/legacy/hotspot-dials/ClockScale.js"
    },
    {
        "id": "files/48197",
        "path": "ui/src/visualizations/legacy/hotspot-dials/Dial.js"
    },
    {
        "id": "files/48200",
        "path": "ui/src/visualizations/legacy/hotspot-dials/chart.js"
    },
    {
        "id": "files/48201",
        "path": "ui/src/visualizations/legacy/hotspot-dials/DoubleDial.js"
    },
    {
        "id": "files/48203",
        "path": "ui/src/visualizations/legacy/hotspot-dials/config.js"
    },
    {
        "id": "files/48205",
        "path": "ui/src/visualizations/legacy/hotspot-dials/help.js"
    },
    {
        "id": "files/48207",
        "path": "ui/src/visualizations/legacy/hotspot-dials/styles.scss"
    },
    {
        "id": "files/48209",
        "path": "ui/src/visualizations/legacy/hotspot-dials/index.js"
    },
    {
        "id": "files/48211",
        "path": "ui/src/visualizations/legacy/language-module-river/config.js"
    },
    {
        "id": "files/48213",
        "path": "ui/src/visualizations/legacy/language-module-river/help.js"
    },
    {
        "id": "files/48215",
        "path": "ui/src/visualizations/legacy/language-module-river/index.js"
    },
    {
        "id": "files/48217",
        "path": "ui/src/visualizations/legacy/language-module-river/styles.scss"
    },
    {
        "id": "files/48227",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/chart.js"
    },
    {
        "id": "files/48229",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/chart.scss"
    },
    {
        "id": "files/48231",
        "path": "ui/src/visualizations/legacy/code-hotspots/config/config.js"
    },
    {
        "id": "files/48233",
        "path": "ui/src/visualizations/legacy/code-hotspots/css/codeMirror.css"
    },
    {
        "id": "files/48235",
        "path": "ui/src/visualizations/legacy/code-hotspots/images/icons.js"
    },
    {
        "id": "files/48237",
        "path": "ui/src/visualizations/legacy/code-hotspots/css/loading.scss"
    },
    {
        "id": "files/48239",
        "path": "ui/src/visualizations/legacy/code-hotspots/reducers/config.js"
    },
    {
        "id": "files/48241",
        "path": "ui/src/visualizations/legacy/code-hotspots/reducers/data.js"
    },
    {
        "id": "files/48243",
        "path": "ui/src/visualizations/legacy/issue-impact/reducers/config.js"
    },
    {
        "id": "files/48245",
        "path": "ui/src/visualizations/legacy/code-hotspots/reducers/index.js"
    },
    {
        "id": "files/48249",
        "path": "ui/src/visualizations/legacy/issue-impact/reducers/data.js"
    },
    {
        "id": "files/48251",
        "path": "ui/src/visualizations/legacy/issue-impact/reducers/index.js"
    },
    {
        "id": "files/48253",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/Axis.js"
    },
    {
        "id": "files/48255",
        "path": "ui/src/visualizations/legacy/issue-impact/sagas/index.js"
    },
    {
        "id": "files/48257",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/CommitMarker.js"
    },
    {
        "id": "files/48259",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/GridLines.js"
    },
    {
        "id": "files/48261",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/CommitMarker.scss"
    },
    {
        "id": "files/48265",
        "path": "ui/src/visualizations/legacy/code-hotspots/sagas/index.js"
    },
    {
        "id": "files/48267",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/StackedArea.js"
    },
    {
        "id": "files/48269",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/chart.js"
    },
    {
        "id": "files/48271",
        "path": "ui/src/visualizations/legacy/code-ownership-river/reducers/config.js"
    },
    {
        "id": "files/48273",
        "path": "ui/src/visualizations/legacy/code-ownership-river/reducers/data.js"
    },
    {
        "id": "files/48275",
        "path": "ui/src/visualizations/legacy/code-ownership-river/reducers/index.js"
    },
    {
        "id": "files/48277",
        "path": "ui/src/visualizations/legacy/code-ownership-river/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/48279",
        "path": "ui/src/visualizations/legacy/code-ownership-river/sagas/getBounds.js"
    },
    {
        "id": "files/48281",
        "path": "ui/src/visualizations/legacy/code-ownership-river/sagas/getBuildData.js"
    },
    {
        "id": "files/48283",
        "path": "ui/src/visualizations/legacy/code-ownership-river/sagas/getCommitData.js"
    },
    {
        "id": "files/48285",
        "path": "ui/src/visualizations/legacy/code-ownership-river/sagas/getIssueData.js"
    },
    {
        "id": "files/48287",
        "path": "ui/src/visualizations/legacy/code-ownership-river/sagas/index.js"
    },
    {
        "id": "files/48289",
        "path": "ui/src/visualizations/legacy/dashboard/reducers/config.js"
    },
    {
        "id": "files/48291",
        "path": "ui/src/visualizations/legacy/dashboard/reducers/data.js"
    },
    {
        "id": "files/48293",
        "path": "ui/src/visualizations/legacy/dashboard/reducers/index.js"
    },
    {
        "id": "files/48295",
        "path": "ui/src/visualizations/legacy/dashboard/chart/chart.js"
    },
    {
        "id": "files/48297",
        "path": "ui/src/visualizations/legacy/dashboard/chart/index.js"
    },
    {
        "id": "files/48299",
        "path": "ui/src/visualizations/legacy/dashboard/sagas/getBounds.js"
    },
    {
        "id": "files/48301",
        "path": "ui/src/visualizations/legacy/dashboard/sagas/getBuildData.js"
    },
    {
        "id": "files/48303",
        "path": "ui/src/visualizations/legacy/dashboard/sagas/getCommitData.js"
    },
    {
        "id": "files/48305",
        "path": "ui/src/visualizations/legacy/dashboard/sagas/getIssueData.js"
    },
    {
        "id": "files/48307",
        "path": "ui/src/visualizations/legacy/dashboard/sagas/index.js"
    },
    {
        "id": "files/48309",
        "path": "ui/src/visualizations/legacy/hotspot-dials/reducers/config.js"
    },
    {
        "id": "files/48311",
        "path": "ui/src/visualizations/legacy/hotspot-dials/reducers/data.js"
    },
    {
        "id": "files/48313",
        "path": "ui/src/visualizations/legacy/code-ownership-river/chart/index.js"
    },
    {
        "id": "files/48315",
        "path": "ui/src/visualizations/legacy/hotspot-dials/reducers/index.js"
    },
    {
        "id": "files/48317",
        "path": "ui/src/visualizations/legacy/hotspot-dials/sagas/index.js"
    },
    {
        "id": "files/48319",
        "path": "ui/src/visualizations/legacy/language-module-river/chart/index.js"
    },
    {
        "id": "files/48321",
        "path": "ui/src/visualizations/legacy/language-module-river/chart/chart.js"
    },
    {
        "id": "files/48323",
        "path": "ui/src/visualizations/legacy/language-module-river/reducers/config.js"
    },
    {
        "id": "files/48325",
        "path": "ui/src/visualizations/legacy/language-module-river/reducers/data.js"
    },
    {
        "id": "files/48327",
        "path": "ui/src/visualizations/legacy/language-module-river/reducers/index.js"
    },
    {
        "id": "files/48329",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/48331",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/getBounds.js"
    },
    {
        "id": "files/48333",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/getBuildData.js"
    },
    {
        "id": "files/48335",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/getCommitData.js"
    },
    {
        "id": "files/48337",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/getLanguageData.js"
    },
    {
        "id": "files/48339",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/getModuleData.js"
    },
    {
        "id": "files/48341",
        "path": "ui/src/visualizations/legacy/language-module-river/sagas/index.js"
    },
    {
        "id": "files/48347",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/charts/chartGeneration.js"
    },
    {
        "id": "files/48349",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/charts/chartUpdater.js"
    },
    {
        "id": "files/48351",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/helper/colorMixer.js"
    },
    {
        "id": "files/48353",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/helper/listGeneration.js"
    },
    {
        "id": "files/48355",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/helper/loading.js"
    },
    {
        "id": "files/48357",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/helper/vcsData.js"
    },
    {
        "id": "files/48359",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/helper/modeSwitcher.js"
    },
    {
        "id": "files/48361",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/VisulaizationSelector/visualizationSelector.js"
    },
    {
        "id": "files/48363",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/VisulaizationSelector/visualizationSelector.scss"
    },
    {
        "id": "files/48365",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/backgroundRefreshIndicator/backgroundRefreshIndicator.js"
    },
    {
        "id": "files/48367",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/dateRangeFilter/dateRangeFilter.js"
    },
    {
        "id": "files/48369",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/dateRangeFilter/dateRangeFilter.scss"
    },
    {
        "id": "files/48371",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/fileBrowser/fileBrowser.js"
    },
    {
        "id": "files/48373",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/fileBrowser/fileBrowser.scss"
    },
    {
        "id": "files/48375",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/settings/settings.js"
    },
    {
        "id": "files/48377",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/settings/settings.scss"
    },
    {
        "id": "files/48379",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/searchBar/searchAlgorithm.js"
    },
    {
        "id": "files/48381",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/searchBar/searchBar.js"
    },
    {
        "id": "files/48383",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/searchBar/searchBar.scss"
    },
    {
        "id": "files/48385",
        "path": "ui/src/visualizations/legacy/code-hotspots/components/searchBar/searchTextHighlighting.js"
    },
    {
        "id": "files/48393",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/charts/subCharts/columnChartGeneration.js"
    },
    {
        "id": "files/48395",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/charts/subCharts/heatmapChartGeneration.js"
    },
    {
        "id": "files/48397",
        "path": "ui/src/visualizations/legacy/code-hotspots/chart/charts/subCharts/rowChartGeneration.js"
    },
    {
        "id": "files/49287",
        "path": "ui/src/visualizations/dashboard/visualizationRegistry.js"
    },
    {
        "id": "files/49307",
        "path": "ui/src/visualizations/VisualizationComponents/Empty/index.js"
    },
    {
        "id": "files/49323",
        "path": "ui/src/visualizations/VisualizationComponents/Empty/styles.scss"
    },
    {
        "id": "files/49325",
        "path": "ui/src/visualizations/VisualizationComponents/Empty2/index.js"
    },
    {
        "id": "files/49327",
        "path": "ui/src/visualizations/VisualizationComponents/Empty2/styles.scss"
    },
    {
        "id": "files/49329",
        "path": "ui/src/visualizations/dashboard/components/visualizationSelector.js"
    },
    {
        "id": "files/49331",
        "path": "ui/src/visualizations/dashboard/styles/visualizationSelector.css"
    },
    {
        "id": "files/49335",
        "path": "ui/src/visualizations/VisualizationComponents/Empty/chart/chart.js"
    },
    {
        "id": "files/49337",
        "path": "ui/src/visualizations/VisualizationComponents/Empty2/chart/chart.js"
    },
    {
        "id": "files/49512",
        "path": "ui/src/visualizations/VisualizationComponents/Additions_Deletions/index.js"
    },
    {
        "id": "files/49513",
        "path": "ui/src/visualizations/VisualizationComponents/Additions_Deletions/styles.scss"
    },
    {
        "id": "files/49545",
        "path": "ui/src/visualizations/VisualizationComponents/Additions_Deletions/chart/data.js"
    },
    {
        "id": "files/49553",
        "path": "ui/src/visualizations/VisualizationComponents/Additions_Deletions/chart/chart.js"
    },
    {
        "id": "files/49824",
        "path": "ui/src/visualizations/dashboard/assets/highVisualizationIcon.svg"
    },
    {
        "id": "files/50128",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/config.js"
    },
    {
        "id": "files/50130",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/help.js"
    },
    {
        "id": "files/50132",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/index.js"
    },
    {
        "id": "files/50134",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/styles.scss"
    },
    {
        "id": "files/50136",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/config.js"
    },
    {
        "id": "files/50138",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/help.js"
    },
    {
        "id": "files/50140",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/styles.scss"
    },
    {
        "id": "files/50142",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/index.js"
    },
    {
        "id": "files/50146",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/chart/chart.js"
    },
    {
        "id": "files/50148",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/chart/index.js"
    },
    {
        "id": "files/50150",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/reducers/config.js"
    },
    {
        "id": "files/50152",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/reducers/data.js"
    },
    {
        "id": "files/50154",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/reducers/index.js"
    },
    {
        "id": "files/50156",
        "path": "ui/src/visualizations/VisualizationComponents/CIBuilds/sagas/index.js"
    },
    {
        "id": "files/50158",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/chart/chart.js"
    },
    {
        "id": "files/50160",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/chart/index.js"
    },
    {
        "id": "files/50162",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/reducers/config.js"
    },
    {
        "id": "files/50164",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/reducers/data.js"
    },
    {
        "id": "files/50166",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/reducers/index.js"
    },
    {
        "id": "files/50168",
        "path": "ui/src/visualizations/VisualizationComponents/Issues/sagas/index.js"
    },
    {
        "id": "files/50662",
        "path": "ui/src/visualizations/VisualizationComponents/changes/help.js"
    },
    {
        "id": "files/50664",
        "path": "ui/src/visualizations/VisualizationComponents/changes/config.js"
    },
    {
        "id": "files/50672",
        "path": "ui/src/visualizations/VisualizationComponents/changes/index.js"
    },
    {
        "id": "files/50674",
        "path": "ui/src/visualizations/VisualizationComponents/changes/styles.scss"
    },
    {
        "id": "files/50676",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/config.js"
    },
    {
        "id": "files/50678",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/help.js"
    },
    {
        "id": "files/50680",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/index.js"
    },
    {
        "id": "files/50682",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/styles.scss"
    },
    {
        "id": "files/50684",
        "path": "ui/src/visualizations/VisualizationComponents/issues/config.js"
    },
    {
        "id": "files/50686",
        "path": "ui/src/visualizations/VisualizationComponents/issues/index.js"
    },
    {
        "id": "files/50688",
        "path": "ui/src/visualizations/VisualizationComponents/issues/help.js"
    },
    {
        "id": "files/50690",
        "path": "ui/src/visualizations/VisualizationComponents/issues/styles.scss"
    },
    {
        "id": "files/50696",
        "path": "ui/src/visualizations/VisualizationComponents/changes/chart/chart.js"
    },
    {
        "id": "files/50698",
        "path": "ui/src/visualizations/VisualizationComponents/changes/chart/index.js"
    },
    {
        "id": "files/50700",
        "path": "ui/src/visualizations/VisualizationComponents/changes/reducers/config.js"
    },
    {
        "id": "files/50702",
        "path": "ui/src/visualizations/VisualizationComponents/changes/reducers/data.js"
    },
    {
        "id": "files/50704",
        "path": "ui/src/visualizations/VisualizationComponents/changes/reducers/index.js"
    },
    {
        "id": "files/50706",
        "path": "ui/src/visualizations/VisualizationComponents/changes/sagas/getBounds.js"
    },
    {
        "id": "files/50708",
        "path": "ui/src/visualizations/VisualizationComponents/changes/sagas/getCommitData.js"
    },
    {
        "id": "files/50710",
        "path": "ui/src/visualizations/VisualizationComponents/changes/sagas/index.js"
    },
    {
        "id": "files/50712",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/chart/chart.js"
    },
    {
        "id": "files/50714",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/chart/index.js"
    },
    {
        "id": "files/50716",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/reducers/config.js"
    },
    {
        "id": "files/50718",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/reducers/data.js"
    },
    {
        "id": "files/50720",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/reducers/index.js"
    },
    {
        "id": "files/50722",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/sagas/getBounds.js"
    },
    {
        "id": "files/50724",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/sagas/getBuildData.js"
    },
    {
        "id": "files/50726",
        "path": "ui/src/visualizations/VisualizationComponents/issues/chart/chart.js"
    },
    {
        "id": "files/50728",
        "path": "ui/src/visualizations/VisualizationComponents/ciBuilds/sagas/index.js"
    },
    {
        "id": "files/50730",
        "path": "ui/src/visualizations/VisualizationComponents/issues/chart/index.js"
    },
    {
        "id": "files/50732",
        "path": "ui/src/visualizations/VisualizationComponents/issues/reducers/config.js"
    },
    {
        "id": "files/50734",
        "path": "ui/src/visualizations/VisualizationComponents/issues/reducers/data.js"
    },
    {
        "id": "files/50736",
        "path": "ui/src/visualizations/VisualizationComponents/issues/reducers/index.js"
    },
    {
        "id": "files/50738",
        "path": "ui/src/visualizations/VisualizationComponents/issues/sagas/getBounds.js"
    },
    {
        "id": "files/50740",
        "path": "ui/src/visualizations/VisualizationComponents/issues/sagas/index.js"
    },
    {
        "id": "files/50742",
        "path": "ui/src/visualizations/VisualizationComponents/issues/sagas/getIssueData.js"
    },
    {
        "id": "files/51238",
        "path": "ui/src/visualizations/dashboard/components/universalConfig.js"
    },
    {
        "id": "files/51338",
        "path": "ui/src/visualizations/legacy/hotspot-dials/chart/Dial.js"
    },
    {
        "id": "files/51342",
        "path": "ui/src/visualizations/legacy/hotspot-dials/chart/ClockScale.js"
    },
    {
        "id": "files/51344",
        "path": "ui/src/visualizations/legacy/hotspot-dials/chart/chart.js"
    },
    {
        "id": "files/51346",
        "path": "ui/src/visualizations/legacy/hotspot-dials/chart/DoubleDial.js"
    },
    {
        "id": "files/51348",
        "path": "ui/src/visualizations/legacy/hotspot-dials/chart/index.js"
    },
    {
        "id": "files/51506",
        "path": "ui/src/components/DateRangeFilter/dateRangeFilter.scss"
    },
    {
        "id": "files/51508",
        "path": "ui/src/components/DateRangeFilter/dateRangeFilter.js"
    },
    {
        "id": "files/51538",
        "path": "ui/src/visualizations/dashboard/dashboard/dashboard.js"
    },
    {
        "id": "files/51540",
        "path": "ui/src/visualizations/dashboard/dashboard/index.js"
    },
    {
        "id": "files/51774",
        "path": "ui/src/visualizations/legacy/hotspot-dials/sagas/getBounds.js"
    },
    {
        "id": "files/51884",
        "path": "ui/src/visualizations/legacy/issue-impact/sagas/getBounds.js"
    },
    {
        "id": "files/51975",
        "path": "ui/src/visualizations/dashboard/assets/filter_off.svg"
    },
    {
        "id": "files/51977",
        "path": "ui/src/visualizations/dashboard/assets/filter.svg"
    },
    {
        "id": "files/52327",
        "path": "foxx/types/gitHubUser.js"
    },
    {
        "id": "files/53981",
        "path": "ui/src/database/localDB.js"
    },
    {
        "id": "files/53983",
        "path": "ui/src/database/database.js"
    },
    {
        "id": "files/53988",
        "path": "ui/src/database/serverDB.js"
    },
    {
        "id": "files/54138",
        "path": "ui/src/components/RootOffline.js"
    },
    {
        "id": "files/54541",
        "path": "foxx/types/clone.js"
    },
    {
        "id": "files/54557",
        "path": "lib/models/CloneCloneConnection.js"
    },
    {
        "id": "files/54559",
        "path": "lib/models/Clone.js"
    },
    {
        "id": "files/54561",
        "path": "lib/models/CloneCommitConnection.js"
    },
    {
        "id": "files/54563",
        "path": "lib/models/CloneFileConnection.js"
    },
    {
        "id": "files/54671",
        "path": "ui/src/visualizations/code-clone-evolution/chart.js"
    },
    {
        "id": "files/54673",
        "path": "ui/src/visualizations/code-clone-evolution/config.js"
    },
    {
        "id": "files/54687",
        "path": "ui/src/visualizations/code-clone-evolution/help.js"
    },
    {
        "id": "files/54689",
        "path": "ui/src/visualizations/code-clone-evolution/index.js"
    },
    {
        "id": "files/54691",
        "path": "ui/src/visualizations/code-clone-evolution/styles.scss"
    },
    {
        "id": "files/54697",
        "path": "ui/src/visualizations/code-clone-evolution/reducers/data.js"
    },
    {
        "id": "files/54699",
        "path": "ui/src/visualizations/code-clone-evolution/reducers/config.js"
    },
    {
        "id": "files/54701",
        "path": "ui/src/visualizations/code-clone-evolution/reducers/index.js"
    },
    {
        "id": "files/54703",
        "path": "ui/src/visualizations/code-clone-evolution/sagas/index.js"
    },
    {
        "id": "files/54825",
        "path": "scripts/gather_clone_data_simian.sh"
    },
    {
        "id": "files/54826",
        "path": "scripts/gather_clone_data_cpd.sh"
    },
    {
        "id": "files/54847",
        "path": "lib/indexers/BaseCloneIndexer.js"
    },
    {
        "id": "files/54854",
        "path": "lib/indexers/clones/index.js"
    },
    {
        "id": "files/54853",
        "path": "lib/indexers/clones/SimianCloneIndexer.js"
    },
    {
        "id": "files/54959",
        "path": "foxx/types/lastrevision.js"
    },
    {
        "id": "files/54963",
        "path": "lib/models/LastRevision.js"
    },
    {
        "id": "files/55319",
        "path": "foxx/types/cloneInFile.js"
    },
    {
        "id": "files/55471",
        "path": "ui/src/visualizations/code-expertise/config.js"
    },
    {
        "id": "files/55488",
        "path": "ui/src/visualizations/code-expertise/help.js"
    },
    {
        "id": "files/55490",
        "path": "ui/src/visualizations/code-expertise/index.js"
    },
    {
        "id": "files/55494",
        "path": "ui/src/visualizations/code-expertise/chart/index.js"
    },
    {
        "id": "files/55496",
        "path": "ui/src/visualizations/code-expertise/reducers/config.js"
    },
    {
        "id": "files/55498",
        "path": "ui/src/visualizations/code-expertise/reducers/data.js"
    },
    {
        "id": "files/55500",
        "path": "ui/src/visualizations/code-expertise/reducers/index.js"
    },
    {
        "id": "files/55504",
        "path": "ui/src/visualizations/code-expertise/sagas/index.js"
    },
    {
        "id": "files/55784",
        "path": "ui/src/visualizations/code-expertise/styles.scss"
    },
    {
        "id": "files/55811",
        "path": "ui/src/visualizations/code-expertise/sagas/helper.js"
    },
    {
        "id": "files/55813",
        "path": "ui/src/visualizations/code-expertise/chart/Segment.js"
    },
    {
        "id": "files/56013",
        "path": "ui/src/visualizations/code-expertise/chart/full-screen-message.js"
    },
    {
        "id": "files/56150",
        "path": "ui/src/visualizations/code-expertise/config/index.js"
    },
    {
        "id": "files/56180",
        "path": "ui/src/visualizations/code-expertise/config/filePicker/ModuleLine.js"
    },
    {
        "id": "files/56182",
        "path": "ui/src/visualizations/code-expertise/config/filePicker/index.js"
    },
    {
        "id": "files/56356",
        "path": "ui/src/visualizations/code-expertise/chart/chart.js"
    },
    {
        "id": "files/56383",
        "path": "ui/src/visualizations/code-expertise/chart/details/CommitDetails.js"
    },
    {
        "id": "files/56392",
        "path": "ui/src/visualizations/code-expertise/chart/details/CommitDetailsList.js"
    },
    {
        "id": "files/56394",
        "path": "ui/src/visualizations/code-expertise/chart/details/index.js"
    },
    {
        "id": "files/56563",
        "path": "lib/endpoints/get-filenames.js"
    },
    {
        "id": "files/56567",
        "path": "lib/endpoints/get-blame.js"
    },
    {
        "id": "files/56950",
        "path": "lib/endpoints/get-blame-issues.js"
    },
    {
        "id": "files/56952",
        "path": "lib/endpoints/get-blame-modules.js"
    },
    {
        "id": "files/57163",
        "path": "ui/src/visualizations/file-tree-evolution/config.js"
    },
    {
        "id": "files/57189",
        "path": "ui/src/visualizations/file-tree-evolution/help.js"
    },
    {
        "id": "files/57191",
        "path": "ui/src/visualizations/file-tree-evolution/index.js"
    },
    {
        "id": "files/57193",
        "path": "ui/src/visualizations/file-tree-evolution/styles.scss"
    },
    {
        "id": "files/57195",
        "path": "ui/src/visualizations/file-tree-evolution/chart/Sunburst.js"
    },
    {
        "id": "files/57199",
        "path": "ui/src/visualizations/file-tree-evolution/chart/chart.js"
    },
    {
        "id": "files/57201",
        "path": "ui/src/visualizations/file-tree-evolution/chart/data-generator.js"
    },
    {
        "id": "files/57203",
        "path": "ui/src/visualizations/file-tree-evolution/chart/index.js"
    },
    {
        "id": "files/57205",
        "path": "ui/src/visualizations/file-tree-evolution/reducers/config.js"
    },
    {
        "id": "files/57207",
        "path": "ui/src/visualizations/file-tree-evolution/reducers/data.js"
    },
    {
        "id": "files/57209",
        "path": "ui/src/visualizations/file-tree-evolution/reducers/index.js"
    },
    {
        "id": "files/57211",
        "path": "ui/src/visualizations/file-tree-evolution/sagas/index.js"
    },
    {
        "id": "files/57424",
        "path": "ui/src/visualizations/file-tree-evolution/chart/CommitSlider.js"
    },
    {
        "id": "files/57541",
        "path": "ui/src/visualizations/active-conflict-awareness/chart.js"
    },
    {
        "id": "files/57543",
        "path": "ui/src/visualizations/active-conflict-awareness/config.js"
    },
    {
        "id": "files/57557",
        "path": "ui/src/visualizations/active-conflict-awareness/help.js"
    },
    {
        "id": "files/57559",
        "path": "ui/src/visualizations/active-conflict-awareness/index.js"
    },
    {
        "id": "files/57561",
        "path": "ui/src/visualizations/active-conflict-awareness/styles.scss"
    },
    {
        "id": "files/57565",
        "path": "ui/src/visualizations/active-conflict-awareness/reducers/config.js"
    },
    {
        "id": "files/57569",
        "path": "ui/src/visualizations/active-conflict-awareness/reducers/data.js"
    },
    {
        "id": "files/57571",
        "path": "ui/src/visualizations/active-conflict-awareness/reducers/index.js"
    },
    {
        "id": "files/57573",
        "path": "ui/src/visualizations/active-conflict-awareness/sagas/index.js"
    },
    {
        "id": "files/57999",
        "path": "ui/src/visualizations/team-awareness/README.md"
    },
    {
        "id": "files/58064",
        "path": "ui/src/visualizations/team-awareness/config.js"
    },
    {
        "id": "files/58078",
        "path": "ui/src/visualizations/team-awareness/help.js"
    },
    {
        "id": "files/58080",
        "path": "ui/src/visualizations/team-awareness/index.js"
    },
    {
        "id": "files/58085",
        "path": "ui/src/visualizations/team-awareness/chart/index.js"
    },
    {
        "id": "files/58086",
        "path": "ui/src/visualizations/team-awareness/chart/chart.js"
    },
    {
        "id": "files/58088",
        "path": "ui/src/visualizations/team-awareness/reducers/index.js"
    },
    {
        "id": "files/58090",
        "path": "ui/src/visualizations/team-awareness/sagas/index.js"
    },
    {
        "id": "files/58227",
        "path": "ui/src/visualizations/team-awareness/reducers/config.js"
    },
    {
        "id": "files/58229",
        "path": "ui/src/visualizations/team-awareness/reducers/data.js"
    },
    {
        "id": "files/58243",
        "path": "ui/src/visualizations/team-awareness/util/util.js"
    },
    {
        "id": "files/58245",
        "path": "ui/src/visualizations/team-awareness/sagas/getCommits.js"
    },
    {
        "id": "files/58247",
        "path": "ui/src/visualizations/team-awareness/sagas/getStakeholders.js"
    },
    {
        "id": "files/58410",
        "path": "ui/src/visualizations/team-awareness/components/BubbleChart/BubbleChart.js"
    },
    {
        "id": "files/58414",
        "path": "ui/src/visualizations/team-awareness/components/BubbleChart/BubbleChart.scss"
    },
    {
        "id": "files/58416",
        "path": "ui/src/visualizations/team-awareness/components/Timeline/ActivityTimeline.js"
    },
    {
        "id": "files/58418",
        "path": "ui/src/visualizations/team-awareness/components/Timeline/ActivityTimeline.scss"
    },
    {
        "id": "files/58559",
        "path": "ui/src/visualizations/team-awareness/components/ChartLegend/ChartLegend.js"
    },
    {
        "id": "files/58567",
        "path": "ui/src/visualizations/team-awareness/components/ChartLegend/ChartLegend.scss"
    },
    {
        "id": "files/58660",
        "path": "ui/src/visualizations/team-awareness/sagas/calculateFigures.js"
    },
    {
        "id": "files/58782",
        "path": "ui/src/visualizations/team-awareness/config.scss"
    },
    {
        "id": "files/58839",
        "path": "ui/src/visualizations/team-awareness/styles.scss"
    },
    {
        "id": "files/59170",
        "path": "ui/src/visualizations/team-awareness/sagas/getBranches.js"
    },
    {
        "id": "files/59308",
        "path": "ui/src/visualizations/team-awareness/sagas/fileTreeOperations.js"
    },
    {
        "id": "files/59310",
        "path": "ui/src/visualizations/team-awareness/sagas/getFiles.js"
    },
    {
        "id": "files/59335",
        "path": "ui/src/visualizations/team-awareness/components/FileSelection/FileSelection.js"
    },
    {
        "id": "files/59341",
        "path": "ui/src/visualizations/team-awareness/components/FileSelection/FileSelection.scss"
    },
    {
        "id": "files/59628",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/subCharts/hunkChartGeneration.js"
    },
    {
        "id": "files/60027",
        "path": "ui/src/visualizations/code-hotspots/chart/charts/interaction/heatmapInteraction.js"
    },
    {
        "id": "files/60510",
        "path": "ui/src/visualizations/File-Evolution/help.js"
    },
    {
        "id": "files/60511",
        "path": "ui/src/visualizations/File-Evolution/index.js"
    },
    {
        "id": "files/60526",
        "path": "ui/src/visualizations/File-Evolution/reducers/config.js"
    },
    {
        "id": "files/60528",
        "path": "ui/src/visualizations/File-Evolution/reducers/data.js"
    },
    {
        "id": "files/60530",
        "path": "ui/src/visualizations/File-Evolution/reducers/index.js"
    },
    {
        "id": "files/60621",
        "path": "ui/src/visualizations/File-Evolution/sagas/getBranches.js"
    },
    {
        "id": "files/60625",
        "path": "ui/src/visualizations/File-Evolution/sagas/getCommitData.js"
    },
    {
        "id": "files/60627",
        "path": "ui/src/visualizations/File-Evolution/sagas/getCommiters.js"
    },
    {
        "id": "files/60629",
        "path": "ui/src/visualizations/File-Evolution/sagas/index.js"
    },
    {
        "id": "files/60710",
        "path": "ui/src/visualizations/File-Evolution/config.js"
    },
    {
        "id": "files/60712",
        "path": "ui/src/visualizations/File-Evolution/styles.scss"
    },
    {
        "id": "files/60775",
        "path": "ui/src/visualizations/File-Evolution/chart/index.js"
    },
    {
        "id": "files/60776",
        "path": "ui/src/visualizations/File-Evolution/chart/chart.js"
    },
    {
        "id": "files/60871",
        "path": "ui/src/visualizations/File-Evolution/sagas/getFiles.js"
    },
    {
        "id": "files/61505",
        "path": "ui/src/visualizations/project-issue/config.js"
    },
    {
        "id": "files/61537",
        "path": "ui/src/visualizations/project-issue/help.js"
    },
    {
        "id": "files/61539",
        "path": "ui/src/visualizations/project-issue/styles.scss"
    },
    {
        "id": "files/61541",
        "path": "ui/src/visualizations/project-issue/index.js"
    },
    {
        "id": "files/61545",
        "path": "ui/src/visualizations/project-issue/chart/chart.js"
    },
    {
        "id": "files/61547",
        "path": "ui/src/visualizations/project-issue/chart/index.js"
    },
    {
        "id": "files/61549",
        "path": "ui/src/visualizations/project-issue/reducers/config.js"
    },
    {
        "id": "files/61551",
        "path": "ui/src/visualizations/project-issue/reducers/data.js"
    },
    {
        "id": "files/61553",
        "path": "ui/src/visualizations/project-issue/sagas/getBounds.js"
    },
    {
        "id": "files/61555",
        "path": "ui/src/visualizations/project-issue/reducers/index.js"
    },
    {
        "id": "files/61557",
        "path": "ui/src/visualizations/project-issue/sagas/getBuildData.js"
    },
    {
        "id": "files/61559",
        "path": "ui/src/visualizations/project-issue/sagas/getCommitData.js"
    },
    {
        "id": "files/61561",
        "path": "ui/src/visualizations/project-issue/sagas/getIssueData.js"
    },
    {
        "id": "files/61563",
        "path": "ui/src/visualizations/project-issue/sagas/index.js"
    },
    {
        "id": "files/61809",
        "path": "ui/src/components/ViolinPlot/ViolinPlot.js"
    },
    {
        "id": "files/61811",
        "path": "ui/src/components/ViolinPlot/index.js"
    },
    {
        "id": "files/61816",
        "path": "ui/src/components/ViolinPlot/violinPlot.scss"
    },
    {
        "id": "files/62247",
        "path": "ui/src/visualizations/project-issue/sagas/getIssueCommitData.js"
    },
    {
        "id": "files/62413",
        "path": "ui/src/components/ViolinPlot2/index.js"
    },
    {
        "id": "files/62414",
        "path": "ui/src/components/ViolinPlot2/ViolinPlot2.js"
    },
    {
        "id": "files/62416",
        "path": "ui/src/components/ViolinPlot2/violinPlot2.scss"
    },
    {
        "id": "files/63487",
        "path": "ui/src/visualizations/code-flow/config.js"
    },
    {
        "id": "files/63489",
        "path": "ui/src/visualizations/code-flow/help.js"
    },
    {
        "id": "files/63509",
        "path": "ui/src/visualizations/code-flow/index.js"
    },
    {
        "id": "files/63511",
        "path": "ui/src/visualizations/code-flow/styles.scss"
    },
    {
        "id": "files/63517",
        "path": "ui/src/visualizations/code-flow/chart/chart.js"
    },
    {
        "id": "files/63519",
        "path": "ui/src/visualizations/code-flow/chart/index.js"
    },
    {
        "id": "files/63521",
        "path": "ui/src/visualizations/code-flow/reducers/config.js"
    },
    {
        "id": "files/63523",
        "path": "ui/src/visualizations/code-flow/reducers/index.js"
    },
    {
        "id": "files/63525",
        "path": "ui/src/visualizations/code-flow/sagas/getCommitData.js"
    },
    {
        "id": "files/63527",
        "path": "ui/src/visualizations/code-flow/sagas/index.js"
    },
    {
        "id": "files/64246",
        "path": "ui/src/database/index.js"
    },
    {
        "id": "files/64604",
        "path": "ui/src/visualizations/loc-evolution/config.js"
    },
    {
        "id": "files/64606",
        "path": "ui/src/visualizations/loc-evolution/help.js"
    },
    {
        "id": "files/64656",
        "path": "ui/src/visualizations/loc-evolution/index.js"
    },
    {
        "id": "files/64658",
        "path": "ui/src/visualizations/loc-evolution/styles.scss"
    },
    {
        "id": "files/64662",
        "path": "ui/src/visualizations/loc-evolution/chart/Axis.js"
    },
    {
        "id": "files/64666",
        "path": "ui/src/visualizations/loc-evolution/chart/CommitMarker.js"
    },
    {
        "id": "files/64668",
        "path": "ui/src/visualizations/loc-evolution/chart/CommitMarker.scss"
    },
    {
        "id": "files/64670",
        "path": "ui/src/visualizations/loc-evolution/chart/GridLines.js"
    },
    {
        "id": "files/64672",
        "path": "ui/src/visualizations/loc-evolution/chart/chart.js"
    },
    {
        "id": "files/64674",
        "path": "ui/src/visualizations/loc-evolution/chart/StackedArea.js"
    },
    {
        "id": "files/64676",
        "path": "ui/src/visualizations/loc-evolution/chart/index.js"
    },
    {
        "id": "files/64678",
        "path": "ui/src/visualizations/loc-evolution/reducers/config.js"
    },
    {
        "id": "files/64680",
        "path": "ui/src/visualizations/loc-evolution/reducers/data.js"
    },
    {
        "id": "files/64682",
        "path": "ui/src/visualizations/loc-evolution/reducers/index.js"
    },
    {
        "id": "files/64684",
        "path": "ui/src/visualizations/loc-evolution/sagas/fetchRelatedCommits.js"
    },
    {
        "id": "files/64686",
        "path": "ui/src/visualizations/loc-evolution/sagas/getBounds.js"
    },
    {
        "id": "files/64688",
        "path": "ui/src/visualizations/loc-evolution/sagas/getBuildData.js"
    },
    {
        "id": "files/64690",
        "path": "ui/src/visualizations/loc-evolution/sagas/getCommitData.js"
    },
    {
        "id": "files/64692",
        "path": "ui/src/visualizations/loc-evolution/sagas/getIssueData.js"
    },
    {
        "id": "files/64694",
        "path": "ui/src/visualizations/loc-evolution/sagas/index.js"
    },
    {
        "id": "files/64896",
        "path": "ui/src/visualizations/loc-evolution/mockdata.csv"
    },
    {
        "id": "files/64977",
        "path": "ui/src/visualizations/loc-evolution/chart/prototyp.js"
    },
    {
        "id": "files/65075",
        "path": "ui/src/visualizations/loc-evolution/chart/mockdata.csv"
    },
    {
        "id": "files/65936",
        "path": "foxx/types/blame.js"
    },
    {
        "id": "files/66010",
        "path": "ui/src/visualizations/code-editor/help.js"
    },
    {
        "id": "files/66012",
        "path": "ui/src/visualizations/code-editor/config.js"
    },
    {
        "id": "files/66014",
        "path": "ui/src/visualizations/code-editor/configComponent.js"
    },
    {
        "id": "files/66016",
        "path": "ui/src/visualizations/code-editor/index.js"
    },
    {
        "id": "files/66018",
        "path": "ui/src/visualizations/code-editor/styles.scss"
    },
    {
        "id": "files/66022",
        "path": "ui/src/visualizations/code-editor/chart/BarChart.js"
    },
    {
        "id": "files/66024",
        "path": "ui/src/visualizations/code-editor/chart/Overlay.js"
    },
    {
        "id": "files/66026",
        "path": "ui/src/visualizations/code-editor/chart/OverlayPlotter.js"
    },
    {
        "id": "files/66028",
        "path": "ui/src/visualizations/code-editor/chart/PieChart.js"
    },
    {
        "id": "files/66030",
        "path": "ui/src/visualizations/code-editor/chart/StackedBarChart.js"
    },
    {
        "id": "files/66032",
        "path": "ui/src/visualizations/code-editor/chart/StackedBarChart.scss"
    },
    {
        "id": "files/66034",
        "path": "ui/src/visualizations/code-editor/chart/chart.js"
    },
    {
        "id": "files/66036",
        "path": "ui/src/visualizations/code-editor/chart/index.js"
    },
    {
        "id": "files/66038",
        "path": "ui/src/visualizations/code-editor/classes/codeLine.js"
    },
    {
        "id": "files/66040",
        "path": "ui/src/visualizations/code-editor/reducers/config.js"
    },
    {
        "id": "files/66042",
        "path": "ui/src/visualizations/code-editor/reducers/data.js"
    },
    {
        "id": "files/66044",
        "path": "ui/src/visualizations/code-editor/reducers/index.js"
    },
    {
        "id": "files/66046",
        "path": "ui/src/visualizations/code-editor/helper/util.js"
    },
    {
        "id": "files/66048",
        "path": "ui/src/visualizations/code-editor/sagas/index.js"
    },
    {
        "id": "files/66356",
        "path": "ui/src/visualizations/symbol-lifespan/config.js"
    },
    {
        "id": "files/66358",
        "path": "ui/src/visualizations/symbol-lifespan/help.js"
    },
    {
        "id": "files/66369",
        "path": "ui/src/visualizations/symbol-lifespan/index.js"
    },
    {
        "id": "files/66371",
        "path": "ui/src/visualizations/symbol-lifespan/mock.js"
    },
    {
        "id": "files/66373",
        "path": "ui/src/visualizations/symbol-lifespan/styles.scss"
    },
    {
        "id": "files/66379",
        "path": "ui/src/visualizations/symbol-lifespan/chart/index.js"
    },
    {
        "id": "files/66381",
        "path": "ui/src/visualizations/symbol-lifespan/reducers/index.js"
    },
    {
        "id": "files/66383",
        "path": "ui/src/visualizations/symbol-lifespan/sagas/index.js"
    },
    {
        "id": "files/66766",
        "path": "ui/src/visualizations/symbol-lifespan/enum/zoom-granularity.js"
    },
    {
        "id": "files/66833",
        "path": "ui/src/visualizations/symbol-lifespan/enum/submenu.js"
    },
    {
        "id": "files/66893",
        "path": "ui/src/visualizations/symbol-lifespan/enum/order.js"
    },
    {
        "id": "files/66949",
        "path": "ui/src/visualizations/symbol-lifespan/enum/ordinal-type.js"
    },
    {
        "id": "files/67008",
        "path": "ui/src/visualizations/symbol-lifespan/enum/sort-criterion.js"
    },
    {
        "id": "files/67083",
        "path": "ui/src/visualizations/symbol-lifespan/enum/exclusion-filter.js"
    },
    {
        "id": "files/67085",
        "path": "ui/src/visualizations/symbol-lifespan/enum/filter-category.js"
    },
    {
        "id": "files/67087",
        "path": "ui/src/visualizations/symbol-lifespan/enum/inclusion-filter.js"
    },
    {
        "id": "files/67089",
        "path": "ui/src/visualizations/symbol-lifespan/enum/index.js"
    },
    {
        "id": "files/67471",
        "path": "ui/src/components/ColorPicker/index.js"
    },
    {
        "id": "files/67485",
        "path": "ui/src/components/ColorPicker/styles.scss"
    },
    {
        "id": "files/67487",
        "path": "ui/src/visualizations/conflict-awareness/SemiCircleScale.js"
    },
    {
        "id": "files/67489",
        "path": "ui/src/visualizations/conflict-awareness/chart.js"
    },
    {
        "id": "files/67491",
        "path": "ui/src/visualizations/conflict-awareness/config.js"
    },
    {
        "id": "files/67493",
        "path": "ui/src/visualizations/conflict-awareness/help.js"
    },
    {
        "id": "files/67495",
        "path": "ui/src/visualizations/conflict-awareness/hunkTransitions.scss"
    },
    {
        "id": "files/67497",
        "path": "ui/src/visualizations/conflict-awareness/index.js"
    },
    {
        "id": "files/67499",
        "path": "ui/src/visualizations/conflict-awareness/styles.scss"
    },
    {
        "id": "files/67503",
        "path": "ui/src/visualizations/conflict-awareness/reducers/config.js"
    },
    {
        "id": "files/67505",
        "path": "ui/src/visualizations/conflict-awareness/reducers/data.js"
    },
    {
        "id": "files/67507",
        "path": "ui/src/visualizations/conflict-awareness/reducers/index.js"
    },
    {
        "id": "files/67509",
        "path": "ui/src/visualizations/conflict-awareness/sagas/index.js"
    },
    {
        "id": "files/67697",
        "path": "lib/models/CommitBranchConnection.js"
    },
    {
        "id": "files/67792",
        "path": "ui/src/visualizations/conflict-awareness/sagas/getCommitData.js"
    },
    {
        "id": "files/67891",
        "path": "ui/src/visualizations/conflict-awareness/chart/chart.js"
    },
    {
        "id": "files/67907",
        "path": "ui/src/visualizations/conflict-awareness/chart/index.js"
    },
    {
        "id": "files/67909",
        "path": "ui/src/visualizations/conflict-awareness/sagas/getBranchData.js"
    },
    {
        "id": "files/68154",
        "path": "lib/endpoints/get-diffs.js"
    },
    {
        "id": "files/68164",
        "path": "lib/endpoints/get-forks.js"
    },
    {
        "id": "files/68166",
        "path": "lib/endpoints/index-project.js"
    },
    {
        "id": "files/68232",
        "path": "ui/src/utils/compare.js"
    },
    {
        "id": "files/68250",
        "path": "ui/src/visualizations/conflict-awareness/sagas/get-branch-data.js"
    },
    {
        "id": "files/68252",
        "path": "ui/src/visualizations/conflict-awareness/sagas/get-commit-data.js"
    },
    {
        "id": "files/68254",
        "path": "ui/src/visualizations/conflict-awareness/sagas/get-parent-and-forks.js"
    },
    {
        "id": "files/68256",
        "path": "ui/src/visualizations/conflict-awareness/sagas/index-project.js"
    },
    {
        "id": "files/68431",
        "path": "ui/src/visualizations/conflict-awareness/sagas/get-issue-data.js"
    },
    {
        "id": "files/68619",
        "path": "lib/git-utils.js"
    },
    {
        "id": "files/68641",
        "path": "lib/endpoints/check-rebase.js"
    },
    {
        "id": "files/68669",
        "path": "ui/src/visualizations/conflict-awareness/sagas/check-rebase.js"
    },
    {
        "id": "files/68805",
        "path": "lib/endpoints/check-merge.js"
    },
    {
        "id": "files/69006",
        "path": "lib/endpoints/check-cherry-picks.js"
    },
    {
        "id": "files/69544",
        "path": "lib/endpoints/get-commit-dependencies.js"
    },
    {
        "id": "files/70824",
        "path": "ui/src/visualizations/conflict-awareness/help-images/clusteredNodeAll.png"
    },
    {
        "id": "files/70826",
        "path": "ui/src/visualizations/conflict-awareness/help-images/clusteredNodeFiltered.png"
    },
    {
        "id": "files/70828",
        "path": "ui/src/visualizations/conflict-awareness/help-images/commitFilterIn.png"
    },
    {
        "id": "files/70830",
        "path": "ui/src/visualizations/conflict-awareness/help-images/commitSelected.png"
    },
    {
        "id": "files/70834",
        "path": "ui/src/visualizations/conflict-awareness/help-images/commitFilteredOut.png"
    },
    {
        "id": "files/70836",
        "path": "ui/src/visualizations/conflict-awareness/help-images/dependencyCommit.png"
    },
    {
        "id": "files/70921",
        "path": "ui/src/visualizations/conflict-awareness/help-images/commitIssue.png"
    },
    {
        "id": "files/71106",
        "path": "ui/src/visualizations/dependency-graph/config.js"
    },
    {
        "id": "files/71108",
        "path": "ui/src/visualizations/dependency-graph/help.js"
    },
    {
        "id": "files/71134",
        "path": "ui/src/visualizations/dependency-graph/index.js"
    },
    {
        "id": "files/71136",
        "path": "ui/src/visualizations/dependency-graph/styles.scss"
    },
    {
        "id": "files/71142",
        "path": "ui/src/visualizations/dependency-graph/chart/chart.js"
    },
    {
        "id": "files/71144",
        "path": "ui/src/visualizations/dependency-graph/chart/index.js"
    },
    {
        "id": "files/71146",
        "path": "ui/src/visualizations/dependency-graph/reducers/data.js"
    },
    {
        "id": "files/71148",
        "path": "ui/src/visualizations/dependency-graph/reducers/config.js"
    },
    {
        "id": "files/71150",
        "path": "ui/src/visualizations/dependency-graph/reducers/index.js"
    },
    {
        "id": "files/71152",
        "path": "ui/src/visualizations/dependency-graph/sagas/getBounds.js"
    },
    {
        "id": "files/71154",
        "path": "ui/src/visualizations/dependency-graph/sagas/getFilesAndLinks.js"
    },
    {
        "id": "files/71156",
        "path": "ui/src/visualizations/dependency-graph/sagas/index.js"
    },
    {
        "id": "files/71314",
        "path": "ui/src/visualizations/dependency-graph/sagas/getGraphData.js"
    },
    {
        "id": "files/186372",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/styles.scss"
    },
    {
        "id": "files/186374",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/config.js"
    },
    {
        "id": "files/186376",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/index.js"
    },
    {
        "id": "files/186417",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/reducers/config.js"
    },
    {
        "id": "files/186429",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/chart/chart.js"
    },
    {
        "id": "files/186431",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/reducers/index.js"
    },
    {
        "id": "files/186435",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/chart/index.js"
    },
    {
        "id": "files/186445",
        "path": "ui/src/visualizations/VisualizationComponents/coChangeGraph/sagas/index.js"
    }
]

export default files;