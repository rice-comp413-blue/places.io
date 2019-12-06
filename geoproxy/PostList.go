package main

import (
	"fmt"
	"log"
)

// PostList contains posts from server response
type PostList []*Post

// PushToCapacity pushes new post to list with capacity cap
func (pl *PostList) PushToCapacity(cap int, post *Post) {
	old := *pl
	n := len(old)
	if verbose {
		fmt.Printf("Length of list before pushing %d \n", n)
	}
	if n < cap {
		*pl = append(*pl, post)
		if verbose {
			fmt.Printf("Length of list after pushing %d \n", len(*pl))
		}
		return
	}
	// If the list is at capacity, see if there's an element smaller than what we're pushing. If so then push this instead
	var lowInd = -1
	var lowPost = post
	for i, post2 := range old {
		if Less(post2, lowPost) {
			lowInd = i
			lowPost = post2
		}
	}
	if lowInd == -1 {
		return
	}
	if verbose {
		log.Println("Adding to list")
	}
	old[lowInd] = post
}

// Less is comparator using timestamps of posts
func Less(p1 *Post, p2 *Post) bool {
	// We want Pop to give us the highest, not lowest, priority so we use greater than here.
	// Want to maintain a min heap of times, where more recent times are greater
	return (*p1).Timestamp.Before((*p2).Timestamp)
}
