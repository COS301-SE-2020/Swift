from flask import Flask, request, abort, jsonify, make_response
from flask_restful import Resource, Api
import controller.estimatedPrepTime as ept
import controller.promoSuggest as ps
import controller.menuSuggest as ms
import controller.ratingEstimator as re

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
            return ps.suggest()
        if(request.json["requestType"] == "menuSuggest"):
            return ms.suggest()
        if(request.json["requestType"] == "clearRatingsCache"):
            return re.clearRatingsCache()
        badRequest()

if __name__ == '__main__':
    app.run(debug=True)

