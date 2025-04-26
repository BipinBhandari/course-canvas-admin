import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SlideEditor } from "@/components/slides/SlideEditor";
import { SlidesList } from "@/components/slides/SlidesList";
import { TopicFormDialog } from "@/components/forms/TopicFormDialog";
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
import { useTopics } from "@/hooks/useTopics";
import { toast } from "@/components/ui/use-toast";

const generateSlideName = () => {
  const adjectives = ['New', 'Cool', 'Amazing', 'Awesome', 'Great', 'Fantastic'];
  const nouns = ['Slide', 'Page', 'Content', 'Section', 'Part'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
};

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteTopic } = useTopics();

  const { data: topic } = useQuery({
    queryKey: ['topic', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          topic_tags(
            tag_id,
            tags(
              id,
              name,
              category
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: slides, refetch: refetchSlides } = useQuery({
    queryKey: ['slides', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('topic_id', id)
        .order('order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleDelete = async () => {
    await deleteTopic(id!);
    navigate('/topics');
  };

  const handleNewSlide = async () => {
    try {
      // Validate that we have a topic ID
      if (!id) {
        toast({
          title: "Error",
          description: "Topic ID is missing",
          variant: "destructive",
        });
        return;
      }

      // Calculate the next order number
      const nextOrder = slides?.length ? Math.max(...slides.map(s => s.order)) + 1 : 0;

      // Create new slide with explicit topic_id
      const { data, error } = await supabase
        .from('slides')
        .insert({
          topic_id: id,
          content_type: 'content',
          content: { text: '' },
          order: nextOrder,
          name: generateSlideName()
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch slides and select the new one
      await refetchSlides();
      setSelectedSlideId(data.id);

      toast({
        title: "Success",
        description: "New slide created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new slide",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white" asChild>
              <a href="/topics">
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
            <h1 className="text-2xl font-bold text-white">{topic?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-white hover:bg-white/5"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Topic Details Card */}
        <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Topic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-white/60">Description</h3>
                <p className="mt-1 text-white">{topic?.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Tags</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {topic?.topic_tags?.map((tt) => (
                    <span 
                      key={tt.tag_id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white"
                    >
                      {tt.tags.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Difficulty</h3>
                <p className="mt-1 text-white capitalize">{topic?.difficulty}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Estimated Time</h3>
                <p className="mt-1 text-white">{topic?.estimated_time} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slides Section */}
        <div className="grid grid-cols-12 gap-6">
          {/* Slides List */}
          <div className="col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Slides</h2>
              <Button 
                size="sm" 
                className="bg-[#6366f1] hover:bg-[#4f46e5]"
                onClick={handleNewSlide}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Slide
              </Button>
            </div>
            <SlidesList 
              slides={slides || []} 
              selectedSlideId={selectedSlideId}
              onSelectSlide={setSelectedSlideId}
              onSlidesChange={refetchSlides}
            />
          </div>

          {/* Slide Editor */}
          <div className="col-span-9">
            <SlideEditor 
              slide={slides?.find(s => s.id === selectedSlideId)} 
              topicId={id!}
              onSave={refetchSlides}
            />
          </div>
        </div>
      </div>

      {/* Edit Topic Dialog */}
      {topic && (
        <TopicFormDialog 
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialData={topic}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#221F26] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete the topic "{topic?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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

export default TopicDetails;