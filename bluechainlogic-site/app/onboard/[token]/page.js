import OnboardingPortal from "./OnboardingPortal";

export const metadata = {
  title: "Client Onboarding | Bluechainlogic",
  description: "Complete your onboarding to get started with Bluechainlogic.",
};

export default async function OnboardPage({ params }) {
  const { token } = await params;
  return <OnboardingPortal token={token} />;
}
