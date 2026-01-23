interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    className = '',
}: StatCardProps) {
    return (
        <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-neutral-400 mb-1">{title}</p>
                    <p className="text-2xl font-semibold text-white">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <p className={`text-xs mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-neutral-500">so với hôm qua</span>
                        </p>
                    )}
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg text-neutral-400">
                    {icon}
                </div>
            </div>
        </div>
    );
}
