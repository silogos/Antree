import { memo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Queue } from "@/src/types/queue.types";
import { Card, CardContent } from "./ui/Card.component";
import { Button } from "./ui/Button.component";

interface QueueBoardCardProps {
	queue: Queue;
}

/**
 * QueueBoardCard Component
 * Displays a single queue as a clickable card in the board list
 * Memoized to prevent unnecessary re-renders when other queues change
 */
export const QueueBoardCard = memo<QueueBoardCardProps>(({ queue }) => {
	return (
		<Link
			to={`/queues/${queue.id}`}
			className="group"
		>
			<Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200">
				<CardContent className="p-6">
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1 min-w-0">
							<h3 className="text-xl font-semibold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
								{queue.name}
							</h3>
							<div className="flex items-center gap-2 flex-wrap">
								{queue.isActive ? (
									<span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
										<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
										Active
									</span>
								) : (
									<span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">
										Inactive
									</span>
								)}
							</div>
						</div>
						<div className="shrink-0 ml-2">
							<ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
						</div>
					</div>

					<div className="pt-4 border-t border-slate-100">
						<div className="flex items-center justify-between">
							<div className="flex flex-col gap-1">
								<p className="text-xs text-slate-500">Created</p>
								<p className="text-sm font-medium text-slate-700">
									{new Date(queue.createdAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</p>
							</div>
							<Button
								size="sm"
								variant="ghost"
								className="opacity-0 group-hover:opacity-100 transition-opacity"
							>
								View
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
});

QueueBoardCard.displayName = "QueueBoardCard";
