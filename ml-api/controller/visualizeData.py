# visualizeData Module - uses Matplotlib to show the data mined with the various ML algorithms

import io
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import matplotlib
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
import numpy as np
import controller.ratingEstimator as re
import controller.frequentItemsets as fi
import base64

matplotlib.use('Agg')

def create_ratings_figure(customerId):
    fig = Figure()
    ax = fig.add_subplot(1, 1, 1)
    figureData = re.filterRatingData(int(customerId), True)
    rc = ax.scatter(figureData[0]['weightedRecommendationScore'], figureData[0]['sum_similarityIndex'], alpha=0.2, color='blue', s=figureData[0]['sum_similarityIndex']*100)
    sl = ax.scatter(figureData[1]['weightedRecommendationScore'], figureData[1]['sum_similarityIndex'], color='orange', s=figureData[1]['sum_similarityIndex']*100)
    ax.set_xlabel('Predicted Rating Score')
    ax.set_ylabel('Confidence')
    fig.legend((rc, sl),
               ('Estimated Rating', 'Selected Menu Items'),
               scatterpoints=1,
               loc=(0.3, 0.89),
               ncol=2,
               fontsize=8)
    fig.suptitle(
        'Collaborative Filtering (Ratings Estimation) \n', fontsize=16, y=1.05)
    return fig

def create_apriori_figure():
    import networkx as nx  
    associationGraph = nx.DiGraph()

    fig = plt.figure()

    rules = fi.Apriori(True);

    #TODO: select max between 10 and len(rules)
    rules_to_show = 7
   
    color_map=[]
    N = 50
    colors = np.random.rand(N)    
    #accomodate 11 rules
    ruleLables=['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11']  
   
    for i in range (rules_to_show):      
        associationGraph.add_nodes_from(["R"+str(i)])
        for a in rules.iloc[i]['antecedents']:   
            associationGraph.add_nodes_from([a])
            associationGraph.add_edge(a, "R"+str(i), color=colors[i] ,  weight=rules.iloc[i]['lift'])
        for c in rules.iloc[i]['consequents']:
                associationGraph.add_nodes_from([c])
                associationGraph.add_edge("R"+str(i), c, color=colors[i],  weight=rules.iloc[i]['lift'])
 
    for node in associationGraph:
       found_a_string = False
       for item in ruleLables: 
           if node==item:
                found_a_string = True
       if found_a_string:
            color_map.append('yellow')
       else:
            color_map.append('green')       
 
    edges = associationGraph.edges()
    colors = [associationGraph[u][v]['color'] for u,v in edges]
    #TODO: scale lift (weight) value to a regionable margin
    weights = [associationGraph[u][v]['weight']/8 for u,v in edges]

    pos = nx.spring_layout(associationGraph, k=16, scale=1)
    nx.draw(associationGraph, pos, node_color = color_map, alpha=0.7,edge_color=colors, width=weights, font_size=16, with_labels=False)            

    for p in pos:  # raise text positions
           pos[p][1] += 0.12
    nx.draw_networkx_labels(associationGraph, pos)
    fig.suptitle(
        'Apriori Algorithm (Frequent Item Sets) \n', fontsize=16, y=1.05)
    fig.subplots_adjust(top=2.80)
    return fig


def Apriori():
    figurePNG = io.BytesIO()
    create_apriori_figure().savefig(figurePNG,  format='png', bbox_inches="tight")
    figureHash = base64.b64encode(figurePNG.getvalue()).decode('utf-8')
    return '<img align="center" src="data:image/png;base64,%s">' % figureHash


def collaborativeFiltering(customerId):
    figurePNG = io.BytesIO()
    create_ratings_figure(customerId).savefig(figurePNG,  format='png', bbox_inches="tight")
    figureHash = base64.b64encode(figurePNG.getvalue()).decode('utf-8')
    return '<img align="center" src="data:image/png;base64,%s">' % figureHash

