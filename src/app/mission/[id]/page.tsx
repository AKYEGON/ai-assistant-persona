import { MissionWorkspace } from "@/components/mission-workspace";

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MissionWorkspace missionId={id} />;
}
