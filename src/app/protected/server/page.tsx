"use server";

import { currentUser } from "@clerk/nextjs/server";
import { NbaDataClient } from "../../../components/nba-data-client";

export default async function Page() {
  const user = await currentUser();
  console.log({ user });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">NBA Data Dashboard</h1>
      <NbaDataClient />
    </div>
  );
}
