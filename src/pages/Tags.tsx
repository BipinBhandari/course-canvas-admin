
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTags } from "@/hooks/useTags";
import { TagFormDialog } from "@/components/forms/TagFormDialog";
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

const Tags = () => {
  const { tags, deleteTag } = useTags();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);

  const handleEditClick = (tag: any) => {
    setSelectedTag(tag);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (tag: any) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTag) {
      await deleteTag(selectedTag.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <Button 
            className="bg-[#6366f1] hover:bg-[#4f46e5]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        </div>
        <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">All Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tags && tags.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell>{tag.category}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(tag)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(tag)}
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
              <p className="text-gray-400">No tags found. Create your first tag to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Tag Dialog */}
      <TagFormDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Edit Tag Dialog */}
      {selectedTag && (
        <TagFormDialog 
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialData={selectedTag}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#221F26] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete the tag "{selectedTag?.name}". 
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

export default Tags;
