/*
  # Initial schema for MapConnect application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users.id)
      - `username` (text, not null)
      - `avatar_url` (text, nullable)
      - `location` (jsonb, nullable - stores lat/long coordinates)
      - `updated_at` (timestamptz, default now())
      - `status` (text, default 'offline')
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles.id)
      - `receiver_id` (uuid, references profiles.id)
      - `content` (text, not null)
      - `created_at` (timestamptz, default now())
      - `read` (boolean, default false)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for users to:
      - Read all profiles
      - Update only their own profile
      - Read messages where they are sender or receiver
      - Create messages (they can only set themselves as sender)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  location JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'offline'
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can insert messages as themselves"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received (for read status)"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Index for faster message queries
CREATE INDEX IF NOT EXISTS messages_sender_receiver_idx ON messages(sender_id, receiver_id);