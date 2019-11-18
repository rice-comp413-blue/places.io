package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	//"fmt"
)

func TestOverlap(t *testing.T) {
	assert.True(t, rangesOverlap(3.5, 4.7, CoordRange{4.2, 8}), "Region overlaps")
	assert.False(t, rangesOverlap(3.5, 4.0, CoordRange{4.2, 8}), "Region do not overlap")
}

func TestOverlapMultiple(t *testing.T) {
	coordBox := CoordBox{Coord{20, -50}, Coord{-50, 90}}
	latRange1 := CoordRange{-90, 0}
	latRange2 := CoordRange{0, 90}
	lngRange := CoordRange{-180, 180}
	assert.True(t, rangesOverlap(coordBox.BottomRight.Lat, coordBox.TopLeft.Lat, latRange1), "Region 1 overlaps")
	assert.True(t, rangesOverlap(coordBox.BottomRight.Lat, coordBox.TopLeft.Lat, latRange2), "Region 2 overlaps")
	assert.Equal(t, CoordBox{Coord{0, -50}, Coord{-50, 90}}, getRangeIntersection(coordBox, latRange1, lngRange), "Intersection of region 1")
	assert.Equal(t, CoordBox{Coord{20, -50}, Coord{0, 90}}, getRangeIntersection(coordBox, latRange2, lngRange), "Intersection of region 2")
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
