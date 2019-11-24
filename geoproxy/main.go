package main

//Notes:
//Some errors from proxy.ServeHTTP cannot be caught and modified bc of how the function is written.

//Resources:
//https://www.integralist.co.uk/posts/golang-reverse-proxy/
//https://hackernoon.com/writing-a-reverse-proxy-in-just-one-line-with-go-c1edfa78c84b

import (
	//"errors"
	"bytes"
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
	"reflect"
	"strconv"
	"time"
    aws "github.com/aws/aws-sdk-go/aws"
    session "github.com/aws/aws-sdk-go/aws/session"
    servicediscovery "github.com/aws/aws-sdk-go/service/servicediscovery"
	"github.com/NYTimes/gziphandler"
)

var verbose = false
var instances []*servicediscovery.HttpInstanceSummary


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
	ImageURL  string    `json:"image_url"`
	//HasImage  bool      `json:"hasimage"`
}

// ResponseObj struct for server response to view
type ResponseObj struct {
	Posts []Post `json:"entries"`
	ID    string `json:"id"`
}

type ViewResponseObj struct {
	Posts []Post `json:"entries"`
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

type countRequestPayloadStruct struct {
	LatLng1   []float64 `json:"latlng1"`
	LatLng2   []float64 `json:"latlng2"`
}

// Submit request passes the coord to post
// "coordinate": [-20.3, 60]
type submitRequestPayloadStruct struct {
	LatLng []float64 `json:"coordinate"`
}

type singleViewRequestHandler struct {
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

func requestBodyDecoder(request *http.Request) *json.Decoder {
	// Read body to buffer
	body, err := ioutil.ReadAll(request.Body)
	if err != nil {
		log.Printf("Error reading body: %v \n", err)
		return nil
	}

	// Because go lang is a pain in the ass if you read the body then any subsequent calls
	// are unable to read the body again....
	request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	return json.NewDecoder(ioutil.NopCloser(bytes.NewBuffer(body)))
}

// Parse the view requests body
func parseViewRequestBody(request *http.Request) viewRequestPayloadStruct {
	decoder := requestBodyDecoder(request)

	if decoder == nil {
		fmt.Println("Creating view body decoder failed")
		return viewRequestPayloadStruct{}
	}

	var requestPayload viewRequestPayloadStruct
	err := decoder.Decode(&requestPayload)

	if err != nil {
		fmt.Println("Error decoding into view request payload")
		return viewRequestPayloadStruct{}
	}

	if verbose {
		fmt.Println("Parsed view request payload:")
		fmt.Printf("\t%+v\n", requestPayload)
	}

	return requestPayload
}

func parseCountRequestBody(request *http.Request) countRequestPayloadStruct {
	decoder := requestBodyDecoder(request)

	if decoder == nil {
		fmt.Println("Creating count body decoder failed")
		return countRequestPayloadStruct{}
	}

	var requestPayload countRequestPayloadStruct
	err := decoder.Decode(&requestPayload)

	if err != nil {
		fmt.Println("Error creating decoder for count request payload")
		return countRequestPayloadStruct{}
	}
	if verbose {
		fmt.Println("Parsed count request payload:")
		fmt.Printf("\t%+v\n", requestPayload)
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
	var bodyBytes []byte
	if request.Body != nil {
  		bodyBytes, _ = ioutil.ReadAll(request.Body)
	}
	request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	request.ParseMultipartForm(0)
	var LatLng []float64
	lat := request.FormValue("lat")
	lng := request.FormValue("lng")
	latVal, err := strconv.ParseFloat(lat, 64)
	if err != nil {
		fmt.Println("Couldn't parse latitude value in submit request.")
		return submitRequestPayloadStruct{}
	}
	LatLng = append(LatLng, latVal)
	lngVal, err := strconv.ParseFloat(lng, 64)
	if err != nil {
		fmt.Println("Couldn't parse longitude value in submit request.")
		return submitRequestPayloadStruct{}
	}
	LatLng = append(LatLng, lngVal)

	var requestPayload submitRequestPayloadStruct
	requestPayload.LatLng = LatLng

	request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	bodyString := string(bodyBytes)
	if verbose {
		log.Println("Submit Body: ")
		log.Println(bodyString)
	}

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

// Get the url(s) for given coordinates of request with a bounding box
// Can be used for view or count request
func getBoundingBoxURLs(rawCoord1 []float64, rawCoord2 []float64) map[string]CoordBox {
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
		if rangesOverlap(bottomRight.Lat, topLeft.Lat, latRange) {
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

func buildProxy(proxy *httputil.ReverseProxy)  {
	proxy.ErrorHandler = func(rw http.ResponseWriter, r *http.Request, err error) {
			fmt.Printf("error was: %+v \n", err)
			rw.WriteHeader(http.StatusInternalServerError)
			rw.Write([]byte(err.Error()))
	}

}

func serveSubmitReverseProxy(res http.ResponseWriter, req *http.Request) {
	if req.Method == "OPTIONS" {
		enableCors(&res)
		res.WriteHeader(http.StatusOK)
		return
	}

	// Submit request
	if verbose {	
		log.Println("Submit request received")
	}
	requestPayload := parseSubmitRequestBody(req)
	if reflect.DeepEqual(requestPayload, (submitRequestPayloadStruct{})) {
		// If we get empty struct then something went wrong
		http.Error(res, "Client sent incorrect submit request body", http.StatusBadRequest)
		return
	}

	target := getSubmitProxyURL(requestPayload.LatLng)
	logSubmitRequestPayload(requestPayload, target)
	if target == ERROR_URL {
		log.Printf("Error: Could not send request due to incorrect request body\n")
		http.Error(res, "Client queried for invalid coordinate", http.StatusBadRequest)
			// Todo: check if this is valid. I put this as the response because we assume that if we can't find the url the client gave us a bad request
		return
	}
	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	targ_url, parseErr := url.Parse(target)
	if parseErr != nil {
		http.Error(res, "Error parsing url", http.StatusInternalServerError)
	}

	proxy := httputil.NewSingleHostReverseProxy(targ_url)
  buildProxy(proxy)
	req.URL.Host = targ_url.Host
	req.URL.Scheme = targ_url.Scheme
	req.Host = targ_url.Host
	
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

func serveCountRequest(res http.ResponseWriter, req *http.Request) {
	if req.Method == "OPTIONS" {
		enableCors(&res)
		res.WriteHeader(http.StatusOK)
		return
	}

	var bodyBytes []byte
	if req.Body != nil {
  		bodyBytes, _ = ioutil.ReadAll(req.Body)
	}

	req.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
	requestPayload := parseCountRequestBody(req) 
	if reflect.DeepEqual(requestPayload, (countRequestPayloadStruct{})) {
		// If we get empty struct then something went wrong
		http.Error(res, "Client sent incorrect count request body", http.StatusBadRequest)
		return
	}

  // Couldn't parse correctly.
	urlsMap := getBoundingBoxURLs(requestPayload.LatLng1, requestPayload.LatLng2)

	if len(urlsMap) == 0 {
		// If no urls were found then return error. We assume that if no urls were found then the bounding box was invalid (although the request body itself was valid)
		http.Error(res, "Invalid bounding box queried", http.StatusBadRequest)
	}

	// Note: below is the code for getting a single URL to forward our request to. 
    	keys := make([]string, 0, len(urlsMap))
        for k := range urlsMap {
		keys = append(keys, k)
	}

	target:=keys[0] // Get first url
	// Above is only a temporary solution

	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	url, err := url.Parse(target)
	if err != nil {
		log.Printf("Invalid url: %s \n", target)
		res.WriteHeader(http.StatusInternalServerError)
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(url)
	buildProxy(proxy)

	req.URL.Host = url.Host
	req.URL.Scheme = url.Scheme
	req.Host = url.Host
	req.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
	proxy.ServeHTTP(res,req)
	return
}

func (rh *singleViewRequestHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	// Created this method for when we want to only route to a single server. 

	if req.Method == "OPTIONS" {
		enableCors(&res)
		res.WriteHeader(http.StatusOK)
		return
	}
	
	var bodyBytes []byte
	if req.Body != nil {
  		bodyBytes, _ = ioutil.ReadAll(req.Body)
	}
	if verbose {
		fmt.Printf("Forwarding following request to server: \n %s \n", string(bodyBytes))
	}
	req.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
	requestPayload := parseViewRequestBody(req)

	// Hackish solution, but here we get the midpoint to then fetch the corresponding server with the same approach we do with submit requests. 
	var midPoint []float64
	latVal := (requestPayload.LatLng1[0] + requestPayload.LatLng2[0]) / 2
	lngVal := (requestPayload.LatLng1[1] + requestPayload.LatLng2[1]) / 2
	midPoint = append(midPoint, latVal)
	midPoint = append(midPoint, lngVal)
	
	target := getSubmitProxyURL(midPoint)

	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	targ_url, parseErr := url.Parse(target)
	if parseErr != nil {
		http.Error(res, "Error parsing url", http.StatusInternalServerError)
	}

	proxy := httputil.NewSingleHostReverseProxy(targ_url)
	buildProxy(proxy)
	//fmt.Println(proxy)

	req.URL.Host = targ_url.Host
	req.URL.Scheme = targ_url.Scheme
	req.Host = targ_url.Host
	req.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
	proxy.ServeHTTP(res, req)
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

func check_service() {
	fmt.Println("Check service.")
	sess := session.Must(session.NewSessionWithOptions(session.Options{
        SharedConfigState: session.SharedConfigEnable,
    }))
    svc := servicediscovery.New(sess, aws.NewConfig().WithRegion("us-east-2"))
    req, res := svc.DiscoverInstancesRequest(&servicediscovery.DiscoverInstancesInput{
		HealthStatus:  aws.String(servicediscovery.HealthStatusFilterHealthy),
		NamespaceName: aws.String("dns-namespace1"),
		ServiceName:   aws.String("sd-service1"),
	})
	err := req.Send()
	if err == nil {
		fmt.Println(res.Instances)
		instances = res.Instances
	} else {
		fmt.Println("Error getting instances.")
		fmt.Println(err)
	}
}

func main() {
	check_service()

	// Log setup values
	flag.BoolVar(&verbose, "v", false, "a bool")
	flag.Parse()
	if verbose {
		fmt.Println("Verbose mode")
		fmt.Printf("Map set up\n")
	}

	rh := &singleViewRequestHandler{} // Uncomment this for single server routing.
	//rh := &viewRequestHandler{} // Uncomment this for multiple server routing.
	// start server
	// Gzip handler will only encode the response if the client supports it view the Accept-Encoding header.
	// See NewGzipLevelHandler at https://sourcegraph.com/github.com/nytimes/gziphandler/-/blob/gzip.go#L298
	gzHandleFunc := gziphandler.GzipHandler(rh)
	//http.Handle("/view", rh)
	http.Handle("/view", gzHandleFunc)
	http.HandleFunc("/submit", serveSubmitReverseProxy)
	http.HandleFunc("/count", serveCountRequest)

	//http.HandleFunc("/", handleRequestAndRedirect)
	//http.HandleFunc("/", testFixedResponse)
	//Initialize ticker + channel + run in parallel
	if err := http.ListenAndServe(getListenAddress(), nil); err != nil {
		fmt.Println("Error when calling listen and serve")
		panic(err)
	}
}
