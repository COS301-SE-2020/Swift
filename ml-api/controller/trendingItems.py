# trendingItems Module - uses the frequency of recent menuItem orders to recommend ternding products
import sys
import json
sys.path.append('..') #import from parent directory
from functools import lru_cache
import db

@lru_cache(maxsize=100)
def retrieveOrderData():
    connection = db.connect()
    cursor = connection.cursor()
    cursor.execute("SELECT menuitemid, -(CURRENT_DATE - orderdatetime::date) ""age"", count(menuitemid) FROM itemordered" +
                   " INNER JOIN customerorder" +
                   " ON customerorder.orderid = itemordered.orderid" +
                   " WHERE orderdatetime >= (now() - INTERVAL '40 DAYS')" +
                   " AND orderdatetime < CURRENT_DATE" +
                   " GROUP BY 1, 2;")
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return records

#cache record data on Server start
retrieveOrderData()

def findTrending():
    return retrieveOrderData()