import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to Korean locale with goals page
  redirect("/ko/goals");
}
