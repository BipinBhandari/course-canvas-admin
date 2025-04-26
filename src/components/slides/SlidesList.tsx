import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
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
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SlidesListProps {
  slides: Array<{
    id: string;
    order: number;
    content_type: string;
    content: any;
    name: string;
    topic_id: string;
  }>;
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onSlidesChange: () => void;
}

interface SortableSlideProps {
  slide: SlidesListProps['slides'][0];
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onDuplicate: (slide: any) => void;
  onDelete: (id: string) => void;
}

const SortableSlide = ({ slide, selectedSlideId, onSelectSlide, onDuplicate, onDelete }: SortableSlideProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 cursor-pointer transition-colors border-transparent hover:bg-[#221F26]/80",
        "bg-[#221F26]/60 backdrop-blur-lg",
        selectedSlideId === slide.id && "bg-[#221F26] border-[#6366f1]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          className="touch-none p-1 opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-white/60" />
        </button>
        <span className="text-sm font-medium text-white/60">
          {String(slide.order).padStart(2, '0')}
        </span>
        <div 
          className="flex-1 cursor-pointer" 
          onClick={() => onSelectSlide(slide.id)}
        >
          <h3 className="text-sm font-medium text-white">
            {slide.name || (slide.content_type === 'quiz' ? 'Quiz' : 'Content')}
          </h3>
          <p className="text-xs text-white/60">
            {slide.content_type === 'quiz' ? 'Quiz Slide' : 'Content Slide'}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(slide);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(slide.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const SlidesList = ({ slides, selectedSlideId, onSelectSlide, onSlidesChange }: SlidesListProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDuplicate = async (slide: any) => {
    try {
      // Find the index of the current slide
      const currentIndex = slides.findIndex(s => s.id === slide.id);
      
      // Get the next slide's order (if it exists)
      const nextSlide = slides[currentIndex + 1];
      const nextOrder = nextSlide 
        ? Math.floor((slide.order + nextSlide.order) / 2) // Place between current and next slide
        : slide.order + 1; // If it's the last slide, just add 1

      // Create new slide with copied content
      const { data, error } = await supabase
        .from('slides')
        .insert([{
          topic_id: slide.topic_id,
          content_type: slide.content_type,
          content: slide.content,
          order: nextOrder,
          name: `${slide.name} (duplicate)`
        }])
        .select()
        .single();

      if (error) throw error;

      // Select the new slide and refresh the list
      onSelectSlide(data.id);
      onSlidesChange();

      toast({
        title: "Success",
        description: "Slide duplicated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate slide",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!slideToDelete) return;

    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideToDelete);

      if (error) throw error;

      // If the deleted slide was selected, select the previous slide or the first available slide
      if (selectedSlideId === slideToDelete) {
        const currentIndex = slides.findIndex(s => s.id === slideToDelete);
        const nextSlide = slides[currentIndex - 1] || slides[currentIndex + 1];
        if (nextSlide) {
          onSelectSlide(nextSlide.id);
        } else {
          onSelectSlide(null);
        }
      }

      // Refresh the slides list
      onSlidesChange();

      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSlideToDelete(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = slides.findIndex(slide => slide.id === active.id);
    const newIndex = slides.findIndex(slide => slide.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    try {
      const reorderedSlides = arrayMove(slides, oldIndex, newIndex);
      
      // Calculate new order values and include all required fields
      const updates = reorderedSlides.map((slide, index) => ({
        id: slide.id,
        order: index + 1,
        topic_id: slide.topic_id,
        content_type: slide.content_type,
        content: slide.content,
        name: slide.name
      }));

      // Update all slides with new order values
      const { error } = await supabase
        .from('slides')
        .upsert(updates);

      if (error) throw error;

      onSlidesChange();
    } catch (error) {
      console.error('Reorder error:', error);
      toast({
        title: "Error",
        description: "Failed to reorder slides",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map(slide => slide.id)}
            strategy={verticalListSortingStrategy}
          >
            {slides.map((slide) => (
              <SortableSlide
                key={slide.id}
                slide={slide}
                selectedSlideId={selectedSlideId}
                onSelectSlide={onSelectSlide}
                onDuplicate={handleDuplicate}
                onDelete={(id) => {
                  setSlideToDelete(id);
                  setIsDeleteDialogOpen(true);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

        {slides.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No slides yet. Create your first slide to get started.
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#221F26] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete this slide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-white/10 text-white"
              onClick={() => setSlideToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};