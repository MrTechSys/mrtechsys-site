
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Keep this import, it might be used elsewhere or could be a remnant, but better safe.
import { Calendar as CalendarIcon, Upload, X } from "lucide-react"; // Send icon removed as comment functionality is moved
import { format } from "date-fns";
import { toast } from "sonner";
import CommentThread from "../CommentThread"; // New import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // New imports

export default function TaskFormModal({ open, onClose, task, jobId, onSave, teamMembers = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assigned_to: "",
    due_date: null,
    estimated_hours: null,
    blocked_reason: "",
    attachments: [],
    // comments removed from formData, as CommentThread will manage them
  });

  // newComment and setNewComment state removed
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null); // Keep user state for attachment info

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assigned_to: task.assigned_to || "",
        due_date: task.due_date ? new Date(task.due_date) : null,
        estimated_hours: task.estimated_hours || null,
        blocked_reason: task.blocked_reason || "",
        attachments: task.attachments || [],
        // comments removed as it's managed by CommentThread
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigned_to: "",
        due_date: null,
        estimated_hours: null,
        blocked_reason: "",
        attachments: [],
        // comments removed
      });
    }
  }, [task]);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const taskData = {
      ...formData,
      job_id: jobId,
      due_date: formData.due_date ? formData.due_date.toISOString() : null
    };

    onSave(taskData);
    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        attachments: [
          ...formData.attachments,
          {
            name: file.name,
            url: file_url,
            uploaded_at: new Date().toISOString()
          }
        ]
      });
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // handleAddComment function removed as comment functionality is moved to CommentThread
  // newComment state removed as comment functionality is moved to CommentThread

  const removeAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-4xl max-h-[90vh] overflow-y-auto"> {/* Changed max-w-3xl to max-w-4xl */}
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="details" className="data-[state=active]:bg-amber-500/20">
              Task Details
            </TabsTrigger>
            {task && ( // Conditionally render comments tab only if editing an existing task
              <TabsTrigger value="comments" className="data-[state=active]:bg-amber-500/20">
                Comments & Activity
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-white">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-amber-500/30 text-white"
                placeholder="Enter task title..."
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-amber-500/30 text-white"
                rows={3}
                placeholder="Describe the task..."
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority" className="text-white">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assigned_to" className="text-white">Assign To</Label>
                <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full bg-white/5 border-amber-500/30 text-white justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => setFormData({ ...formData, due_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <Label htmlFor="estimated_hours" className="text-white">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                value={formData.estimated_hours || ''}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || null })}
                className="bg-white/5 border-amber-500/30 text-white"
                placeholder="e.g., 4.5"
              />
            </div>

            {/* Blocked Reason (only if status is blocked) */}
            {formData.status === 'blocked' && (
              <div>
                <Label htmlFor="blocked_reason" className="text-white">Blocked Reason</Label>
                <Textarea
                  id="blocked_reason"
                  value={formData.blocked_reason}
                  onChange={(e) => setFormData({ ...formData, blocked_reason: e.target.value })}
                  className="bg-white/5 border-amber-500/30 text-white"
                  rows={2}
                  placeholder="Why is this task blocked?"
                />
              </div>
            )}

            {/* Attachments */}
            <div>
              <Label className="text-white">Attachments</Label>
              <div className="space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-amber-500/20">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-white text-sm truncate hover:underline">
                      {attachment.name}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-600 h-6 w-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                  className="w-full border-amber-500/30 text-white hover:bg-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {task && ( // Conditionally render comments tab content only if editing an existing task
            <TabsContent value="comments" className="mt-4">
              <CommentThread
                entityType="task"
                entityId={task.id}
                entityName={task.title}
              />
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-amber-500/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
