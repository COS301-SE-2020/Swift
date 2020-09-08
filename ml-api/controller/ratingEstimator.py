# ratingEstimator Module - uses collaborative filtering to estimate a user's rating on a menu item
import sys
import json
sys.path.append('..') #import from parent directory
from functools import lru_cache
import db
from multiprocessing import Process

@lru_cache(maxsize=100)
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

#cache record data on Server start
retrieveRatingData()

#clear and reload RatingsCache each time a new rating is added
def clearRatingsCache():
    retrieveRatingData.cache_clear()
    retrieveRatingData() #slow to execute
    return {'message': 'Cache Cleared'}

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
    #change this to the user you want to query for
    newCustomerRating = ratings_df.loc[ratings_df['customerId'] == 137]
    ratings_df = ratings_df.loc[ratings_df['customerId'] != 137]

    #Filtering out users that have rated the same menu items
    ratingsSubset = ratings_df[ratings_df['menuItemId'].isin(newCustomerRating['menuItemId'].tolist())]

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
        newCustomerRating = newCustomerRating.sort_values(by='menuItemId')
        nRatings = len(group)
        temp_df = newCustomerRating[newCustomerRating['menuItemId'].isin(group['menuItemId'].tolist())]
        tempRatingList = temp_df['ratingScore'].tolist()
        tempGroupList = group['ratingScore'].tolist()
        #calculate pearson correclation coefficient
        Sxx = sum([i**2 for i in tempRatingList]) - pow(sum(tempRatingList),2)/float(nRatings)
        Syy = sum([i**2 for i in tempGroupList]) - pow(sum(tempGroupList),2)/float(nRatings)
        Sxy = sum( i*j for i, j in zip(tempRatingList, tempGroupList)) - sum(tempRatingList)*sum(tempGroupList)/float(nRatings)
        if Sxx != 0 and Syy != 0:
            pearsonCorrelation[name] = abs(Sxy/sqrt(Sxx*Syy))
        else:
            pearsonCorrelation[name] = 0

    #convert pearson calculation to dataframe
    pearson_df = pd.DataFrame.from_dict(pearsonCorrelation, orient='index')
    pearson_df.columns = ['similarityIndex']
    pearson_df['customerId'] = pearson_df.index
    pearson_df.index = range(len(pearson_df))
    #sort dataframe according to simalarity
    pearson_df = pearson_df.sort_values(by=['similarityIndex'], ascending=False)

    #select the top 50 matching profiles with similarity > 0
    topUsers = (pearson_df.loc[pearson_df['similarityIndex'] > 0])[0:50]

    #merge menuItemId & ratingScore with pearsonCorrelation
    topCustomersRating = topUsers.merge(ratings_df, left_on='customerId', right_on='customerId', how='inner')

    #Calculate weighted ratings using the similarityIndex
    topCustomersRating['weightedRating'] = topCustomersRating['similarityIndex']*topCustomersRating['ratingScore']

    #Group all ratings by menuItemId and calculate the sum of weightedRatings
    sumTopCustomersRating = topCustomersRating.groupby('menuItemId').sum()[['similarityIndex', 'weightedRating']]
    sumTopCustomersRating.columns = ['sum_similarityIndex','sum_weightedRating']
    print(sumTopCustomersRating)