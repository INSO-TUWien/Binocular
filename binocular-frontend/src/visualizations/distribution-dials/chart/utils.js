import _ from 'lodash';
import * as d3 from 'd3';

//given a circle at (0,0) and specified radius, get the coordinates of a point on the outside line for the specified angle
export function getCoordinatesForAngle(r, angle) {
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  return [x, y];
}

export function getAngle(percent) {
  const max = 2 * Math.PI;
  return max * percent;
}

export function getAngleAdjusted(percent) {
  //for some reason, d3 starts drawing 90° off (clockwise), so we add a 3/4 turn
  const max = 2 * Math.PI;
  return (max * percent + max * 0.75) % max;
}

export function getCoordinatesForBucket(currentBucket, bucketsNum, currentValue, maxValue, innerRadius, outerRadius) {
  //give it half a bucketsize more so the point ends up in the middle of the bucket and not directly on the line
  const percent = (0.5 + currentBucket) / bucketsNum;
  const rad = innerRadius + ((0.0 + currentValue) / maxValue) * (outerRadius - innerRadius);
  return getCoordinatesForAngle(rad, getAngleAdjusted(percent));
}

export function getInverseCoordinatesForBucket(currentBucket, bucketsNum, currentValue, maxValue, innerRadius, outerRadius) {
  //give it half a bucketsize more so the point ends up in the middle of the bucket and not directly on the line
  const percent = (0.5 + currentBucket) / bucketsNum;
  const rad = outerRadius - ((0.0 + currentValue) / maxValue) * (outerRadius - innerRadius);
  return getCoordinatesForAngle(rad, getAngleAdjusted(percent));
}

export function getCoordinatesForRadius(currentBucket, bucketsNum, radius) {
  //point ends up directly on the line
  const percent = currentBucket / bucketsNum;
  return getCoordinatesForAngle(radius, getAngleAdjusted(percent));
}

export function getOuterCoordinatesForBucket(currentBucket, bucketsNum, outerRadius) {
  //give it half a bucketsize more so the point ends up in the middle of the bucket and not directly on the line
  const percent = (0.5 + currentBucket) / bucketsNum;
  return getCoordinatesForAngle(outerRadius, getAngleAdjusted(percent));
}

export const splitCommitsByAuthor = (data) => {
  const result = {};
  for (const d of data) {
    const name = d.signature;
    if (!result[name]) {
      result[name] = {
        commits: 0,
        goodCommits: 0,
        badCommits: 0,
        additions: 0,
        deletions: 0,
      };
    }
    result[name].commits += 1;
    if (d.buildStatus === 'success') {
      result[name].goodCommits += 1;
    } else if (d.buildStatus === 'failed') {
      result[name].badCommits += 1;
    }
    result[name].additions += d.stats.additions;
    result[name].deletions += d.stats.deletions;
  }

  return Object.entries(result).map(([key, value]) => {
    return {
      name: key,
      commits: value.commits,
      goodCommits: value.goodCommits,
      badCommits: value.badCommits,
      additions: value.additions,
      deletions: value.deletions,
    };
  });
};

export const splitIssuesByAuthor = (issuesCreated, issuesClosed) => {
  const result = {};

  const allIssues = _.uniqBy(issuesCreated.concat(issuesClosed), (i) => i.iid);

  for (const i of allIssues) {
    let name = i.author.login;
    if (name === null) {
      name = i.author.name;
    }
    if (!result[name]) {
      result[name] = {
        issues: 0,
        issuesCreated: 0,
        issuesClosed: 0,
      };
    }
    result[name].issues += 1;

    if (issuesCreated.filter((issue) => issue.iid === i.iid).length !== 0) {
      result[name].issuesCreated += 1;
    }
    if (issuesClosed.filter((issue) => issue.iid === i.iid).length !== 0) {
      result[name].issuesClosed += 1;
    }
  }

  return Object.entries(result).map(([key, value]) => {
    return {
      name: key,
      issues: value.issues,
      issuesCreated: value.issuesCreated,
      issuesClosed: value.issuesClosed,
    };
  });
};

export const smoothCurve = d3
  .line()
  .x((d) => d.x)
  .y((d) => d.y)
  .curve(d3.curveCardinalClosed);

export const getNumberOfCategories = (data) => {
  for (const d of data) {
    if (d.length !== 0) {
      return d[0].data.length;
    }
  }
  return 0;
};
