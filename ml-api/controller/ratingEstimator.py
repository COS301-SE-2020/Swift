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

    #Simulate sample new input (user that added a new rating)
    newUserRating = ratings_df.loc[ratings_df['customerId'] == 137]
    ratings_df = ratings_df.loc[ratings_df['customerId'] != 137]

    #Filtering out users that have rated the same menu items
    ratingsSubset = ratings_df[ratings_df['menuItemId'].isin(newUserRating['menuItemId'].tolist())]

    #Groupby creates several sub dataframes where they all have the same value in the column specified as the parameter
    ratingsGrouped = ratings_df.groupby('customerId')
    #Sorting it so users with menuItems most in common with the input will have priority
    ratingsGrouped = sorted(ratingsGrouped, key=lambda x: len(x[1]), reverse=True)

    #need to impose some sort of limit as to how many profiles we are taking into account
    ratingsSubsetGroup = ratingsGrouped[0:1000]

    #use pearson correlation calculation to find users with the most similar rating tendencies
    pearsonCorrelation = {}
    for name, group in ratingsSubsetGroup:
        group = group.sort_values(by='menuItemId')
        newUserRating = newUserRating.sort_values(by='menuItemId')
        nRatings = len(group)
        temp_df = newUserRating[newUserRating['menuItemId'].isin(group['menuItemId'].tolist())]
        tempRatingList = temp_df['ratingScore'].tolist()
        tempGroupList = group['ratingScore'].tolist()
        #calculate pearson correclation coefficient
        Sxx = sum([i**2 for i in tempRatingList]) - pow(sum(tempRatingList),2)/float(nRatings)
        Syy = sum([i**2 for i in tempGroupList]) - pow(sum(tempGroupList),2)/float(nRatings)
        Sxy = sum( i*j for i, j in zip(tempRatingList, tempGroupList)) - sum(tempRatingList)*sum(tempGroupList)/float(nRatings)
        if Sxx != 0 and Syy != 0:
            pearsonCorrelation[name] = Sxy/sqrt(Sxx*Syy)
        else:
            pearsonCorrelation[name] = 0

    #convert pearson calculation to dataframe
    pearsonDF = pd.DataFrame.from_dict(pearsonCorrelation, orient='index')
    pearsonDF.columns = ['similarityIndex']
    pearsonDF['userId'] = pearsonDF.index
    pearsonDF.index = range(len(pearsonDF))
    #sort dataframe according to simalarity
    pearsonDF = pearsonDF.sort_values(by=['similarityIndex'], ascending=False)
    print(pearsonDF.head())