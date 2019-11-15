package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"sync"
	"time"
	//"github.com/NYTimes/gziphandler"
	uuid "github.com/google/uuid"
)

var verbose = false

// Coord struct represents the lat-lng coordinate
type Coord struct {
	Lat, Lng float64
}

// CoordBox struct represents a box with topleft corner and bottomright corner
type CoordBox struct {
	TopLeft     Coord
	BottomRight Coord
}

// CoordRange is for range of coords for mapping to servers
type CoordRange struct {
	Low, High float64
}

// Post struct for server response's post to view
type Post struct {
	StoryID   string    `json:"storyid"`
	Timestamp time.Time `json:"timestamp"`
	Lat       float64   `json:"lat"`
	Lng       float64   `json:"long"`
	Text      string    `json:"text"`
	HasImage  bool      `json:"hasimage"`
}

// ResponseObj struct for server response to view
type ResponseObj struct {
	Posts []Post `json:"entries"`
	ID    string `json:"id"`
}

// View request passes top-left and bottom-right coords
// "latlng1": [2.5, -10.3],
// "latlng2": [0, 80.5]
type viewRequestPayloadStruct struct {
	LatLng1   []float64 `json:"latlng1"`
	LatLng2   []float64 `json:"latlng2"`
	Skip      int       `json:"skip"`
	PageLimit int       `json:"pagelimit"`
	ID        string    `json:"id,omitempty"`
}

// Submit request passes the coord to post
// "coordinate": [-20.3, 60]
type submitRequestPayloadStruct struct {
	LatLng []float64 `json:"coordinate"`
}

type viewRequestHandler struct {
}

type healthResponse struct {
	Image_url string
	Storyid   string
	Text      string
}

// List of server URLs
var serverURLs []string

// 2D map of LatCoordRange:LngCoordRange:Index of server in serverURLs
var coordBoxToServer = map[CoordRange]map[CoordRange]int{}

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

func getNullResponseObj(id string) ResponseObj {
	var respObj ResponseObj
	var emptyPosts []Post
	respObj.Posts = emptyPosts
	respObj.ID = id
	return respObj
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
	// Array holds env strings
	serverURLs = []string{"A_CONDITION_URL", "B_CONDITION_URL"}

	// Map will map lat-long ranges to index in serverURLs
	// latitude: (-90, 90) longitude: (-180, 180)

	coordBoxToServer[cr1] = map[CoordRange]int{}
	coordBoxToServer[cr2] = map[CoordRange]int{}
	coordBoxToServer[cr1][cr3] = 0
	coordBoxToServer[cr2][cr3] = 1
}

