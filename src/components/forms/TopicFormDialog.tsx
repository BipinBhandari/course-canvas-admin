
import { useState } from "react";
import { useTopics } from "@/hooks/useTopics";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "lucide-react";

type TopicFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    estimated_time: number;
    thumbnail_url?: string;
  };
};

export const TopicFormDialog = ({ isOpen, onOpenChange, initialData }: TopicFormProps) => {
  const isEditing = !!initialData;
  const { createTopic, updateTopic, isLoading } = useTopics();
  const { tags } = useTags();
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "beginner");
  const [estimatedTime, setEstimatedTime] = useState(initialData?.estimated_time || 30);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || "");
  const [selectedTag, setSelectedTag] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const topicData = {
      title,
      description,
      difficulty,
      estimated_time: estimatedTime,
      thumbnail_url: thumbnailUrl,
      tag_id: selectedTag || undefined
    };
    
    if (isEditing && initialData) {
      await updateTopic(initialData.id, topicData);
    } else {
      await createTopic(
        title,
        description,
        difficulty,
        estimatedTime,
        thumbnailUrl,
        selectedTag
      );
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#221F26] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Topic" : "Create New Topic"}</DialogTitle>
          <DialogDescription className="text-white/60">
            {isEditing 
              ? "Make changes to the existing topic." 
              : "Fill out the form below to create a new topic."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <ImageUpload
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter topic description"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select a tag">
                  {selectedTag ? (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      {tags?.find(t => t.id === selectedTag)?.name || "Select a tag"}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Select a tag
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#221F26] border-white/10">
                {tags?.map((tag) => (
                  <SelectItem 
                    key={tag.id} 
                    value={tag.id}
                    className="text-white hover:bg-white/10"
                  >
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      {tag.name} ({tag.category})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-md p-2 bg-black/20 border-white/10 text-white"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                className="bg-black/20 border-white/10 text-white"
                min={1}
                required
              />
            </div>
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
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
