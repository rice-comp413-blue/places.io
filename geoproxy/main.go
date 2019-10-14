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
	"fmt"
)

var data = map[int]map[int]string{}
var sorted_lat []int

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

type requestPayloadStruct struct {
	// Replace with lat-long param
	Lat string `json:"lat"`
	Lng string `json:"lng"`
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

// Parse the requests body
func parseRequestBody(request *http.Request) requestPayloadStruct {
	decoder := requestBodyDecoder(request)

	var requestPayload requestPayloadStruct
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

// Get the url for a given lat and long pair
func getProxyUrl(latRaw string, lngRaw string) string {
	lat1, err1 := strconv.ParseFloat(latRaw, 32)
	lng1, err2 := strconv.ParseFloat(lngRaw, 32)
	lat := float32(lat1)
	lng := float32(lng1)

	default_condtion_url := os.Getenv("DEFAULT_CONDITION_URL")

	if err1 != nil || err2 != nil {
		log.Printf("Error: Invalid lat-long pair.")
		return default_condtion_url
	}

	// Lat-long mapping logic to get the env
	for l1 := range sorted_lat {
		if lat < float32(l1) {
			var sorted_lng []int
			for l2 := range data[l1] {
			    sorted_lng = append(sorted_lng, l2)
			}
			sort.Ints(sorted_lng)
			for l2 := range sorted_lng {
				if lng < float32(l2) {
					return os.Getenv(data[l1][l2])
				}
			}
		}
	}

	return default_condtion_url
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

	enableCors(&res)


	//Need to be able to handle OPTIONS, see https://flaviocopes.com/golang-enable-cors/ for details
	if (*req).Method == "OPTIONS" {
		return
	}


	// Note that ServeHttp is non blocking and uses a go routine under the hood
	proxy.ServeHTTP(res, req)
}

//Header to allow for CORS access
func enableCors(w *http.ResponseWriter) {
	//This should be fine for GET requests
	(*w).Header().Set("Access-Control-Allow-Origin", "*")

	//Extra handling for POST requests
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    (*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// Given a request send it to the appropriate url
func handleRequestAndRedirect(res http.ResponseWriter, req *http.Request) {

	fmt.Printf("Request received\n")
	requestPayload := parseRequestBody(req)
	url := getProxyUrl(requestPayload.Lat, requestPayload.Lng)

	fmt.Printf("Conditional url attained\n")
	logRequestPayload(requestPayload, url)

	fmt.Printf("Request served to reverse proxy\n")
	serveReverseProxy(url, res, req)
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