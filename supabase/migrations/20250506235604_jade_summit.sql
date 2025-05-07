/*
  # Fix profiles RLS policies

  1. Changes
    - Drop existing insert policy
    - Create new insert policy with proper auth checks
    - Add enable_row_level_security call to ensure RLS is enabled
  
  2. Security
    - Ensures users can only insert their own profile
    - Maintains existing security model
*/

-- First drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Re-enable RLS to ensure it's active
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new insert policy with proper auth checks
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );