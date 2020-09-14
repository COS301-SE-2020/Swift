from flask import Flask, request, abort, jsonify, make_response
from flask_restful import Resource, Api
import controller.estimatedPrepTime as ept
import controller.promoSuggest as ps
import controller.menuSuggest as ms
import controller.ratingEstimator as re
import controller.visualizeData as vd
import os

app = Flask(__name__)
api = Api(app)


def badRequest():
    abort(make_response(jsonify(reason="Bad Request", status=400), 400))

@app.route('/', methods=["POST", "GET"])
def api():
    if(request.method == "GET"):
        return {'whoami': 'Swift AI'}
    elif (request.method == "POST"):
        #check request format
        if not request.json or not 'requestType' in request.json:
            badRequest()
        if(request.json["requestType"] == "estimatedPrepTime"):
            return ept.updatePrepTime()
        if(request.json["requestType"] == "promoSuggest"):
            if(not 'restaurantId' in request.json):
                badRequest()
            else:
                return ps.getPopularItemsets(request.json["restaurantId"])
        if(request.json["requestType"] == "getTrending"):
            return jsonify(ms.suggestFromTrending())
        if(request.json["requestType"] == "suggestFromRatings"):
            if(not 'customerId' in request.json):
                badRequest()
            else:
                return ms.suggestFromRatings(request.json["customerId"])
        if(request.json["requestType"] == "clearRatingsCache"):
            return re.clearRatingsCache()
        badRequest()



@app.route('/visualize', methods=["GET"])
def viz():
    if(request.args.get('customerId')):
        return vd.collaborativeFiltering(request.args.get('customerId'))
    elif(request.args.get('restaurantId')):
        return vd.Apriori(request.args.get('restaurantId'))
    else:
        return badRequest()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=os.getenv('PORT', 8080), debug=True)
