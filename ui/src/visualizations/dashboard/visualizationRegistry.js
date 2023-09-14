'use strict';

import empty from '../VisualizationComponents/Empty';
import additions_deletions from '../VisualizationComponents/Additions_Deletions';
import codeOwnershipRiver from '../legacy/code-ownership-river';
import issueImpact from '../legacy/issue-impact';
import hotspotDials from '../legacy/hotspot-dials';
import ciBuilds from '../VisualizationComponents/ciBuilds';
import issues from '../VisualizationComponents/issues';
import issueBreakdown from '../VisualizationComponents/issueBreakdown';
import changes from '../VisualizationComponents/changes';
import sprints from '../VisualizationComponents/sprints';
import timeSpent from '../VisualizationComponents/timeSpent';

export default {
  changes,
  issues,
  ciBuilds,
  codeOwnershipRiver,
  issueImpact,
  issueBreakdown,
  hotspotDials,
  additions_deletions,
  timeSpent,
  sprints,
  empty,
};
