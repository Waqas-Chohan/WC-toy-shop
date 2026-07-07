'use client';

import { useState } from 'react';
import { useProductStore, HeroSlide } from '@/stores/productStore';
import { 
  Plus, Search, Edit2, Trash2, 
  Image as ImageIcon, FolderPlus, HelpCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export function SlidersSection() {
  const { slides, addSlide, updateSlide, deleteSlide } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('NEW ARRIVAL');
  const [cta, setCta] = useState('Shop Now');

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setImage('');
    setBadge('NEW ARRIVAL');
    setCta('Shop Now');
    setEditingSlide(null);
    setIsFormOpen(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle);
    setImage(slide.image);
    setBadge(slide.badge);
    setCta(slide.cta);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !subtitle || !image || !badge || !cta) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const slideData = {
      title,
      subtitle,
      image,
      badge,
      cta,
    };

    if (editingSlide) {
      updateSlide(editingSlide.id, slideData);
      toast.success('Slide updated successfully!');
    } else {
      addSlide(slideData);
      toast.success('New carousel slide added successfully!');
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this homepage slide?')) {
      deleteSlide(id);
      toast.success('Slide deleted successfully!');
    }
  };

  const filteredSlides = slides.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.badge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search slides, badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
          />
        </div>

        <button
          onClick={handleOpenAddForm}
          className="w-full sm:w-auto h-9 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Add Carousel Slide
        </button>
      </div>

      {/* Form Area */}
      {isFormOpen && (
        <div className="glass-card border-purple-500/20 rounded-2xl p-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            {editingSlide ? 'Edit Slide Details' : 'Configure New Homepage Carousel Slide'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slide Header / Title *</label>
              <input
                type="text"
                placeholder="e.g. Next-Gen Intelligent Play"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slide Subtitle / Description *</label>
              <input
                type="text"
                placeholder="e.g. Expand creativity with programmable building kits"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Badge Text *</label>
              <input
                type="text"
                placeholder="e.g. NEW ARRIVAL"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CTA Button Text *</label>
              <input
                type="text"
                placeholder="e.g. Shop Now"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Background Image URL *</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-... (1200x500 resolution recommended)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="flex gap-3 justify-end md:col-span-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 h-10 rounded-lg border border-border text-sm font-semibold text-slate-300 hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                {editingSlide ? 'Save Slide' : 'Publish Slide'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSlides.map((slide) => (
          <div 
            key={slide.id} 
            className="glass-card border-border/40 rounded-2xl overflow-hidden hover-lift flex flex-col group"
          >
            {/* Header image preview */}
            <div className="relative h-40 bg-slate-900 overflow-hidden shrink-0 border-b border-border/20">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-widest bg-cyan-500/80 text-white border border-cyan-400/30 rounded-full w-fit uppercase mb-1">
                  {slide.badge}
                </span>
                <h3 className="font-bold text-white text-base truncate">{slide.title}</h3>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{slide.subtitle}</p>
              
              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <span className="text-xs font-semibold text-slate-500">
                  CTA Action: <span className="text-cyan-400 font-bold">{slide.cta}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditForm(slide)}
                    className="p-1.5 rounded-md hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 text-cyan-400 transition-colors"
                    title="Edit Slide"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredSlides.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            No homepage slides configured. Click "Add Carousel Slide" to make one.
          </div>
        )}
      </div>
    </div>
  );
}
