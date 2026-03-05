
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Paperclip,
  MoreVertical,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

const statusColumns = [
  { id: "todo", title: "To Do", color: "border-slate-300" },
  { id: "in_progress", title: "In Progress", color: "border-blue-500" },
  { id: "review", title: "Review", color: "border-purple-500" },
  { id: "blocked", title: "Blocked", color: "border-red-500" },
  { id: "completed", title: "Completed", color: "border-green-500" }
];

export default function TaskKanbanBoard({ tasks, onTaskClick, onTaskUpdate, teamMembers = [] }) {
  const [tasksByStatus, setTasksByStatus] = useState(() => {
    const grouped = {};
    statusColumns.forEach(col => {
      grouped[col.id] = tasks.filter(t => t.status === col.id)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });
    return grouped;
  });

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const sourceTasks = Array.from(tasksByStatus[sourceStatus]);
    const destTasks = sourceStatus === destStatus ? sourceTasks : Array.from(tasksByStatus[destStatus]);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destStatus;

    destTasks.splice(destination.index, 0, movedTask);

    setTasksByStatus({
      ...tasksByStatus,
      [sourceStatus]: sourceStatus === destStatus ? destTasks : sourceTasks,
      [destStatus]: destTasks
    });

    // Update task status in backend
    onTaskUpdate(draggableId, { status: destStatus, order_index: destination.index });
  };

  const getAssignee = (userId) => {
    return teamMembers.find(m => m.id === userId);
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className={`bg-[#0a1929]/60 backdrop-blur border-amber-500/20 border-t-4 ${column.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm font-semibold">
                    {column.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-amber-500/10 rounded-lg p-2' : ''
                      }`}
                    >
                      {tasksByStatus[column.id]?.map((task, index) => {
                        const assignee = getAssignee(task.assigned_to);
                        const overdue = isOverdue(task.due_date);

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white/5 border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                }`}
                                onClick={() => onTaskClick(task)}
                                data-tutorial="task-card"
                              >
                                <CardContent className="p-3 space-y-2">
                                  {/* Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-white font-medium text-sm line-clamp-2">
                                      {task.title}
                                    </h4>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/60">
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onTaskClick(task)}>
                                          Edit Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                          Delete Task
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Priority Badge */}
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${priorityColors[task.priority]} text-xs`}>
                                      {task.priority}
                                    </Badge>
                                    {task.estimated_hours && (
                                      <span className="text-xs text-white/60 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.estimated_hours}h
                                      </span>
                                    )}
                                  </div>

                                  {/* Description */}
                                  {task.description && (
                                    <p className="text-xs text-white/60 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Due Date */}
                                  {task.due_date && (
                                    <div className={`flex items-center gap-1 text-xs ${
                                      overdue ? 'text-red-400' : 'text-white/60'
                                    }`}>
                                      {overdue ? (
                                        <AlertCircle className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      {format(new Date(task.due_date), 'MMM d, h:mm a')}
                                    </div>
                                  )}

                                  {/* Footer */}
                                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    {/* Assignee */}
                                    <div className="flex items-center gap-1">
                                      {assignee ? (
                                        <>
                                          <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                                              {assignee.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-white/70">{assignee.full_name}</span>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-1 text-white/50">
                                          <User className="w-3 h-3" />
                                          <span className="text-xs">Unassigned</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Icons */}
                                    <div className="flex items-center gap-2">
                                      {task.comments?.length > 0 && (
                                        <div className="flex items-center gap-1 text-white/60">
                                          <MessageSquare className="w-3 h-3" />
                                          <span className="text-xs">{task.comments.length}</span>
                                        </div>
                                      )}
                                      {task.attachments?.length > 0 && (
                                        <div className="flex items-center gap-1 text-white/60">
                                          <Paperclip className="w-3 h-3" />
                                          <span className="text-xs">{task.attachments.length}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
