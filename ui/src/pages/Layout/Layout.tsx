import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import "./Layout.scss"
import Sidebar from "../../components/Sidebar";

export interface LayoutProps {
}

const Layout: React.FC<LayoutProps> = ({
}) => {
  return <>
    <nav className="navbar is-light" role="navigation" aria-label="main navigation">
      <Navbar />
    </nav>
    <main className="container is-fluid">
      <Outlet />
    </main>
    <footer className="footer">
      <Footer />
    </footer>
  </>
}

export default Layout;
