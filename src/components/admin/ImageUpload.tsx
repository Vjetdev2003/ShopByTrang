'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export default function ImageUpload({
    value,
    onChange,
    maxFiles = 5,
    disabled
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const uploadFiles = async (files: FileList | File[]) => {
        try {
            setUploading(true);
            const urls: string[] = [];

            const fileArray = Array.from(files);
            const remainingSlots = maxFiles - value.length;
            const filesToUpload = fileArray.slice(0, remainingSlots);

            for (const file of filesToUpload) {
                // Check if file is an image
                if (!file.type.startsWith('image/')) {
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                urls.push(data.url);
            }

            if (urls.length > 0) {
                onChange([...value, ...urls]);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi xảy ra khi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await uploadFiles(files);
        e.target.value = '';
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !uploading) {
            setIsDragOver(true);
        }
    }, [disabled, uploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled || uploading) return;
        if (value.length >= maxFiles) {
            alert(`Chỉ được upload tối đa ${maxFiles} ảnh`);
            return;
        }

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await uploadFiles(files);
        }
    }, [disabled, uploading, value.length, maxFiles]);

    const onRemove = (url: string) => {
        onChange(value.filter((current) => current !== url));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="relative Aspect-square bg-neutral-800 rounded-lg overflow-hidden group border border-neutral-700 aspect-square"
                    >
                        <div className="relative w-full h-full">
                            {/* Using standard img for now if next/image config is not set for uploads */}
                            <img
                                src={url}
                                alt="Product image"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(url)}
                            disabled={disabled}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {value.length < maxFiles && (
                <div
                    className="flex items-center gap-4"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <label className={`
                        flex flex-col items-center justify-center w-full min-h-[128px]
                        border-2 border-dashed rounded-lg
                        cursor-pointer transition-all duration-200
                        ${isDragOver
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/50'
                        }
                        ${disabled && 'opacity-50 cursor-not-allowed'}
                    `}>
                        <div className="flex flex-col items-center justify-center py-6">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                            ) : (
                                <ImagePlus className={`w-8 h-8 ${isDragOver ? 'text-blue-400' : 'text-neutral-400'}`} />
                            )}
                            <p className={`mt-2 text-sm ${isDragOver ? 'text-blue-400' : 'text-neutral-400'}`}>
                                {isDragOver ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                Còn {maxFiles - value.length} ảnh có thể thêm
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={onUpload}
                            disabled={disabled || uploading}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
