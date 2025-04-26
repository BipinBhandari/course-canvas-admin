
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Topics = () => {
  const { topics, deleteTopic } = useTopics();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const handleEditClick = (topic: any) => {
    setSelectedTopic(topic);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (topic: any) => {
    setSelectedTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTopic) {
      await deleteTopic(selectedTopic.id);
      setIsDeleteDialogOpen(false);
    }
  };

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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>{topic.title}</TableCell>
                      <TableCell>{topic.description}</TableCell>
                      <TableCell>{topic.difficulty}</TableCell>
                      <TableCell>{topic.estimated_time} mins</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(topic)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(topic)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
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

      {/* Edit Topic Dialog */}
      {selectedTopic && (
        <TopicFormDialog 
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialData={selectedTopic}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#221F26] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete the topic "{selectedTopic?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Topics;
