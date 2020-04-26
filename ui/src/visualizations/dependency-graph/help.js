'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Dependency Graph Help</h1>
    <p>
      This visualization shows co-change dependencies between entities. 
    </p>
    <h2>Entities</h2>
    <p>
      Each circle represents an entity. Circles with a black border represent files and circles with a red border represent folders.
      <br></br>
      The size of the circles represents the amount of lines of code. For folders that is the sum of lines for each file in the folder.
      <br></br>
      The color of the circles represents the number of commits that entity has been in. A darker color means the entity has been in more commits.
    </p>
    <h2>Dependencies</h2>
    <p>
      The grey trapezoids connecting the circles represent co-change dependencies. A co-change dependencie exists if two entities have been together in one or more commits.
      <br></br>
      The width of the connection represents the degree of the dependencie. A wider connection means that the two entities have been in more commits together.
      <br></br>
      A connection can also have different widths on each side to represent the direction of the dependency.
      The entity at the wider side of the connection is more dependent on the other entity, because a bigger proportion of commits of that entity has been together with the other entity.
      The entity on the narrower end of the connection is less dependent on the other entity, because a smaller proportion of commits of that entity has been together with the other entity.
    </p>
    <h2>Filters</h2>
    <h3>Depth</h3>
    <p>
      This filter defines the depth of the folder structure from which the entities should be displayed.
    </p>
    <h3>Mean percentage of combined commits threshold</h3>
    <p>
      With this filter it is possible to remove connections where combined commits of both entities are just a small amount compared to all commits of the entities.
    </p>
    <h3>Mean percentage of max commits threshold</h3>
    <p>
      With this filter it is possible to remove connections where the amount commits of both entities is small to the amount of commits of the most comitted entity.
    </p>
    <h3>Time range</h3>
    <p>
      This filter defines the time range from which the commits should be taken.
    </p>
    <h3>Files</h3>
    <p>
      This filter defines which files should be displayed in the visualization.
    </p>
  </div>;
