/**
 * Chart Loading Skeleton
 * 
 * Animated skeleton loader for charts during data loading.
 * Provides better perceived performance than spinners.
 */

export function ChartSkeleton() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            
            {/* Description skeleton */}
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-4"></div>
            
            {/* Chart area skeleton */}
            <div className="h-80 bg-gray-50 rounded flex items-end justify-around p-4 space-x-2">
                {/* Simulated bar chart bars */}
                <div className="w-full bg-gray-200 rounded-t" style={{ height: '60%' }}></div>
                <div className="w-full bg-gray-200 rounded-t" style={{ height: '80%' }}></div>
                <div className="w-full bg-gray-200 rounded-t" style={{ height: '45%' }}></div>
                <div className="w-full bg-gray-200 rounded-t" style={{ height: '95%' }}></div>
                <div className="w-full bg-gray-200 rounded-t" style={{ height: '70%' }}></div>
                <div className="w-full bg-gray-200 rounded-t" style={{ height: '55%' }}></div>
            </div>
        </div>
    );
}

/**
 * Grid of Chart Skeletons
 * 
 * @param {number} count - Number of skeleton charts to display
 */
export function ChartSkeletonGrid({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ChartSkeleton key={index} />
            ))}
        </div>
    );
}

export default ChartSkeleton;
