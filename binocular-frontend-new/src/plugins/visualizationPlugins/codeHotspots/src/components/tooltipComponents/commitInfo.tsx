import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';

function CommitInfo(props: { commit: DataPluginCommit }) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date(props.commit.date))
    .replace(/\//g, '.')
    .replace(',', '');

  return (
    <>
      <div className="rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-base-content">
          <tbody>
            <tr>
              <td style={{ minWidth: '10rem' }}>Message</td>
              <td>
                <span style={{ maxWidth: '20rem' }}>{props.commit.message}</span>
              </td>
            </tr>
            <tr>
              <td>Date</td>
              <td>{formattedDate}</td>
            </tr>
            <tr>
              <td>Url</td>
              <td>
                <a href={props.commit.webUrl} target={'_blank'} rel="noreferrer">
                  {props.commit.webUrl}
                </a>
              </td>
            </tr>
            <tr>
              <td>Committer</td>
              <td>{props.commit.user.gitSignature}</td>
            </tr>
            <tr>
              <td>Stats</td>
              <td>
                <table className="table text-base-content">
                  <tbody>
                    <tr>
                      <td>Additions</td>
                      <td>
                        <span>{props.commit.stats.additions}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Deletions</td>
                      <td>
                        <span>{props.commit.stats.deletions}</span>
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
