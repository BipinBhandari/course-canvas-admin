import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-2 [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>blockquote]:mb-2',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('slides')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('slides')
        .getPublicUrl(fileName);

      // Insert the image into the editor
      editor.chain().focus().setImage({ src: publicUrl }).run();

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsImageDialogOpen(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setIsImageDialogOpen(false);
    }
  };

  const addLink = () => {
    if (linkUrl) {
      if (editor.getAttributes('link').href) {
        editor.chain().focus().unsetLink().run();
      }
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(false);
    }
  };

  return (
    <div className="border border-white/10 rounded-md overflow-hidden">
      <div className="bg-black/20 border-b border-white/10 p-2 flex items-center gap-1 flex-wrap">
        {/* Text Style Controls */}
        <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-white/10' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-white/10' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        {/* Heading Controls */}
        <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-white/10' : ''}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-white/10' : ''}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-white/10' : ''}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment Controls */}
        <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-white/10' : ''}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-white/10' : ''}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-white/10' : ''}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-white/10' : ''}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* List Controls */}
        <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-white/10' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-white/10' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-white/10' : ''}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLinkDialogOpen(true)}
            className={editor.isActive('link') ? 'bg-white/10' : ''}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsImageDialogOpen(true)}
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="bg-[#221F26] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription className="text-white/60">
              Upload an image or enter an image URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/10"
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
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#221F26] px-2 text-white/60">or</span>
                </div>
              </div>
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={addImage}
              className="bg-[#6366f1] hover:bg-[#4f46e5]"
              disabled={!imageUrl && !isUploading}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="bg-[#221F26] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter the URL for your link
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Link URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={addLink}
              className="bg-[#6366f1] hover:bg-[#4f46e5]"
            >
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};