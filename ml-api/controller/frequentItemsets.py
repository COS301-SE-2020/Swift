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
    cursor.execute("SELECT customerorder.orderid, customerid,  menuitemid, quantity FROM itemordered" +
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
    import pandas as pd
    from mlxtend.frequent_patterns import apriori
    from mlxtend.frequent_patterns import association_rules
    from mlxtend.preprocessing import TransactionEncoder

    #read and filter the data
    orders_df =  pd.DataFrame.from_records(retrieveOrderData())
    orders_df.columns = ['orderId','customerId', 'menuItemId', 'quantity']
    orders_df = orders_df.dropna()

    #convert to a basket of orderId (row) x menuItemId (col) (which items are present in which orders)
    orderBasket = (orders_df.groupby(['orderId', 'menuItemId'])['quantity']
            .sum().unstack().reset_index().fillna(0)
            .set_index('orderId'))
    
    #convert all values >=1 to 1 and all <=0 to 0
    def encodeData(x):
        if x <= 0:
            return 0
        if x >= 1:
            return 1
    basket_sets = orderBasket.applymap(encodeData)
    
    #apply mlxtend apriori to the basket, items need to occur together in an order 
    #for at least 1.5% of all orders in database
    frequent_itemsets = apriori(basket_sets, min_support=0.015, use_colnames=True, low_memory=True)
    frequent_itemsets.sort_values('support', ascending=False)

    associationRules = association_rules(frequent_itemsets, metric="lift", min_threshold=0)

    #sort association by lift then confidence, return top 20
    associationRules = (associationRules.sort_values(['lift', 'confidence'], ascending=False))[0:20]

    #group all of the top associated items
    groupedItems = []

    for indx in associationRules.index: 
        group = []
        for antecedent in associationRules["antecedents"][indx]:
            group.append(antecedent)
            
        for consequent in associationRules["consequents"][indx]:
            group.append(consequent)

        groupedItems.append(group)
    
    return groupedItems