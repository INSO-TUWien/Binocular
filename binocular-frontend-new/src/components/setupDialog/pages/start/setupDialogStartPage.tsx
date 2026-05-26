import { Icon } from '../../../icon';

function SetupDialogStartPage() {
  return (
    <>
      <div className={'flex items-center gap-3'}>
        <Icon name="logo" className={'h-12 w-auto'} />
        <h1>Welcome to Binocular</h1>
      </div>
      <p>
        Binocular is a tool for visualizing data from various software-engineering tools. It works as a command-line tool run from a
        git-repository. When run, Binocular will gather data from the repository and the GitHub or GitLab API and persist it to a configured
        ArangoDB instance. Binocular then hosts interactive visualizations about the gathered data via a web-interface.
      </p>
      <h2>Lets get you started!</h2>
      <p>
        It seem like you have started binocular for the first time. At first it is necessary to connect to a. Binocular supports multiple
        sources to gater Data from its own dedicated backend to loading data directly from json files in the browser without the need of a
        backend at all.
      </p>
      <p>
        Just press the <span className={'btn btn-primary btn-xs no-animation'}>Next</span> button to start with the setup process!
      </p>
    </>
  );
}

export default SetupDialogStartPage;
