import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaUserCircle,
  FaBell,
  FaSearch,
  FaBars,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBuilding,
  FaQuestionCircle,
  FaEnvelope,
} from "react-icons/fa";

const Navbar = ({ toggleSidebar }) => {
  const { auth, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="bg-blue-600 h-16 sticky top-0 z-50 shadow-lg">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Botón toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-blue-700 transition-colors"
        >
          <FaBars className="text-white text-xl" />
        </button>

        {/* Buscador */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-none border-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Iconos y perfil */}
        <div className="flex items-center">
          {/* Botones de acción */}
          <div className="flex items-center border-r border-blue-500 pr-4 mr-4">
            {/* Ayuda */}
            <a
              href="/help"
              className="p-2 hover:bg-blue-700 transition-colors hidden md:block"
            >
              <FaQuestionCircle className="text-white text-xl" />
            </a>

            {/* Email */}
            <button className="p-2 hover:bg-blue-700 transition-colors">
              <FaEnvelope className="text-white text-xl" />
            </button>

            {/* Notificaciones */}
            <div className="relative">
              <button
                className="p-2 hover:bg-blue-700 transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="text-white text-xl" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Dropdown Notificaciones */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-none border border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">
                      Notificaciones
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((notification) => (
                      <div
                        key={notification}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      >
                        <p className="text-sm text-gray-600">
                          Nueva notificación {notification}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Hace 5 minutos
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Perfil */}
          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer px-3 py-2 hover:bg-blue-700 transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUserCircle className="text-white text-2xl" />
              <span className="text-white hidden md:block">
                {auth?.nombre || "Usuario"}
              </span>
            </div>

            {/* Dropdown Perfil */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white shadow-lg rounded-none border border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">{auth?.nombre}</p>
                  <p className="text-sm text-gray-500">{auth?.email}</p>
                </div>

                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  <FaUser className="text-gray-400" />
                  <span>Mi Perfil</span>
                </a>

                <a
                  href="/company"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  <FaBuilding className="text-gray-400" />
                  <span>Mi Empresa</span>
                </a>

                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  <FaCog className="text-gray-400" />
                  <span>Configuración</span>
                </a>

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-gray-50 w-full"
                >
                  <FaSignOutAlt className="text-red-500" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
