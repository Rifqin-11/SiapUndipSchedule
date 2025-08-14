import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="">
      <main className="">{children}</main>
    </div>
  );
};

export default Layout;
