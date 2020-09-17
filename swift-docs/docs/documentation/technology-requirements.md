# Technology Requirements

### Protocols
* **HTTPS (Hyper Text Transfer Protocol Secure):** HTTPS adds security and trust in orderto make the website and application connection more secure.
* **IP (Internet  Protocol):** The  IP  protocol  can  co-exist  with  other  network  protocols,  thusdifferent services can share a common network infrastructure concurrently.
* **TCP (Transmission Control Protocol):** It supports the 4-tier architecture which our appli-cation is going to run on.  This implies that it allows networks to be added without disruptingthe current services.
* **FTP (File Transfer Protocol):** The application will have to support transferring files to theserver when the customer uploads their profile picture and retrieving files when the customerviews the different restaurants, menu items and their Augmented Reality sections.

### Technologies
* **[Vue.js:](https://vuejs.org/):** We  are  using  vue.js  to  implement  our  cross  platform  web  applications.   A  flexibletechnology that you can employ to build modern, nimble apps without using a lot of resources.One platform can be used to build a website,  an android app and an IOS app.  It allows fora MVC structure by allowing you to create reusable modular view components which retrievedata from the different models and update the store.
* **[Ionic and Capacitor frameworks:](https://capacitorjs.com/):** We use Ionic Framework for building high quality, cross-platform native and web app experiences and to develop hybrid mobile applications.  Capacitorare Ionic’s new Native API Container that makes it easy to build web apps that run on iOS,Android and on the web as Progressive Web Apps with full access to native functionality oneach platform.
* **[Node.js](https://nodejs.org/en/):** One of the key advantages of Node.js is that it provides fullstack javascript whichallows both our back-end and front-end work to be developed in the same environment.  Developers find it easy to scale the applications using the following ways:  Most of Node’s objects— like HTTP requests, responses, and streams — implement the EventEmitter module so theycan provide a way to emit and listen to events.  Instead of passing a callback as an argumentand handling the error in the same place, a promise object allows us to handle success and errorcases  separately  and  it  also  allows  us  to  chain  multiple  asynchronous  calls  instead  of  nestingthem.  Node has a core module EventEmitter which can be extended to emit any event that werequire for the business logic.

The ``API`` will be split into modular components which allow the different modules to communicate with each other.  This makes the system more flexible since you can add api points ormicroservices at any time and the new service will just become a new model and controller.

* **[PostgreSQL](https://www.postgresql.org/):** PostgreSQL provides enterprise-class performance and functions among current Open  Source  DBMS  with  no  end  of  development  possibilities.   Also,  PostgreSQL  users  candirectly participate in the community and post and share inconveniences and bugs.  We makesure of PostgreSQL for relational database for user data as well as one for managing data.

