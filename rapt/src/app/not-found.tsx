import AppStatusScreen from "@/components/AppStatusScreen";

export default function NotFound() {
  return (
    <AppStatusScreen
      title="Page not found"
      message="This route doesn't exist anymore or the link is out of date. We replaced the default Next.js 404 with this fallback."
      homeLabel="Go to homepage"
    />
  );
}
