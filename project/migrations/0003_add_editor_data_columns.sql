ALTER TABLE pages RENAME COLUMN data TO novel_data;
ALTER TABLE pages ADD COLUMN blocknote_data text;
ALTER TABLE pages ADD COLUMN quill_data text;

ALTER TABLE workspaces RENAME COLUMN data TO novel_data;
ALTER TABLE workspaces ADD COLUMN blocknote_data text;
ALTER TABLE workspaces ADD COLUMN quill_data text;