
import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";

type TagFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    name: string;
    category: string;
  };
};

export const TagFormDialog = ({ isOpen, onOpenChange, initialData }: TagFormProps) => {
  const isEditing = !!initialData;
  const { createTag, updateTag, isLoading } = useTags();
  
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && initialData) {
      await updateTag(initialData.id, {
        name,
        category
      });
    } else {
      await createTag(name, category);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#221F26] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Tag" : "Create New Tag"}</DialogTitle>
          <DialogDescription className="text-white/60">
            {isEditing 
              ? "Make changes to the existing tag." 
              : "Fill out the form below to create a new tag."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tag name"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter tag category"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-[#6366f1] hover:bg-[#4f46e5]"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
