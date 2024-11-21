import { useLocation, Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Mapeo de rutas a nombres más amigables
  const pathMap = {
    "": "Inicio",
    login: "Iniciar Sesión",
    registro: "Registro",
    dashboard: "Dashboard",
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center text-custom-400">
            <Link to="/" className="hover:text-custom-500 transition-colors">
              <FiHome className="w-5 h-5" />
            </Link>

            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
              const isLast = index === pathnames.length - 1;

              return (
                <div key={name} className="flex items-center">
                  <FiChevronRight className="mx-2" />
                  {isLast ? (
                    <span className="font-medium text-custom-500">
                      {pathMap[name] || name}
                    </span>
                  ) : (
                    <Link
                      to={routeTo}
                      className="hover:text-custom-500 transition-colors"
                    >
                      {pathMap[name] || name}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;
