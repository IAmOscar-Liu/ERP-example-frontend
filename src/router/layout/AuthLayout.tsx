import { Outlet } from "react-router";
import authSideImage from "@/assets/login-side-image.png";

function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[500px] lg:block">
        <img
          className="h-screen w-full object-cover"
          src={authSideImage}
          alt=""
        />
      </div>
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
