package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"net/http/httputil"

	uuid "github.com/google/uuid"

	// "net/http/httptest"
	"net/url"
	"os"
	"reflect"
	"strings"
	"sync"
	"time"
)

var verbose = true

// Coord struct represents the lat-lng coordinate
type Coord struct {
	Lat, Lng float64
}

// Key struct is for map pointing to correct server
type CoordRange struct {
	Low, High float64
}

// Post struct for server response to view
type Post struct {
	StoryID   string    `json:"storyid"`
	Timestamp time.Time `json:"timestamp"`
	Lat       float64   `json:"lat"`
	Lng       float64   `json:"long"`
	Text      string    `json:"text"`
	HasImage  bool      `json:"hasimage"`
}

type ResponseObj struct {
	Posts []Post `json:"entries"`
	ID    string `json:"id"`
}

// View request passes top-left and bottom-right coords
// "latlng1": [2.5, -10.3],
// "latlng2": [0, 80.5]
type viewRequestPayloadStruct struct {
	LatLng1 []float64 `json:"latlng1"`
	LatLng2 []float64 `json:"latlng2"`
}

// Submit request passes the coord to post
// "coordinate": [-20.3, 60]
type submitRequestPayloadStruct struct {
	LatLng []float64 `json:"coordinate"`
}

// 2D map of LatCoordRange:LngCoordRange:ServerURL
var data = map[CoordRange]map[CoordRange]string{}

// Error coord
var ERROR_COORD = Coord{360, 360}

// Error url
var ERROR_URL = "ERROR"

//Coordinate ranges
var cr1 = CoordRange{-90, 0}
var cr2 = CoordRange{0, 90}
var cr3 = CoordRange{-180, 180}

//Boolean to check if servers are up
//If we have more than 2 conditional urls we probably want to make this
//some sort of map, but this should be fine for now
var pingA = true
var pingB = true

var timeout float64 = 1

const entriesToServe = 10 // Currently hard-coded. do we want to take this in from the client or something?

// Map of UUID to response writer
var responseWriterMap map[uuid.UUID]http.ResponseWriter = make(map[uuid.UUID]http.ResponseWriter)

// Map of UUID to mutex. Each mutex regulates access to the entries of the map corresponding to the respective UUID.
var requestMutexMap map[uuid.UUID]sync.Mutex = make(map[uuid.UUID]sync.Mutex)

// Mutex for regulating access to below maps. Must have this mutex before attempting to add or delete to the map
var mapMutex = sync.Mutex{}

// Map of UUID to number of requests expected
var responsesMap map[uuid.UUID]int = make(map[uuid.UUID]int)

// Following maps and mutex created to help handle forwarding of requests to multiple servers
// Map of UUID to Heap for maintaining the entries we're sending back to client
var queryMap map[uuid.UUID]PostList = make(map[uuid.UUID]PostList)

// Get env var or default
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// Get the port to listen on
func getListenAddress() string {
	port := getEnv("PORT", "1338")
	return ":" + port
}

// Log the env variables required for a reverse proxy
func logSetup() {
	a_condtion_url := os.Getenv("A_CONDITION_URL")
	b_condtion_url := os.Getenv("B_CONDITION_URL")
	default_condtion_url := os.Getenv("DEFAULT_CONDITION_URL")

	log.Printf("Server will run on: %s\n", getListenAddress())
	log.Printf("Redirecting to A url: %s\n", a_condtion_url)
	log.Printf("Redirecting to B url: %s\n", b_condtion_url)
	log.Printf("Redirecting to Default url: %s\n", default_condtion_url)
}

// Setups the mapping to servers
func setupMap() {
	// Map will map lat-long ranges to env strings
	// latitude: (-90, 90) longitude: (-180, 180)

	data[cr1] = map[CoordRange]string{}
	data[cr2] = map[CoordRange]string{}
	data[cr1][cr3] = "A_CONDITION_URL"
	data[cr2][cr3] = "B_CONDITION_URL"
}

func modifyMap(conditional int) {
	if conditional == 0 {
		data[cr1][cr3] = "B_CONDITION_URL"
	} else if conditional == 1 {
		data[cr2][cr3] = "A_CONDITION_URL"
	}

}

// Get a json decoder for a given requests body
func requestBodyDecoder(request *http.Request) *json.Decoder {
	// Read body to buffer
	body, err := ioutil.ReadAll(request.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		panic(err)
	}

	// Because go lang is a pain in the ass if you read the body then any subsequent calls
	// are unable to read the body again....
	request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	return json.NewDecoder(ioutil.NopCloser(bytes.NewBuffer(body)))
}

