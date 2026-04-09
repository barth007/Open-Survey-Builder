
import React from 'react';

interface NoResponsesViewProps {
  totalResponses: number;
  hasFilteredResponses: boolean;
}

export const NoResponsesView: React.FC<NoResponsesViewProps> = ({ totalResponses, hasFilteredResponses }) => {
  if (totalResponses > 0 && !hasFilteredResponses) {
    return (
      <div className="text-center py-16 rounded-[24px] border border-border/70 bg-background">
        <p className="text-sm text-muted-foreground">No responses match your filter criteria.</p>
      </div>
    );
  }
  
  if (totalResponses === 0) {
    return (
      <div className="text-center py-16 rounded-[24px] border border-border/70 bg-background">
        <p className="text-sm text-muted-foreground">No responses have been collected for this survey yet.</p>
      </div>
    );
  }
  
  return null;
};
