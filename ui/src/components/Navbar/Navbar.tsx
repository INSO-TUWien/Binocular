import "./Navbar.scss";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <>
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <span className="icon-text">
            <span className="icon">
              {/* <i className="fab fa-lg fa-binoculars"></i> */}
              {/* <i className="fa-solid fa-binoculars"></i> */}
              <img src="/reset/android-chrome-192x192.png" className="logo"/>
            </span>
            <span><strong>Binocular</strong></span>
          </span>
        </Link>

        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-start">
          <Link className="navbar-item" to="/dashboard">
            Dashboard
          </Link>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              More
            </a>

            <div className="navbar-dropdown">
              <a className="navbar-item">
                About
              </a>
              <a className="navbar-item">
                Jobs
              </a>
              <a className="navbar-item">
                Contact
              </a>
              <hr className="navbar-divider" />
              <a className="navbar-item">
                Report an issue
              </a>
            </div>
          </div>
        </div>

        <div className="navbar-end">
          <Link className="navbar-item" to="/export">
            <span className="icon-text">
              <span className="icon">
                <i className="fa-solid fa-download"></i>
              </span>
              <span>Export</span>
            </span>
          </Link>
          <a className="bd-navbar-icon navbar-item" href="https://github.com/INSO-TUWien/Binocular" target="_blank">
            <span className="icon-text">
              <span className="icon">
                <i className="fab fa-lg fa-github"></i>
              </span>
            </span>
          </a>
          <div className="navbar-item">
          </div>
        </div>
      </div></>
  );
};

export default Navbar;
