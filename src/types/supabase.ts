export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          location: Json | null
          updated_at: string
          status: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          location?: Json | null
          updated_at?: string
          status?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          location?: Json | null
          updated_at?: string
          status?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
      }
    }
  }
}