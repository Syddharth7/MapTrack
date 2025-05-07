import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Error fetching user profile' });
    }

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get all users (admin only)
app.get('/api/users', authenticateUser, async (req, res) => {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      return res.status(500).json({ error: 'Error fetching profiles' });
    }
    
    // Get all users from auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      return res.status(500).json({ error: 'Error fetching users' });
    }
    
    // Combine profile data with user emails
    const combinedUsers = profiles.map(profile => {
      const authUser = users.find(u => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email
      };
    });
    
    res.status(200).json(combinedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Create user (admin only)
app.post('/api/users', authenticateUser, async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }
    
    // Create auth user using admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (userError) {
      return res.status(500).json({ error: userError.message });
    }
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userData.user.id,
        username,
        status: 'offline'
      }]);
      
    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }
    
    res.status(201).json({ message: 'User created successfully', userId: userData.user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user using admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
    
    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});