from flask import Flask, request, abort, jsonify, make_response
from flask_restful import Resource, Api
import controller.estimatedPrepTime as ept
import controller.promoSuggest as ps
import controller.menuSuggest as ms
import controller.ratingEstimator as re
import controller.visualizeData as vd

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
            if(not 'customerId' in request.json):
                badRequest()
            else:
                return ms.suggest(request.json["customerId"])
        if(request.json["requestType"] == "clearRatingsCache"):
            return re.clearRatingsCache()
        badRequest()

@app.route('/visualize', methods=["GET"])
def viz():
    customerId = request.args.get('customerId')
    if not customerId:
        return badRequest()
    else:
        return vd.collaborativeFiltering(customerId)

if __name__ == '__main__':
    app.run(debug=True)
