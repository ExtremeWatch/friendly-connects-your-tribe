CREATE POLICY "Anyone can view event media" ON storage.objects FOR SELECT USING (bucket_id = 'event-media');
CREATE POLICY "Anyone can upload event media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-media');
CREATE POLICY "Owners can delete event media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-media');