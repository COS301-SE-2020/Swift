# visualizeData Module - uses Matplotlib to show the data mined with the various ML algorithms

import io
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import controller.ratingEstimator as re
import base64


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
        'Collaborative Filtering (Ratings Estimation) \n', fontsize=16)
    return fig


def collaborativeFiltering(customerId):
    figurePNG = io.BytesIO()
    create_ratings_figure(customerId).savefig(figurePNG,  format='png', bbox_inches="tight")
    figureHash = base64.b64encode(figurePNG.getvalue()).decode('utf-8')
    return '<img align="center" src="data:image/png;base64,%s">' % figureHash

