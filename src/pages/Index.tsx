import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Welcome to your admin dashboard. Use the navigation menu to manage your content.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Topics</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Tags</span>
                  <span className="text-white font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;