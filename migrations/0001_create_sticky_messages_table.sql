-- migrations/0001_create_sticky_messages_table.sql

CREATE TABLE sticky_messages (
    channel_id TEXT PRIMARY KEY,
    current_message_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL
);