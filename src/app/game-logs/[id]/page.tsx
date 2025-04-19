"use client";

import { useQuery } from "@apollo/client";
import { GET_GAME_LOG } from "../../../lib/graphql/queries";
import { useParams } from "next/navigation";
import { GameLogResponse } from "@/src/lib/types/types";
import { useEffect, useState } from "react";
export default function GameLogPage() {
  const params = useParams();
  const [gameLog, setGameLog] = useState<GameLogResponse | null>(null);
  const { data, loading, error } = useQuery(GET_GAME_LOG, {
    variables: { id: params.id },
  });

  useEffect(() => {
    if (data) {
      setGameLog(data.game_log);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!gameLog) return <div>Game log not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Game Log Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Teams</h2>
            <div className="space-y-4">
              <p>{gameLog.user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
