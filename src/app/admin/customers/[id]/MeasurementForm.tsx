'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Measurement {
    id?: string;
    height?: number | null;
    weight?: number | null;
    bust?: number | null;
    waist?: number | null;
    hips?: number | null;
    shoulder?: number | null;
    armLength?: number | null;
    dressLength?: number | null;
    note?: string | null;
}

interface Props {
    userId: string;
    initialData: Measurement | null;
}

const measurementFields = [
    { key: 'height', label: 'Chiều cao', unit: 'cm', placeholder: '160' },
    { key: 'weight', label: 'Cân nặng', unit: 'kg', placeholder: '50' },
    { key: 'bust', label: 'Vòng 1 (ngực)', unit: 'cm', placeholder: '88' },
    { key: 'waist', label: 'Vòng 2 (eo)', unit: 'cm', placeholder: '68' },
    { key: 'hips', label: 'Vòng 3 (mông)', unit: 'cm', placeholder: '92' },
    { key: 'shoulder', label: 'Vai', unit: 'cm', placeholder: '38' },
    { key: 'armLength', label: 'Dài tay', unit: 'cm', placeholder: '58' },
    { key: 'dressLength', label: 'Dài áo dài', unit: 'cm', placeholder: '140' },
];

export default function MeasurementForm({ userId, initialData }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Measurement>(initialData || {});
    const [note, setNote] = useState(initialData?.note || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/customers/${userId}/measurement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, note }),
            });

            if (response.ok) {
                router.refresh();
            } else {
                alert('Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (key: string, value: string) => {
        const numValue = value ? parseFloat(value) : null;
        setData((prev) => ({ ...prev, [key]: numValue }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {measurementFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-xs text-neutral-400 mb-1">
                            {field.label} ({field.unit})
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={(data as Record<string, number | null>)[field.key] || ''}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                        />
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-xs text-neutral-400 mb-1">Ghi chú số đo</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Khách thích mặc rộng tay, eo hơi bó..."
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-neutral-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
                {loading ? 'Đang lưu...' : initialData ? 'Cập nhật số đo' : 'Lưu số đo'}
            </button>
        </form>
    );
}
