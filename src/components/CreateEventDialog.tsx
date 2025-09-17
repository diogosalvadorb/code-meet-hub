import { useState } from "react";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { validateEventData, sanitizeFormData, sanitizeInput } from "@/lib/validation";

export const CreateEventDialog = ({ onEventCreated }: { onEventCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    max_attendees: "",
    organizer_name: "",
    organizer_email: "",
    image_url: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const sanitizedTag = sanitizeInput(tagInput);
    if (sanitizedTag && !tags.includes(sanitizedTag) && tags.length < 10) {
      setTags(prev => [...prev, sanitizedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar um evento.",
      });
      navigate('/auth');
      return;
    }
    
    // Sanitize and validate form data
    const sanitizedData = sanitizeFormData(formData);
    const validation = validateEventData(sanitizedData);
    
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: validation.errors.join(', '),
      });
      return;
    }
    
    // Validate tags
    const sanitizedTags = tags.map(tag => sanitizeInput(tag)).filter(Boolean);
    if (sanitizedTags.length !== tags.length) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Algumas tags contêm caracteres inválidos.",
      });
      return;
    }
    
    setLoading(true);

    try {
      const eventDateTime = new Date(`${sanitizedData.date}T${sanitizedData.time}`);
      
      const { error } = await supabase
        .from('events')
        .insert({
          title: sanitizedData.title,
          description: sanitizedData.description || null,
          date: eventDateTime.toISOString(),
          location: sanitizedData.location,
          max_attendees: sanitizedData.max_attendees ? parseInt(sanitizedData.max_attendees) : null,
          organizer_name: sanitizedData.organizer_name,
          organizer_email: sanitizedData.organizer_email,
          image_url: sanitizedData.image_url || null,
          tags: sanitizedTags.length > 0 ? sanitizedTags : null,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Evento criado com sucesso!",
        description: "Seu evento foi publicado na plataforma.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        max_attendees: "",
        organizer_name: "",
        organizer_email: "",
        image_url: ""
      });
      setTags([]);
      setOpen(false);
      onEventCreated?.();
    } catch (error: any) {
      let errorMessage = "Tente novamente em alguns instantes.";
      
      // Handle specific database errors without exposing system details
      if (error?.code === '23505') {
        errorMessage = "Já existe um evento com essas informações.";
      } else if (error?.code === '23502') {
        errorMessage = "Todos os campos obrigatórios devem ser preenchidos.";
      }
      
      toast({
        title: "Erro ao criar evento",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-gradient-hero hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Criar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Criar Novo Evento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título do Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: React Meetup São Paulo"
                required
                className="glass"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva o que será discutido no evento..."
                className="glass min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
                className="glass"
              />
            </div>

            <div>
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
                className="glass"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="location">Local *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                  required
                  className="glass pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_attendees">Máx. Participantes</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => handleInputChange("max_attendees", e.target.value)}
                  placeholder="50"
                  className="glass pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="glass"
              />
            </div>

            <div>
              <Label htmlFor="organizer_name">Seu Nome *</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) => handleInputChange("organizer_name", e.target.value)}
                placeholder="João Silva"
                required
                className="glass"
              />
            </div>

            <div>
              <Label htmlFor="organizer_email">Seu Email *</Label>
              <Input
                id="organizer_email"
                type="email"
                value={formData.organizer_email}
                onChange={(e) => handleInputChange("organizer_email", e.target.value)}
                placeholder="joao@exemplo.com"
                required
                className="glass"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ex: React, JavaScript, Frontend"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="glass"
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  Adicionar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-hero hover:opacity-90"
            >
              {loading ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};