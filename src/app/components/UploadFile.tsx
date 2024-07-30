import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface InputFilesProps {
  files: File[];
  setFiles: (files: File[]) => void;
  txt?: string;
  isRequired?: boolean;
}

const InputFiles: React.FC<InputFilesProps> = ({ files, setFiles, txt = '', isRequired = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dragover = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const dragleave = () => {
    setIsDragging(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const newFiles = Array.from(fileInputRef.current.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer?.files || null;
      onChange(e as any);
    }
    setIsDragging(false);
  };

  const removeFile = (file: File) => {
    const updatedFiles = files.filter(f => f !== file);
    setFiles(updatedFiles);
  };

  return (
    <div className="mb-4 flex w-full flex-col">
      <label htmlFor="message" className="fs-sm pb-2 text-gray80">
        {txt || 'Please upload documents'}
      </label>
      <div
        className={`flex flex-col items-center justify-center gap-4 border border-dashed border-gray-500 py-8 bg-[#7ca3f0]/20 rounded-md ${
          isDragging ? 'bg-[#7ca3f0]/30' : ''
        }`}
        onDragOver={dragover}
        onDragLeave={dragleave}
        onDrop={drop}
      >
        <input
          id="fileInput"
          ref={fileInputRef}
          type="file"
          required={isRequired}
          className="pointer-events-none absolute opacity-0"
          multiple
          onChange={onChange}
        />
        <label htmlFor="fileInput" className="text-sm flex cursor-pointer items-center justify-center border-none bg-gray-400/50 text-[#121212] rounded-md px-3 py-2 hover:bg-gray-400/70">
          Upload
        </label>
        <label htmlFor="fileInput" className="text-sm">
          <div>Drag & Drop your files here or click to upload</div>
        </label>
        {files.length > 0 && (
          <div className="flex w-full flex-wrap justify-center gap-2">
            {files.map((file) => (
              <div key={file.name} className="flex items-center border border-gray-500 rounded-md px-1">
                <div>
                  <p className='text-sm text-[#121212]/80'>{file.name}</p>
                </div>
                <div>
                  <button className="ml-2" type="button" title="Remove file" onClick={() => removeFile(file)}>
                    <b className='text-[#121212]/80'>x</b>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputFiles;
