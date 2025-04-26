
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export const useTopics = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: topics, refetch } = useQuery({
    queryKey: ['topics'],
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
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch topics",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const createTopic = async (
    title: string, 
    description: string, 
    difficulty: string, 
    estimatedTime: number,
    thumbnailUrl?: string,
    tagId?: string
  ) => {
    setIsLoading(true);
    try {
      // First create the topic
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .insert([{ 
          title, 
          description, 
          difficulty, 
          estimated_time: estimatedTime,
          thumbnail_url: thumbnailUrl 
        }])
        .select()
        .single();

      if (topicError) throw topicError;

      // If a tag was selected, create the topic-tag relationship
      if (tagId && topicData) {
        const { error: tagError } = await supabase
          .from('topic_tags')
          .insert([{
            topic_id: topicData.id,
            tag_id: tagId
          }]);

        if (tagError) throw tagError;
      }

      await refetch();
      toast({
        title: "Success",
        description: "Topic created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create topic",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTopic = async (id: string, data: {
    title: string;
    description: string;
    difficulty: string;
    estimated_time: number;
    thumbnail_url?: string;
    tag_id?: string;
  }) => {
    setIsLoading(true);
    try {
      // Update the topic
      const { error: topicError } = await supabase
        .from('topics')
        .update({
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          estimated_time: data.estimated_time,
          thumbnail_url: data.thumbnail_url
        })
        .eq('id', id);

      if (topicError) throw topicError;

      // Update the tag relationship if a tag is specified
      if (data.tag_id) {
        // First remove any existing tags
        await supabase
          .from('topic_tags')
          .delete()
          .eq('topic_id', id);

        // Then add the new tag
        const { error: tagError } = await supabase
          .from('topic_tags')
          .insert([{
            topic_id: id,
            tag_id: data.tag_id
          }]);

        if (tagError) throw tagError;
      }

      await refetch();
      toast({
        title: "Success",
        description: "Topic updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTopic = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Topic deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    topics,
    isLoading,
    createTopic,
    updateTopic,
    deleteTopic,
  };
};
