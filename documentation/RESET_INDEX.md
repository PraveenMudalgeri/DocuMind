# How to Reset the FAISS Index

If you're seeing "Invalid index" warnings, your FAISS vector index has become corrupted and needs to be reset.

## Quick Reset (Recommended)

Run this command from the project root:

```bash
# Stop the backend server first (Ctrl+C)

# Remove the corrupted index files
rm -rf data/faiss_index.bin data/metadata_store.json data/parent_chunks.json

# Restart the backend
./run_app.sh
```

## What This Does

1. **Removes corrupted files**: Deletes the FAISS index and metadata
2. **Fresh start**: System will create clean, empty index on restart
3. **Re-upload needed**: You'll need to re-upload and re-index your documents

## Re-Indexing Your Documents

After reset:

1. Start backend: `./run_app.sh`
2. Start frontend: `cd frontend && npm run dev`
3. Log in to the application
4. Go to **Documents** page
5. Upload your documents again (they will be automatically indexed)

## Why This Happens

The index corruption occurs when:
- The FAISS index has more vectors than the metadata mapping
- The system was interrupted during document indexing
- Files were manually edited in the `data/` directory

## Prevention

- Always stop the backend cleanly (Ctrl+C, wait for shutdown)
- Don't manually edit files in the `data/` directory
- Let uploads complete fully before stopping the server

## Alternative: Clean Install

If you want a completely fresh start:

```bash
# Backup any important documents first!

# Remove all data
rm -rf data/

# Remove uploaded files
rm -rf data/uploads/

# Restart backend
./run_app.sh
```

This gives you a completely clean slate.
