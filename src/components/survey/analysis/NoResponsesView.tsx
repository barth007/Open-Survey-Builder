
import React from 'react';

interface NoResponsesViewProps {
  totalResponses: number;
  hasFilteredResponses: boolean;
}

export const NoResponsesView: React.FC<NoResponsesViewProps> = ({ totalResponses, hasFilteredResponses }) => {
  if (totalResponses > 0 && !hasFilteredResponses) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-ice">
        <p className="text-gray-500">No responses match your filter criteria.</p>
      </div>
    );
  }
  
  if (totalResponses === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-ice">
        <p className="text-gray-500">No responses have been collected for this survey yet.</p>
      </div>
    );
  }
  
  return null;
};
