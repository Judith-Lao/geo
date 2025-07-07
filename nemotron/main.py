from datasets import load_dataset
from sentence_transformers import SentenceTransformer
import chromadb
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = chromadb.CloudClient(
  api_key=os.getenv("CHROMA_API_KEY"),
  tenant='728acd1a-999a-43cb-9a69-9b81215b64bd',
  database='nemotron'
)


def main():
    print("Hello from nemotron!")

    # Initialize model and ChromaDB
    model = SentenceTransformer('all-mpnet-base-v2') # understands professional, lifestyle, and demographic concepts
    collection = client.get_or_create_collection(name="personas_v2")

    # Load dataset
    dataset = load_dataset("nvidia/Nemotron-Personas")

    # Process each person and their different personas
    personas = []
    metadatas = []
    ids = []

    persona_types = ['persona', 'professional_persona', 'sports_persona', 'arts_persona', 'travel_persona', 'culinary_persona']

    for i, item in enumerate(dataset['train']):
        # Clean the background fields
        occupation = item['occupation'].replace('_', ' ')
        education = item['education_level'].replace('_', ' ')
        marital_status = item['marital_status'].replace('_', ' ')
        bachelors_field = item['bachelors_field'].replace('_', ' ') if item['bachelors_field'] else 'No higher education'
        # Create separate embeddings for each persona type
        for persona_type in persona_types:
            if item[persona_type] is None:
                continue
            if persona_type == 'professional_persona':
                persona_text = f"""
                    Professional Role: {item['professional_persona']}
                    Occupation: {occupation}
                    Key Skills: {item['skills_and_expertise']}
                    Career Focus: {item['career_goals_and_ambitions']}
                    Education: {education}
                    Marital Status: {marital_status}
                    Bachelors Field: {bachelors_field} 
                    Demographics: {item['age']} year old {item['sex']} in {item['city']}, {item['state']}
                    """
                personas.append(persona_text)
            elif persona_type != 'professional_persona':
                persona_text = f"""
                    Lifestyle: {item[persona_type]}
                    Interests: {item['hobbies_and_interests']}
                    Life Stage: {item['age']} year old {marital_status} {item['sex']}
                    Location: {item['city']}, {item['state']}
                    Background: {education} education, {occupation}
                    """.strip()
                personas.append(persona_text)

            metadatas.append({
                'persona_type': persona_type,
                'person_uuid': item['uuid'],
                'age': item['age'],
                'sex': item['sex'],
                'city': item['city'],
                'state': item['state'],
                'zipcode': item['zipcode'],
                'education_level': education,
                'occupation': occupation,
                'marital_status': marital_status,
                'bachelors_field': bachelors_field,
            })
            ids.append(f"{item['uuid']}_{persona_type}")

    # Add to ChromaDB
    batch_size = 300
    for i in range(0, len(personas), batch_size):
        batch_personas = personas[i:i+batch_size]
        batch_metadatas = metadatas[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        print(f"Processing batch {i//batch_size+1}/{len(personas)//batch_size}", batch_metadatas)
        embeddings = model.encode(batch_personas).tolist()
        
        collection.add(
            embeddings=embeddings,
            documents=batch_personas,
            metadatas=batch_metadatas,
            ids=batch_ids
        )

    print(f"Added {len(personas)} persona entries to ChromaDB")

    # Enhanced search function that shows related personas
    # Unused function - kept for reference
    def _unused_find_similar_personas_with_relationships(query, persona_type_filter=None, n_results=5):
        # Build where clause for filtering
        where_clause = {}
        if persona_type_filter:
            where_clause = {"persona_type": persona_type_filter}
        
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_clause if where_clause else None
        )
        
        print(f"\nTop {n_results} similar personas for: '{query}'")
        if persona_type_filter:
            print(f"Filtered by: {persona_type_filter}")
        print("=" * 80)
        
        for i, (persona, metadata, distance) in enumerate(zip(
            results['documents'][0], 
            results['metadatas'][0], 
            results['distances'][0]
        )):
            print(f"\n{i+1}. MATCHED PERSONA [{metadata['persona_type']}]:")
            print(f"   {persona}")
            print(f"   Similarity: {1-distance:.3f}")
            print(f"   Person: {metadata['age']}yr old {metadata['sex']} from {metadata['city']}, {metadata['state']}")
            
            # Show ALL related personas for this person
            print(f"\n   OTHER PERSONAS for this same person:")
            all_personas = metadata['all_personas']
            for ptype, ptext in all_personas.items():
                if ptype != metadata['persona_type']:  # Don't repeat the matched one
                    print(f"     [{ptype}]: {ptext}")
            
            print(f"\n   Skills: {metadata['skills']}")
            print(f"   Hobbies: {metadata['hobbies']}")
            print("-" * 80)
        
        return results

    # Function to get ALL personas for a specific person
    # Unused function - kept for reference
    def _unused_get_all_personas_for_person(person_uuid):
        results = collection.query(
            query_texts=[""],  # Empty query
            n_results=10,
            where={"person_uuid": person_uuid}
        )
        
        if results['documents']:
            metadata = results['metadatas'][0][0]  # Get first result's metadata
            print(f"\nALL PERSONAS for person {person_uuid}:")
            print(f"Demographics: {metadata['age']}yr old {metadata['sex']} from {metadata['city']}, {metadata['state']}")
            print("-" * 60)
            
            all_personas = metadata['all_personas']
            for ptype, ptext in all_personas.items():
                print(f"[{ptype}]: {ptext}\n")
        
        return results

    # Example searches
    # print("=== SEARCHING FOR COMMUNITY LEADERS ===")
    # find_similar_personas_with_relationships("community leader and organizer")

    # print("\n=== SEARCHING FOR GOLF ENTHUSIASTS ===")
    # find_similar_personas_with_relationships("golf enthusiast", persona_type_filter="sports_persona")

    # print("\n=== SEARCHING FOR HISTORY LOVERS ===")
    # find_similar_personas_with_relationships("history lover")

    # Get all personas for a specific person
    # get_all_personas_for_person('df6b2b96-a938-48b0-83d8-75bfed059a3d')

if __name__ == "__main__":
    main()
