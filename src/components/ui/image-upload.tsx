
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Image, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export const ImageUpload = ({ value, onChange, className }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('topics')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('topics')
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative w-40 h-40 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
        {value ? (
          <img 
            src={value} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <Image className="w-8 h-8 text-white/40" />
        )}
      </div>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/10"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </Button>
      </div>
    </div>
  );
};
