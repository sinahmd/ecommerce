'use client';

import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import api from '@/lib/api';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Define more specific TinyMCE editor types
interface EditorEvent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: HTMLElement; // More specific than 'any'
  type: string;
}

interface BlobInfo {
  blob: () => Blob;
  filename: () => string;
  base64: () => string;
}

// Define a type for the TinyMCE editor instance
interface TinyMCEEditor {
  getContent: () => string;
  setContent: (content: string) => void;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  destroy: () => void;
}

interface ProgressEvent {
  loaded: number;
  total?: number;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <div className="min-h-[400px] border rounded-md">
      <Editor
        
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ''} // Use environment variable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onInit={(evt: EditorEvent, editor: TinyMCEEditor) => (editorRef.current = editor)}
        initialValue={value}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          images_upload_handler: async (blobInfo: BlobInfo, progress: (percent: number) => void) => {
            try {
              // Create a FormData object for the image upload
              const formData = new FormData();
              formData.append('file', blobInfo.blob(), blobInfo.filename());
              
              // Use our authenticated API client to upload the image
              const response = await api.post('/api/admin-panel/upload-image/', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (e: ProgressEvent) => {
                  if (e.total) {
                    progress(e.loaded / e.total * 100);
                  }
                }
              });
              
              // Return the URL from the response
              if (response.data && response.data.url) {
                return response.data.url;
              }
              
              throw new Error('Invalid response from server');
            } catch (error) {
              console.error('Image upload failed:', error);
              throw new Error('Image upload failed');
            }
          }
        }}
        onEditorChange={(content: string) => {
          onChange(content);
        }}
      />
    </div>
  );
} 