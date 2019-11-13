package main

import (
  "testing"
  "github.com/stretchr/testify/assert"
  "net/http/httptest"
  "net/http"
  //"fmt"
)






func TestOverlap(t *testing.T) {
  assert.True(t, rangesOverlap(3.5 , 4.7, 4.2, 8), "Region overlaps")
  assert.False(t, rangesOverlap(3.5 , 4.0, 4.2, 8), "Region do not overlap")

}


func TestCheckMatches(t *testing.T) {
  // generate a test server so we can capture and inspect the request
	testServer := httptest.NewServer(http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
	    //res.WriteHeader(scenario.expectedRespStatus)
	    res.Write([]byte(`[{
		    "storyid": "7d7c6600-fb54-11e9-93cf-67d480eb30ad",
		    "timestamp": "2019-10-17T02:12:18.000Z",
		    "lat": 10,
		    "long": 10,
		    "text": "health",
		    "image_url": "https://comp413-places.s3.amazonaws.com/1572467590447health.jpg"
		  }]`))

	}))
	defer func() { testServer.Close() }()

	req, err := http.NewRequest(http.MethodGet, testServer.URL, nil)
	assert.NoError(t, err)

	res, err := http.DefaultClient.Do(req)

	assert.True(t, checkMatches(res))
	assert.NoError(t, err)
	// fmt.Println("ASFASDAS")
	// fmt.Sprintf("%d",res.StatusCode);

	
	assert.Equal(t, 200, res.StatusCode, "status code should match the expected response")

}