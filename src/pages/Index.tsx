import { useState, useEffect } from "react";
import { Calendar, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import heroImage from "@/assets/hero-meetup.jpg";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  max_attendees?: number;
  organizer_name: string;
  organizer_email: string;
  image_url?: string;
  tags?: string[];
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: "Tente recarregar a página.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleViewDetails = (eventId: string) => {
    // Future: Navigate to event details page
    toast({
      title: "Em breve!",
      description: "Página de detalhes do evento será implementada em breve.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Developers coding together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
        </div>
        
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-between">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Code Meet Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Conecte-se com desenvolvedores, aprenda novas tecnologias e faça networking na comunidade tech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CreateEventDialog onEventCreated={fetchEvents} />
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Eventos
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <UserMenu />
          </div>
        </div>
        <div className="absolute top-4 right-4 md:hidden">
          <UserMenu />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">{events.length}</div>
              <div className="text-muted-foreground">Eventos Disponíveis</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Desenvolvedores Conectados</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Tecnologias Abordadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-6">
              <Code className="w-4 h-4 text-primary" />
              Próximos eventos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Eventos de <span className="text-primary">Tecnologia</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre meetups, workshops e conferências sobre as tecnologias que você mais ama
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="glass rounded-2xl p-12 max-w-md mx-auto">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum evento disponível</h3>
                <p className="text-muted-foreground mb-6">
                  Seja o primeiro a criar um evento incrível para a comunidade!
                </p>
                <CreateEventDialog onEventCreated={fetchEvents} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para <span className="text-primary">conectar</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Organize seu próprio evento ou participe de meetups incríveis na sua cidade
            </p>
            <CreateEventDialog onEventCreated={fetchEvents} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="font-semibold">Code Meet Hub</span>
          </div>
          <p className="text-sm">
            Conectando desenvolvedores através de eventos incríveis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;