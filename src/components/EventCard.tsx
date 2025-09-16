import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  max_attendees?: number;
  organizer_name: string;
  image_url?: string;
  tags?: string[];
}

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
}

export const EventCard = ({ event, onViewDetails }: EventCardProps) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="glass shadow-card hover-lift hover-glow group cursor-pointer overflow-hidden">
      {event.image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <span>{formattedDate} às {formattedTime}</span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>

            {event.max_attendees && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2 text-primary" />
                <span>Máx. {event.max_attendees} participantes</span>
              </div>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="pt-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onViewDetails(event.id)}
              className="w-full bg-gradient-hero hover:opacity-90"
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};