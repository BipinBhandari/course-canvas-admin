import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { TopicFormDialog } from "@/components/forms/TopicFormDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Topics = () => {
  const navigate = useNavigate();
  const { topics } = useTopics();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Topics</h1>
          <Button 
            className="bg-[#6366f1] hover:bg-[#4f46e5]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
        <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">All Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {topics && topics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Est. Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow 
                      key={topic.id}
                      className="cursor-pointer hover:bg-white/5"
                      onClick={() => navigate(`/topics/${topic.id}`)}
                    >
                      <TableCell>{topic.title}</TableCell>
                      <TableCell>{topic.description}</TableCell>
                      <TableCell>{topic.difficulty}</TableCell>
                      <TableCell>{topic.estimated_time} mins</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-400">No topics found. Create your first topic to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Topic Dialog */}
      <TopicFormDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </AppLayout>
  );
};

export default Topics;