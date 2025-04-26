
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
        .select('*')
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

  const createTopic = async (title: string, description: string, difficulty: string, estimatedTime: number) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('topics')
        .insert([{ title, description, difficulty, estimated_time: estimatedTime }]);

      if (error) throw error;

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

  const updateTopic = async (id: string, data: Partial<{
    title: string;
    description: string;
    difficulty: string;
    estimated_time: number;
  }>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('topics')
        .update(data)
        .eq('id', id);

      if (error) throw error;

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
