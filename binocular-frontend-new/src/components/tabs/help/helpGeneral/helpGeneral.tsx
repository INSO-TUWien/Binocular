function HelpGeneral() {
  return (
    <div className={'h-4/5 overflow-x-hidden max-w-3xl'}>
      <div className="collapse collapse-plus bg-base-200 mb-1">
        <input type="radio" name="my-accordion-3" />
        <div className="collapse-title text-xl font-medium">Dashboard</div>
        <div className="collapse-content">
          The dashboard is the main focus of Binocular, here multiple different components can be placed from visualizations to stats to
          complex components (those need to be popped out to be viewed). New components can be added from the components tab by clicking on
          them (automatic placement) or by dragging them to the desired location. Every dashboard component can also be configured which
          database it uses, if it respects the global set parameters and its component specific parameters. Additionally each component can
          be popped out into a new window or exported as different data like svg.
        </div>
      </div>
      <div className="collapse collapse-plus bg-base-200 mb-1">
        <input type="radio" name="my-accordion-3" />
        <div className="collapse-title text-xl font-medium">Tabs</div>
        <div className="collapse-content">
          Around the dashboard different tabs are located which offer different functionality. All the tab can be dragged and placed at all
          sides of the dashboard so that it can fit every user. The tabs can also be minimized or expanded by killing on them. Tabs that
          depend on database data in general also offer a database selector. The different tabs available are:
          <div>
            <ul className={'list-disc ml-5'}>
              <li>
                <span className={'font-bold'}>Parameters:</span> In the parameters tab the basic parameters are set all compatible
                visualizations adhere to. This includes for example the date range, granularity or if merge requests are excluded. Those
                parameters can also be set on an per visualization instance basis.
              </li>
              <li>
                <span className={'font-bold'}>Components:</span> In the parameters tab the basic parameters are set all compatible
                visualizations adhere to. This includes for example the date range, granularity or if merge requests are excluded. Those
                parameters can also be set on an per visualization instance basis.
              </li>
              <li>
                <span className={'font-bold'}>Sprints:</span> The sprints tab lets the user define and manage sprints which later can be
                overlay onto supporting visualizations.
              </li>
              <li>
                <span className={'font-bold'}>Authors:</span> The authors tab provides a list of all the authors that are part of the
                analyzed repository. Here authors can also be manged by merging them or comping them to other. Also the name and color for
                each author can be selected here which later gets reflected in each visualizations.
              </li>
              <li>
                <span className={'font-bold'}>FileTree:</span> The file tree tab shows the file tree of the analyzed repository. Folders can
                be opened and closed to reveal more files.
              </li>
              <li>
                <span className={'font-bold'}>Help:</span> The help tab provides useful information to Binocular and all of its different
                sub visualizations.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpGeneral;
