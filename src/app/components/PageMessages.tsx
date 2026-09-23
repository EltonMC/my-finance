type PageMessagesProps = {
  signOutError: string | null;
  savedStatus: string | null;
  mutationError: string | null;
  showMutationError: boolean;
};

export function PageMessages({ signOutError, savedStatus, mutationError, showMutationError }: PageMessagesProps) {
  return (
    <>
      {signOutError ? (
        <p className="form-error" role="alert">
          {signOutError}
        </p>
      ) : null}
      {savedStatus ? (
        <p className="form-success app-status" role="status">
          {savedStatus}
        </p>
      ) : null}
      {showMutationError && mutationError ? (
        <p className="form-error app-status" role="alert">
          {mutationError}
        </p>
      ) : null}
    </>
  );
}
