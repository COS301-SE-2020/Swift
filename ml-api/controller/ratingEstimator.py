# ratingEstimator Module - uses collaborative filtering to estimate a user's rating on a menu item
import sys
import json
sys.path.append('..') #import from parent directory

import db

def retrieveRatingData():
    connection = db.connect()
    cursor = connection.cursor()

    cursor.execute("SELECT customerid, review.menuitemid, ratingscore FROM review" +
                    " INNER JOIN customerorder" +
                    " ON review.orderid = customerorder.orderid;")
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return records

def filterRatingData():
    import pandas as pd
    from math import sqrt
    import numpy as np
    import matplotlib.pyplot as plt

    #read and filter the data
    ratings_df = pd.DataFrame.from_records(retrieveRatingData())
    ratings_df.columns = ['customerId', 'menuItemId', 'ratingScore']
    ratings_df = ratings_df.dropna()
    ratings_df['menuItemId'] = ratings_df['menuItemId'].astype(int)

    #Groupby creates several sub dataframes where they all have the same value in the column specified as the parameter
    ratingsGrouped = ratings_df.groupby('customerId')
    #Sorting it so users with menuItems most in common with the input will have priority
    ratingsGrouped = sorted(ratingsGrouped, key=lambda x: len(x[1]), reverse=True)

    print(ratingsGrouped)