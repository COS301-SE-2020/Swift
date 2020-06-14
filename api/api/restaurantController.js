'use strict'

const db = require('./db');
const tokenHandler = require('./tokenHandler');
const { response } = require('express');

module.exports = {
    getRestaurantList : (reqBody, response) => {
        // Check all keys are in place - no need to check request type at this point
        if(!reqBody.hasOwnProperty("token")) {
            return response.status(400).send({'status':400,'reason':'Bad Request'});
        }

        // TODO: Remove hardcoded restaurant rating
        const restaurantRating = 4;

        if(tokenHandler.validate(reqBody.token)) {
            db.query('SELECT restaurantid, restaurantname, location, coverimageurl FROM public.restaurant;').then(res => {
                var restaurantResponse = new Object();
                restaurantResponse.restaurants = [];
                for(var r = 0; r < res.rows.length; r++) {
                    restaurantResponse.restaurants[r] = new Object();
                    restaurantResponse.restaurants[r].restaurantId = res.rows[r].restaurantid;
                    restaurantResponse.restaurants[r].name = res.rows[r].restaurantname;
                    restaurantResponse.restaurants[r].location = res.rows[r].location;
                    restaurantResponse.restaurants[r].image = res.rows[r].coverimageurl;
                    restaurantResponse.restaurants[r].rating = restaurantRating;
                }

                return response.status(200).send(restaurantResponse);
            }).catch(err => {
                console.error('Error executing query', err.stack)
                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
            });
        } else {
            // Invalid token
            return response.status(401).send({'status':401,'reason':'Unauthorised Access'});
        }
    },
    getMenu : (reqBody, response) => {
        // Check all keys are in place - no need to check request type at this point
        if(!reqBody.hasOwnProperty("token") || !reqBody.hasOwnProperty("restaurantId")) {
            return response.status(400).send({'status':400,'reason':'Bad Request'});
        }

        // Check token
        if(tokenHandler.validate(reqBody.token)) {
            // check if restaurant exists
            db.query('SELECT restaurantname, location FROM public.restaurant WHERE restaurantid = $1::integer', [reqBody.restaurantId]).then(res => {
                if(res.rows.length == 0) {
                    // restaurant does not exist
                    return response.status(404).send({'status':404,'reason':'Not Found'});
                } else {
                    // get menu
                    var menuResponse = new Object();
                    menuResponse.name = res.rows[0].restaurantname;
                    menuResponse.location = res.rows[0].location;
                    menuResponse.categories = [];

                    // menu item query promises
                    var menuQueries = [];
                    db.query('SELECT categoryid, categoryname FROM public.category').then(res => {
                        for(var c = 0; c < res.rows.length; c++) {
                            menuResponse.categories[c] = new Object();
                            menuResponse.categories[c].categoryId = res.rows[c].categoryid;
                            menuResponse.categories[c].categoryName = res.rows[c].categoryname;
                            menuResponse.categories[c].categoryItems = [];

                            // menu items
                            let asyncQueryCat = async (restaurantId, categoryId, catIndex) => {
                                let queryPromise = new Promise((resolve, reject) => {
                                    var imageIngredientQueries = [];

                                    db.query('SELECT menuitemid, menuitemname, price, estimatedwaitingtime, menuitemdescription FROM public.menuitem WHERE restaurantid = $1::integer AND categoryid = $2::integer', [restaurantId, categoryId]).then(res => {
                                        for(var m = 0; m < res.rows.length; m++) {
                                            menuResponse.categories[catIndex].categoryItems[m] = new Object();
                                            menuResponse.categories[catIndex].categoryItems[m].id = res.rows[m].menuitemid;
                                            menuResponse.categories[catIndex].categoryItems[m].name = res.rows[m].menuitemname;
                                            menuResponse.categories[catIndex].categoryItems[m].price = res.rows[m].price;
                                            menuResponse.categories[catIndex].categoryItems[m].prepTime = res.rows[m].estimatedwaitingtime;
                                            menuResponse.categories[catIndex].categoryItems[m].description = res.rows[m].menuitemdescription;
                                            menuResponse.categories[catIndex].categoryItems[m].images = [];
                                            menuResponse.categories[catIndex].categoryItems[m].ingredients = [];

                                            // images
                                            let asyncQueryImg = async (menuItemId, catIndex, catItem) => {
                                                let queryPromise = new Promise((resolve, reject) => {
                                                    db.query('SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer', [menuItemId]).then(res => {
                                                        res.rows.forEach(img => {
                                                            menuResponse.categories[catIndex].categoryItems[catItem].images.push(img.imageurl); 
                                                        });                        
                                                        resolve();
                                                    }).catch(err => {
                                                        reject(err);
                                                    });
                                                });

                                                // wait until the query is complete
                                                await queryPromise; 
                                            }

                                            // ingredients
                                            let asyncQueryIngredient = async (menuItemId, catIndex, catItem) => {
                                                let queryPromise = new Promise((resolve, reject) => {
                                                    db.query('SELECT ingredient.ingredientname, price FROM public.menuitemingredient INNER JOIN public.ingredient ON ingredient.ingredientid = menuitemingredient.ingredientid WHERE menuitemid = $1::integer', [menuItemId]).then(res => {
                                                        for(var ing = 0; ing < res.rows.length; ing++) {
                                                            menuResponse.categories[catIndex].categoryItems[catItem].ingredients[ing] = new Object();
                                                            menuResponse.categories[catIndex].categoryItems[catItem].ingredients[ing].name = res.rows[ing].ingredientname;
                                                            var ingPrice = res.rows[ing].price == null ? 0 : res.rows[ing].price;
                                                            var ingSelected = ingPrice == 0 ? true : false;
                                                            menuResponse.categories[catIndex].categoryItems[catItem].ingredients[ing].price = ingPrice;
                                                            menuResponse.categories[catIndex].categoryItems[catItem].ingredients[ing].selected = ingSelected;
                                                            menuResponse.categories[catIndex].categoryItems[catItem].ingredients[ing].extraIngredients = [];
                                                            // TODO: Add extra ingredients
                                                        }
                                                        resolve();
                                                    }).catch(err => {
                                                        reject(err);
                                                    });
                                                });

                                                // wait until the query is complete
                                                await queryPromise; 
                                            }

                                            imageIngredientQueries.push(asyncQueryImg(menuResponse.categories[catIndex].categoryItems[m].id, catIndex, m));
                                            imageIngredientQueries.push(asyncQueryIngredient(menuResponse.categories[catIndex].categoryItems[m].id, catIndex, m));
                                        }

                                        Promise.all(imageIngredientQueries).then(() => {
                                            resolve();
                                        }).catch(err => {
                                            reject(err);
                                        });
                                    }).catch(err => {
                                        reject(err);
                                    });
                                });
                                // wait for query
                                await queryPromise; 
                            }

                            menuQueries.push(asyncQueryCat(reqBody.restaurantId, menuResponse.categories[c].categoryId, c));
                        }

                        Promise.all(menuQueries).then(() => {
                            return response.status(200).send(menuResponse);
                        }).catch(err => {
                            console.error('Error executing query', err.stack);
                            return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                        });
                    }).catch(err => {
                        console.error('Error executing query', err.stack);
                        return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                    });
                }
            }).catch(err => {
                console.error('Error executing query', err.stack);
                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
            });
        } else {
            // Invalid token
            return response.status(401).send({'status':401,'reason':'Unauthorised Access'});
        }
    },
    addOrder : (reqBody, response) => {
        // Check all keys are in place - no need to check request type at this point
        if(!reqBody.hasOwnProperty("token") || !reqBody.hasOwnProperty("orderInfo")) {
            return response.status(400).send({'status':400,'reason':'Bad Request'});
        }

        // Check token
        if(tokenHandler.validate(reqBody.token)) {
            var orderInfo = reqBody.orderInfo;
            var customerId = tokenHandler.getCustomerId(reqBody.token);
            // Check if orderInfo is valid
            if(!orderInfo.hasOwnProperty("restaurantId") || !orderInfo.hasOwnProperty("tableId") || !orderInfo.hasOwnProperty("orderItems")) {
                return response.status(400).send({'status':400,'reason':'Bad Request'});
            }

            // Check if at least one item has been ordered
            if(orderInfo.orderItems.length < 1) {
                return response.status(400).send({'status':400,'reason':'Bad Request'});
            }

            // check if restaurant exists
            db.query('SELECT restaurantname FROM public.restaurant INNER JOIN public.restauranttable ON public.restaurant.restaurantid = public.restauranttable.restaurantid WHERE restaurant.restaurantid = $1::integer AND restauranttable.tableid = $2::integer', [orderInfo.restaurantId, orderInfo.tableId]).then(res => {
                if(res.rows.length == 0) {
                    // restaurant does not exist
                    return response.status(404).send({'status':404,'reason':'Not Found'});
                } else {
                    // time to place order
                    // TODO: Remove employee ID hardcoding
                    var employeeId = 1;
                    const orderStatus = 'in-progress';

                    // create order
                    db.query('INSERT INTO public.foodorder (customerid, employeeid, orderdatetime, orderstatus, tableid) VALUES ($1::integer, $2::integer, NOW(), $3::text, $4::integer) RETURNING orderid', [customerId, employeeId, orderStatus, orderInfo.tableId]).then(res => {
                        orderInfo.orderItems.forEach(orderItem => {
                            // add items to order
                            db.query('INSERT INTO public.orderitem (orderid, menuitemid, quantity) VALUES ($1::integer, $2::integer, $3::integer)', [res.rows[0].orderid, orderItem.menuItemId, orderItem.quantity]).then(res => {}).catch(err => {
                                console.error('Error executing query', err.stack);
                                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                            });
                        });
                    }).catch(err => {
                        console.error('Error executing query', err.stack);
                        return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                    });

                    // Get order history
                    var orderResponse = new Object();
                    orderResponse.orderHistory = [];
                    var orderHistoryQueries = []; // promise keeper

                    db.query('SELECT orderid, orderstatus, orderdatetime, restaurant.restaurantname, restaurant.location FROM public.foodorder INNER JOIN public.restauranttable ON public.foodorder.tableid = public.restauranttable.tableid INNER JOIN public.restaurant ON public.restaurant.restaurantid = public.restauranttable.restaurantid WHERE customerid = $1::integer;', [customerId]).then(res => {
                        // get data
                        for(var i = 0; i < res.rows.length; i++) {
                            orderResponse.orderHistory[i] = new Object();
                            orderResponse.orderHistory[i].total = 0.0;
                            orderResponse.orderHistory[i].orderNumber = res.rows[i].orderid;
                            orderResponse.orderHistory[i].restaurant = res.rows[i].restaurantname;
                            orderResponse.orderHistory[i].location = res.rows[i].location;
                            orderResponse.orderHistory[i].date = res.rows[i].orderdatetime;
                            orderResponse.orderHistory[i].orderItems = [];

                            const orderid = orderResponse.orderHistory[i].orderNumber;

                            let orderQuery = async (index, orderid) => {
                                let queryPromise = new Promise((resolve, reject) => {
                                    db.query('SELECT menuitemname, price, orderitem.quantity, menuitemimages.imageurl FROM public.menuitem INNER JOIN public.orderitem ON public.orderitem.menuitemid = public.menuitem.menuitemid LEFT JOIN public.menuitemimages ON public.menuitemimages.menuitemid = public.menuitem.menuitemid WHERE orderitem.orderid = $1::integer;', [orderid]).then(res => {
                                        // each item ordered
                                        for(var m = 0; m < res.rows.length; m++) {
                                            orderResponse.orderHistory[index].orderItems[m] = new Object();
                                            orderResponse.orderHistory[index].orderItems[m].name = res.rows[m].menuitemname;
                                            orderResponse.orderHistory[index].orderItems[m].quantity = res.rows[m].quantity;
                                            orderResponse.orderHistory[index].orderItems[m].price = res.rows[m].price;
                                            orderResponse.orderHistory[index].orderItems[m].image = res.rows[m].imageurl;
                                            // update total price
                                            orderResponse.orderHistory[index].total += (res.rows[m].price * res.rows[m].quantity);
                                        }
                                        resolve();
                                    }).catch(err => {
                                        reject(err);
                                    });
                                });

                                // wait until the query is complete
                                await queryPromise; 
                            }

                            orderHistoryQueries.push(orderQuery(i, orderid));
                        }

                        Promise.all(orderHistoryQueries).then(() => {
                            return response.status(200).send(orderResponse);
                        }).catch(err => {
                            console.error('Error executing query', err.stack);
                            return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                        });
                    }).catch(err => {
                        console.error('Error executing query', err.stack);
                        return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                    });
                }
            }).catch(err => {
                console.error('Error executing query', err.stack);
                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
            });
        } else {
            // Invalid token
            return response.status(401).send({'status':401,'reason':'Unauthorised Access'});
        }
    }
};
