import { useEffect } from "react";
import { useParams } from "react-router-dom";

/**
 * ItemDetail Component
 * Shows details of a specific queue item with SSE integration
 */
export function ItemDetail() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    console.log("ItemDetail - SSE connection for item:", id);
    // TODO: Implement SSE connection for item updates
    // TODO: Fetch item details from API

    return () => {
      console.log("ItemDetail - Cleaning up SSE connection for item:", id);
    };
  }, [id]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Queue Item Details</h1>
        {id ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Item ID: {id}</p>
              <p className="text-sm text-gray-600">Loading item details...</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No item ID provided</p>
          </div>
        )}
      </div>
    </div>
  );
}
