# menuSuggest Module - suggest menu items according to a user's preferred meal items and order history
import controller.ratingEstimator as re
import controller.trendingItems as ti

def suggestFromRatings(customerId):
    return { 'menuItemIds' : re.filterRatingData(customerId) } 

def suggestFromTrending():
    return ti.findTrending()