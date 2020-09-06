# menuSuggest Module - suggest menu items according to a user's preferred meal items and order history
import controller.ratingEstimator as re
from flask import jsonify

def suggest():
    re.filterRatingData()
    return jsonify(re.retrieveRatingData())