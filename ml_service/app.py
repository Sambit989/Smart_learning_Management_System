from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

app = Flask(__name__)

# --- Mock Data for Cold Start ---
# specific courses
courses_db = [
    {"id": 1, "title": "Intro to Python", "description": "Learn the basics of Python programming, variables, loops, and functions."},
    {"id": 2, "title": "Advanced Python", "description": "Deep dive into decorators, generators, and metaprogramming in Python."},
    {"id": 3, "title": "Data Science with Python", "description": "Data analysis using Pandas, NumPy, and Matplotlib."},
    {"id": 4, "title": "Web Development with Node.js", "description": "Build scalable backend systems using Node.js and Express."},
    {"id": 5, "title": "React for Beginners", "description": "Frontend development with React, hooks, and state management."},
]

# Initialize TF-IDF Vectorizer
vectorizer = TfidfVectorizer(stop_words='english')
course_descriptions = [c['description'] for c in courses_db]
tfidf_matrix = vectorizer.fit_transform(course_descriptions)

# --- Dummy Models for Prediction (Pre-trained logic simulation) ---
# In a real app, load from .pkl files
# model_perf = joblib.load('model_perf.pkl')
# model_drop = joblib.load('model_drop.pkl')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ML Service is running"}), 200

@app.route('/recommend-courses', methods=['POST'])
def recommend_courses():
    data = request.json
    # Expected input: {"completed_course_ids": [1, 3]}
    completed_ids = data.get('completed_course_ids', [])
    
    if not completed_ids:
        # Return popular courses if no history
        return jsonify({"recommendations": courses_db[:3]}), 200

    # specific content-based filtering
    # 1. Get descriptions of completed courses
    completed_indices = [i for i, c in enumerate(courses_db) if c['id'] in completed_ids]
    if not completed_indices:
        return jsonify({"recommendations": courses_db[:3]}), 200

    # 2. Average the vectors of completed courses to get a "user profile"
    user_profile = tfidf_matrix[completed_indices].mean(axis=0)
    
    # 3. Calculate cosine similarity between user profile and all courses
    user_profile_np = np.asarray(user_profile) # Convert sparse matrix to numpy array if needed
    cosine_sim = cosine_similarity(user_profile_np, tfidf_matrix)

    # 4. Get top recommendations (excluding completed ones)
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    recommendations = []
    for i, score in sim_scores:
        course = courses_db[i]
        if course['id'] not in completed_ids:
            recommendations.append(course)
            if len(recommendations) >= 3:
                break
                
    return jsonify({"recommendations": recommendations}), 200

@app.route('/predict-performance', methods=['POST'])
def predict_performance():
    data = request.json
    # Expected: {"quiz_score": 80, "time_spent": 120, "login_freq": 5}
    
    score = data.get('quiz_score', 0)
    time = data.get('time_spent', 0)
    logins = data.get('login_freq', 0)
    
    # Simple Heuristic / Rule-based checks (simulating a model)
    # RFC usually splits on these features
    
    prediction = "Low"
    if score > 80 and time > 100:
        prediction = "High"
    elif score > 50 or (time > 50 and logins > 5):
        prediction = "Medium"
        
    return jsonify({"performance_category": prediction}), 200

@app.route('/predict-dropout', methods=['POST'])
def predict_dropout():
    data = request.json
    # Expected: {"attendance": 0.5, "quiz_score": 40}
    
    attendance = data.get('attendance', 0)
    score = data.get('quiz_score', 0)
    
    # Logistic Regression Simulation
    # P(dropout) = 1 / (1 + e^-(w*x + b))
    # Let's say low attendance and low score increases probability
    
    prob = 0.1 # Base probability
    if attendance < 0.5:
        prob += 0.4
    if score < 50:
        prob += 0.3
        
    prob = min(max(prob, 0), 1) # Clip between 0 and 1
    
    return jsonify({"dropout_probability": round(prob, 2)}), 200

if __name__ == '__main__':
    app.run(port=8000, debug=True)
