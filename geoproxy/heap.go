package main

import (
	"container/heap"
	"fmt"
	"time"
	//"github.com/simplereach/timeutils"
	"reflect"
)

// An Item is something we manage in a priority queue.
type Item struct { // TODO: REPLACE WITH RESPOONSE STRUCT
	value    string // The value of the item; arbitrary.
	priority int    // The priority of the item in the queue.
	// The index is needed by update and is maintained by the heap.Interface methods.
	index int // The index of the item in the heap.
	time  time.Time
}

type responseObj struct {
	Time     time.Time `json:"timestamp"`
	StoryID  string         `json:"storyid"`
	Lat      float64        `json:"lat"`
	Long     float64        `json:"long"`
	Text     string         `json:"text"`
	HasImage bool           `json:"hasImage`
}

// A PriorityQueue implements heap.Interface and holds Items.
type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	// We want Pop to give us the highest, not lowest, priority so we use greater than here.
	//return pq[i].priority > pq[j].priority
	// Want to maintain a min heap of times, where more recent times are greater
	return pq[i].time.After(pq[j].time)
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue) Size() int {
	return len(*pq)
}

func (pq *PriorityQueue) PushToCapacity(cap int, item *Item) {
	// todo: check if this works
	heap.Push(pq, item)
	n := pq.Size()
	fmt.Println("size ", n)
	if n > cap {
		_ = heap.Pop(pq).(*Item)
	}
}

func (pq *PriorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil  // avoid memory leak
	item.index = -1 // for safety
	*pq = old[0 : n-1]
	return item
}

// update modifies the priority and value of an Item in the queue.
func (pq *PriorityQueue) update(item *Item, value string, priority int) {
	item.value = value
	item.priority = priority
	heap.Fix(pq, item.index)
}

// This example creates a PriorityQueue with some items, adds and manipulates an item,
// and then removes the items in priority order.
func main() {
	// Some items and their priorities.
	items := map[string]int{
		"banana": 3, "apple": 2, "pear": 4,
	}

	// Create a priority queue, put the items in it, and
	// establish the priority queue (heap) invariants.
	pq := make(PriorityQueue, len(items))
	i := 0
	for value, priority := range items {
		pq[i] = &Item{
			value:    value,
			priority: priority,
			index:    i,
			time: time.Now(),
		}
		i++
	}
	heap.Init(&pq)

	// Insert a new item and then modify its priority.
	item := &Item{
		value:    "orange",
		priority: 1,
	}
	item2 := &Item{
		value:    "clementine",
		priority: 5,
		time: time.Now(),
	}

	//heap.Push(&pq, item)
	fmt.Println(reflect.TypeOf(item2))
	//heap.Push(&pq, item2)
	pqp := &pq
	pqp.PushToCapacity(3, item)
	//pqp.PushToCapacity(3, *item2)
	pq.update(item, item.value, 5)

	// Take the items out; they arrive in decreasing priority order.
	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Item)
		fmt.Printf("%.2d:%s ", item.priority, item.value)
		fmt.Printf("\n")
	}
}
