-- in this file we are bascially creating data
-- Users
INSERT INTO users (username, email, password_hash, bio)
VALUES
  ('alice',   'alice@example.com',   'hash_placeholder', 'Full stack developer'),
  ('bob',     'bob@example.com',     'hash_placeholder', 'Backend engineer'),
  ('charlie', 'charlie@example.com', 'hash_placeholder', 'Frontend developer');

-- Tags
INSERT INTO tags (name, slug)
VALUES
  ('JavaScript', 'javascript'),
  ('Node.js',    'nodejs'),
  ('PostgreSQL', 'postgresql'),
  ('Express',    'express'),
  ('Tutorial',   'tutorial');

-- Posts
INSERT INTO posts (title, slug, content, excerpt, user_id, published, published_at)
VALUES
  (
    'Getting Started with Node.js',
    'getting-started-nodejs',
    'Node.js is a JavaScript runtime built on Chrome V8 engine. It allows you to run JavaScript on the server side. This guide covers everything you need to know to get started.',
    'An introduction to Node.js for beginners',
    1, true, NOW()
  ),
  (
    'PostgreSQL for Backend Developers',
    'postgresql-backend-developers',
    'PostgreSQL is the most advanced open source relational database. In this post we cover tables, joins, indexes, and transactions in depth.',
    'Deep dive into PostgreSQL features',
    1, true, NOW()
  ),
  (
    'Building REST APIs with Express',
    'rest-apis-express',
    'Express is a minimal web framework for Node.js. This guide shows you how to build production-ready REST APIs with proper structure, validation, and error handling.',
    'Learn to build production REST APIs',
    2, true, NOW()
  ),
  (
    'Draft Post Not Published Yet',
    'draft-post',
    'This post is still being written and is not ready for publishing.',
    NULL,
    2, false, NULL
  );

-- Post-Tags
INSERT INTO post_tags (post_id, tag_id)
VALUES
  (1, 1), (1, 2), (1, 5),
  (2, 3), (2, 5),
  (3, 1), (3, 4), (3, 5),
  (4, 2);

-- Comments
INSERT INTO comments (content, post_id, user_id)
VALUES
  ('Great article, very helpful!',         1, 2),
  ('Thanks for sharing this!',             1, 3),
  ('Really detailed explanation.',         2, 2),
  ('Can you cover transactions next?',     2, 3),
  ('Express is my favourite framework!',   3, 1);