func modifyMap(conditional int) {
	if conditional == 0 {
		coordBoxToServer[cr1][cr3] = 1
	} else if conditional == 1 {
		coordBoxToServer[cr2][cr3] = 0
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
	fmt.Println("Parsed view request payload:")
	fmt.Printf("\t%+v\n", requestPayload)
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
	request.ParseMultipartForm(0)
	var LatLng []float64
	lat := request.FormValue("lat")
	lng := request.FormValue("lng")
	var err error
	LatLng[0], err = strconv.ParseFloat(lat, 64)
	if err != nil {
		panic(err)
	}

	LatLng[1], err = strconv.ParseFloat(lng, 64)
	if err != nil {
		panic(err)
	}

	var requestPayload submitRequestPayloadStruct
	requestPayload.LatLng = LatLng

	return requestPayload
}

// Log the view typeform payload and redirect url
func logViewRequestPayload(requestionPayload viewRequestPayloadStruct, proxyURL string) {
	log.Printf("\tlatlng1: %v, latlng2: %v, proxy_url: %s\n", requestionPayload.LatLng1, requestionPayload.LatLng2, proxyURL)
}

// Log the submit typeform payload and redirect url
func logSubmitRequestPayload(requestionPayload submitRequestPayloadStruct, proxyURL string) {
	log.Printf("coordinate: %v, proxy_url: %s\n", requestionPayload.LatLng, proxyURL)
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

func rangesOverlap(start1 float64, end1 float64, coordRange CoordRange) bool {
	overlap := math.Min(end1, coordRange.High) >= math.Max(start1, coordRange.Low)
	// Below two cases account for case where one interval encompasses the other
	overlap = overlap || (start1 < coordRange.Low && end1 > coordRange.High)
	overlap = overlap || (coordRange.Low < start1 && coordRange.High > end1)
	//fmt.Println(overlap)
	return overlap
}

func getRangeIntersection(coordBox CoordBox, latRange CoordRange, lngRange CoordRange) CoordBox {
	return CoordBox{
		TopLeft: Coord{
			Lat: math.Min(coordBox.TopLeft.Lat, latRange.High),
			Lng: math.Max(coordBox.TopLeft.Lng, lngRange.Low),
		},
		BottomRight: Coord{
			Lat: math.Max(coordBox.BottomRight.Lat, latRange.Low),
			Lng: math.Min(coordBox.BottomRight.Lng, lngRange.High),
		},
	}
}

// Get the url(s) for given coordinates of view request
func getViewProxyURL(rawCoord1 []float64, rawCoord2 []float64) map[string]CoordBox {
	// Acts as a set of url strings
	urls := make(map[string]CoordBox)

	// Parse each coord
	topLeft := parseCoord(rawCoord1)
	bottomRight := parseCoord(rawCoord2)

	// Note that bottom right lat < top left lat
	// bottom right lng > top left lng
	coordBox := CoordBox{
		TopLeft:     topLeft,
		BottomRight: bottomRight,
	}

	for latRange := range coordBoxToServer {
		//fmt.Printf("%v",latRange)
		if rangesOverlap(bottomRight.Lat, topLeft.Lat, latRange) {
			//fmt.Printf("%v",latRange)
			for lngRange := range coordBoxToServer[latRange] {
				if rangesOverlap(topLeft.Lng, bottomRight.Lng, lngRange) {
					// Check if we have already added url
					urlString := os.Getenv(serverURLs[coordBoxToServer[latRange][lngRange]])
					if verbose {
						fmt.Println(urlString)
					}

					if _, exists := urls[urlString]; !exists {
						urls[urlString] = getRangeIntersection(coordBox, latRange, lngRange)
					}
				}
			}
		}
	}

	return urls
}

// Get the url for given coordinates of submit request
func getSubmitProxyURL(rawCoord []float64) string {
	coord := parseCoord(rawCoord)

	if coord == ERROR_COORD {
		return ERROR_URL
	}

	for latRange := range coordBoxToServer {
		if coord.Lat >= latRange.Low && coord.Lat < latRange.High {
			for lngRange := range coordBoxToServer[latRange] {
				if coord.Lng >= lngRange.Low && coord.Lng < lngRange.High {
					return os.Getenv(serverURLs[coordBoxToServer[latRange][lngRange]])
				}
			}
		}
	}
	return ERROR_URL
}

func isJSON(s string) bool {
	var js map[string]interface{}
	return json.Unmarshal([]byte(s), &js) == nil
}

// Takes in the new latlng box, response writer, request, unmarshalled view request payload, and uuid for request
func serveViewReverseProxy(targets map[string]CoordBox, res http.ResponseWriter, req *http.Request, reqPayload viewRequestPayloadStruct, id uuid.UUID) {
	if verbose {
		log.Println("Making view request")
	}
	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))

	// Edit request body to include id
	reqPayload.ID = id.String()

	setupTimer(id)
	// Send to other servers for view request
	for target, coordBox := range targets {
		if verbose {
			fmt.Printf("\tURL serving to: %s \n", target)
		}
		logViewRequestPayload(reqPayload, target)

		// parse the url
		url, _ := url.Parse(target)
		url.Path = "/view"

		// Edit coord box to intersecting box with server region
		reqPayload.LatLng1 = []float64{coordBox.TopLeft.Lat, coordBox.TopLeft.Lng}
		reqPayload.LatLng2 = []float64{coordBox.BottomRight.Lat, coordBox.BottomRight.Lng}
		newReq, err := json.Marshal(reqPayload)
		if err != nil {
			fmt.Println("\tError marshalling request payload for view: ", err)
		}
		newReqBody := ioutil.NopCloser(bytes.NewBuffer(newReq))

		if verbose {
			log.Printf("\tServing request to %s: %s", target, string(newReq))
		}

		res, err := http.Post(url.String(), "application/json", newReqBody)
		if err != nil {
			log.Printf("\tError when sending request: %v", err)
			processResponse(getNullResponseObj(id.String()))
		} else {
			var responseObj ResponseObj
			body, bodyErr := ioutil.ReadAll(res.Body)
			if bodyErr != nil {
				// Do we want to stop the program here
				log.Fatal("\tError reading view response: ", bodyErr)
			}

			if unmarshalErr := json.Unmarshal([]byte(body), &responseObj); unmarshalErr != nil {
				log.Println("\tError unmarshalling view response: ", unmarshalErr)
			} else {
				// We got a valid response back and want to parse it out
				processResponse(responseObj)
			}
			if verbose {
				log.Printf("\tRequest served to reverse proxy for %s\n", target)
				log.Printf("\tResponse obj: %v", responseObj)
			}
			res.Body.Close() // Have to make sure to call this.
		}
	}
}

