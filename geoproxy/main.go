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
	"net/url"
	"os"
	"strings"
)

// Coord struct represents the lat-lng coordinate
type Coord struct {
	Lat, Lng float64
}

// Key struct is for map pointing to correct server
type CoordRange struct {
	Low, High float64
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
	cr1 := CoordRange{-90, 0}
	cr2 := CoordRange{0, 90}
	cr3 := CoordRange{-180, 180}
	data[cr1] = map[CoordRange]string{}
	data[cr2] = map[CoordRange]string{}
	data[cr1][cr3] = "A_CONDITION_URL"
	data[cr2][cr3] = "B_CONDITION_URL"
}

// Get a json decoder for a given requests body
func requestBodyDecoder(request *http.Request) *json.Decoder {
	// Read body to buffer
	body, err := ioutil.ReadAll(request.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		panic(err)
	}

	// Because go lang is a pain in the ass if you read the body then any susequent calls
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

	if topLeft == ERROR_COORD || bottomRight == ERROR_COORD {
		urls[ERROR_URL] = true
		return urls
	}

	if topLeft.Lat < bottomRight.Lat || topLeft.Lng > bottomRight.Lng {
		fmt.Printf("Error: latlng1 should be top left and latlng2 should be bottom right of the coord box\n")
		urls[ERROR_URL] = true
		return urls
	}

	// **Commented out to test with only one server associated with midpoint for now**
	// *******************************************************************************
	// // Add all urls of zones that touch the box of the coords
	// for latRange := range data {
	// 	if rangesOverlap(topLeft.Lat, bottomRight.Lat, latRange.Low, latRange.High) {
	// 		for lngRange := range data[latRange] {
	// 			if rangesOverlap(topLeft.Lng, bottomRight.Lng, lngRange.Low, lngRange.High) {
	// 				// Check if we have already added url
	// 				urlString := os.Getenv(data[latRange][lngRange])
	// 				// url, exists := urls[urlString]
	// 				if !urls[urlString] {
	// 					urls[urlString] = true
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	// *******************************************************************************

	coord := Coord{(topLeft.Lat + bottomRight.Lat) / 2, (topLeft.Lng + bottomRight.Lng) / 2}

	urls[getProxyURL(coord)] = true

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
func serveReverseProxy(target string, res http.ResponseWriter, req *http.Request) {
	// parse the url
	url, _ := url.Parse(target)

	// create the reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(url)

	// Update the headers to allow for SSL redirection
	req.URL.Host = url.Host
	req.URL.Scheme = url.Scheme
	req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
	req.Host = url.Host

	// enableCors(&res)

	// //Need to be able to handle OPTIONS, see https://flaviocopes.com/golang-enable-cors/ for details
	// if (*req).Method == "OPTIONS" {
	// 	return
	// }

	// Note that ServeHttp is non blocking and uses a go routine under the hood
	proxy.ServeHTTP(res, req)
}

// Enable cors for response to pre-flight
func enableCors(w *http.ResponseWriter) {
	//  allow CORS
	(*w).Header().Set("Access-Control-Allow-Origin", "*")

	//  Allow these headers in client's response to pre-flight response
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
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
		requestPayload := parseViewRequestBody(req)
		urls := getViewProxyUrl(requestPayload.LatLng1, requestPayload.LatLng2)
		fmt.Printf("Conditional url(s) attained\n")

		// We are only looking for one server associated with midpoint right now
		if len(urls) != 1 {
			log.Printf("Warning: Should have only one url for view request right now")
		}

		for url := range urls {
			logViewRequestPayload(requestPayload, url)
			if url == ERROR_URL {
				fmt.Printf("Error: Could not send request due to incorrect request body\n")
				return
			}
			fmt.Printf("View request served to reverse proxy\n")
			serveReverseProxy(url, res, req)
		}
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

		fmt.Printf("Submit request served to reverse proxy\n")
		serveReverseProxy(url, res, req)
	} else {
		fmt.Printf("Unrecognized request received\n")
	}
}

func main() {
	// Log setup values
	logSetup()
	setupMap()

	fmt.Printf("Map set up\n")

	// start server
	http.HandleFunc("/", handleRequestAndRedirect)
	if err := http.ListenAndServe(getListenAddress(), nil); err != nil {
		panic(err)
	}
}
