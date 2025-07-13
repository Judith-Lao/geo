from flask import Flask
from sentence_transformers import SentenceTransformer
import chromadb
from dotenv import load_dotenv
import os
from flask import request, jsonify

load_dotenv()

app = Flask(__name__)

client = chromadb.CloudClient(
  api_key=os.getenv("CHROMA_API_KEY"),
  tenant=os.getenv("CHROMA_TENANT_ID"),
  database=os.getenv("CHROMA_DB")
)

@app.route('/search_ICP', methods=['POST'])
def search_ICP():
    """
    Search for the most similar personas to the given content
    
    Args:
        content (str): The content to search for
    
    Returns:
        list: List of formatted results sorted by distance (highest to lowest)
    """
    try:
        content = request.json.get('content')
        if not content:
            return jsonify({"error": "Content is required"}), 400

        model = SentenceTransformer('all-mpnet-base-v2') # understands professional, lifestyle, and demographic concepts
        collection = client.get_collection(name="personas_v2")
        print(collection)
        
        results = collection.query(
            query_embeddings=model.encode([content]),
            n_results=5,
            include=["metadatas", "documents", "distances"]
        )
        print("results", results)
        formatted_results = format_search_results(results)
        return jsonify(formatted_results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


def format_search_results(results):
    """
    Format ChromaDB search results into a more readable format
    
    Args:
        results (dict): ChromaDB search results containing documents, metadatas, and distances
        
    Returns:
        list: List of formatted results sorted by distance (highest to lowest)
    """
    formatted_results = []
    
    # Get the first (and only) list of results from each category
    documents = results['documents'][0]
    metadatas = results['metadatas'][0]
    distances = results['distances'][0]
    
    # Combine the results
    for doc, meta, dist in zip(documents, metadatas, distances):
        formatted_results.append({
            'document': doc,
            'metadata': meta,
            'distance': dist
        })
    
    # Sort by distance (highest to lowest)
    formatted_results.sort(key=lambda x: x['distance'], reverse=True)
    
    return formatted_results
