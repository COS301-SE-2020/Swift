import axios from "@/axios.js"

export default {
  addNewRestaurant({
    commit
  }, payload) {
    axios(
      {
      method: 'post',
      url: 'https://api.swiftapp.ml',
      data: {
      "requestType": "createRestaurant",
      "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFhR19TWm1Vc0tpTVdFZDB6SWVha1g0Q2EyZk0tZlVhSGxITWtoQXQwN1d4YkFIV1NCRU1sZS1VVWhmckFaZ0ZXb3pja0JScHpLbXRTMGRnb0RKekxpM1QiLCJ5IjoiQWJGdXQ3Xy05ZGVNSWVkRDV5R0VGOXZiSG84d1h2OTc3TlZNZ0F4ZjZrT0ZwdFBldkhLNFY2cnpETEtkSElRT1N1TkpCelIySmNLekt4RjgxT29sQ2hZTCJ9fQ..fcGdsBXuoATxMpKy9ZTy4g.g3Pi_S3UJ-ZdfnKLs1LDY0GSmkV8ZSRhXvrU77xC1kM7MYBAMilsv5phV5xgEy0utI-92wHYFo9pBUPWRYsZq1auHg56Objsdf7G04Ao-mWglfUewrx2cl_PhuACqmb8WZeLXiJVXtFgMuKuwuPquw2Rf2ELi2FfoKw2M559Vp7gVdHueY0oXn0Z0cJiSQA-zSZMkl1QCYNPBlYTqp3R7MZ9DMSg7kgcrWsX25Iko4tINHEXeHLgmrx5_C02kYyioVDisIWMLEuSnMFexwSl_vxtaH-c9E_XOhYorDaf1ccF6-gSg10MzI7X5cJLylmG9qxs8r3ZamcuOA33QyfZ2GHmGJsAfMPSsujQCEpmYfp38NYW751qwQs9eg5OJ6hSZ7nChTGyw5cOqwf5aqou1898li_-VEC_5oY1DUlOs5qavcUw8Y5u5hrBpgCSp1C7bqrJp8fw2fmG1TeKpKE5IYVZwkw4EUxE262fI8c_g64Z4knWvpXEGTMozr8A1_VllD9jXnULlHlFLsB6VbWJRv4aJMiit5D8PhqfjSgEbfGiPNRG7KcS7pnSYTOPAiTbATfYK0hvL37srbpDdv2mcn8BharBCRjFYGPsMxXmkB4.xMF73hjuI56bsrmjk8dQtA",
      "name": payload.restaurantName,
      "description": payload.restaurantDesc,
      "branch":  payload.restaurantBranch,
      "location": "Centurion",
      "categories": JSON.parse(payload.restaurantCategories),
      "coverImageURL": payload.restaurantImage
      }
    }).then(result => {
      console.log(result);

    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
  retrieveRestaurantCategories({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "allRestaurantCategories",
      "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFTdG5aZldTLS12RVFna1owYlhaWHo1TXd4WmNrSUJadHBrdVJvbzgtRkhoRDl4NGF2cm9PbExZN2V6blFkdXI2UXVUZUZ3bHBXRFhxUk5rei1ZeDk5WVQiLCJ5IjoiQWVPQXc5d3UxeTBfUjVNNll0WE44a19vZi1hLVFUNUVtOEpZUTU4eURJYmhtMnpIdFAyc3N4b0tjZXNkOFpIRUh2Q2xacFIwSFlFYWt6QnFNTWhac3VJNiJ9fQ..egod4OZOuzlZ2Nm_wxJ6Ug.LLRKt4oeqx0SCFBcpftHqVlq4C20-U_7CRV-3GCMHrVOMlE1PpHG26hsmmM2LK5-HOsdciAeANbdB2BosHOoia9JKyey6K7dlM3jBgery5PmgEuYU_pVMNtND4wQLSjpp7NDn18UkMklblY-6NoNrsuQwN6px2FR1m0k3qukAO0_lepMQZIAXJwqq0v49rP9RoONtu6OiuyacpoxFIbRlLhohYYblyEitsVY3_uSylTWvFXsh238uTtlWGrqnJCd3TDznnd7btq-HqLHO9P3ux0b9vgWVa0f0RFDe0KTQS2kKtQl8XLaRkap_m4cuaN9I5E2L_2mpbhhCCGyZctgdx6C45npnOCGNJpJPNuYZLrrZJT6HI0-QI6kA-OAhquNSAE-g_v67Xsa5W-9N2C0t0kXcfoyx5y3c7KP7sQgDOA6x0vM1i6-lX5paqK6qoX6LhtS5e_565Yml37g5dBduyZ9MFuTsn4X7nz8d0UEJnlYPaLtJs6ZxUav1mA_i8KbIz3UxFbcuChPuM8Ctaw4eRRw04Y2Tbztb6xRaXLaId-yy7pjYNEoNOK94CpRRVYGyfjumfgLfvGfThDmLn20T2r27RlNax3iiieRbHyYU1cg6VgtVZFmDuN0GLL21SbeNvgyCeFCltPIsAbzijHWlQ.1Veec0SDpY8a8CBoD-5kgQ",
    }).then(result => {
      console.log("Restaurant Category Options", result);
      commit('SET_RESTAURANT_CATEGORY_OPTIONS', result.data.categories);

    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
}