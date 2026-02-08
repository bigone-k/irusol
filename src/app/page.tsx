import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to Korean locale with today page
  redirect("/ko/today");
}
