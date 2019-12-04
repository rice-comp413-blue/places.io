const text= `
# Introduction

#### Problem Statement

We believe that people should have one centralized application to share and view images and content about locations around the world. We want to enable people to share images about their locations and display the intricacies of their individual worlds. Aside from empowering cultural and societal diffusion, this can also work as a warning system, as users can report about issues in their regions and easily demonstrate the situation.

What distributed systems challenges are we facing?

The naive approach to implementing a geolocation update service would involve utilizing one central database to coordinate potentially thousands of real-time updates to the service. This would create various problems for our system involving latency, server load and consistency. To combat these problems, we are crafting a system that would involve a myriad of servers, with each containing unique isolated data. We believe that this system accounts for interserver communication and fault tolerance, and further explain why throughout this document. Our primary goal is to build a system that is both fast and accurate in light of the problems associated with distributed systems. Some of the general distributed issues that we face involve routing user requests to the correct server and sharding our systems when we face server overload.

On the other hand, due to the nature of our system, consistency issues are less important. Maintaining a chronological ordering of our views will be the largest problem, but we do not need strong consistency for data storage or queueing the data when multiple stories are written to the database.



What does our application do differently?

Fundamentally, the aims of our project are to make a simple, scalable distributed project. We&#39;re not going for tons of optimization right now. We hope to design our project in a way that is easily extensible and where we can add a lot of these optimizations down the road.

Why does this make a good project?

We believe that this application is important and that there is an interesting distributed system for the framework of the problem. We have to deal with issues such as load balancing, sharding servers, maintaining various databases and fault tolerance. We think we can use this project to learn more about distributed systems and to build something interesting and useful.

#### Application Details

Places.io will be used as a tool to view and submit the most up to date data about
#
[ANNOTATION:

BY &#39;Clara Tian&#39;
ON &#39;2019-09-15T16:07:18&#39;
NOTE: &#39;nit: somewhat inconsistent with the problem statement at the beginning; this seems to be more focused on reporting incidents&#39;]
threats, incidents, and other events on a map.  It helps keep people safe by the power of crowd-sourcing data. The more users places.io has, the more data points it has. Thus, places.io needs to be built as a distributed system that can scale with large amounts of users and large amounts of data.

In general, places.io will be a web application with a highly scalable distributed server architecture designed to handle huge amounts of data and users at a time. The world is divided into zones, with a geographic size comparable to a zip code, that a user can click on and interact with. When interacting with a zone, the user can upload what we define as a &quot;story&quot;, which serves as the single content source of our application. The story must have a location (represented as a coordinate internally but shown externally as something like the name of the place or address to the user), along with an image and/or text. Stories will be ordered chronologically upon view in a feed-like interface that users can scroll through. Stories will be owned by zones and zones will be owned by a server instance.
npm i remarkable
NOTE: &#39;also somewhat inconsistent with the broad description in the problem statement section for the same reasons as stated in the comment above&#39;]
Use Cases

Imagine a user is traveling and just landed in a new and unfamiliar city.  The user wants to be aware of their surroundings to ensure their safety.  With places.io, the user can simply view the map, zoom into their location, and check if there were any active incidents or threats in the surrounding area.  The user can see the location, some text describing the event, an image, and a timestamp of when it occurred.

Now imagine a user is out running and witnesses a burglary in his neighborhood.  In addition to reporting the burglary to authorities, they can open up places.io, select their location on the map, add a description to warn other users, and upload an image of the house where the burglary happened.  Now all other users&#39; maps will update with this event and they can take appropriate action to protect themselves.

General System Setup

At its core, our web application, places.io, provides users with read/write access to a crowd-sourced database of various &quot;places&quot; through a map interface.  These &quot;places&quot; are defined by 4 data points:

1. A location (GPS coordinate, Latitude/Longitude, etc)
2. A text string annotation for that location
3. An image providing additional information about that location
4. A timestamp marking when the &quot;place&quot; information was created

There are two actions a user can perform with regard to these &quot;places&quot; - view and submit.

- View:
  - A user can interact with the map and see an overview of where all the &quot;places&quot; all users have created reside.  The &quot;places&quot; that appear on the map are determined by the bounding box of the current user&#39;s map view.
  - A user can see a &quot;place&quot; in more detail by clicking on a specific location, and all the location, text, image, and timestamp data for every &quot;place&quot; in that location would be presented to the user.
- Submit:

1.
  - A user can also submit a &quot;place&quot; as well. When a user clicks on a location on a map for submission, they will be presented with areas to enter a text string and upload an image for that &quot;place&quot;.  Once the user clicks submit, the &quot;place&quot; is submitted for that location and is placed into the database.  The update will be reflected in the map view of all clients, including the current user&#39;s.
  - Places.io will be able to handle very large volumes of concurrent clients in all regions of the world; thus, we need to build a distributed backend that partitions data across multiple servers, implements routing and queueing of client requests to the appropriate server, supports concurrent view/submit requests, provides eventual consistency for the data, and is fault tolerant to disruptions of service in any node.



#### Assumptions, System/Failure Model

**Application Assumptions:**

- Users will view/submit to regions of the world besides where they&#39;re located.

- A single zone won&#39;t have more data than can fit on a single server node.
- Latency isn&#39;t a big concern for our application. Although definitely not ideal, we are fine with several seconds of latency

**System Model:**

- Asynchronous system model

**Failure Model:**

- Primary-backup server protocol
- Crash-recovery failure

#### Architecture Design Overview

**Architecture Diagram for places.io**



**Monolithic Server Architecture**

We have decided against a micro services architecture to start off. This is because we believe in the philosophy to build a monolithic architecture first to maximize development productivity and then transitioning to a microservices architecture at scale, once developer productivity starts to be hindered by the serious challenges of monolithic architecture that necessitate a development bottleneck. In particular, we find that building a monolithic server architecture to really understand the domain boundaries and fault lines between the components of our webapp are critical to start off. This will help us put more functionality for this webapp in scope for this semester.



**Structure**

Generally, we will have some number of monolithic server instances n

# 1
, n
# 2
, ... , n
# x
 behind an nginx
# 1,2
 proxy. We call the combination of each server instance and its database &quot;shards&quot;. Each server instance is a single process, containerized (using Docker) instance of our server code that writes to and reads from a single database. Having zones be owned by a specific server instance gives us the somewhat unique opportunity to reduce network latency by geographical server proximity.

**Load Balancing**

All client requests go to our load balancer. Our load balancer needs to be able to receive and allocate thousands of requests to a port (representing the correct server instance) very efficiently with some degree of anonymity. That said, no matter how fast our load balancing program is, collisions are inevitable and request queuing can quickly become a large issue especially with our monolithic architecture where client traffic might suddenly start heavily requesting some server instance n

# x
. This is because zones are owned uniquely by server instances and although the load can eventually be distributed by splitting a shard, sudden hot spots can form and overload a shard. Because of this inevitability, we need a cache on our nginx node. We can both support this and reduce the network overhead from request queuing by having requests allocated atomically by using Redis.

**Database**

As mentioned earlier, each server instance has its own database that it writes to and reads from. A strong choice for a database management system would be Cassandra

# 4
. Cassandra supports time series data modeling which is particularly useful for our use case since each zone organizes stories chronologically. Accessing a physical partition on disk that has data clustered by timestamp as a primary key can greatly improve the cost of retrieving data. This works especially well since each shard has a constant bound on the number of zones so time series modeling makes a lot of sense here, we won&#39;t waste too much time sifting through different zones. Additionally, we can index on zone id.

**Splitting Shards**

There are two scenarios in which we split a shard. The first is obviously if a server n

# x
 becomes a regular hot spot and overloads often. The second case is if we surpass an upper bound on either zones or disk space. In this case, we are preemptively splitting the shard in anticipation of growth in those zones. We partition zones by both number and geography.





**Fault Tolerance**

Since we&#39;re following a monolithic server architecture where data is actually uniquely owned by a server instance we need to maintain a spare in the event of a media failure. This means that when we request is allocated to some n

# x
 we also send it along to n
# x
-spare. This should be a reasonable defense against the very infrequent and rare event of a media failure.

**Containerized Server Instances**

We do want to containerize our application using Docker for the strong benefits of environmental consistency, operational efficiency, developer productivity, and version control. This may not be intuitive in a monolithic architecture but we believe in particular because we are using a monolithic architecture where critical changes need to be deployed across all instances, containerization will be very important for fault tolerance. On that note, it may be desirable but perhaps not in scope of the class to also host an intermediary process that runs a basic verification on config changes so that updates to our server instances don&#39;t completely break production.

**Server Code Design**

[places.io](http://places.io) is an API first application. This means that routes are exposed through a well defined API. This gives us long term flexibility in building out functionality and services as components. It also has the added benefit of allowing us to enforce security and user permissions in a standardized way.



#### Architecture Desig
#
[ANNOTATION:

BY &#39;Santiago Garcia Acosta&#39;
ON &#39;2019-09-13T17:54:43&#39;
NOTE: &#39;Missing client side stuff&#39;]
n Details

GeoProxy

An integral layer of our architecture is a reverse proxy (which we&#39;ve dubbed the &quot;geoproxy&quot;) to receive requests from clients and transmit them to the appropriate servers. This layer separates the client and server nodes.

The motivation behind the geoproxy is multifaceted:

- Request routing: the geoproxy will direct client requests to the server containing the pertinent information.
- Security purposes: We don&#39;t want clients communicating directly with the server nodes. Putting the reverse proxy between them hides important server details.
- Request queuing: In the case that a particular server can&#39;t take any more requests, the geoproxy will queue the request and deliver it only once the server is available. Clients can&#39;t handle this capability themselves.
- HTTP Compression to improve transfer speed and bandwidth utilization

We should clarify which things are NOT the motivation behind the geoproxy:

- The geoproxy isn&#39;t just a load balancer. Because a particular set of zone-specific requests can be handled by one server only there is no room for load balancing
- The geoproxy isn&#39;t meant to serve the role of a reverse proxy in a Content Delivery Network. That is, requests aren&#39;t routed to the server closest to a particular client. That is, we only consider the zone that a client queries; the client&#39;s actual location does not affect which server handles the request.

**Inner Workings of the Proxy**

At a high level, the geoproxy receives a request from a client and directs it to the correct server. Then it gets the response back from the server and forwards it to the appropriate client.

As previously noted in the client section, client requests will vary in their URI based on the region which they&#39;re trying to access. Therefore, the geoproxy&#39;s routing will be done based on the URI and some way of mapping from URI to server. At its simplest, this might take the form of a hard-coded hash-table from zones to servers (which is updated manually with the splitting of a shard).

The geoproxy does the following upon receipt of a request from a client:

- Get the appropriate server based on the URI
- Based on the server&#39;s availability either: send or queue a request to the server
  - In the case of an entry upload we also send requests to the backup servers
- Process the server&#39;s response
- Send back a compressed response to client



**Implementation Details**

Although not technically an expectation for this doc, we will include a couple preliminary ideas with regards to implementation.

NGINX, designed to be used as a reverse proxy (among other things), shows much promise for use as our geoproxy. Promising features/qualities include:

- Non-blocking event-driven connection handling algorithm which allows it to handle many client requests quickly (3).
- A substantial collection of 3rd party modules
- Support for compression and decompression (1)
- Custom load-balancing algorithms, including one which hashes user-defined keys (can be based off URI) to servers (2). Although it isn&#39;t load-balancing per se, this can be of much use in the way the geoproxy directs client requests.

More Detail on Sharding in our System

Every single actual server instance is exactly the same and is completely decoupled from things like region. So server instance n1 should not know whether it is an America server or a China server. In fact it could be both. Geographical considerations are only in the context of splitting a shard and for store itself. Server instances are not tied to a single database, they each have their own instance of a database because every single monolithic instance (what we call a shard) is simply a clone. This is not super efficient especially when splitting a shard. We&#39;ll discuss optimizations at the bottom but for now I think for scoping purposes they should remain optimizations rather than original design.

Let&#39;s consider a simple example. When we start off with[places.io](http://places.io) we probably only want to provision a single server instance to begin with, let&#39;s call it n1. Now n1 serves clients (these are the users that are based in some geographical location) c1 (America), c2 (Europe), c3 (China), and c4 (Japan). Now let&#39;s say some client c5 (Korea) starts using[places.io](http://places.io) and that puts us in a situation where we need to split the shard because n1 is getting overloaded with requests. How should we split the users?

We could do something based perhaps based on usage.Perhaps our dear American clientc1 uses[places.io](http://places.io) as much as all the other clients put together. But there&#39;s another consideration we can probably make here that can help optimize our system as it scales by reducing network overhead. That is, we might consider geographical usage.

Here&#39;s where we need to start thinking about what each server instance looks like:

Every single server instance is the exact same, it&#39;s a black box that takes in requests and handles it with the same exact procedure. The only difference between a server n1 and n2 is that they take in different requests and the database tied to it has, as a result, different data. So although n1 is not necessarily a North American server it might happen to have data for North America. This data is going to inherently be tied to a location but not because of any backend logic.

Rather, these kind of actual geographical relationships will be handled entirely on the client side. Routing to a server instance is handled by some simple uri and when a user is currently viewing zip code 77005 (America) we might have a url like[n1.places.io.](http://n1.places.io.) To further clarify this example, if a user wants to view a region in China (whose data we say is currently associated with server n7) then clicking on that region will redirect the user to the url[n7.places.io.](http://n7.places.io.) We might choose to make this prettier but internally this is how it will be handled.

Now splitting a shard is manual, this is not an automated process. So if we decide to split n1 (which previously handled America data) into west (n1) and east (n2) America we clarify this on our client so that if a user clicks on a western region it will redirect to[n1.places.io](http://n1.places.io) and if they click on an eastern region it will redirect to[n2.places.io.](http://n2.places.io.) But as far as business logic goes, n1 and n2 are exactly the same and have no clue that they are associated with a geographical location at all.

To clarify further, the reason we decouple application logic (geographical location) from the server is because there is no well defined upper bound for how far our system can scale meaning sharding is inevitable. And since sharding is inevitable, the server logic should be decoupled from the application logic since a server might split at any time and generally speaking this is how a monolithic server architecture work, we scale by making copies of the full server stack including db and the server instance itself.

Now back to the original example. Now, when we split we have a good opportunity to make an optimization here. That is, since we have to bootstrap a new machine anyways, we might as well make this new server physically closer to the clients it will more likely serve (for writes, reads can potentially happen from anywhere). So when we split, maybe we decide european and american regions are going to be handled by n1 and a new server n2 is going to be located in China and will handle Korea, China, and Japan.

Now, how do we handle the actual split when, as we just discussed, a server isn&#39;t tied to a geographical location? Well, the server&#39;s database does have data that is tied to a location. So on the client side we decide zip codes 77005 through 77025 are going to be n1 and zip codes 77026 through 77050 are going to be n2.

Now n1 might have had data originally like so:

| **zip code** | **text** |
| --- | --- |
| 77005 | a |
| 77010 | b |
| 77026 | c |
| 77030 | d |
| 77037 | e |

We split n1 into n1 and n2, each having its own db. This might look like:

| **zip code** | **text** |
| --- | --- |
| 77005 | a |
| 77010 | b |
|   |   |

| **zip code** | **text** |
| --- | --- |
| 77026 | c |
| 77030 | d |
| 77037 | e |

And then after the split, the client continues to handle the geographical aspect of the application logic as we just discussed.

Containers / Container Management

- Container orchestration
  - In the case that we need to manage many containers in a single shard, we can make use of Kubernetes to automate container deployment, scaling, and management.

- What are we putting in containers?
  - Each container will have a Cassandra instance to store location and warning information as well as the server node to handle client requests.

- How are we deploying containers?
  - We will make use of Docker to containerize and deploy our containers. Docker is the current industry standard and utilized in enterprise applications everywhere.

- What is containerization?
  - Containerization is the bundling of all source code, runtime, system tools, system libraries and settings into one central unit of software that is required for your application to run across any computing environment. Meaning that no matter where you run your container, it will behave the same way every time no matter the OS or libraries currently installed. While often compared with VMs, containers differ in that they run on the host&#39;s OS and do not have their own OS for each container. This generally results in less memory and space usage while still retaining the benefit of isolation.

- What are the benefits of containerization?
  - Discussed somewhat above, containerization provides an easy method of deployment. Especially in our case when we will be deploying the same code across multiple shards, we can containerize then set up our container on each in an efficient manner.
  - Containerization makes scalability (in terms of increasing number of server nodes) as simple as spinning up new executables, which Kubernetes can handle for us

Database Storage

Each server node should have a controller that handles the logic of performing a client&#39;s request. Because our current system only wishes to read and write &quot;place&quot; data for the user to share to other clients around the world, the main component of each node is a local database containing entries of &quot;places&quot; clients create. These entries are horizontally partitioned across different servers in a way to both balance the load of requests being made and balance the amount of information stored in each database (the decisions behind this is handled by the proxy service). In the case that a database exists on a failing server, there should be a copy of this information still accessible in a single backup server (see Fault Tolerance section for more details). Our database needs to support basic read and write/append capabilities from concurrent requests.

Tentative place entry consists of:

- placeId (unique)
- location (required)
- timestamp (required)
- text (optional) or image (optional)



#### Extended Scenarios

Overloaded Servers (Anthony, Eva)

- There are two scenarios in which we split a shard:
  - First, if a server n\_x becomes a regular hot spot and overloads often.
  - The second case is if we surpass an upper bound on either zones or disk space. In this case, we are preemptively splitting the shard in anticipation of growth in those zones. We partition zones by both number and geography.
- We need to split a shard because there is too much load on the original shard.
- What if a node is getting many requests even though the storage is actually not even close to maximum capacity?
  - Our database + our proxy together should be able to handle a reasonably large amount of requests concurrently.
  -  A potential solution to this is adding another layer of distribution (and complexity) by abstracting a server to a cluster of servers that accesses a single store.
- What if there is too much data with a particular zip code?
  - Our model currently does not handle this - for now this would be an infrastructure issue that we deal with manually. In such a special case we would have to expand the store or the server capacity ourselves. A later optimization to allow a cluster of server instances for a shard and allow a shard to increase storage capacity with a distributed store may address this but for now is deemed an optimization rather than an mvp.
- When we split a shard, how is the new zone info passed back to the clients?
  - To maintain consistency, we might have clients temporarily hold both versions of map. If the client pings a shard that is splitting and that shard is done splitting we send back a version number telling the client to use the updated map from now on and for the user to try again.

Fault Tolerance

#
[ANNOTATION:

BY &#39;Jacob Diaz&#39;
ON &#39;2019-09-13T04:06:30&#39;
NOTE: &#39;No problem! And yea I agree completely. Cox was saying like there would only be tens of milliseconds of latency added by moving servers farther away from one another&#39;]

#
[ANNOTATION:

BY &#39;Kathleen Hu&#39;
ON &#39;2019-09-13T03:22:19&#39;
NOTE: &#39;Just a note: although one downfall is the latency in the messages between the primary server and its backup, I think the latency is not relevant enough to outweigh handling the regional failures (especially given the flexible consistency of our system)&#39;]

#
[ANNOTATION:

BY &#39;Kathleen Hu&#39;
ON &#39;2019-09-13T03:19:59&#39;
NOTE: &#39;I wasn&#39;t thinking about this--thank you for asking Jacob! We should put backup servers in different regions from their primaries.&#39;]

#
[ANNOTATION:

BY &#39;Jacob Diaz&#39;
ON &#39;2019-09-13T00:56:09&#39;
NOTE: &#39;are these backups located in the same region as the primary servers? I&#39;m thinking this might be relevant if we bring region-wide failures into consideration (I think Yorke was talking about these, e.g. ISP failure)&#39;]
Back-Up Servers

Our system uses a primary-backup protocol for each of its servers; each server has a backup server containing the same information. The backup server will be in a different region to guard against failures affecting the region of the primary server.

 ![](data:image/*;base64,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)

**Overview of Localized Fault Tolerance in the System**

The process of this protocol are as follows:

1. A client sends a request to server P1 through the GeoProxy.
2. P1 processes the request and make changes to its data accordingly.
3. P1 sends a message about its new update to its backup server B1 through their communication link.
4. P1 will send back a response to the client through the GeoProxy. To avoid high latency and possible deadlock situation, it does not wait for B1 to acknowledge the information-update message.
5.

If primary server P1 crashes, the backup B1 will take its place as the primary and notify the application to reroute the appropriate requests to B1. When P1 recovers, B1 will clone over its data to P1, and P1 will become the backup server.

Back-Up Proxies

There is a redundant GeoProxy that rotes the requests and messages in case of proxy crash or failure. Only one active GeoProxy handles and routes requests at a time, while the other remains passive. The two proxies form a cluster, in which they send heartbeats to each other to monitor health. If the primary proxy stops responding, the other proxy will notice and begin to take over the place of the primary proxy.



#### References

1. [https://docs.nginx.com/nginx/admin-guide/web-server/compression/](https://docs.nginx.com/nginx/admin-guide/web-server/compression/)
2. [https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
3. [https://serverguy.com/comparison/apache-vs-nginx/](https://serverguy.com/comparison/apache-vs-nginx/)
4. [https://www.tutorialspoint.com/cassandra/cassandra\_architecture.htm](https://www.tutorialspoint.com/cassandra/cassandra_architecture.htm)

`

export default text;
