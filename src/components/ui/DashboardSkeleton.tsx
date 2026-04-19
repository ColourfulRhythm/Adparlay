import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Skeleton */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
          <div className="flex-1 h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1 h-11 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="flex gap-4">
            <div className="h-11 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-11 w-40 bg-gray-200 rounded-xl animate-pulse hidden sm:block"></div>
          </div>
        </div>

        {/* List Areas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100 animate-pulse">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 w-full max-w-md bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                     <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                     <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
