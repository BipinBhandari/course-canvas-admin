import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Plus } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { SlideTemplates } from "./SlideTemplates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface SlideEditorProps {
  slide?: {
    id: string;
    content_type: string;
    content: any;
    order: number;
    name: string;
  };
  topicId: string;
  onSave?: () => void;
}

export const SlideEditor = ({ slide, topicId, onSave }: SlideEditorProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState(slide?.content_type || 'content');
  const [content, setContent] = useState(slide?.content || { text: '' });
  const [name, setName] = useState(slide?.name || '');
  const [quizOptions, setQuizOptions] = useState<Array<{ text: string; isCorrect: boolean }>>(
    slide?.content_type === 'quiz' ? slide.content.options : [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  );
  const [question, setQuestion] = useState(
    slide?.content_type === 'quiz' ? slide.content.question : ''
  );

  useEffect(() => {
    if (slide) {
      setContentType(slide.content_type);
      setContent(slide.content);
      setName(slide.name);
      if (slide.content_type === 'quiz') {
        setQuizOptions(slide.content.options);
        setQuestion(slide.content.question);
      }
    }
  }, [slide]);

  const handleSave = async () => {
    if (!slide?.id) return;

    setIsLoading(true);
    try {
      const slideData = {
        content_type: contentType,
        content: contentType === 'quiz' 
          ? { question, options: quizOptions }
          : content,
        name,
      };

      const { error } = await supabase
        .from('slides')
        .update(slideData)
        .eq('id', slide.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['slides', topicId] });
      onSave?.();
      
      toast({
        title: "Success",
        description: "Slide saved successfully",
      });
    } catch (error) {
      console.error('Error saving slide:', error);
      toast({
        title: "Error",
        description: "Failed to save slide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addQuizOption = () => {
    setQuizOptions([...quizOptions, { text: '', isCorrect: false }]);
  };

  const updateQuizOption = (index: number, text: string) => {
    const newOptions = [...quizOptions];
    newOptions[index].text = text;
    setQuizOptions(newOptions);
  };

  const toggleOptionCorrect = (index: number) => {
    const newOptions = [...quizOptions];
    newOptions[index].isCorrect = !newOptions[index].isCorrect;
    setQuizOptions(newOptions);
  };

  const removeQuizOption = (index: number) => {
    setQuizOptions(quizOptions.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (template: any) => {
    if (template.content_type === contentType) {
      if (contentType === 'quiz') {
        setQuestion(template.content.question);
        setQuizOptions(template.content.options);
      } else {
        setContent(template.content);
      }
    }
  };

  if (!slide) {
    return (
      <Card className="h-full bg-[#221F26]/60 backdrop-blur-lg border-white/10">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-white/60">
            Select a slide to edit or create a new one
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#221F26]/60 backdrop-blur-lg border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-white">
          {contentType === 'quiz' ? 'Quiz Question' : 'Content Slide'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <SlideTemplates
            currentContent={contentType === 'quiz' ? { question, options: quizOptions } : content}
            contentType={contentType}
            onApplyTemplate={handleApplyTemplate}
          />
          <Button 
            size="sm" 
            className="bg-[#6366f1] hover:bg-[#4f46e5]"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slide Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Slide Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter slide name"
            className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Slide Type Selector */}
        <div className="flex items-center gap-4">
          <Button
            variant={contentType === 'content' ? 'default' : 'outline'}
            onClick={() => setContentType('content')}
            className={contentType === 'content' 
              ? "bg-[#6366f1] hover:bg-[#4f46e5]" 
              : "border-white/10 text-white"
            }
          >
            Content
          </Button>
          <Button
            variant={contentType === 'quiz' ? 'default' : 'outline'}
            onClick={() => setContentType('quiz')}
            className={contentType === 'quiz' 
              ? "bg-[#6366f1] hover:bg-[#4f46e5]" 
              : "border-white/10 text-white"
            }
          >
            Quiz
          </Button>
        </div>

        {contentType === 'quiz' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Question</label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question"
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Options</label>
              </div>

              <div className="space-y-2">
                {quizOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={option.text}
                        onChange={(e) => updateQuizOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 pr-20"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleOptionCorrect(index)}
                          className={`h-6 w-6 ${option.isCorrect ? 'text-green-500 hover:text-green-400' : 'text-white/60 hover:text-white'}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuizOption(index)}
                          className="h-6 w-6 text-red-500 hover:text-red-400"
                          disabled={quizOptions.length <= 2}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5"
                onClick={addQuizOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Content</label>
              <RichTextEditor
                content={content.text}
                onChange={(text) => setContent({ text })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};