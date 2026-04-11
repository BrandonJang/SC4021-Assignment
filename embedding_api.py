from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

print("Loading embedding model 'all-MiniLM-L6-v2'...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully. Service is ready.")

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
        
    text = data['text']
    # Generate the vector for the user's search query
    vector = model.encode(text).tolist()
    
    return jsonify({'vector': vector})

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(port=5000, debug=False)
