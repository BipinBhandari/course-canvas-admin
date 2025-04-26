
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

  const createTopic = async (topicData: {
    title: string;
    description: string;
    difficulty: string;
    estimated_time: number;
    thumbnail_url?: string;
    tag_ids?: string[];
  }) => {
    setIsLoading(true);
    try {
      // First create the topic
      const { data: createdTopic, error: topicError } = await supabase
        .from('topics')
        .insert([{ 
          title: topicData.title, 
          description: topicData.description, 
          difficulty: topicData.difficulty, 
          estimated_time: topicData.estimated_time,
          thumbnail_url: topicData.thumbnail_url 
        }])
        .select()
        .single();

      if (topicError) throw topicError;

      // Create topic-tag relationships if tags are selected
      if (topicData.tag_ids && topicData.tag_ids.length > 0 && createdTopic) {
        const tagRelationships = topicData.tag_ids.map(tagId => ({
          topic_id: createdTopic.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('topic_tags')
          .insert(tagRelationships);

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

  const updateTopic = async (id: string, topicData: {
    title: string;
    description: string;
    difficulty: string;
    estimated_time: number;
    thumbnail_url?: string;
    tag_ids?: string[];
  }) => {
    setIsLoading(true);
    try {
      // Update the topic details
      const { error: topicError } = await supabase
        .from('topics')
        .update({
          title: topicData.title,
          description: topicData.description,
          difficulty: topicData.difficulty,
          estimated_time: topicData.estimated_time,
          thumbnail_url: topicData.thumbnail_url
        })
        .eq('id', id);

      if (topicError) throw topicError;

      // Update topic-tag relationships
      if (topicData.tag_ids) {
        // First remove existing tag relationships
        await supabase
          .from('topic_tags')
          .delete()
          .eq('topic_id', id);

        // Then add new tag relationships if tags are selected
        if (topicData.tag_ids.length > 0) {
          const tagRelationships = topicData.tag_ids.map(tagId => ({
            topic_id: id,
            tag_id: tagId
          }));

          const { error: tagError } = await supabase
            .from('topic_tags')
            .insert(tagRelationships);

          if (tagError) throw tagError;
        }
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
