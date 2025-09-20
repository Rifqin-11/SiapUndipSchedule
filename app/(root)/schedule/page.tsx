import React from "react";
import ScheduleServer from "@/components/schedule/ScheduleServer";
import ScheduleLoader from "@/components/schedule/ScheduleLoader";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";

const Page = async ({ cookies }: { cookies?: any }) => {
  // Server-side fetch subjects for initial render (use auth cookie)
  try {
    const token = cookies?.get?.("auth_token")?.value;
    if (!token) {
      // no auth — render empty server version
      return <ScheduleServer subjects={[]} />;
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) return <ScheduleServer subjects={[]} />;

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const subjects = await db
      .collection("subjects")
      .find({ userId: decoded.userId })
      .toArray();

    const mappedSubjects = subjects.map((s: any) => ({ ...s, id: s._id.toString() }));

    return (
      <>
        <ScheduleServer subjects={mappedSubjects} />
        {/* Client loader enables interactive features when needed */}
        <ScheduleLoader />
      </>
    );
  } catch (err) {
    return <ScheduleServer subjects={[]} />;
  }
};

export default Page;
