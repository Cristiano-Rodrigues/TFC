# Context

## Overview

This project is evolving from a basic Retrieval-Augmented Generation (RAG) MVP into a more robust document ingestion and semantic retrieval platform.

The current architecture already supports:

* Document upload via webhook
* Text extraction
* Text normalization
* Chunking
* Embedding generation with Cohere
* Storage of embeddings in Supabase/pgvector
* Semantic retrieval through vector similarity search
* Response generation using an LLM

The next iteration focuses on robustness, extensibility, metadata enrichment, and multi-format document support.

---

# Current Goals

The platform must evolve to support:

* Multiple document types
* Robust ingestion pipelines
* Metadata extraction and enrichment
* Duplicate detection
* Empty document validation
* Storage of original documents
* Better separation between document storage and vector storage
* More maintainable workflows

---

# Architectural Direction

The system should be organized into distinct responsibilities:

```text
UPLOAD / SOURCE
    ↓
Document Registry
    ↓
Type Detection
    ↓
Text Extraction
    ↓
Validation
    ↓
Deduplication
    ↓
Metadata Extraction / Generation
    ↓
Chunking + Embeddings
    ↓
Vector Storage
```

The architecture should progressively move away from a "single workflow does everything" model.

---

# Core Concepts

## Documents

Documents are the primary entities in the system.

A document:

* Represents an uploaded or imported source
* Stores metadata
* Stores extracted and normalized text
* Owns multiple chunks
* Tracks ingestion state

Suggested fields:

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),

  source_type text,
  original_name text,
  mime_type text,

  checksum text unique,

  raw_text text,
  normalized_text text,

  author text,
  created_at_source timestamptz,
  detected_language text,

  generated_summary text,
  generated_subject text,
  generated_keywords text[],

  status text default 'pending',

  file_size bigint,

  inserted_at timestamptz default now()
);
```

---

## Chunks

Chunks are secondary entities linked to documents.

A document may contain many chunks.

Suggested structure:

```sql
create table chunks (
  id uuid primary key default gen_random_uuid(),

  document_id uuid references documents(id),

  chunk_index integer,
  content text,

  embedding vector(1024)
);
```

---

# Supported Sources

## Text-Based Files

Examples:

* TXT
* MD
* DOCX
* JSON
* CSV

Pipeline:

```text
file
  ↓
extract text
  ↓
normalize text
```

---

## PDFs

The system must support both:

* Textual PDFs
* Scanned PDFs

Recommended flow:

```text
PDF
 ├─ extract text
 └─ if extraction fails or text is empty:
       OCR
```

OCR may use:

* Tesseract
* PaddleOCR
* Google Vision API
* Azure OCR

---

## Images

Images should pass through OCR.

Pipeline:

```text
image
  ↓
OCR
  ↓
text normalization
```

Useful metadata:

* resolution
* image format
* EXIF data (if available)

---

## Emails

Emails should be treated as structured documents.

Relevant fields:

* sender
* recipients
* subject
* body
* sent_date
* attachments

Attachments may recursively enter the ingestion pipeline.

Possible integrations:

* IMAP
* Gmail API
* Outlook API

---

# Validation

## Empty Document Detection

The system must reject invalid or empty documents before embedding generation.

Examples:

* Empty text
* OCR failure
* Whitespace-only content
* Extremely short content

Example validation:

```js
if (!text || text.trim().length < 30)
```

Suggested status:

```text
EMPTY_DOCUMENT
```

---

## Duplicate Detection

Duplicate detection should happen before chunk generation.

Recommended strategy:

1. Normalize text
2. Generate checksum/hash
3. Verify if checksum already exists

Recommended algorithm:

* SHA256

Normalization should include:

* Lowercasing
* Unicode normalization
* Whitespace cleanup

Suggested flow:

```text
normalize text
    ↓
hash
    ↓
check existing checksum
```

Possible outcomes:

* Ignore duplicate
* Create new version
* Link duplicate references

---

# Metadata Extraction

The system should support two categories of metadata.

## Explicit Metadata

Extracted directly from the source.

Examples:

* File type
* File size
* PDF author
* Creation date
* Email sender
* MIME type

---

## Generated Metadata

Generated using LLMs.

Examples:

* Summary
* Subject
* Keywords
* Category
* Language

Suggested enrichment flow:

```text
normalized_text
    ↓
LLM enrichment
```

Example response structure:

```json
{
  "summary": "...",
  "subject": "...",
  "keywords": ["..."],
  "category": "...",
  "language": "pt"
}
```

---

# Storage Strategy

The architecture should separate:

1. Binary storage
2. Relational metadata storage
3. Vector storage

Suggested technologies:

* Supabase Storage → original files
* PostgreSQL → metadata and relational data
* pgvector → embeddings

---

# Workflow Evolution

The current workflows are MVP-oriented.

Future improvements should focus on:

* Better modularity
* Retry mechanisms
* Error handling
* Status tracking
* Observability
* Easier debugging

Suggested statuses:

```text
uploaded
extracting
normalizing
enriching
embedding
completed
failed
duplicate
empty
```

---

# Retrieval Improvements (Future)

The current retrieval pipeline is semantic-only.

Future improvements may include:

* Hybrid search

  * semantic + keyword
* Reranking
* Multi-query retrieval
* Query expansion
* Metadata-aware filtering

These improvements are not yet priorities during the current MVP-hardening phase.

---

# Immediate Priorities

The next implementation priorities are:

1. Create a proper `documents` table
2. Store original uploaded files
3. Implement checksum-based deduplication
4. Extract and generate metadata
5. Add multi-format ingestion support
6. Improve workflow robustness and observability

---

# Long-Term Direction

The long-term goal is to evolve the platform into a flexible AI-powered document understanding system capable of:

* Semantic search
* Intelligent document ingestion
* Automated document classification
* Metadata enrichment
* Cross-document retrieval
* Enterprise-style document workflows
* Multi-source knowledge integration
