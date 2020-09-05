# ratingEstimator Module - uses collaborative filtering to estimate a user's rating on a menu item
import sys
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