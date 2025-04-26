import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, BookTemplate as Templates } from "lucide-react";

interface SlideTemplatesProps {
  currentContent: any;
  contentType: string;
  onApplyTemplate: (template: any) => void;
}

export const SlideTemplates = ({ currentContent, contentType, onApplyTemplate }: SlideTemplatesProps) => {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const { data: templates, refetch } = useQuery({
    queryKey: ['slide-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slide_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSaveTemplate = async () => {
    try {
      const { error } = await supabase
        .from('slide_templates')
        .insert({
          name: templateName,
          content_type: contentType,
          content: currentContent,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template saved successfully",
      });
      
      setTemplateName("");
      setIsSaveDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleLoadTemplate = async () => {
    if (!selectedTemplateId) return;

    try {
      const template = templates?.find(t => t.id === selectedTemplateId);
      if (!template) return;

      onApplyTemplate(template);
      setIsLoadDialogOpen(false);
      setSelectedTemplateId(null);

      toast({
        title: "Success",
        description: "Template applied successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="border-white/10"
        onClick={() => setIsSaveDialogOpen(true)}
      >
        <Save className="h-4 w-4 mr-2" />
        Save as Template
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-white/10"
        onClick={() => setIsLoadDialogOpen(true)}
      >
        <Templates className="h-4 w-4 mr-2" />
        Load Template
      </Button>

      {/* Save Template Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-[#221F26] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription className="text-white/60">
              Save the current slide content as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              className="bg-[#6366f1] hover:bg-[#4f46e5]"
              disabled={!templateName}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="bg-[#221F26] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription className="text-white/60">
              Choose a template to apply to the current slide
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select
                value={selectedTemplateId || ""}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent className="bg-[#221F26] border-white/10 text-white">
                  {templates?.filter(t => t.content_type === contentType).map((template) => (
                    <SelectItem 
                      key={template.id} 
                      value={template.id}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLoadDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLoadTemplate}
              className="bg-[#6366f1] hover:bg-[#4f46e5]"
              disabled={!selectedTemplateId}
            >
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};