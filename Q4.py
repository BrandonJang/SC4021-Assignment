import pandas as pd
import numpy as np
import time
from sklearn.metrics import cohen_kappa_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression

# ==========================================
# 1. MOCK DATA CREATION
# ==========================================
# Mocking a small subset of the 1000 manually labeled records
# Subj: 0 = Neutral, 1 = Opinionated
# Pol: 0 = Negative, 1 = Positive, -1 = N/A (for neutral text)

eval_data = pd.DataFrame({
    'text': [
        "The battery life on this phone is amazing!", 
        "The screen is 6.1 inches.", 
        "I absolutely hate the new UI update.", 
        "It comes with a USB-C cable in the box.", 
        "Best purchase I have made this year.",
        "Terrible customer service, never buying again."
    ],
    # Annotator 1 labels
    'A1_subj': [1, 0, 1, 0, 1, 1],
    'A1_pol':  [1, -1, 0, -1, 1, 0],
    # Annotator 2 labels (Slight disagreement on the last one to show IAA)
    'A2_subj': [1, 0, 1, 0, 1, 1],
    'A2_pol':  [1, -1, 0, -1, 1, 1] 
})

# Mocking the "rest of the data" for the random accuracy / scalability test
rest_of_data = pd.DataFrame({
    'text': [
        "The delivery was late by two days.",
        "The color is exactly as shown in the picture.",
        "Worst experience of my life.",
        "It weighs exactly 200 grams.",
        "I love how fast it boots up!"
    ] * 2000 # Multiplying to create 10,000 rows for a meaningful speed test
})

# ==========================================
# 2. INTER-ANNOTATOR AGREEMENT (IAA)
# ==========================================
print("--- INTER-ANNOTATOR AGREEMENT ---")
kappa_subj = cohen_kappa_score(eval_data['A1_subj'], eval_data['A2_subj'])
kappa_pol = cohen_kappa_score(eval_data['A1_pol'], eval_data['A2_pol'])

print(f"Subjectivity Cohen's Kappa: {kappa_subj:.2f}")
print(f"Polarity Cohen's Kappa: {kappa_pol:.2f}")
print("Note: In our report, aim for > 0.80 agreement.\n")

# Use Annotator 1's labels as the "Ground Truth" for training/evaluating
y_true_subj = eval_data['A1_subj']
y_true_pol = eval_data[eval_data['A1_subj'] == 1]['A1_pol'] # Only opinionated texts get polarity

# ==========================================
# 3. MODEL TRAINING (TEMPLATE ARCHITECTURE)
# ==========================================
# Step A: Subjectivity Classifier
subj_classifier = make_pipeline(TfidfVectorizer(), LogisticRegression())
subj_classifier.fit(eval_data['text'], y_true_subj)

# Step B: Polarity Classifier (Trained only on opinionated data)
opinionated_texts = eval_data[eval_data['A1_subj'] == 1]['text']
pol_classifier = make_pipeline(TfidfVectorizer(), LogisticRegression())
pol_classifier.fit(opinionated_texts, y_true_pol)

# ==========================================
# 4. EVALUATION METRICS (Precision, Recall, F-measure)
# ==========================================
print("--- EVALUATION METRICS (Subjectivity) ---")
subj_preds = subj_classifier.predict(eval_data['text'])
print(classification_report(y_true_subj, subj_preds, target_names=['Neutral', 'Opinionated']))

print("--- EVALUATION METRICS (Polarity) ---")
# Predict polarity using the *actual* opinionated texts from the ground truth,
# rather than what the first model predicted.
actual_opinionated_mask = eval_data['A1_subj'] == 1
actual_opinionated_texts = eval_data['text'][actual_opinionated_mask]

pol_preds = pol_classifier.predict(actual_opinionated_texts)
print(classification_report(y_true_pol, pol_preds, target_names=['Negative', 'Positive']))

# ==========================================
# 5. SCALABILITY & RANDOM ACCURACY TEST
# ==========================================
print("--- SCALABILITY & SPEED TEST ---")
start_time = time.time()

# Run the pipeline on the 10,000 unseen rows
rest_subj_preds = subj_classifier.predict(rest_of_data['text'])
rest_opinionated_texts = rest_of_data['text'][rest_subj_preds == 1]

if len(rest_opinionated_texts) > 0:
    rest_pol_preds = pol_classifier.predict(rest_opinionated_texts)

end_time = time.time()
elapsed_time = end_time - start_time
total_records = len(rest_of_data)
records_per_sec = total_records / elapsed_time

print(f"Processed {total_records} records in {elapsed_time:.4f} seconds.")
print(f"Speed: {records_per_sec:.2f} records/second.")

print("\n--- RANDOM ACCURACY SPOT-CHECK ---")
# Sample 5 random records from the unseen data to manually check
rest_of_data['predicted_subj'] = rest_subj_preds
sample = rest_of_data.sample(3, random_state=42)
for idx, row in sample.iterrows():
    label = "Opinionated" if row['predicted_subj'] == 1 else "Neutral"
    print(f"Text: '{row['text']}' --> Model Predicted: {label}")
