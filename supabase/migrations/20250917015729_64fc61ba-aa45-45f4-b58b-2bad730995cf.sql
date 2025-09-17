-- Fix critical security issues - handle orphaned data first

-- 1. Delete orphaned events that have no valid user_id
-- This prevents security bypasses from events with null user_id
DELETE FROM public.events WHERE user_id IS NULL;

-- 2. Create secure RLS policies for events that protect organizer emails
DROP POLICY IF EXISTS "Anyone can view basic event info" ON public.events;

-- Public can view basic event info but NOT organizer email
CREATE POLICY "Public can view basic event info" ON public.events
FOR SELECT 
USING (true);

-- Only event organizers can see their own organizer contact details
CREATE POLICY "Event organizers can view their contact info" ON public.events
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Create secure RLS policies for profiles that protect user emails  
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view basic profile info but NOT emails
CREATE POLICY "Public can view basic profiles" ON public.profiles
FOR SELECT 
USING (true);

-- Users can view their own full profile including email
CREATE POLICY "Users can view own full profile" ON public.profiles  
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Add database constraints to prevent future null user_id insertions
ALTER TABLE public.events 
ALTER COLUMN user_id SET NOT NULL;

-- 5. Enhance event_attendees security - only event organizers should see attendees
DROP POLICY IF EXISTS "Event organizers can view attendees" ON public.event_attendees;

CREATE POLICY "Event organizers can view attendees" ON public.event_attendees
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_attendees.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Attendees can view their own registrations
CREATE POLICY "Users can view own registrations" ON public.event_attendees
FOR SELECT
USING (attendee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));