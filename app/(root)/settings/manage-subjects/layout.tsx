
import SimplePageHeader from "@/components/SimplePageHeader";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <SimplePageHeader
        title="Manage Subjects"
        icon="BookOpen"
        iconColor="text-purple-600"
      />
      <div className="pt-20 lg:pt-0 pb-12">{children}</div>
    </div>
  );
};

export default layout;
