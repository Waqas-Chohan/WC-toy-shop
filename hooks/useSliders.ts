import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Slider {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export function useSliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('sliders')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        setSliders(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching sliders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  const addSlider = async (slider: Omit<Slider, 'id' | 'created_at'>) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sliders')
        .insert([
          {
            ...slider,
            created_by: authData.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setSliders([...sliders, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateSlider = async (id: string, updates: Partial<Slider>) => {
    try {
      const { data, error } = await supabase
        .from('sliders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSliders(sliders.map((s) => (s.id === id ? data : s)));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSlider = async (id: string) => {
    try {
      const { error } = await supabase.from('sliders').delete().eq('id', id);

      if (error) throw error;
      setSliders(sliders.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { sliders, loading, error, addSlider, updateSlider, deleteSlider };
}
