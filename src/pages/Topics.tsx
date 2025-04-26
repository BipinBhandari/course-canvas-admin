
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Topics = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Topics</h1>
          <Button className="bg-[#6366f1] hover:bg-[#4f46e5]">
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
        <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">All Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We'll implement the topics list in the next step */}
            <p className="text-gray-400">No topics found. Create your first topic to get started.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Topics;
