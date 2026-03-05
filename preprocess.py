import pandas as pd 

def load_and_clean_data(path):
    df = pd.read_csv(path)

    # remove empty comments
    df = df.dropna(subset=["comment"])

    # remove duplicates
    df = df.drop_duplicates(subset=["comment"])

    # lowercase text
    df["comment"] = df["comment"].str.lower()

    return df