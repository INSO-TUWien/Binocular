Contributing to pupil
=====================

This document aims to give a general overview of pupil's internal
architecture.

Pupil is designed as a node.js command-line application that hosts a
React/Redux-based Front-End. Pupil is generally split into three components:

- A back-end responsible for gathering data from the various
  data-sources
- A front-end to display visualizations from the data
- A GraphQL-interface that is mounted into ArangoDB that allows the
  Front-End to easily query data from the back-end

![Architecture](./zivsed-architecture.png)

Technically, the front-end does not access the GraphQL-interface
directly, but uses a proxy that the back-end provides to circumvent
CORS-issues.

![CORS](./cors.png)

The source-code is organized similarly:

```
pupil
├── foxx     # Holds the foxx-service that is the GraphQL-interface
├── lib      # Holds the back-end
└── ui       # Holds the front-end
```



## Back-End

The back-end is a pretty straightforward node.js application. It is
responsible for gathering data and uses express to host the front-end.

The data gathering is done by a type of component called indexer. You
can see the indexers in the `lib/indexers` directory:

```

lib/indexers
├── BaseGitLabIndexer.js    # Basic indexer for accessing GitLab-Data
├── ci                      # CI-specific indexers
│   ├── GitLabCIIndexer.js  # Indexer for GitLab-CI
│   ├── ...                 # (Additional CI-indexers could be added here)
│   └── index.js
├── its                     # ITS-specific indexers
│   ├── GitHubIndexer.js    # Indexer for GitHub
│   ├── GitLabITSIndexer.js # Indexer for GitLab
│   ├── ...                 # (Additional ITS-indexers could be added here)
│   └── index.js
└── vcs
    ├── GitIndexer.js       # Indexer for git
│   ├── ...                 # (Additional VCS-indexers could be added here)
    └── index.js
```

## GraphQL-Interface

The GraphQl interface is hosted as an ArangoDB-FOXX-service which is
automatically zipped and installed at startup into the database. It
enables querying the database easiliy through GraphQl. A very useful
tool is the GraphiQl-interface exposed by it, which allows developers
to interactively query the service. Once the service is installed in
the database, it can be accessed by pointing your browser to
`http://ARANGO_HOST:ARANGO_PORT/pupil-PROJECT_NAME/pupil-ql`, e.g.
http://localhost:8529/_db/pupil-pupil/pupil-ql.

## Front-End

The front-end is a redux-backed react application that heavily relies
on D3 to do its work:

```
ui
├── index.html                    # Main entry point
└── src
   ├── components                 # Holds general components used everywhere in the app
   ├── index.js                   # Main JS-entry-point
   ├── reducers                   # Holds general reducers
   ├── sagas                      # Holds general sagas
   ├── utils                      # Utility functions
   └── visualizations             # Each visualization is a directory here, with its own reducers and sagas
       ├── code-ownership-river
       │   ├── chart              # Main chart component
       │   ├── config.js          # Main config component (shown in the sidebar)
       │   ├── help.js            # Component shown in the help-section
       │   ├── index.js           # main entry point for the component, bundles everything together
       │   ├── reducers           # Reducers for the visualization
       │   │   ├── config.js      # Configuration-related reducers
       │   │   ├── data.js        # Data-related reducers
       │   │   └── index.js
       │   ├── sagas              # Sagas/Actions for the visualization
       │   └── styles.scss        # Styles for the visualization
       ├── hotspot-dials
       │   ├── chart.js
       │   ├── help.js
       │   ├── reducers
       │   │   ├── config.js
       │   │   ├── data.js
       │   │   └── index.js
       │   ├── sagas
       │   │   └── index.js
       │   └── styles.scss
       └── issue-impact
           ├── chart.js
           ├── config.js
           ├── help.js
           ├── index.js
           ├── reducers
           │   ├── config.js
           │   ├── data.js
           │   └── index.js
           ├── sagas
           │   └── index.js
           └── styles.scss
```

To add another visualization, check the source code of the existing ones.
