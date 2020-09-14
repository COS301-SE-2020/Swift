# promoSuggest Module - suggest promotions to the Restaurant Management by clustering together frequently bought items
import controller.frequentItemsets as fi

def getPopularItemsets(restaurantId):
    return fi.Apriori(restaurantId)