import User from '../supportingTypes/User.ts';

export default interface CommitDto {
  oid: string;
  commit: {
    parent: string[];
    author: User;
    message: string;
    branch: string;
  };
}
