package main

type PostList []*Post

func (pl *PostList) PushToCapacity(cap int, post *Post) {
	old := *pl
	n := len(old)
	if n < cap {
		*pl = append(*pl, post)
		return
	}
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
	old[lowInd] = post
}

func Less(p1 *Post, p2 *Post) bool {
	// We want Pop to give us the highest, not lowest, priority so we use greater than here.
	// Want to maintain a min heap of times, where more recent times are greater
	return (*p1).Timestamp.Before((*p2).Timestamp)
}
