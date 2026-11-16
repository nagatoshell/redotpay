
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaExchangeAlt,
  FaThLarge,
  FaChartBar,
} from "react-icons/fa";

const StickyBottomNav = () => {
  const navItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Transactions",
      path: "/history",
      icon: <FaExchangeAlt />,
    },
    {
      name: "Assets",
      path: "/assets",
      icon: <FaThLarge />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[460px] z-50">

      <div className="bg-[#111111] rounded-full px-2 py-2 flex items-center justify-around shadow-2xl border border-white/10">

        {navItems.map((item) => (

          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[65px] px-3 py-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`
            }
          >

            <span className="text-xl">
              {item.icon}
            </span>

            <span className="text-[9px] font-medium whitespace-nowrap">
              {item.name}
            </span>

          </NavLink>

        ))}

      </div>

    </div>
  );
};

export default StickyBottomNav;
