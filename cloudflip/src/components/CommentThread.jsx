import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, MoreVertical, Edit, Trash, Smile, AtSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// NEW: PresenceIndicator component definition
const PresenceIndicator = ({ entityType, entityId }) => {
  // In a real application, this would fetch actual presence data for entityType/entityId
  // For demonstration, we'll simulate some active users.
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Simulate real-time updates for demonstration purposes
    const simulatePresence = () => {
      const users = [
        { id: 'usr-1', full_name: "Alice", avatar_initials: "AL" },
        { id: 'usr-2', full_name: "Bob", avatar_initials: "BO" },
        { id: 'usr-3', full_name: "Charlie", avatar_initials: "CH" },
        { id: 'usr-4', full_name: "Diana", avatar_initials: "DI" },
      ];
      // Randomly select some users to be "present" for this entity
      const currentActive = users.filter(() => Math.random() > 0.5);
      setActiveUsers(currentActive);
    };

    simulatePresence(); // Initial presence
    const interval = setInterval(simulatePresence, 10000); // Update every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [entityType, entityId]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-white/5 border border-amber-500/20">
      <span className="text-white/70 text-sm">Currently viewing:</span>
      <div className="flex -space-x-2 overflow-hidden">
        {activeUsers.map((user, index) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-[#0a1929] hover:z-10 transition-all duration-200">
            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
              {user.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
            <span className="sr-only">{user.full_name}</span>
          </Avatar>
        ))}
      </div>
      {activeUsers.length > 0 && (
        <span className="text-white/70 text-xs ml-1">
          {activeUsers.length} user{activeUsers.length > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};


const MentionPopover = ({ searchTerm, users, onSelect, position }) => {
  if (!searchTerm || users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bg-[#0a1929] border border-amber-500/30 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
      style={{ bottom: '100%', left: position.left, marginBottom: '8px' }}
    >
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          className="w-full px-4 py-2 hover:bg-amber-500/10 flex items-center gap-2 text-left"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
              {user.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-sm">{user.full_name}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default function CommentThread({ entityType, entityId, entityName }) {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ left: 0 });
  const [user, setUser] = useState(null);
  const textareaRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => api.entities.Comment.filter({
      entity_type: entityType,
      entity_id: entityId
    }, '-created_date'),
    refetchInterval: 5000 // Real-time refresh every 5 seconds
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => api.entities.User.list()
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data) => {
      const activity = await api.entities.Comment.create(data);
      
      // Create team activity
      await api.entities.TeamActivity.create({
        org_id: data.org_id,
        actor_id: user.id,
        actor_name: user.full_name,
        action_type: 'commented',
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        description: `${user.full_name} commented on ${entityName}`,
        mentioned_users: data.mentions || []
      });
      
      return activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity'] });
      setNewComment("");
      toast.success("Comment posted!");
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content, mentions }) => 
      api.entities.Comment.update(id, {
        content,
        mentions,
        is_edited: true,
        edited_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setEditingComment(null);
      toast.success("Comment updated!");
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => api.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success("Comment deleted!");
    }
  });

  const handleCommentChange = (value) => {
    setNewComment(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      const searchTerm = spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex);
      
      if (searchTerm.length > 0 && !searchTerm.includes('\n')) {
        setMentionSearch(searchTerm);
        // Calculate position - currently fixed, but could be dynamic based on caret
        const textarea = textareaRef.current;
        if (textarea) {
          // For simplicity, we'll keep it at left: 0.
          // Dynamic positioning based on cursor would require more complex calculations
          // using getBoundingClientRect and caret position.
          setMentionPosition({ left: 0 }); 
        }
      } else {
        setMentionSearch("");
      }
    } else {
      setMentionSearch("");
    }
  };

  const handleMentionSelect = (selectedUser) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const beforeMention = newComment.substring(0, lastAtIndex);
    const afterMention = newComment.substring(lastAtIndex + 1);
    const spaceIndex = afterMention.indexOf(' ');
    const remaining = spaceIndex === -1 ? '' : afterMention.substring(spaceIndex);
    
    setNewComment(`${beforeMention}@${selectedUser.full_name} ${remaining}`);
    setMentionSearch("");
    textareaRef.current?.focus();
  };

  const extractMentions = (text) => {
    // Regex to find words starting with @, potentially including spaces if names are multi-word
    // This simple regex might not handle all edge cases for multi-word names perfectly
    // A more robust solution might involve parsing the text structure.
    const mentionPattern = /@([\w\s]+?)(?=\s|$)/g; 
    const mentions = [];
    let match;
    
    while ((match = mentionPattern.exec(text)) !== null) {
      const mentionedName = match[1].trim(); // Trim to remove potential trailing spaces
      const user = teamMembers.find(u => 
        u.full_name.toLowerCase() === mentionedName.toLowerCase()
      );
      if (user) {
        mentions.push(user.id);
      }
    }
    
    return mentions;
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    
    const mentions = extractMentions(newComment);
    
    createCommentMutation.mutate({
      org_id: user.current_org_id,
      entity_type: entityType,
      entity_id: entityId,
      author_id: user.id,
      author_name: user.full_name,
      content: newComment,
      mentions
    });
  };

  const handleUpdate = (comment) => {
    if (!editingComment.content.trim()) return;
    
    const mentions = extractMentions(editingComment.content);
    updateCommentMutation.mutate({
      id: comment.id,
      content: editingComment.content,
      mentions
    });
  };

  const filteredUsers = mentionSearch
    ? teamMembers.filter(u => 
        u.full_name.toLowerCase().includes(mentionSearch.toLowerCase())
      )
    : [];

  const renderCommentContent = (content) => {
    // Highlight mentions in displayed content
    const mentionPattern = /@([\w\s]+?)(?=\s|$)/g;
    const parts = content.split(mentionPattern);
    
    return parts.map((part, idx) => {
      // Every second part is a captured group (the mention)
      if (idx % 2 === 1) {
        // Check if the part corresponds to an actual user to highlight it
        const isActualMention = teamMembers.some(u => 
          u.full_name.toLowerCase() === part.toLowerCase()
        );
        return (
          <span key={idx} className={isActualMention ? "text-amber-400 font-medium" : ""}>
            @{part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* Presence Indicators - NEW */}
      <PresenceIndicator entityType={entityType} entityId={entityId} />

      {/* Comment Input */}
      <div className="relative">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
              {user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Write a comment... Use @ to mention teammates"
              className="bg-white/5 border-amber-500/30 text-white resize-none"
              rows={3}
            />
            <AnimatePresence>
              {mentionSearch && (
                <MentionPopover
                  searchTerm={mentionSearch}
                  users={filteredUsers}
                  onSelect={handleMentionSelect}
                  position={mentionPosition}
                />
              )}
            </AnimatePresence>
            <div className="flex justify-between items-center mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white/80"
                onClick={() => {
                  setNewComment(newComment + ' @');
                  textareaRef.current?.focus();
                }}
              >
                <AtSign className="w-4 h-4 mr-1" />
                Mention
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || createCommentMutation.isPending}
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929]"
              >
                <Send className="w-4 h-4 mr-2" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex gap-3 p-3 bg-white/5 rounded-lg border border-amber-500/20"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                  {comment.author_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">
                      {comment.author_name}
                    </span>
                    <span className="text-white/50 text-xs">
                      {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                    </span>
                    {comment.is_edited && (
                      <Badge variant="outline" className="text-xs border-white/20 text-white/50">
                        edited
                      </Badge>
                    )}
                  </div>
                  {comment.author_id === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white/60">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingComment({ id: comment.id, content: comment.content })}>
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="text-red-600"
                        >
                          <Trash className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {editingComment?.id === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingComment.content}
                      onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                      className="bg-white/5 border-amber-500/30 text-white text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(comment)}
                        className="bg-amber-500 hover:bg-amber-600 text-[#0a1929]"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingComment(null)}
                        className="text-white/60"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/70 text-sm whitespace-pre-wrap">
                    {renderCommentContent(comment.content)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <div className="text-center py-8 text-white/50 text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}