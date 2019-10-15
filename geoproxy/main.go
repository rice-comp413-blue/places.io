package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"sort"
	"strconv"
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
// "latlng1": [20, 0],
// "latlng2": [0, 80]
type viewRequestPayloadStruct struct {
	LatLng1 string `json:"latlng1"`
	LatLng2 string `json:"latlng2"`
}

// Submit request passes the coord to post
// "coordinate": [-20, -20]
type submitRequestPayloadStruct struct {
	LatLng string `json:"coordinate"`
}

// 2D map of LatCoordRange:LngCoordRange:ServerURL
var data = map[CoordRange]map[CoordRange]string{}

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
	// Map will map lat-long to env strings
	// latitude: (-90, 90) longitude: (-180, 180)
	data[0] = map[int]string{}
	data[90] = map[int]string{}
	// sorted_lat keeps track of latitude keys in order to sort them
	sorted_lat = append(sorted_lat, 0)
	sorted_lat = append(sorted_lat, 90)
	sort.Ints(sorted_lat)
	data[0][180] = "A_CONDITION_URL"
	data[90][180] = "B_CONDITION_URL"
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

// Log the typeform payload and redirect url
func logRequestPayload(requestionPayload requestPayloadStruct, proxyUrl string) {
	log.Printf("lat: %s, lng: %s, proxy_url: %s\n", requestionPayload.Lat, requestionPayload.Lng, proxyUrl)
}

// Given string in form [0.0, 0.0], create and return coord struct
func parseCoord(coord string) Coord {
	splitCoord := strings.Split(coord, ",")
	// We should have "[0.0", "0.0]"
	if len(splitCoord) != 2 {
		log.Printf("Error: Coordinate passed into json request should be of form [0.0, 0.0].")
		return nil
	} else {
		coord0 := []rune(splitCoord[0])
		coord1 := []rune(splitCoord[1])

		lat, errLat := strconv.ParseFloat(string(lat[1:len(splitCoord[0])]), 64)
		lng, errLng := strconv.ParseFloat(string(lat[0:len(splitCoord[0])-1]), 64)

		if errLat != nil || errLng != nil {
			log.Printf("Error: Invalid lat-long coordinate.")
			return nil
		}
		// var parsedCoord = Coord{lat, lng}
		return Coord{lat, lng}
	}

}

// Get the url(s) for given coordinates of view request
func getViewProxyUrl(rawCoord1 string, rawCoord2 string) string[] {
	var urls strings[]

	// Parse each coord
	topLeft := parseCoord(rawCoord1)
	bottomRight := parseCoord(rawCoord2)

	// Add all urls of zones that touch the box of the coords
	// This means that we check if the 
	for latRange := range data {
		if topLeft.Lat < latRange.high && bottomRight.Lat >= latRange.High {
			for lngRange := range data[latRange] {
				if coord.Lng >= lngRange.Low && coord.Lng < lngRange.High {
					// TODO: Check doc
					urls = append(urls, os.Getenv(data[latRange][lngRange]))
					break
				}
			}
			break
		}
	}
	if len(urls) == 0 {
		// ERROR: Lat-lng coordinate not in range
		// TODO: Throw error message and possibly error url
		urls = append(urls, os.Getenv("DEFAULT_CONDITION_URL"))
	}

	return urls
}

// Get the url(s) for given coordinates of view request
func getViewProxyUrl(rawCoord1 string, rawCoord2 string) string[] {
	var urls strings[]

	for rawCoord := range rawCoords {
		// Parse each coord
		coord := parseCoord(rawCoord)
		// Lookup coord in data map
		for latRange := range data {
			if coord.Lat >= latRange.Low && coord.Lat < latRange.High {
				for lngRange := range data[latRange] {
					if coord.Lng >= lngRange.Low && coord.Lng < lngRange.High {
						// TODO: Check doc
						urls = append(urls, os.Getenv(data[latRange][lngRange]))
						break
					}
				}
				break
			}
		}

	}
	if len(urls) == 0 {
		// ERROR: Lat-lng coordinate not in range
		// TODO: Throw error message and possibly error url
		urls = append(urls, os.Getenv("DEFAULT_CONDITION_URL"))
	}

	return urls
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

	// Note that ServeHttp is non blocking and uses a go routine under the hood
	proxy.ServeHTTP(res, req)
}

// Given a request send it to the appropriate url
func handleRequestAndRedirect(res http.ResponseWriter, req *http.Request) {
	var rawCoords string[]
	// TODO: Look at header to see if view or submit

	// View request
	requestPayload := parseViewRequestBody(req)
	rawCoords[0] = requestPayload.LatLng1
	rawCoords[1] = requestPayload.LatLng2

	// Submit request
	requestPayload := parseSubmitRequestBody(req)
	rawCoords[0] = requestPayload.LatLng

	urls := getProxyUrl(rawCoords)
	// logRequestPayload(requestPayload, url)
	for url : range urls {
		serveReverseProxy(url, res, req)
	}
}

func main() {
	// Log setup values
	logSetup()
	setupMap()

	// start server
	http.HandleFunc("/", handleRequestAndRedirect)
	if err := http.ListenAndServe(getListenAddress(), nil); err != nil {
		panic(err)
	}
}