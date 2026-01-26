
import { supabase } from '../lib/supabase';
import { Note } from '../types';

export const fetchNotes = async (leadId: string): Promise<Note[]> => {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notes:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching notes:', err);
        return [];
    }
};

export const createNote = async (leadId: string, content: string): Promise<Note | null> => {
    try {
        const { data, error } = await supabase
            .from('notes')
            .insert([
                { lead_id: leadId, content }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Unexpected error creating note:', err);
        return null;
    }
};

export const updateNote = async (noteId: string, content: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('notes')
            .update({ content })
            .eq('id', noteId);

        if (error) {
            console.error('Error updating note:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Unexpected error updating note:', err);
        return false;
    }
};

export const deleteNote = async (noteId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            console.error('Error deleting note:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Unexpected error deleting note:', err);
        return false;
    }
};