// Parse the view requests body
func parseViewRequestBody(request *http.Request) viewRequestPayloadStruct {
	decoder := requestBodyDecoder(request)

	var requestPayload viewRequestPayloadStruct
	err := decoder.Decode(&requestPayload)

	if err != nil {
		panic(err)
	}

	return requestPayload
}

// Call this after receiving server response to view for posts
func getPosts(body []byte) ([]Post, error) {
	var posts []Post
	err := json.Unmarshal(body, &posts)
	if err != nil {
		log.Printf("Error parsing server response: %v", err)
	}
	return posts, err
}

// Parse the submit requests body
func parseSubmitRequestBody(request *http.Request) submitRequestPayloadStruct {
	decoder := requestBodyDecoder(request)

	var requestPayload submitRequestPayloadStruct
	err := decoder.Decode(&requestPayload)

	if err != nil {
		panic(err)
	}

	return requestPayload
}

// Log the view typeform payload and redirect url
func logViewRequestPayload(requestionPayload viewRequestPayloadStruct, proxyUrl string) {
	log.Printf("latlng1: %v, latlng2: %v, proxy_url: %s\n", requestionPayload.LatLng1, requestionPayload.LatLng2, proxyUrl)
}

// Log the submit typeform payload and redirect url
func logSubmitRequestPayload(requestionPayload submitRequestPayloadStruct, proxyUrl string) {
	log.Printf("coordinate: %v, proxy_url: %s\n", requestionPayload.LatLng, proxyUrl)
}

// Given float array in form [0.0, 0.0], create and return coord struct
func parseCoord(coord []float64) Coord {
	if len(coord) != 2 {
		fmt.Printf("Error: Coordinate passed into json request should be of form [0.0, 0.0]\n")
		return ERROR_COORD
	}

	if coord[0] < -90 || coord[0] > 90 {
		fmt.Printf("Error: Latitude should be in range [-90, 90]\n")
		return ERROR_COORD
	}

	if coord[1] < -180 || coord[1] > 180 {
		fmt.Printf("Error: Longitude should be in range [-180, 180]\n")
		return ERROR_COORD
	}

	return Coord{coord[0], coord[1]}
}

func rangesOverlap(start1 float64, end1 float64, start2 float64, end2 float64) bool {
	return math.Min(end1, end2) >= math.Max(start1, start2)
}

// Get url for a coord of request. We may not need this anymore after changing logic to
// get multiple proxy urls for view requests (just move logic back to getSubmitProxyUrl)
func getProxyURL(coord Coord) string {
	for latRange := range data {
		if coord.Lat >= latRange.Low && coord.Lat < latRange.High {
			for lngRange := range data[latRange] {
				if coord.Lng >= lngRange.Low && coord.Lng < lngRange.High {
					return os.Getenv(data[latRange][lngRange])
				}
			}
		}
	}
	return ERROR_URL
}

// Get the url(s) for given coordinates of view request
func getViewProxyUrl(rawCoord1 []float64, rawCoord2 []float64) map[string]bool {
	// Acts as a set of urls
	urls := make(map[string]bool)

	// Parse each coord
	topLeft := parseCoord(rawCoord1)
	bottomRight := parseCoord(rawCoord2)

	for latRange := range data {
		if rangesOverlap(topLeft.Lat, bottomRight.Lat, latRange.Low, latRange.High) {
			for lngRange := range data[latRange] {
				if rangesOverlap(topLeft.Lng, bottomRight.Lng, lngRange.Low, lngRange.High) {
					// Check if we have already added url
					urlString := os.Getenv(data[latRange][lngRange])
					// url, exists := urls[urlString]
					if !urls[urlString] {
						urls[urlString] = true
					}
				}
			}
		}
	}

	return urls
}

// Get the url for given coordinates of submit request
func getSubmitProxyUrl(rawCoord []float64) string {
	coord := parseCoord(rawCoord)

	if coord == ERROR_COORD {
		return ERROR_URL
	}

	return getProxyURL(coord)
}

