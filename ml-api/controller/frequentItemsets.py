# frequentItemsets Module - uses the apriori algorithm to find items that are often purchased together
import sys
import json
sys.path.append('..') #import from parent directory
from functools import lru_cache
import db

@lru_cache(maxsize=100)
def retrieveOrderData():
    connection = db.connect()
    cursor = connection.cursor()
    cursor.execute("SELECT customerid,  menuitemid, quantity FROM itemordered" +
                    " INNER JOIN customerorder" +
                    " ON customerorder.orderid = itemordered.orderid;")
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return records

#cache record data on Server start
retrieveOrderData()

#clear and reload RatingsCache each time a new rating is added
def clearOrdersCache():
    retrieveOrderData.cache_clear()
    retrieveOrderData() #slow to execute
    return {'message': 'Cache Cleared'}

def Apriori(viz = False):
    return retrieveOrderData()