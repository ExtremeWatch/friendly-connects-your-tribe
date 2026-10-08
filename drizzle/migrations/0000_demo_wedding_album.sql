INSERT INTO public.events (id, host_id, code, name, event_type, welcome_message, event_date)
VALUES ('00000000-0000-0000-0000-00000000de30', '00000000-0000-0000-0000-000000000000', 'demo', 'Emma & Luca''s Wedding', 'wedding', 'Thank you for celebrating with us — add your photos, videos and wishes!', CURRENT_DATE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.posts (event_id, author_name, kind, caption, status, created_at) VALUES
('00000000-0000-0000-0000-00000000de30', 'Sofia', 'text', 'To the happy couple! Wishing you a lifetime of laughter.', 'published', now() - interval '30 minutes'),
('00000000-0000-0000-0000-00000000de30', 'Marco', 'text', 'Best speech I''ve ever heard. Not crying, you''re crying.', 'published', now() - interval '20 minutes'),
('00000000-0000-0000-0000-00000000de30', 'Nanna Rita', 'text', 'Il-Bambin ikun magħkom dejjem. Love you both!', 'published', now() - interval '10 minutes');