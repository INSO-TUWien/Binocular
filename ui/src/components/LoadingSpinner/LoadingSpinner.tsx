const LoadingSpinnerComponent: React.FC = () => {
  return (
    <div className="is-fullheight">
      <div className="has-text-centered">
        <span className="icon-text">
          <span className="icon">
          <i className="fas fa-spinner fa-spin"></i>
          </span>
          <span>Loading...</span>
        </span>
        {/* <div className="is-loading mb-4"></div> */}
      </div>
    </div>
  );
};

export default LoadingSpinnerComponent;
