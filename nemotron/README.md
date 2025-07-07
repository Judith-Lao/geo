# HuggingFace Dataset to ChromaDB Vector Import

Quick guide to import HuggingFace datasets into ChromaDB for semantic search.

## Setup

```bash
uv add datasets sentence-transformers chromadb "huggingface-hub[cli]"
```

```env
CHROMA_API_KEY=your_api_key_here
```

```bash
huggingface-cli login
```

## Core Implementation

```python

# Initialize ChromaDB
client = chromadb.CloudClient(
    api_key=os.getenv("CHROMA_API_KEY"),
    tenant='your-tenant-id',
    database='your-database'
)

# Initialize embedding model
model = SentenceTransformer('all-mpnet-base-v2') # general purpose sentence transformer that understands professional, lifestyle, and demographic concepts into vectors

# Initialize ChromaDB collection
collection = client.get_or_create_collection(name="your_collection")

# Load dataset
dataset = load_dataset("nvidia/Nemotron-Personas")

# Process each person and their different personas into a personas document
personas = []
metadatas = []
ids = []

persona_types = ['persona', 'professional_persona', 'sports_persona', 
                'arts_persona', 'travel_persona', 'culinary_persona']

for i, item in enumerate(dataset['train']):

    for persona_type in persona_types:
        if persona_type == 'professional_persona':
            # COMBINED FIELDS APPROACH
            document = f"""
            Professional Role: [insert all the information about the professional persona and related fields]
            Occupation:     
            Key Skills:     
            Career Focus:   
            Education:      
            Demographics
            """
        else:
            # COMBINED FIELDS APPROACH
            document = f"""
            Lifestyle: [insert all the information about the lifestyle persona and related fields]
            Interests:      
            Life Stage:     
            Location:       
            Background:     
            """
        
        personas.append(document.strip())
        metadatas.append({
            'persona_type': persona_type, # the type of persona
            'person_uuid': item['uuid'], # the uuid of the person
        })
        ids.append(f"{item['uuid']}_{persona_type}")

# Batch insert to ChromaDB
batch_size = 300 # batch size for embedding writes
for i in range(0, len(personas), batch_size):
    batch_personas = personas[i:i+batch_size]
    batch_metadatas = metadatas[i:i+batch_size]
    batch_ids = ids[i:i+batch_size]
    
    embeddings = model.encode(batch_personas).tolist()
    
    # Add to ChromaDB
    collection.add(
        embeddings=embeddings,
        documents=batch_personas,
        metadatas=batch_metadatas,
        ids=batch_ids
    )
```

## Key Design Decisions

### Multi-Persona Approach
- TLDR: Embed ALL the personas for max flexibility so you can use semantic search to find the most relevant ones regardless of persona type (sports persona vs professional persona, both are useful depending on the end user's ICP)
- Creates separate vector entries for each persona type per person
- Rich Context: combines related fields into the document for better embedding quality (professional persona also contains information about age, education, etc.)
- Enables precise semantic matching (e.g., "golf enthusiast" → sports_persona)
- Person Level Queries: preserves relationships through shared `person_uuid` for person level queries, relationships are preserved

### Document Structure
- **Professional personas**: Role, skills, career focus, demographics
- **Lifestyle personas**: Activities, interests, life stage, background
- Structured text format for better embedding quality

### Metadata Strategy
- Demographics for filtering (`age`, `location`, `education`)
- Persona relationships tracked via `person_uuid`
- Clean, frontend-ready field names

## Usage

```python
# Search for similar personas
results = collection.query(
    query_texts=["tech startup founder"],
    n_results=5,
    where={"persona_type": "professional_persona"}
)

# Filter by demographics
results = collection.query(
    query_texts=["outdoor enthusiast"],
    n_results=10,
    where={
        "persona_type": "sports_persona",
        "age": {"$gte": 25, "$lte": 45}
    }
)

# Find personas by traits/skills
find_similar_personas("analytical problem solver")
find_similar_personas("creative and artistic")
find_similar_personas("leadership and management")
find_similar_personas("technical expert")
find_similar_personas("outdoor enthusiast")
find_similar_personas("arts teacher")
find_similar_personas("tech startup founder")

# Find personas good for specific scenarios
find_similar_personas("helping with career advice")
find_similar_personas("explaining complex topics")
find_similar_personas("creative brainstorming")
find_similar_personas("technical troubleshooting")
```

## Adaptation Guide

To adapt for your dataset:

1. **Replace dataset**: Change `"nvidia/Nemotron-Personas"` to your dataset
2. **Update personas types**: Define your data's core document format
3. **Modify document formatting**: Adjust text structure for your fields
4. **Update metadata**: Include relevant fields for your use case
5. **Adjust batch_size**: Based on testing, your data size, and memory constraints

## Requirements

- ChromaDB Cloud account (or local instance)
- ~2GB RAM for embedding generation
- uv run main.py

## Alternatives

### Dataset Alternatives

- HuggingFace `nvidia/nemotron-personas` for a diverse set of relevant synthetic personas created from US Census data
- HuggingFace `personahub` for 1B+ personas, overkill for this use case, more for academic use

### ChromaDB Alternatives

- **ChromaDB Cloud**
- ChromaDB Local
- Pinecone

### Sentence Transformer Alternatives

Sentence Transformer options
- all-MiniLM-L6-v2 - fast, good for general use
- **all-mpnet-base-v2** - slower but better quality for general use
- OpenAI's text-embedding-ada-002 - via API, very good quality, but expensive

The project currently uses **all-mpnet-base-v2** for its better quality embeddings and ability to understand professional, lifestyle, and demographic concepts (aka understands semantic relationships across domains)