// Serve a reverse proxy for a given url
// TODO include uuid as an argument
func serveReverseProxy2(target []string, res http.ResponseWriter, req *http.Request, id uuid.UUID) {
	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	// Read body to buffer
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		return
	}
	buff := bytes.NewBuffer(body)
	if id != uuid.Nil {
		// Edit request body to include id
		bodyStr := buff.String()
		// This is where we want to insert the id param
		i := strings.LastIndex(bodyStr, "\n}")
		// Convert to runes to split
		runes := []rune(bodyStr)
		// Left side string of \n}
		leftStr := string(runes[0:i])
		buff = bytes.NewBufferString(leftStr)
		// Concatenate new id param and request body remainder
		buff.WriteString(",\n  \"id\": " + id.String())
		buff.WriteString(string(runes[i:len(runes)]))
		setupTimer(id)
	} else {
		// Then we just have a submit request.
		// We only have to send it to a single server
		url, _ := url.Parse(target[0])
		proxy := httputil.NewSingleHostReverseProxy(url)
		req.URL.Host = url.Host
		req.URL.Scheme = url.Scheme
		req.Host = url.Host
		proxy.ServeHTTP(res, req)
		return
	}

	// Send to other servers for view request
	for i := 0; i < len(target); i++ {
		// parse the url
		url, _ := url.Parse(target[i])
		newReqBody := ioutil.NopCloser(buff)

		// reusing requests is unreliable, so copy to new request
		newReq, err := http.NewRequest(req.Method, target[i], newReqBody)
		if err != nil {
			log.Printf("Error creating new request: %v", err)
			continue
		}
		// Update the headers to allow for SSL redirection
		newReq.URL.Host = url.Host
		newReq.URL.Scheme = url.Scheme
		newReq.Host = url.Host

		for header, values := range req.Header {
			for _, value := range values {
				newReq.Header.Add(header, value)
			}
		}
		res, err := http.DefaultClient.Do(newReq)
		if err != nil {
			log.Printf("Error when sending request", err)
		} else {

			defer res.Body.Close()
			// Todo: do we close the response appropriately?
			// when do we want to process it?
			// https://stackoverflow.com/questions/17156371/how-to-get-json-response-from-http-get
			var responseObj ResponseObj
			//fmt.Println(res.Body)

			/*
				dec := json.NewDecoder(res.Body)
				decErr := dec.Decode(&responseObj)

				if decErr != nil {
					log.Fatal(decErr)
				}
				if verbose {
					fmt.Printf("%v", responseObj)
				}
			*/
			///*
			body, bodyErr := ioutil.ReadAll(res.Body)
			if bodyErr != nil {
				log.Fatal(bodyErr)
			}
			/*
				if verbose {
					fmt.Println("Response body follows")
					fmt.Println(body)
				}*/

			if unmarshalErr := json.Unmarshal([]byte(body), &responseObj); unmarshalErr != nil {
				log.Fatal(unmarshalErr)
			}
			//*/
			processResponse(responseObj)
			if verbose {
				fmt.Printf("Request served to reverse proxy for %s\n", target[i])
				fmt.Printf("%v", responseObj)
			}
		}
	}
}

func serveReverseProxy(target []string, res http.ResponseWriter, req *http.Request, id uuid.UUID) {
	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	// Read body to buffer
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		return
	}
	buff := bytes.NewBuffer(body)
	if id != uuid.Nil {
		// Edit request body to include id
		bodyStr := buff.String()
		// This is where we want to insert the id param
		i := strings.LastIndex(bodyStr, "\n}")
		// Convert to runes to split
		runes := []rune(bodyStr)
		// Left side string of \n}
		leftStr := string(runes[0:i])
		buff = bytes.NewBufferString(leftStr)
		// Concatenate new id param and request body remainder
		buff.WriteString(",\n  \"id\": " + id.String())
		buff.WriteString(string(runes[i:len(runes)]))
		setupTimer(id)
	} else {
		// Then we just have a submit request.
		// We only have to send it to a single server
		url, _ := url.Parse(target[0])
		proxy := httputil.NewSingleHostReverseProxy(url)
		req.URL.Host = url.Host
		req.URL.Scheme = url.Scheme
		req.Host = url.Host
		proxy.ServeHTTP(res, req)
		return
	}

	// Send to other servers for view request
	for i := 0; i < len(target); i++ {
		// parse the url
		url, _ := url.Parse(target[i])
		newReqBody := ioutil.NopCloser(buff)

		// reusing requests is unreliable, so copy to new request
		newReq, err := http.NewRequest(req.Method, target[i], newReqBody)
		if err != nil {
			log.Printf("Error creating new request: %v", err)
			continue
		}
		// Update the headers to allow for SSL redirection
		newReq.URL.Host = url.Host
		newReq.URL.Scheme = url.Scheme
		newReq.Host = url.Host

		for header, values := range req.Header {
			for _, value := range values {
				newReq.Header.Add(header, value)
			}
		}
		res, err := http.DefaultClient.Do(newReq)
		if err != nil {
			log.Printf("Error when sending request", err)
		} else {
			defer res.Body.Close()
			var responseObj ResponseObj

			if err != nil {
				log.Fatal(err)
			}
			defer res.Body.Close()
			htmlTokens := html.NewTokenizer(res.Body)
		loop:
			for {
				tt := htmlTokens.Next()
				fmt.Printf("%T", tt)
				switch tt {
				case html.ErrorToken:
					fmt.Println("End")
					break loop
				case html.TextToken:
					fmt.Println(tt)
				case html.StartTagToken:
					t := htmlTokens.Token()
					isAnchor := t.Data == "a"
					if isAnchor {
						fmt.Println("We found an anchor!")
					}
				}
			}

			body, bodyErr := ioutil.ReadAll(res.Body)
			if bodyErr != nil {
				log.Fatal(bodyErr)
			}

			if unmarshalErr := json.Unmarshal([]byte(body), &responseObj); unmarshalErr != nil {
				log.Fatal(unmarshalErr)
			}
			processResponse(responseObj)
			if verbose {
				fmt.Printf("Request served to reverse proxy for %s\n", target[i])
				fmt.Printf("%v", responseObj)
			}
		}
	}
}

