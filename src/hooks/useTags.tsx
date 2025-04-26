
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export const useTags = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: tags, refetch } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch tags",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const createTag = async (name: string, category: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .insert([{ name, category }]);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTag = async (id: string, data: Partial<{ name: string; category: string }>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTag = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
  };
};
