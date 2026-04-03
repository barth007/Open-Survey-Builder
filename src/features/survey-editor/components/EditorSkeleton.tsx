import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const EditorSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col min-h-0 bg-gray-100 p-4">
            <div className="flex w-full flex-1 gap-4 rounded-xl overflow-hidden">
                {/* Left Panel Skeleton */}
                <div className="flex-1 bg-white p-6 space-y-6 overflow-y-auto">
                    {/* Title & Description Section */}
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>

                    {/* Welcome Card Skeleton */}
                    <Card className="border-ice shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Section Skeleton */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </div>

                        {[1, 2].map((i) => (
                            <Card key={i} className="border-ice shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <Skeleton className="h-10 w-full" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Panel Skeleton (Preview) */}
                <div className="hidden lg:flex flex-1 bg-white p-6 space-y-6 border-l overflow-y-auto">
                    <Skeleton className="h-8 w-32 mb-4" />
                    {[1, 2].map((i) => (
                        <Card key={i} className="border-ice shadow-sm bg-gray-50/50">
                            <CardContent className="p-8 space-y-4 flex flex-col items-center text-center">
                                <Skeleton className="h-10 w-3/4" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-12 w-48 mt-4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
