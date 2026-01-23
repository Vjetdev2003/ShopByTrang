'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NoteEditorProps {
    initialValue: string;
    label: string;
    placeholder?: string;
    apiEndpoint: string;
    fieldKey: string;
}

export default function NoteEditor({
    initialValue,
    label,
    placeholder,
    apiEndpoint,
    fieldKey,
}: NoteEditorProps) {
    const router = useRouter();
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(apiEndpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldKey]: value }),
            });

            if (res.ok) {
                setIsDirty(false);
                router.refresh();
            } else {
                alert('Có lỗi xảy ra khi lưu ghi chú');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">{label}</label>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50"
                    >
                        <Save className="w-3 h-3" />
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                )}
            </div>
            <textarea
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setIsDirty(e.target.value !== initialValue);
                }}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-neutral-500"
            />
        </div>
    );
}
