import { Metadata } from "next";
import SchedulesClient from "./SchedulesClient";

export const metadata: Metadata = {
  title: "Schedli | Schedules",
};

export default function SchedulesPage() {
  return <SchedulesClient />;
}
