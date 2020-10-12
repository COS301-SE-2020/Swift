# Non-functional Requirements

## Quality Requirements

Quality requirements define the quality that our client expects from the system to better the user’s experience. These requirements can be divided into: usability, consistency, availability, maintainability and cost.

* **Usability:** Ensured efficiency when using the system is achieved by reducing the impact of user errors caused by lack of knowledge of the system. We accommodated these user errors by allowing users to be able to abort commands they mistakenly took due to lack of knowledge i.e.  having the back button on all our pages, this gives users the freedom to explore the pages confidently without  fear,  knowing  that  they  can  always  abort  their  actions.   The  functions  provided  by the system must accomplish the intended tasks through ensuring that they fit within the work context of the user:

1.  The user must be able to understand clearly what the user interface is about with the first3 minutes of using the     application.
1.  The user must take an average of 5 clicks to get to the desired view.
1.  All the views must have a redo/undo button to support user exploration.
1.  All of the instructions and error messages must be provided to users in plain English, for easy interpretation.


* **Reliability:** To provide the system with reliability, both the management and customer applications will employ the MVC pattern.  The functionality of the system will be broken up into different  components  (i.e.   Views  and  Controllers)  so  as  to  easily  identify  where  any  failures occur.  These issues can subsequently be handled accordingly with fail safe methods and user notifications.  Due to the modularity of the components, the team will perform unit and integration testing  on  each  to  assess  how  the  different  components  communicate  to  perform  the functions of the system.  To better illustrate the requirements of the system, reliability can bebroken down into three characteristics:

1.  Maturity:  the system must be in a state of being fully developed to avoid failures resulting from faults in the software
2.  Fault  tolerance:   the  system  must  maintain  a  level  of  performance  in  the  instance  that software errors occur 
3.  Recoverability:   if  a  system  failure  occurs,  the  software  must  have  the  capability  to  re-establish the state in which it was prior to the failure.  For example, if a user is logged in and the application crashes, the system must have the capability to preserve the settings and data set before the failure occurred.


* **Flexibility:** The system must support flexibility in the following ways:

1. The system should have to a web and application-based interface for users who choose to not download the app due to storage constraints on their mobile devices.
2.  Using Vue.js we were able to code a system that can work for Android, IOS and has a web version.
3.  All  of  the  features  of  the  application  must  be  compatible  with  both  current  and  newer mobile devices, supporting a minimum of 4 operating systems.
4.  All the features that are supported in the app interface must be supported by the web based interface as well.  The app must be able to run on a minimum of 3 different web browsers.


* **Security:** Our system makes use of critical user information such as their banking details.  It iscrucial that customer’s confidential information is thoroughly protected from jeopardy.  This is achieved in the following ways:

1.  All users will be provided a random token when they sign in which will be used to uniquely identify them.
2.  All communication between the users and the system will be encrypted using SSH encryption.
3.  This will ensure that no third person can intercept the network.
4.  All of user credit card information will be encrypted.  MD5 and SHA-1 hashing, and salting algorithm will be used to store and encrypt user information on the database.


* **Scalabality:** This refers to how well the system can expand to accommodate a demand.  Our system must be scalable to accommodate an increase in items to restaurants menu, a restaurant expanding  to  accommodate  users,  and  an  increase  in  restaurants  added  to  the  system.   The system will accommodate all these changes in the following ways:

1.  Whilst we are not fully geared for a Microservices architecture, we can split our different domains within the API through routes, meaning those domains can possibly be deployed on their own servers in the future.
2.  The database can also be split since we are using different storage methods e.g.  the NoSQL JSON object for menu items.
3.  Analytics and Management only things can be placed in their own separate database and use API calls if they require data from other databases.  We should however keep data in the same database if the data is used together very often.


