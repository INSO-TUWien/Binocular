import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';

function CommitInfo({ commit }: { commit: DataPluginCommit }) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date(commit.date))
    .replace(/\//g, '.')
    .replace(',', '');

  return (
    <>
      <div className="rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-base-content">
          <tbody>
            <tr>
              <td>Message</td>
              <td>
                <span style={{ maxWidth: '20rem' }}>{commit.message}</span>
              </td>
            </tr>
            <tr>
              <td>Date</td>
              <td>{formattedDate}</td>
            </tr>
            <tr>
              <td>Url</td>
              <td>
                <a href={commit.webUrl} target={'_blank'} rel="noreferrer">
                  {commit.webUrl}
                </a>
              </td>
            </tr>
            <tr>
              <td>Committer</td>
              <td>{commit.user.gitSignature}</td>
            </tr>
            <tr>
              <td>Stats</td>
              <td>
                <table className="table text-base-content">
                  <tbody>
                    <tr>
                      <td>Additions</td>
                      <td>
                        <span>{commit.stats.additions}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Deletions</td>
                      <td>
                        <span>{commit.stats.deletions}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CommitInfo;
