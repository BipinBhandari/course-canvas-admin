
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <AppLayout>
      <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Welcome to Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Use the sidebar to navigate between topics and tags management.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Index;
