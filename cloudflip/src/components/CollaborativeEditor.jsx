import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Users, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import PresenceIndicator from "./PresenceIndicator";
import { motion } from "framer-motion";

export default function CollaborativeEditor({ documentId, onSave }) {
  const [user, setUser] = useState(null);
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimerRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      if (documentId) {
        const doc = await api.entities.CollaborativeDocument.get(documentId);
        setDocument(doc);
        setContent(doc.content || "");
      }
    };
    loadData();
  }, [documentId]);

  // Auto-save with debounce
  useEffect(() => {
    if (!document || !user) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [content]);

  // Update presence when editing
  useEffect(() => {
    if (!user || !documentId) return;

    const sessionId = sessionStorage.getItem('cf_session');
    const updatePresence = async () => {
      await api.functions.invoke('realtimePresenceSync', {
        action: 'heartbeat',
        session_id: sessionId,
        page: window.location.pathname,
        entity_type: 'collaborative_document',
        entity_id: documentId,
        is_editing: true
      });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    return () => clearInterval(interval);
  }, [user, documentId]);

  const saveMutation = useMutation({
    mutationFn: async (newContent) => {
      return api.entities.CollaborativeDocument.update(document.id, {
        content: newContent,
        last_edited_by: user.id,
        last_edited_at: new Date().toISOString(),
        version: (document.version || 1) + 1
      });
    },
    onSuccess: (updatedDoc) => {
      setDocument(updatedDoc);
      setLastSaved(new Date());
      setIsSaving(false);
      if (onSave) onSave(updatedDoc);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const handleAutoSave = async () => {
    if (!document || !user || content === document.content) return;
    setIsSaving(true);
    saveMutation.mutate(content);
  };

  const handleManualSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setIsSaving(true);
    saveMutation.mutate(content);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  if (!document) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-8 text-center text-white/60">
          Loading document...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-white">{document.title}</CardTitle>
            {isSaving && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-amber-400 text-sm"
              >
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Saving...
              </motion.div>
            )}
            {lastSaved && !isSaving && (
              <span className="text-white/50 text-xs">
                Saved {format(lastSaved, 'h:mm a')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <PresenceIndicator 
              entityType="collaborative_document" 
              entityId={documentId} 
            />
            <Button
              onClick={handleManualSave}
              disabled={isSaving || content === document.content}
              size="sm"
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Now
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg">
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            theme="snow"
            className="h-96"
          />
        </div>
        <div className="mt-3 text-xs text-white/50 flex items-center justify-between">
          <span>Version {document.version}</span>
          <span>Last edited by {document.last_edited_by === user?.id ? 'You' : 'Team member'}</span>
        </div>
      </CardContent>
    </Card>
  );
}