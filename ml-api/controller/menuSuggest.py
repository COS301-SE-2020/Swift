# menuSuggest Module - suggest menu items according to a user's preferred meal items and order history
import controller.ratingEstimator as re

def suggestFromRatings(customerId):
    return { 'menuItemIds' : re.filterRatingData(customerId) } 

