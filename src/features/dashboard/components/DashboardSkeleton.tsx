import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden border-ice animate-pulse">
                        <CardHeader className="p-4 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Skeleton className="h-24 w-full rounded-md" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};
