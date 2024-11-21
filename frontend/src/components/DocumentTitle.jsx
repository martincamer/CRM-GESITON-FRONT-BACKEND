import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const DocumentTitle = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/login":
        return "Login | Gestión CRM Gestión Proyecto";
      case "/registro":
        return "Registro | Gestión CRM Gestión Proyecto";
      case "/dashboard":
        return "Dashboard | Gestión CRM Gestión Proyecto";
      default:
        return "Gestión CRM Gestión Proyecto";
    }
  };

  return (
    <Helmet>
      <title>{getPageTitle()}</title>
    </Helmet>
  );
};

export default DocumentTitle;
