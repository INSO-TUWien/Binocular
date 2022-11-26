'use strict';

import empty from '../VisualizationComponents/Empty';
import additions_deletions from '../VisualizationComponents/Additions_Deletions';
import codeOwnershipRiver from '../legacy/code-ownership-river';
import issueImpact from '../legacy/issue-impact';
import hotspotDials from '../legacy/hotspot-dials';
import ciBuilds from '../VisualizationComponents/ciBuilds';
import issues from '../VisualizationComponents/issues';
import changes from '../VisualizationComponents/changes';
import fileTreeComparison from '../legacy/file-tree-comparison';

export default {
  changes,
  issues,
  ciBuilds,
  codeOwnershipRiver,
  issueImpact,
  hotspotDials,
  additions_deletions,
  empty,
  fileTreeComparison,
};