func serveSubmitReverseProxy(res http.ResponseWriter, req *http.Request) {
	if req.Method == "OPTIONS" {
		handlePreflight(res, req)
		return
	}
		// Submit request
		if verbose {	
			log.Println("Submit request received")
		}
		requestPayload := parseSubmitRequestBody(req)
		target := getSubmitProxyURL(requestPayload.LatLng)
		logSubmitRequestPayload(requestPayload, target)
		if target == ERROR_URL {
			log.Printf("Error: Could not send request due to incorrect request body\n")
			return
		}
	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	url, _ := url.Parse(target)
	proxy := httputil.NewSingleHostReverseProxy(url)
	req.URL.Host = url.Host
	req.URL.Scheme = url.Scheme
	req.Host = url.Host
	if verbose {
		for header, values := range req.Header {
			for _, value := range values {
				log.Printf("\tHeader: %s, val: %s \n", header, value)
			}
		}
	}
	proxy.ServeHTTP(res, req)
	return
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
		if verbose {
			fmt.Printf("Timeout triggered for %s \n", id.String())
		}
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
				if verbose {
					fmt.Println("serving response after cleanup")
				}
				// TODO: Currently getting superfluous response.WriteHeader err due to not counting empty/error responses
				serveResponseThenCleanup(id)
			}
		}
		/*
			If the mutex isn't in the map, then this means that the request has already been served. In this case, we do nothing.
		*/
	})
}

func handlePreflight(res http.ResponseWriter, req *http.Request) {
	//  handle pre-flight request from browser
		if verbose {
			fmt.Printf("Preflight request received\n")
		}
		enableCors(&res)
		res.WriteHeader(http.StatusOK)
		return
}

// Given a request send it to the appropriate url
func (rh *viewRequestHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	if req.Method == "OPTIONS" {
		handlePreflight(res, req)
		return
	}
		// View request
		var tag = uuid.New()
		requestPayload := parseViewRequestBody(req)
		urls := getViewProxyURL(requestPayload.LatLng1, requestPayload.LatLng2)
		if verbose {
			fmt.Printf("View request received\n")
			fmt.Printf("Conditional url(s) attained\n")
			fmt.Println(urls)
		}
		// Create an entry in our response map

		var responseCount = 0

		for url := range urls {
			// todo: make sure that this is returning the actual url and not index
			if url == ERROR_URL {
				fmt.Println("Error: Could not send request due to incorrect request body")
				return
			}
			responseCount = responseCount + 1
		}
		// Make all map entries for this uuid
		mapMutex.Lock()
		responseWriterMap[tag] = res
		queryMap[tag] = make(PostList, 0)
		responsesMap[tag] = responseCount
		requestMutexMap[tag] = sync.Mutex{}
		mapMutex.Unlock()

		serveViewReverseProxy(urls, res, req, requestPayload, tag)
}

func checkMatches(resp *http.Response) bool {
	var p []byte

	if resp == nil {
		fmt.Println("No Response received. Server may not be set up.")
		return (false)
	}
	
	if resp.ContentLength < 0 {
		fmt.Println("No Data returned")
		return (false)
	}
	p = make([]byte, resp.ContentLength)
	resp.Body.Read(p)
	healthJson := string(p)
	var healthResp []healthResponse
	json.Unmarshal([]byte(healthJson), &healthResp)

	// Added for testing
	if len(healthResp) == 0 {
		return (false)
	}

	if healthResp[0].Image_url == "https://comp413-places.s3.amazonaws.com/1572467590447health.jpg" {
		//fmt.Println("Response OK")
		return (true)
	}

	return (false)
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

			if pingA {
				resp, err := client.Get(os.Getenv("A_CONDITION_URL") + "/health")

				// Modified for testing
				//What should we do if we run into an error? Right now just printing it
				if err != nil {
					fmt.Println(err)
					modifyMap(0)
					pingA = false
				} else {
					valid := checkMatches(resp)

					if valid != true {
						fmt.Println("Error in response JSON during health check")
						modifyMap(0)
						pingA = false
					}
				}
			}

			if pingB {
				resp, err2 := client.Get(os.Getenv("B_CONDITION_URL") + "/health")

				// Modified for testing
				if err2 != nil {
					fmt.Println(err2)
					modifyMap(1)
					pingB = false
				} else {
					valid := checkMatches(resp)
					if valid != true {
						fmt.Println("Error in response JSON during health check")
						modifyMap(1)
						pingB = false
					}
				}
			}

		}
	}
}

