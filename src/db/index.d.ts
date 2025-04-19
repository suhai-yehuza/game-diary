import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

declare module "@/db" {
  export const db: NeonHttpDatabase<typeof schema>;
}
