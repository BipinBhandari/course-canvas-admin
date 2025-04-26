
import { useState } from "react";
import { useTopics } from "@/hooks/useTopics";
import { useTags } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tags as TagsIcon } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
    topic_tags?: {
      tag_id: string;
      tags: {
        name: string;
        category: string;
      };
    }[];
  };
};

export const TopicFormDialog = ({
  isOpen,
  onOpenChange,
  initialData
}: TopicFormProps) => {
  const isEditing = !!initialData;
  const {
    createTopic,
    updateTopic,
    isLoading
  } = useTopics();
  const {
    tags
  } = useTags();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "beginner");
  const [estimatedTime, setEstimatedTime] = useState(initialData?.estimated_time || 30);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.topic_tags?.map(tt => tt.tag_id) || []);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prevTags => prevTags.includes(tagId) ? prevTags.filter(id => id !== tagId) : [...prevTags, tagId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const topicData = {
      title,
      description,
      difficulty,
      estimated_time: estimatedTime,
      thumbnail_url: thumbnailUrl,
      tag_ids: selectedTags
    };
    if (isEditing && initialData) {
      await updateTopic(initialData.id, topicData);
    } else {
      await createTopic(topicData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#221F26] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Topic" : "Create New Topic"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing ? "Make changes to the existing topic." : "Fill out the form below to create a new topic."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="cover" className="text-gray-300">Cover Image</Label>
            <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Enter topic title" 
              className="bg-black/30 border-white/10 text-white placeholder:text-gray-500" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Enter topic description" 
              className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Tags</Label>
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-2 bg-black/10 rounded-md">
              {tags?.map(tag => (
                <Button 
                  key={tag.id} 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-2 ${
                    selectedTags.includes(tag.id) 
                      ? "bg-[#6366f1] text-white hover:bg-[#4f46e5] border-transparent" 
                      : "bg-black/20 border-white/10 text-gray-300 hover:bg-black/30 hover:text-white"
                  }`} 
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <TagsIcon className="h-3 w-3" />
                  {tag.name} ({tag.category})
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-gray-300">Difficulty</Label>
              <Select defaultValue={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2C] border-white/10 text-white">
                  <SelectItem value="beginner" className="focus:bg-white/10 focus:text-white">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="focus:bg-white/10 focus:text-white">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="focus:bg-white/10 focus:text-white">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="text-gray-300">Estimated Time (minutes)</Label>
              <Input 
                id="estimatedTime" 
                type="number" 
                value={estimatedTime} 
                onChange={e => setEstimatedTime(parseInt(e.target.value))} 
                className="bg-black/30 border-white/10 text-white" 
                min={1} 
                required 
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-[#6366f1] text-white hover:bg-[#4f46e5]"
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