func processResponse(response ResponseObj) {
	//b := []byte(response.ID)
	var id, err = uuid.Parse(response.ID)
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
			}
			if responsesMap[id] == 0 {
				if verbose {
					log.Println("Got back all responses in time")
				}
				readyToServe = true
			}
			mutex.Unlock()
			if readyToServe {
				if verbose {
					log.Printf("About to serve request for id: %s\n", id)
				}
				serveResponseThenCleanup(id)
			}
		} else {
			if verbose {
				log.Printf("Response for tag %s came after cleanup", id)
			}
		}
	}
}

func getResponse(id uuid.UUID) PostList {
	return queryMap[id]
}

func serveResponseThenCleanup(id uuid.UUID) {
	if requestMutex, ok := requestMutexMap[id]; ok {
		fmt.Println("found mutex")
		requestMutex.Lock() // We lock here in case we have two or more responses arrive after timeout
		// We don't want both responses triggering us to serve the response.
		// This shouldn't be a problem if all responses arrive in a timely manner though
		defer requestMutex.Unlock()

		var responseEntries = getResponse(id)
		// First marshal the response
		var data, _ = json.Marshal(responseEntries)

		if verbose {
			fmt.Println(data)
		}
		data_b := []byte(data)
		fmt.Printf("data: %s \n", string(data))
		// Get the response writer
		//return
		var resWriter = responseWriterMap[id]
		// Set the appropriate things on the response writer
		resWriter.Header().Set("Content-Type", "application/json")
		//resWriter.Header().Set("Content-Length", string(1000))
		resWriter.Header().Set("Content-Length", strconv.Itoa(len(data_b)))
		resWriter.WriteHeader(http.StatusOK)
		// todo: check which status code we want
		if verbose {
			fmt.Printf("Num bytes: %d \n", binary.Size(data_b))
		}

		// serve the request to the client
		i, writeErr := resWriter.Write(data_b)
		if verbose {
			log.Printf("Wrote: %d \n", i)
		}
		if writeErr != nil {
			log.Println("Error writing to response writer: ", writeErr)
		}

		// Clean up
		multiServerMapCleanup(id)
	}
}

func multiServerMapCleanup(id uuid.UUID) {
	// First lock on mutex
	mapMutex.Lock()
	delete(requestMutexMap, id)
	delete(responsesMap, id)
	delete(queryMap, id)
	delete(responseWriterMap, id)
	if verbose {
		log.Printf("Cleaned up maps for id: %s", id.String())
		//log.Println("New map", queryMap)
	}
	mapMutex.Unlock()
}

func main() {
	// Log setup values
	logSetup()
	setupMap()
	flag.BoolVar(&verbose, "v", false, "a bool")
	flag.Parse()
	if verbose {
		fmt.Println("Verbose mode")
		fmt.Printf("Map set up\n")
	}

	rh := &viewRequestHandler{}
	// start server

	// Gzip handler will only encode the response if the client supports it view the Accept-Encoding header.
	// See NewGzipLevelHandler at https://sourcegraph.com/github.com/nytimes/gziphandler/-/blob/gzip.go#L298
	//gzHandleFunc := gziphandler.GzipHandler(rh)
	http.Handle("/view", rh)
	//http.Handle("/view", gzHandleFunc)
	http.HandleFunc("/submit", serveSubmitReverseProxy)

	//http.HandleFunc("/", handleRequestAndRedirect)
	//http.HandleFunc("/", testFixedResponse)
	//Initialize ticker + channel + run in parallel

	ticker := time.NewTicker(5000 * time.Millisecond)
	done := make(chan bool)
	go checkHealth(ticker, done)

	if err := http.ListenAndServe(getListenAddress(), nil); err != nil {
		panic(err)
	}
}
