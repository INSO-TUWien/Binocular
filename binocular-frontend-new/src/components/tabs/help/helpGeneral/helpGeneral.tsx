function HelpGeneral() {
  return (
    <div className={'h-4/5 overflow-x-hidden max-w-3xl'}>
      <div className="collapse collapse-plus bg-base-200 mb-1">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">Dashboard</div>
        <div className="collapse-content">
          The dashboard is the main focus of Binocular, here multiple different components can be placed from visualizations to stats to
          complex components (those need to be popped out to be viewed). New components can be added from the components tab by clicking on
          them (automatic placement) or by dragging them to the desired location. Every dashboard component can also be configured which
          database it uses, if it respects the global set parameters and its component specific parameters. Additionally each component can
          be popped out into a new window or exported as different data like svg.
          <p>Holding the Shift key will let you quickly remove components from the dashboard.</p>
        </div>
      </div>
      <div className="collapse collapse-plus bg-base-200 mb-1">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">Zoom</div>
        <div className="collapse-content">
          Visualizations that show data over time support interactive zoom to focus on a specific range.
          <div>
            <ul className={'list-disc ml-5'}>
              <li>
                <span className={'font-bold'}>Horizontal Zoom (Drag):</span> Click and drag horizontally on the chart to zoom into a
                specific time range. The Y-axis automatically adjusts to the range of values visible in the selected window.
              </li>
              <li>
                <span className={'font-bold'}>Rectangle Zoom (Ctrl+Drag):</span> Hold the Ctrl key while dragging to draw a selection
                rectangle that sets both the X (time) and Y (value) boundaries simultaneously.
              </li>
              <li>
                <span className={'font-bold'}>Reset:</span> Double-click anywhere on the chart or click and release without dragging to
                return to the full data view.
              </li>
            </ul>
          </div>
          <div className={'mt-2 p-2 bg-warning/20 border border-warning rounded text-sm'}>
            <span className={'font-bold'}>Note:</span> When a strong zoom is applied and the visualization style is set to{' '}
            <span className={'font-bold'}>Curved</span> or <span className={'font-bold'}>Linear</span>, tooltip values may not be fully
            accurate.
          </div>
        </div>
      </div>
      <div className="collapse collapse-plus bg-base-200 mb-1">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">Tabs</div>
        <div className="collapse-content">
          Around the dashboard different tabs are located which offer different functionality. All tabs can be dragged and placed at all
          sides of the dashboard so that it can fit every user. The tabs can also be minimized or expanded by clicking on them. Tabs that
          depend on database data in general also offer a database selector.
          <div className="mt-3 flex flex-wrap gap-1">
            <div className="collapse collapse-arrow bg-base-300/40 rounded-box">
              <input type="checkbox" name="tabs-sub-accordion" />
              <div className="collapse-title font-medium">Parameters</div>
              <div className="collapse-content text-sm">
                <p>
                  In the parameters tab the basic parameters are set that all compatible visualizations adhere to. This includes for example
                  the date range, granularity or if merge requests are excluded. Those parameters can also be set on a per visualization
                  instance basis.
                </p>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-300/40 rounded-box">
              <input type="checkbox" name="tabs-sub-accordion" />
              <div className="collapse-title font-medium">Visualizations</div>
              <div className="collapse-content text-sm">
                <p>
                  In the visualizations tab new visualizations can be added to the dashboard by either clicking on them or dragging them to
                  the desired location.
                </p>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-300/40 rounded-box">
              <input type="checkbox" name="tabs-sub-accordion" />
              <div className="collapse-title font-medium">Sprints</div>
              <div className="collapse-content text-sm">
                <p>The sprints tab lets you define and manage sprints that can be overlaid onto supporting visualizations.</p>
                <div className="mt-2">
                  <ul className={'list-disc ml-5 space-y-1'}>
                    <li>
                      <span className={'font-bold'}>Add Sprint (Single):</span> Opens a dialog to create one sprint by entering a name,
                      start date, and end date.
                    </li>
                    <li>
                      <span className={'font-bold'}>Add Sprint (Multiple):</span> Bulk-creates sprints from a name template, a start date, a
                      sprint length in days, and an amount. A preview of the first sprints is shown before confirming.
                    </li>
                    <li>
                      <span className={'font-bold'}>Name modifiers (multiple mode):</span>
                      <ul className={'list-disc ml-5 mt-1'}>
                        <li>
                          <span className={'font-bold'}>[Nr]</span> — sprint number within this batch, starting at 1
                        </li>
                        <li>
                          <span className={'font-bold'}>[GlobalNr]</span> — global sprint counter across all existing sprints
                        </li>
                        <li>
                          <span className={'font-bold'}>[StartDate]</span> — start date of the individual sprint
                        </li>
                        <li>
                          <span className={'font-bold'}>[EndDate]</span> — end date of the individual sprint
                        </li>
                      </ul>
                    </li>
                    <li>
                      <span className={'font-bold'}>Edit sprint:</span> Hover over a sprint and click the edit button, or right-click and
                      select Edit.
                    </li>
                    <li>
                      <span className={'font-bold'}>Delete sprint:</span> Hover over a sprint and click the delete button, or right-click
                      and select Delete.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-300/40 rounded-box">
              <input type="checkbox" name="tabs-sub-accordion" />
              <div className="collapse-title font-medium">Authors</div>
              <div className="collapse-content text-sm">
                <p>
                  The Authors tab lists every commit author from the analysed repository. Author names, colors and groupings made here are
                  reflected in all supporting visualizations.
                </p>
                <div className="mt-2">
                  <ul className={'list-disc ml-5 space-y-1'}>
                    <li>
                      <span className={'font-bold'}>Data plugin selector:</span> Use the dropdown at the top of the tab to choose which
                      database connection provides author data.
                    </li>
                    <li>
                      <span className={'font-bold'}>Merge authors:</span> Drag one author card onto another to group them under a parent.
                      The child&#39;s commits are attributed to the parent in visualizations.
                    </li>
                    <li>
                      <span className={'font-bold'}>Edit author (right-click → Edit):</span> Opens the Edit Author dialog where you can
                      change the display name, color, add merged sub-authors, and link a platform account.
                    </li>
                    <li>
                      <span className={'font-bold'}>Move to &#34;Other&#34; (right-click → Move to other):</span> Removes the author from
                      the main hierarchy and places them in the &#34;Other&#34; section at the bottom. They still contribute to statistics.
                    </li>
                    <li>
                      <span className={'font-bold'}>Remove from parent (right-click):</span> Ungroups a child author so they appear as a
                      standalone author again.
                    </li>
                    <li>
                      <span className={'font-bold'}>&#34;Other&#34; section:</span> Authors can be put here here, if the analysis of these
                      authors is not interesting. They are still counted in all visualizations.
                    </li>
                    <li>
                      <span className={'font-bold'}>Refresh button:</span> Reloads author data from the selected data plugin.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-300/40 rounded-box">
              <input type="checkbox" name="tabs-sub-accordion" />
              <div className="collapse-title font-medium">FileTree</div>
              <div className="collapse-content text-sm">
                <p>
                  The FileTree tab displays the directory structure of the analysed repository. Selecting or deselecting files and folders
                  determines which paths are included in visualizations that support file filtering.
                </p>
                <div className="mt-2">
                  <ul className={'list-disc ml-5 space-y-1'}>
                    <li>
                      <span className={'font-bold'}>Expand / collapse folders:</span> Click a folder name to toggle its children. The
                      expanded state is preserved for the current session.
                    </li>
                    <li>
                      <span className={'font-bold'}>Select / deselect files:</span> Use the checkbox next to each file or folder. Toggling a
                      folder checkbox cascades to all its children.
                    </li>
                    <li>
                      <span className={'font-bold'}>Select All / Deselect All:</span> Bulk-toggle buttons at the top of the tree affect
                      every file in the repository.
                    </li>
                    <li>
                      <span className={'font-bold'}>Search:</span> The search box filters displayed entries by file or folder name in real
                      time.
                    </li>
                    <li>
                      <span className={'font-bold'}>File info (right-click):</span> Right-clicking any file or folder opens an info dialog
                      showing its full path, web URL (if available), and its current checked state.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpGeneral;
