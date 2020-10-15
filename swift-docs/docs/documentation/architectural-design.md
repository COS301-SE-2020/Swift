# Architectural Design

## Architectural Conceptual Model

### Architectural Design Diagram

![architectural-design](../../assets/swift-architectural-design.svg)

### Discussion

The Swift application uses a 4-tier architectural style that consists of a presentation, business logic, data interface and database tiers.  The presentation tier will handle the user interface of both the customer and management systems. The business logic tier in conjunction with the presentation tier construct the Model-View-Controller (MVC) architectural pattern to allow for system flexibility.  The business logic tier handles all event changes, data manipulation and serves data from the Application 
Programming Interface (API) to the View component.  The data interface tier utilises services that allow for the modularisation of functionality and provide the system with scalability.  To ensure for the security and scalability of the application, the two applications register different independent services that can be deployed separately for different functionality uses of the system. 

There are a number of architectural patterns used for the different components of Swift, namely:

1. **Management and Customer Applications MVC:** To provide the system with flexibility, each application will be constructed with a MVC architectural pattern.  This will provide a modular approach by separating the functionality of the different parts of the system into their own view and models.  Both the customer and management applications will use the MVC pattern to ensure that the different components inside each of the sections are reusable and can be easily modified without adding complexity to the system. The system will also be more flexible because this pattern allows for interoperability between the different components of the system by connecting the API data requests and responses to and from the model, to the view and controllers.

2. **Management and Customer Applications Services:** The data interface layer is responsible for ensuring the scalability of adding different services required for the management and customer applications.  A microservices architecture has been employed to allow for adding new services without interrupting other parts of the system.  This allows for thorough testing of each services before deploying them.

3. **Payment Service Pipe and Filter:** To ensure that the customer’s credit card information is securely stored, the system will utilise a pipe and filter architecture dedicated to filter the different steps needed to access and establish a connection with a third party service that specialises in storing secure credit card information. Once the connection is established, payments can be made by the customer.