// Enable cors for response to pre-flight
func enableCors(w *http.ResponseWriter) {
	//  allow CORS
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	//  Allow these headers in client's response to pre-flight response
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// Sets up timeout callback. Call after sending all requests
func setupTimer(id uuid.UUID) {
	// How long we should wait for multiple
	timeWait := 4 * time.Second
	time.AfterFunc(timeWait, func() {
		if mutex, ok := requestMutexMap[id]; ok {
			mutex.Lock()
			var readyToServe = false
			if numRequests, exists := responsesMap[id]; exists {
				if numRequests > 0 {
					// Note, this should always be true if the request hasn't been serviced yet. maybe delete if statement
					// Let's just send what we have
					readyToServe = true
				}
			}
			mutex.Unlock()
			if readyToServe {
				serveResponseThenCleanup(id)
			}
		}
		/*
			If the mutex isn't in the map, then this means that the request has already been served. In this case, we do nothing.
		*/
	})
}

// Given a request send it to the appropriate url
func handleRequestAndRedirect(res http.ResponseWriter, req *http.Request) {
	//  handle pre-flight request from browser
	if req.Method == "OPTIONS" {
		fmt.Printf("Preflight request received\n")
		enableCors(&res)
		res.WriteHeader(http.StatusOK)
		return
	}

	if strings.Contains(req.URL.Path, "view") {
		// View request
		fmt.Printf("View request received\n")
		var tag = uuid.New()
		requestPayload := parseViewRequestBody(req)
		urls := getViewProxyUrl(requestPayload.LatLng1, requestPayload.LatLng2)
		fmt.Printf("Conditional url(s) attained\n")
		// Create an entry in our response map

		var responseCount = 0

		urlArray := make([]string, 0, len(urls))
		for url := range urls {
			if verbose {
				fmt.Printf("URL serving to: %s", url)
			}
			// todo: make sure that this is returning the actual url and not index
			logViewRequestPayload(requestPayload, url)
			if url == ERROR_URL {
				fmt.Printf("Error: Could not send request due to incorrect request body\n")
				return
			}
			responseCount = responseCount + 1
			urlArray = append(urlArray, url)
		}
		// Make all map entries for this uuid
		mapMutex.Lock()
		responseWriterMap[tag] = res
		queryMap[tag] = make(PostList, 0)
		responsesMap[tag] = responseCount
		requestMutexMap[tag] = sync.Mutex{}
		mapMutex.Unlock()

		serveReverseProxy(urlArray, res, req, tag)
	} else if strings.Contains(req.URL.Path, "submit") {
		// Submit request
		fmt.Printf("Submit request received\n")
		requestPayload := parseSubmitRequestBody(req)
		url := getSubmitProxyUrl(requestPayload.LatLng)
		fmt.Printf("Conditional url attained\n")
		logSubmitRequestPayload(requestPayload, url)

		if url == ERROR_URL {
			fmt.Printf("Error: Could not send request due to incorrect request body\n")
			return
		}

		urlArray := make([]string, 0, 1)
		urlArray = append(urlArray, url)

		serveReverseProxy(urlArray, res, req, uuid.Nil)
	} else {
		fmt.Printf("Unrecognized request received\n")
	}
}

// This function is called on a timer and pings both
// servers with a GET request. A 302 response is expected
// but not yet explicity checked
func checkHealth(ticker *time.Ticker, done chan bool) {
	//Reference for ticker code:
	for {
		select {
		//Is there any case we want this ticker to stop? Leaving for now in case
		// we want to modify this
		case <-done:
			return
		//case t := <-ticker.C:
		case <-ticker.C:
			client := &http.Client{
				//Reference here for redirect code: https://jonathanmh.com/tracing-preventing-http-redirects-golang/
				CheckRedirect: func(req *http.Request, via []*http.Request) error {
					return http.ErrUseLastResponse
				}}
			// fmt.Println("HEALTH CHECK")

			if pingA {
				_, err := client.Get(os.Getenv("A_CONDITION_URL"))

				//What should we do if we run into an error? Right now just printing it
				if err != nil {
					fmt.Println(err)
					modifyMap(0)
					pingA = false
				}

			}

			if pingB {
				_, err2 := client.Get(os.Getenv("B_CONDITION_URL"))

				if err2 != nil {
					fmt.Println(err2)
					modifyMap(1)
					pingB = false
				}
			}

		}
	}
}

func processResponse(response ResponseObj) {
	b := []byte(response.ID)
	var id, err = uuid.FromBytes(b)
	if err != nil {
		panic(err)
	} else {
		// Concurrent reads of the map for getting the mutex are alright
		if mutex, ok := requestMutexMap[id]; ok {
			// make sure that this id hasn't been cleaned up
			var readyToServe = false // Tells us whether all responses have been received
			mutex.Lock()
			var responseEntries = response.Posts
			responsesMap[id] = responsesMap[id] - 1 // decrement number of responses we're waiting on
			var pl = queryMap[id]
			for _, responseEntry := range responseEntries {
				pl.PushToCapacity(entriesToServe, &responseEntry)
				// TODO: COME BACK HERE AND MAKE SURE IT'S ALRIGHT
			}
			if responsesMap[id] == 0 {
				readyToServe = true
			}
			mutex.Unlock()
			if readyToServe {
				serveResponseThenCleanup(id)
			}
		} else {
			if verbose {
				fmt.Printf("Response for tag %s came after cleanup", id)
			}
		}
	}
}

func getResponse(id uuid.UUID) PostList {
	// I wrote below code for if we choose to use heap implementation
	// var requestMutex = requestMutexMap[id]
	// var i = 0
	// var size = pq.Size()
	// for size != 0 {
	// 	size = pq.Size()
	// 	var post = heap.Pop(&pq).(*Post)
	// 	// todo: see whether we should return the actual struct or just the pointer
	// 	posts[i] = post
	// 	i++
	// }
	// requestMutex.Unlock()
	return queryMap[id]
}

func serveResponseThenCleanup(id uuid.UUID) {
	var requestMutex = requestMutexMap[id]
	requestMutex.Lock() // We lock here in case we have two or more responses arrive after timeout
	// We don't want both responses triggering us to serve the response.
	// This shouldn't be a problem if all responses arrive in a timely manner though
	defer requestMutex.Unlock()

	var responseEntries = getResponse(id)
	// First marshal the response
	var data, _ = json.Marshal(responseEntries)
	if verbose {
		fmt.Println(reflect.TypeOf(data))
		fmt.Println(data)
	}
	data_b := []byte(data)
	// Get the response writer
	var resWriter = responseWriterMap[id]
	resWriter.Write(data_b)
	/*
		if verbose { // maybe write otu
			fmt.Printf()
		}
	*/
	// Clean up
	multiServerMapCleanup(id)
	// serve the request to the client
}

func multiServerMapCleanup(id uuid.UUID) {
	// First lock on mutex
	mapMutex.Lock()
	delete(requestMutexMap, id)
	delete(responsesMap, id)
	delete(queryMap, id)
	delete(responseWriterMap, id)
	mapMutex.Unlock()
}

func main() {
	// Log setup values
	logSetup()
	setupMap()

	fmt.Printf("Map set up\n")
	// start server
	http.HandleFunc("/", handleRequestAndRedirect)

	//Initialize ticker + channel + run in parallel
	ticker := time.NewTicker(5000 * time.Millisecond)
	done := make(chan bool)
	go checkHealth(ticker, done)

	if err := http.ListenAndServe(getListenAddress(), nil); err != nil {
		panic(err)
	}
}
