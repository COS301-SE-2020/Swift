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
            // Check if orderInfo is valid
            if(!orderInfo.hasOwnProperty("restaurantId") || !orderInfo.hasOwnProperty("orderItems")) {
                return response.status(400).send({'status':400,'reason':'Bad Request'});
            }

            // Check if at least one item has been ordered
            if(orderInfo.orderItems.length < 1) {
                return response.status(400).send({'status':400,'reason':'Bad Request'});
            }

            // check if restaurant exists
            db.query('SELECT restaurantname FROM public.restaurant WHERE restaurantid = $1::integer', [orderInfo.restaurantId]).then(res => {
                if(res.rows.length == 0) {
                    // restaurant does not exist
                    return response.status(404).send({'status':404,'reason':'Not Found'});
                } else {
                    // time to place order






                    console.log(orderInfo.orderItems);


            
                    var jsonResponse = {'request':'POST', 'response':'Get Menu -> Swift API :)'};
                    response.status(200).send(jsonResponse);




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
