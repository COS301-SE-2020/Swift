# promoSuggest Module - suggest promotions to the Restaurant Management by clustering together frequently bought items
import controller.frequentItemsets as fi
from flask import jsonify

def getPopularItemsets(restaurantId):
    return jsonify(fi.Apriori(restaurantId))