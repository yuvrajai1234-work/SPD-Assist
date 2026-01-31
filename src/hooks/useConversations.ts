import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const createConversation = async (title: string = "New Chat"): Promise<string | null> => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ title })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    return data.id;
  };

  const updateConversationTitle = async (id: string, title: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", id);

    if (error) {
      console.error("Error updating conversation:", error);
      return;
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c))
    );
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    conversations,
    loading,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    refetch: fetchConversations,
  };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages((data || []).map(m => ({
          ...m,
          role: m.role as "user" | "assistant"
        })));
      }
      setLoading(false);
    };

    fetchMessages();
  }, [conversationId]);

  const addMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return null;

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    const typedData: Message = {
      ...data,
      role: data.role as "user" | "assistant"
    };

    setMessages((prev) => [...prev, typedData]);
    return typedData;
  };

  const updateLastAssistantMessage = async (content: string) => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const { error } = await supabase
      .from("messages")
      .update({ content })
      .eq("id", lastAssistant.id);

    if (error) {
      console.error("Error updating message:", error);
    }
  };

  const setMessagesLocal = (msgs: Message[]) => {
    setMessages(msgs);
  };

  return {
    messages,
    loading,
    addMessage,
    updateLastAssistantMessage,
    setMessages: setMessagesLocal,
  };
}
