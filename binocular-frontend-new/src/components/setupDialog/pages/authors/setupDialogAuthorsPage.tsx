import AuthorManagementView from '../../../authorManagement/authorManagementView.tsx';

function SetupDialogAuthorsPage() {
  return (
    <div className="h-full flex flex-col">
      <p className="text-xl font-bold mb-2">Manage Authors</p>
      <p className={'mb-4'}>
        Review the authors detected from your repository. You can merge authors that represent the same person and link them to their
        platform accounts. This step is optional — you can always revisit it later via <strong>Settings → Authors</strong>.
      </p>
      <div className="flex-1 min-h-0">
        <AuthorManagementView />
      </div>
    </div>
  );
}

export default SetupDialogAuthorsPage;
