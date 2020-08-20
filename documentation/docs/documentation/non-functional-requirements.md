# Non-functional Requirements

## Quality Requirements

Quality requirements define the quality that our client expects from the system to better the user’s experience. These requirements can be divided into: usability, consistency, availability, maintainability and cost

* **Usability:** Ensured efficiency when using the system is achieved by reducing the impact of usererrors caused by lack of knowledge of the system. We accommodated these user errors by allowingusers to be able to abort commands they mistakenly took due to lack of knowledge i.e.  havingthe back button on all our pages, this gives users the freedom to explore the pages confidentlywithout  fear,  knowing  that  they  can  always  abort  their  actions.   The  functions  provided  by the system must accomplish the intended tasks through ensuring that they fit within the work context of the user:

1.  The user must be able to understand clearly what the user interface is about with the first3 minutes of using the application.
2.  The user must take an average of 5 clicks to get to the desired view.
3.  All the views must have a redo/undo button to support user exploration.
4.  All of the instructions and error messages must be provided to users in plain English, foreasy interpretation.

* **Reliability:** To provide the system with reliability, both the management and customer appli-cations will employ the MVC pattern.  The functionality of the system will be broken up intodifferent  components  (i.e.   Views  and  Controllers)  so  as  to  easily  identify  where  any  failuresoccur.  These issues can subsequently be handled accordingly with fail safe methods and usernotifications.  Due to the modularity of the components, the team will perform unit and inte-grations  testing  on  each  to  assess  how  the  different  components  communicate  to  perform  thefunctions of the system.  To better illustrate the requirements of the system, reliability can bebroken down into three characteristics:

1.  Maturity:  the system must be in a state of being fully developed so as to avoid failures resulting from faults in the software
2.  Fault  tolerance:   the  system  must  maintain  a  level  of  performance  in  the  instance  that software errors occur 
3.  Recoverability:   if  a  system  failure  occurs,  the  software  must  have  the  capability  to  re-establish the state in which it was prior to the failure.  For example, if a user is logged inand the application crashes, the system must have the capability to preserve the settingsand data set before the failure occurred.

* **Flexibility:** The system must support flexibility in the following ways:

1. The system should have to a web and application based interface for users who choose tonot download the app due to storage constraints on their mobile devices.
2.  Using Vue.js we were able to code a system that can work for Android, IOS and has a webversion.
3.  All  of  the  features  of  the  application  must  be  compatible  with  both  current  and  newermobile devices, supporting a minimum of 4 operating systems.
4.  All the features that are supported in the app interface must be supported by the web basedinterface as well.  The app must be able to run on a minimum of 3 different web browsers.

* **Security:** Our system makes use of critical user information such as their banking details.  It iscrucial that customer’s confidential information is thoroughly protected from jeopardy.  This isachieved in the following ways:

1.  All users will be provided a random token when they sign in which will be used to uniquelyidentify them.
2.  All communication between the users and the system will be encrypted through the use of SSH encryption.
3.  This will ensure that no third person can intercept the network.
4.  All of user credit card information will be encrypted.  MD5 and SHA-1 hashing and salting algorithm will be used to store and encrypt user information on the database.

* **Scalabality:** This refers to how well the system can expand to accommodate a demand.  Oursystem must be scalable to accommodate an increase in items to restaurants menu, a restaurantexpanding  to  accommodate  users,  and  an  increase  in  restaurants  added  to  the  system.   Thesystem will accommodate all these changes in the following ways:

1.  Whilst we are not fully geared for a Microservices architecture, we can split our differentdomains within the API through routes, meaning those domains can possibly be deployedon their own servers in the future.
2.  The database can also be split since we are using different storage methods e.g.  the NoSQLJSON object for menu items.
3.  Analytics and Management only things can be placed in their own separate database anduse API calls if they require data from other databases.  We should however keep data inthe same database if the data is used together very often.

## Technology Requirements

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

