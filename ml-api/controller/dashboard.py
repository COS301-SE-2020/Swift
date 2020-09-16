# dashboard.py Module - retrieve and transform data for use on the Swift management dashboard
import sys
from flask import jsonify
sys.path.append('..') #import from parent directory
import db

def countersActiveOrderCount(restaurantId):
    connection = db.connect()

    #active order count
    cursor = connection.cursor()
    qry = """SELECT  COUNT(DISTINCT customerorder.orderid) as ActiveOrders
             FROM customerorder
             INNER JOIN itemordered
             ON customerorder.orderid = itemordered.orderid
             INNER JOIN menuitem
             ON menuitem.menuitemid = itemordered.menuitemid
             WHERE menuitem.restaurantid = %s
             AND customerorder.progress < 100;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def countersOrderHistory(restaurantId):
    connection = db.connect()
    #order history count
    cursor = connection.cursor()
    qry = """SELECT date_trunc('hour', customerorder.ordercompletiontime) as OrderTime, COUNT(DISTINCT customerorder.orderid) as OrderCount
            FROM customerorder
            INNER JOIN itemordered
            ON customerorder.orderid = itemordered.orderid
            INNER JOIN menuitem
            ON menuitem.menuitemid = itemordered.menuitemid
            WHERE menuitem.restaurantid = %s
            AND customerorder.ordercompletiontime > NOW() - INTERVAL '7 days'
            GROUP BY 1
            ORDER BY OrderTime DESC;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def countersActiveCustomerCount(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT COUNT(*) from person
            INNER JOIN restauranttable
            ON person.checkedin = restauranttable.qrcode
            WHERE restaurantid = %s;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def countersActiveCustomerHistory(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT date_trunc('hour', datetime) as OrderTime, operation, COUNT(operation) from checkedinhistory
            WHERE restaurantid = %s
            GROUP BY 1,2
            ORDER BY OrderTime DESC;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def countersAvailableTables(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT COUNT(*) AS TotalTables, (SELECT COUNT(DISTINCT tablenumber) as Occupied from restauranttable
            INNER JOIN person
            ON person.checkedin = restauranttable.qrcode
            WHERE restaurantid = %s) from restauranttable
            WHERE restaurantid = %s"""
    cursor.execute(qry, [restaurantId, restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify({"totalTables" : records[0][0], "occupiedTables": records[0][1]})

def countersTableOccupancyHistory(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """select * from tableoccupancyhistory
            WHERE datetime > NOW() - INTERVAL '2 days'
            AND restaurantid = %s
            ORDER BY datetime DESC;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def countersActiveWaiters(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT (SELECT count(*) as employeecount FROM restaurantemployee
            WHERE restaurantId = %s
            AND employeerole = 'Waiter'), COUNT(DISTINCT employeeid) as assignedemployees FROM customerorder
            WHERE employeeid IN (SELECT userid FROM restaurantemployee
            WHERE restaurantId = %s
            AND employeerole = 'Waiter')
            and progress < 100;"""
    cursor.execute(qry, [restaurantId, restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify({"totalWaiters" : records[0][0], "occupiedWaiters": records[0][1]})

def topMenuItems(restaurantId, start, end):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT currentPeriod.menuitemname, currentPeriod.totalpurchased, currentPeriod.ratio,
            previousPeriod.totalpurchased as prevtotalpurchased, previousPeriod.ratio as prevratio FROM topMenuItems(%s,%s,%s) as currentPeriod
            FULL JOIN topMenuItems(%s,%s,%s) as previousPeriod
            ON currentPeriod.menuitemname = previousPeriod.menuitemname
            WHERE not(currentPeriod.menuitemname is NULL)
            ORDER BY currentPeriod.totalpurchased DESC;"""
    cursor.execute(qry, [restaurantId, start, end, restaurantId, (start)*2, start-end])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)
"""
Postgres Function does the heavy lifting:
restaurantID, startDaysAgo, endDaysAgo
SELECT topMenuItems(62,7,0) as currentPeriod, topMenuItems(62,14,7) as previousPeriod;

CREATE OR REPLACE FUNCTION topMenuItems(INTEGER, INTEGER, INTEGER) RETURNS TABLE(menuitemname text, totalpurchased bigint, ratio float) AS
$$
    BEGIN 
        RETURN QUERY
		SELECT menuitem.menuitemname, SUM(quantity) as totalpurchased, (SUM(quantity)::FLOAT/(SELECT SUM(quantity) from itemordered
        INNER JOIN menuitem
        ON menuitem.menuitemid = itemordered.menuitemid
        INNER JOIN customerorder
        ON customerorder.orderid = itemordered.orderid
        WHERE customerorder.orderdatetime > NOW() - ($2::TEXT || ' DAYS')::INTERVAL
		AND NOW() - ($3::TEXT || ' DAYS')::INTERVAL > customerorder.orderdatetime																											   	
		AND restaurantid = $1))
        as ratio from itemordered
        INNER JOIN menuitem
        ON menuitem.menuitemid = itemordered.menuitemid
        INNER JOIN customerorder
        ON customerorder.orderid = itemordered.orderid
        WHERE customerorder.orderdatetime > NOW() - ($2::TEXT || ' DAYS')::INTERVAL
		AND NOW() - ($3::TEXT || ' DAYS')::INTERVAL > customerorder.orderdatetime
		AND restaurantid = $1
        GROUP BY 1
        ORDER BY totalpurchased DESC;
    END
$$ LANGUAGE plpgsql;
"""
def topMenus(restaurantId, start):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT menucategory.categoryname, COUNT(*) FROM itemordered
            INNER JOIN menuitem
            ON itemordered.menuitemid = menuitem.menuitemid
            INNER JOIN menucategory
            ON menuitem.categoryid = menucategory.categoryid
            INNER JOIN customerorder
            ON customerorder.orderid = itemordered.orderid
            WHERE menucategory.restaurantid = %s
            AND menucategory.categorytype = 'primary'
            AND customerorder.orderdatetime > NOW() - (%s::TEXT || ' DAYS')::INTERVAL
            GROUP BY 1;"""
    cursor.execute(qry, [restaurantId, start])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def revenue(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT date_trunc('day', orderdatetime) as OrderTime, sum(nullif(ordertotal, 'NaN')) FROM customerorder
            INNER JOIN itemordered
            ON customerorder.orderid = itemordered.orderid
            INNER JOIN menuitem
            ON itemordered.menuitemid = menuitem.menuitemid
            WHERE restaurantid = %s
            GROUP BY 1
            ORDER BY OrderTime DESC;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def topRevenueMenuItems(restaurantId, start, end):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT currentPeriod.menuitemname, currentPeriod.itemprice, currentPeriod.totalpurchased, currentPeriod.ratio,
            previousPeriod.totalpurchased as prevtotalpurchased, previousPeriod.ratio as prevratio FROM topMenuItems(%s,%s,%s) as currentPeriod
            FULL JOIN topMenuItems(%s,%s,%s) as previousPeriod
            ON currentPeriod.menuitemname = previousPeriod.menuitemname
            WHERE not(currentPeriod.menuitemname is NULL)
            ORDER BY currentPeriod.itemprice*currentPeriod.totalpurchased DESC;"""
    cursor.execute(qry, [restaurantId, start, end, restaurantId, (start)*2, start-end])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def averageOrderPrice(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT date_trunc('day', orderdatetime) as OrderTime, AVG(nullif(ordertotal, 'NaN')) FROM customerorder
            INNER JOIN itemordered
            ON customerorder.orderid = itemordered.orderid
            INNER JOIN menuitem
            ON itemordered.menuitemid = menuitem.menuitemid
            WHERE restaurantid = %s
            GROUP BY 1;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

def revenueByMenu(restaurantId):
    connection = db.connect()
    #current number of active customers
    cursor = connection.cursor()
    qry = """SELECT date_trunc('day', customerorder.orderdatetime) as OrderTime, menucategory.categoryname, SUM(itemordered.itemtotal), COUNT(*) FROM itemordered
            INNER JOIN menuitem
            ON itemordered.menuitemid = menuitem.menuitemid
            INNER JOIN menucategory
            ON menuitem.categoryid = menucategory.categoryid
            INNER JOIN customerorder
            ON customerorder.orderid = itemordered.orderid
            WHERE menucategory.restaurantid = %s
            AND menucategory.categorytype = 'primary'
            GROUP BY 1,2;"""
    cursor.execute(qry, [restaurantId])
    records = cursor.fetchall()
    cursor.close()
    db.close(connection)
    return jsonify(records)

