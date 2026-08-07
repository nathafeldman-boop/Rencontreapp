"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, Upload, X } from "lucide-react";

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PhotoDropzoneProps {
  photos: File[];
  onChange: (photos: File[]) => void;
}

export function PhotoDropzone({ photos, onChange }: PhotoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | File[]) {
    setError(null);
    const incoming = Array.from(fileList);

    const invalid = incoming.find((f) => !f.type.startsWith("image/"));
    if (invalid) {
      setError(`"${invalid.name}" n'est pas une image.`);
      return;
    }

    const tooLarge = incoming.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setError(`"${tooLarge.name}" dépasse 10 Mo.`);
      return;
    }

    const merged = [...photos, ...incoming].slice(0, MAX_PHOTOS);
    if (photos.length + incoming.length > MAX_PHOTOS) {
      setError(`Tu peux envoyer jusqu'à ${MAX_PHOTOS} photos — les ${MAX_PHOTOS} premières ont été gardées.`);
    }
    onChange(merged);
  }

  function removeAt(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm transition-colors ${
          isDragging ? "border-primary bg-accent" : "border-border hover:bg-secondary/50"
        }`}
      >
        <Upload className="size-5 text-muted-foreground" />
        <p className="font-medium">Glisse-dépose tes photos ici</p>
        <p className="text-xs text-muted-foreground">ou clique pour parcourir — {MIN_PHOTOS} à {MAX_PHOTOS} photos, JPG ou PNG</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <PhotoPreview key={`${photo.name}-${i}`} file={photo} onRemove={() => removeAt(i)} />
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {photos.length}/{MAX_PHOTOS} photos {photos.length < MIN_PHOTOS && `— ajoute ${MIN_PHOTOS - photos.length} photo(s) de plus pour continuer`}
      </p>
    </div>
  );
}

function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-border">
      <Image src={url} alt={file.name} fill sizes="120px" className="object-cover" unoptimized />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 shadow outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        aria-label={`Supprimer ${file.name}`}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export { MIN_PHOTOS, MAX_PHOTOS };
