import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div>
      {/* Dashboard layout only */}
      <div>
        {/* No need to import side menu here */}
        {/* This part remains static, layout is fixed */}
        {/* SideMenu, Navbar, and Header should not be re-imported here */}
        {/* The Outlet renders dynamic pages here */}
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;