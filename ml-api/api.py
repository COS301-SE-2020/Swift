from flask import Flask, request, abort, jsonify, make_response
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
import urllib.request
import os
import json
import controller.estimatedPrepTime as ept
import controller.promoSuggest as ps
import controller.menuSuggest as ms
import controller.ratingEstimator as re
import controller.visualizeData as vd
import controller.dashboard as dashboard


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
api = Api(app)

APP_API_ENDPOINT = "https://api.swiftapp.ml/"

#responses
def badRequest():
    abort(make_response(jsonify(reason="Bad Request", status=400), 400))

def notFound(message):
    abort(make_response(jsonify(reason=message, status=404), 404))

def notAuthorized():
    abort(make_response(jsonify(reason="Not authorized", status=401), 401))

#authorization
def checkAuth(token):
    body = {'requestType': 'checkUAToken', 'token': token}  

    req = urllib.request.Request(APP_API_ENDPOINT)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsondata = json.dumps(body)
    jsondataasbytes = jsondata.encode('utf-8') 
    req.add_header('Content-Length', len(jsondataasbytes))
    return urllib.request.urlopen(req, jsondataasbytes)

@app.route('/', methods=["POST", "GET"])
@cross_origin()
def api():
    if(request.method == "GET"):
        return {'whoami': 'Swift AI'}
    elif (request.method == "POST"):
        #check request format
        if not request.json or not 'requestType' in request.json or not 'token' in request.json:
            badRequest()

        if(not(json.loads(checkAuth(request.json["token"]).read().decode('utf-8'))["tokenValid"])):
            notAuthorized()

        customerId = json.loads(checkAuth(request.json["token"]).read().decode('utf-8'))["userId"]

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
            return ms.suggestFromRatings(customerId)
        if(request.json["requestType"] == "clearRatingsCache"):
            return re.clearRatingsCache()
        
        #dashboard stats below (requires restaurantId)
        if(not 'restaurantId' in request.json):
            badRequest()
        if(request.json["requestType"] == "dashboardActiveOrderCount"):
            return dashboard.countersActiveOrderCount(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardOrderHistory"):
            return dashboard.countersOrderHistory(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardActiveCustomerCount"):
            return dashboard.countersActiveCustomerCount(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardActiveCustomerHistory"):
            return dashboard.countersActiveCustomerHistory(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardAvailableTables"):
            return dashboard.countersAvailableTables(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardTableOccupancyHistory"):
            return dashboard.countersTableOccupancyHistory(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardActiveWaiters"):
            return dashboard.countersActiveWaiters(request.json["restaurantId"])
        if(request.json["requestType"] == "dashboardTopMenuItems"):
            if(not 'startPeriod' in request.json or not 'endPeriod in request.json'):
                badRequest()
            else:
                return dashboard.topMenuItems(request.json["restaurantId"], request.json["startPeriod"], request.json["endPeriod"])
        if(request.json["requestType"] == "dashboardTopMenus"):
            if(not 'startPeriod' in request.json):
                badRequest()
            else:
                return dashboard.topMenus(request.json["restaurantId"], request.json["startPeriod"])            
            
        badRequest()



@app.route('/visualize', methods=["GET"])
@cross_origin()
def viz():
    if(request.args.get('customerId')):
        return vd.collaborativeFiltering(request.args.get('customerId'))
    elif(request.args.get('restaurantId')):
        return vd.Apriori(request.args.get('restaurantId'))
    else:
        return badRequest()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=os.getenv('PORT', 8080), debug=True)
