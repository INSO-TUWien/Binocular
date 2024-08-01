function HelpGeneral() {
  return (
    <div className={'h-4/5 overflow-x-hidden max-w-3xl'}>
      <h2>Dashboard</h2>
      General Dashboard Stuff WIP
      <h2>Tabs</h2>
      General Tabs Stuff WIP
      <h3>Parameters:</h3>
      In the parameters tab the basic parameters are set all compatible visualizations adhere to. This includes for example the date range,
      granularity or if merge requests are excluded. Those parameters can also be set on an per visualization instance basis.
      <h3>Components:</h3>
      In the components tab all possible dashboard components are listed. From here new components can be inserted into the dashboard by
      dragging them to the desired location or letting them be placed automatically to the next possible location by clicking on them.
      <h3>Sprints:</h3>
      The sprints tab lets the user define and manage sprints which later can be overlay onto supporting visualizations.
      <h3>Authors:</h3>
      The authors tab provides a list of all the authors that are part of the analyzed repository. Here authors can also be manged by
      merging them or comping them to other. Also the name and color for each author can be selected here which later gets reflected in each
      visualizations.
      <h3>FileTree:</h3>
      The file tree tab shows the file tree of the analyzed repository. Folders can be opened and closed to reveal more files
    </div>
  );
}

export default HelpGeneral;
