
// src/pages/TeamsCreate.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TeamsCreate = () => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.from('teams').insert([
        { name, created_by: user.id }
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Team created successfully",
      });

      navigate('/profile');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create a New Team</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamsCreate;
